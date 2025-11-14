import mongoose, { Document, Schema } from 'mongoose'
import { defaultSkin } from '../../utils/skins'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export interface IUser extends Document {
    _id: string
    email: string
    password: string
    skin: string
    visited_realms: string[]
    createdAt: Date
    updatedAt: Date
    comparePassword(candidatePassword: string): Promise<boolean>
    generateAccessToken(): string
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        skin: {
            type: String,
            default: defaultSkin
        },
        visited_realms: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
)

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next()
    }

    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (error: any) {
        next(error)
    }
})

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password)
    } catch (error) {
        return false
    }
}

// Method to generate JWT token
UserSchema.methods.generateAccessToken = function (): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-this'
    return jwt.sign(
        {
            id: this._id.toString(),
            email: this.email
        },
        secret,
        { expiresIn: '7d' }
    )
}

// Remove password from JSON output
UserSchema.methods.toJSON = function () {
    const obj = this.toObject()
    delete obj.password
    return obj
}

export const User = mongoose.model<IUser>('User', UserSchema)
