import mongoose, { Document, Schema } from 'mongoose'

export interface IRealm extends Document {
    _id: string
    owner_id: string
    share_id: string
    name: string
    map_data: any // RealmData type from frontend
    only_owner: boolean
    createdAt: Date
    updatedAt: Date
}

const RealmSchema = new Schema<IRealm>(
    {
        owner_id: {
            type: String,
            required: true,
            ref: 'User',
            index: true
        },
        share_id: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        map_data: {
            type: Schema.Types.Mixed,
            required: true,
            default: {}
        },
        only_owner: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

// Indexes for better query performance
RealmSchema.index({ owner_id: 1, createdAt: -1 })
RealmSchema.index({ share_id: 1 })

export const Realm = mongoose.model<IRealm>('Realm', RealmSchema)
