import mongoose from 'mongoose'

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowspace'

let isConnected = false

export async function connectToDatabase() {
    if (isConnected) {
        console.log('Already connected to MongoDB')
        return
    }

    try {
        await mongoose.connect(MONGODB_URI)
        isConnected = true
        console.log('Successfully connected to MongoDB')

        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error)
            isConnected = false
        })

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected')
            isConnected = false
        })

    } catch (error) {
        console.error('Failed to connect to MongoDB:', error)
        throw error
    }
}

export async function disconnectFromDatabase() {
    if (!isConnected) {
        return
    }

    try {
        await mongoose.disconnect()
        isConnected = false
        console.log('Disconnected from MongoDB')
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error)
        throw error
    }
}

export { mongoose }
