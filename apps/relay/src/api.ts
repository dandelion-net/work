import express from 'express'
import swaggerUi from 'swagger-ui-express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import type { Message } from './types'
import * as openApiSpec from '../openapi.json'
import { getMessages, deleteMessagesBefore } from './db'

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' }
})

// Admin key middleware
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const adminKey = process.env.ADMIN_KEY?.trim()
  if (!adminKey) {
    return res.status(403).json({ error: 'Admin functionality not configured' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin key required' })
  }

  const providedKey = authHeader.split(' ')[1]
  if (providedKey !== adminKey) {
    return res.status(403).json({ error: 'Invalid admin key' })
  }

  next()
}

// Request validation schemas
const MessageSchema = z.object({
  type: z.string().min(1),
  data: z.record(z.unknown()),
  recipient: z.string().optional(),
  tags: z.array(z.string()).optional()
})

const TagsSchema = z.object({
  tags: z.array(z.string().min(1))
})

const BlockSchema = z.object({
  blocked: z.boolean()
})

// Error handling middleware
const errorHandler = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
}

export const createAPI = (p2pNode: ReturnType<typeof import('./p2p-node').createP2PNode>) => {
  const app = express()

  // Security middleware
  app.use(helmet())
  app.use(express.json({ limit: '50kb' })) // Limit payload size
  app.use(limiter)

  // CORS configuration
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200)
    }
    next()
  })

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`)
    })
    next()
  })

  // Serve OpenAPI documentation
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Get all known peers
  app.get('/peers', (req, res) => {
    res.json(p2pNode.getPeers())
  })

  // Get messages within a timeframe
  app.get('/messages', async (req, res, next) => {
    try {
      const startTime = new Date(parseInt(req.query.start as string) || Date.now() - 24 * 60 * 60 * 1000)
      const endTime = new Date(parseInt(req.query.end as string) || Date.now())
      const includeTags = req.query.tags ? (req.query.tags as string).split(',') : undefined
      const excludeTags = Array.from(p2pNode.getBlockedTags())
      
      const messages = await getMessages(startTime, endTime, includeTags, excludeTags)
      res.json(messages)
    } catch (err) {
      next(err)
    }
  })

  // Delete old messages (admin only)
  app.delete('/messages', requireAdmin, async (req, res, next) => {
    try {
      const olderThan = new Date(parseInt(req.query.olderThan as string) || Date.now() - 7 * 24 * 60 * 60 * 1000)
      await deleteMessagesBefore(olderThan)
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  })

  // Broadcast a message
  app.post('/broadcast', async (req, res, next) => {
    try {
      const validatedData = MessageSchema.parse(req.body)
      const message: Message = {
        id: Math.random().toString(36).substr(2, 9),
        ...validatedData,
        timestamp: Date.now(),
        tags: validatedData.tags || []
      }
      await p2pNode.broadcast(message)
      res.json({ success: true, messageId: message.id })
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: err.errors })
      } else {
        next(err)
      }
    }
  })

  // Get base tags (admin only)
  app.get('/admin/tags', requireAdmin, (req, res) => {
    res.json({ tags: p2pNode.getBaseTags() })
  })

  // Update base tags (admin only)
  app.put('/admin/tags', requireAdmin, async (req, res, next) => {
    try {
      const { tags } = TagsSchema.parse(req.body)
      await p2pNode.updateBaseTags(tags)
      res.json({ success: true, tags })
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: err.errors })
      } else {
        next(err)
      }
    }
  })

  // Get blocked tags (admin only)
  app.get('/admin/blocked-tags', requireAdmin, (req, res) => {
    res.json({ tags: Array.from(p2pNode.getBlockedTags()) })
  })

  // Update blocked tags (admin only)
  app.put('/admin/blocked-tags', requireAdmin, async (req, res, next) => {
    try {
      const { tags } = TagsSchema.parse(req.body)
      await p2pNode.updateBlockedTags(tags)
      res.json({ success: true, tags })
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: err.errors })
      } else {
        next(err)
      }
    }
  })

  // Block/unblock a peer (admin only)
  app.put('/admin/peers/:peerId/block', requireAdmin, async (req, res, next) => {
    try {
      const { peerId } = req.params
      const { blocked } = BlockSchema.parse(req.body)
      await p2pNode.blockPeer(peerId, blocked)
      res.json({ success: true, peerId, blocked })
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: err.errors })
      } else {
        next(err)
      }
    }
  })

  // Get blocked peers (admin only)
  app.get('/admin/blocked', requireAdmin, (req, res) => {
    res.json({ blockedPeers: Array.from(p2pNode.getBlockedPeers()) })
  })

  // Error handling
  app.use(errorHandler)

  return app
}