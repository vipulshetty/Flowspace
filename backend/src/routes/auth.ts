import { Router, Request, Response } from 'express'
import { User } from '../db/models/User'
import { z } from 'zod'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { normalizeSkin } from '../utils/skins'

const router = Router()

// Configure Google OAuth Strategy
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value
            if (!email) {
                return done(new Error('No email found in Google profile'), undefined)
            }

            // Find or create user
            let user = await User.findOne({ email })
            
            if (!user) {
                // Create new user with Google auth
                user = new User({
                    email,
                    password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) // Random password for Google users
                })
                await user.save()
            }

            return done(null, user)
        } catch (error) {
            return done(error as Error, undefined)
        }
    }))
}

// Validation schemas
const SignupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional()
})

const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required').optional()
})

// Simple email-only signup (no password required)
const SimpleSignupSchema = z.object({
    email: z.string().email('Invalid email address')
})

// POST /auth/simple-signup - Simple signup with email only
router.post('/simple-signup', async (req: Request, res: Response) => {
    try {
        const result = SimpleSignupSchema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                error: result.error.errors[0].message
            })
        }

        const { email } = result.data

        // Check if user already exists
        let user = await User.findOne({ email })
        
        if (!user) {
            // Create new user with a random password (not used)
            user = new User({
                email,
                password: Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)
            })
            await user.save()
        }

        // Generate access token
        const accessToken = user.generateAccessToken()

        res.status(201).json({
            user: {
                id: user._id.toString(),
                email: user.email,
                skin: user.skin
            },
            access_token: accessToken
        })
    } catch (error: any) {
        console.error('Simple signup error:', error)
        res.status(500).json({
            error: 'Failed to sign in'
        })
    }
})

// POST /auth/signup - Register a new user
router.post('/signup', async (req: Request, res: Response) => {
    try {
        const result = SignupSchema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                error: result.error.errors[0].message
            })
        }

        const { email, password } = result.data

        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                error: 'User with this email already exists'
            })
        }

        // Create new user
        const user = new User({
            email,
            password
        })

        await user.save()

        // Generate access token
        const accessToken = user.generateAccessToken()

        res.status(201).json({
            user: {
                id: user._id.toString(),
                email: user.email,
                skin: user.skin
            },
            access_token: accessToken
        })
    } catch (error: any) {
        console.error('Signup error:', error)
        res.status(500).json({
            error: 'Failed to create user'
        })
    }
})

// POST /auth/login - Login existing user
router.post('/login', async (req: Request, res: Response) => {
    try {
        const result = LoginSchema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                error: result.error.errors[0].message
            })
        }

        const { email, password } = result.data

        // Find user by email
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            })
        }

        // Check password (only if provided)
        if (password) {
            const isPasswordValid = await user.comparePassword(password)
            if (!isPasswordValid) {
                return res.status(401).json({
                    error: 'Invalid email or password'
                })
            }
        }

        // Generate access token
        const accessToken = user.generateAccessToken()

        res.status(200).json({
            user: {
                id: user._id.toString(),
                email: user.email,
                skin: user.skin
            },
            access_token: accessToken
        })
    } catch (error: any) {
        console.error('Login error:', error)
        res.status(500).json({
            error: 'Failed to login'
        })
    }
})

// GET /auth/me - Get current user information
router.get('/me', authenticateToken, async (req: any, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' })
        }

        const user = await User.findById(req.user.id).select('-password')

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.status(200).json({
            user: {
                id: user._id.toString(),
                email: user.email,
                skin: user.skin,
                visited_realms: user.visited_realms
            }
        })
    } catch (error: any) {
        console.error('Get user error:', error)
        res.status(500).json({
            error: 'Failed to get user information'
        })
    }
})

// POST /auth/refresh - Refresh access token (optional - for future use)
router.post('/refresh', authenticateToken, async (req: any, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' })
        }

        const user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const accessToken = user.generateAccessToken()

        res.status(200).json({
            access_token: accessToken
        })
    } catch (error: any) {
        console.error('Refresh token error:', error)
        res.status(500).json({
            error: 'Failed to refresh token'
        })
    }
})

// POST /auth/fix-skin - Temporary endpoint to fix users with invalid skin
router.post('/fix-skin', authenticateToken, async (req: any, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' })
        }

        const user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Normalize legacy skin values
        const normalizedSkin = normalizeSkin(user.skin)
        if (user.skin !== normalizedSkin) {
            user.skin = normalizedSkin
            await user.save()
        }

        res.status(200).json({
            message: 'Skin fixed',
            user: {
                id: user._id.toString(),
                email: user.email,
                skin: user.skin
            }
        })
    } catch (error: any) {
        console.error('Fix skin error:', error)
        res.status(500).json({
            error: 'Failed to fix skin'
        })
    }
})

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}))

router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/signin` }),
    async (req: Request, res: Response) => {
        try {
            const user = req.user as any
            if (!user) {
                return res.redirect(`${FRONTEND_URL}/signin?error=Authentication failed`)
            }

            // Generate access token
            const accessToken = user.generateAccessToken()

            // Redirect to frontend with token
            res.redirect(`${FRONTEND_URL}/auth/callback?token=${accessToken}`)
        } catch (error) {
            console.error('Google callback error:', error)
            res.redirect(`${FRONTEND_URL}/signin?error=Authentication failed`)
        }
    }
)

export default router
