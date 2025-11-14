import { Request, Response, NextFunction, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../db/models/User'

export interface AuthRequest extends Request {
    user?: {
        id: string
        email: string
    }
}

export const authenticateToken: RequestHandler = async (req, res, next) => {
    // We cast to AuthRequest inside to provide the extended type for handlers
    const authReq = req as AuthRequest
    try {
        const authHeader = authReq.headers.authorization
        const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Access token required' })
        }

        const secret = process.env.JWT_SECRET || 'your-secret-key-change-this'

        const decoded = jwt.verify(token, secret) as {
            id: string
            email: string
        }

        // Optionally verify user still exists in database
        const user = await User.findById(decoded.id)
        if (!user) {
            return res.status(401).json({ error: 'User not found' })
        }

        authReq.user = {
            id: decoded.id,
            email: decoded.email
        }

        next()
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ error: 'Invalid token' })
        }
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(403).json({ error: 'Token expired' })
        }
        return res.status(500).json({ error: 'Authentication failed' })
    }
}

export const verifyToken = (token: string): { id: string; email: string } | null => {
    try {
        const secret = process.env.JWT_SECRET || 'your-secret-key-change-this'
        const decoded = jwt.verify(token, secret) as {
            id: string
            email: string
        }
        return decoded
    } catch (error) {
        return null
    }
}
