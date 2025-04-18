import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { kadDHT } from '@libp2p/kad-dht'
import { bootstrap } from '@libp2p/bootstrap'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { WebSocketServer } from 'ws'
import type { Message, NodeState, PeerInfo, ValidationResult } from './types'
import EventEmitter from 'events'
import { generateKeyPair, signMessage, verifySignature, loadExistingKeyPair } from './crypto'
import { storePeerKey, getPeerKey, storeMessage, updatePeerTags, getPeerTags, updatePeerBlocked, isPeerBlocked, getBlockedTags as getBlockedTagsFromDb, updateBlockedTags as updateBlockedTagsInDb } from './db'
import forge from 'node-forge'

export const createNodeState = (): NodeState => ({
  node: null,
  peers: new Map(),
  processedMessages: new Set(),
  wsServer: null,
  keyPair: null,
  baseTags: process.env.BASE_TAGS?.split(',').map(t => t.trim()) || [],
  blockedPeers: new Set(process.env.BLOCKED_PEERS?.split(',').map(p => p.trim()) || []),
  blockedTags: new Set(),
  bootstrapNodes: process.env.BOOTSTRAP_NODES?.split(',').map(n => n.trim()) || [
    '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ'
  ]
})

export const createP2PNode = (port: number, wsPort: number, emitter: EventEmitter) => {
  const state = createNodeState()

  const setupPubSub = () => {
    if (!state.node) return

    state.node.pubsub.subscribe('network-messages', async (message) => {
      try {
        const msg: Message = JSON.parse(new TextDecoder().decode(message.data))
        
        // Skip messages from blocked peers
        if (state.blockedPeers.has(msg.sender) || await isPeerBlocked(msg.sender)) {
          return
        }

        if (state.processedMessages.has(msg.id)) {
          return // Deduplicate messages
        }
        
        state.processedMessages.add(msg.id)
        setTimeout(() => state.processedMessages.delete(msg.id), 60000) // Clear after 1 minute

        // Handle tag update messages
        if (msg.type === 'update-tags') {
          const isValid = await validateMessage(msg)
          if (isValid) {
            await updatePeerTags(msg.sender, msg.data.tags)
            if (state.peers.has(msg.sender)) {
              const peer = state.peers.get(msg.sender)!
              state.peers.set(msg.sender, { ...peer, tags: msg.data.tags })
            }
          }
        }
        
        // Store message if it's a broadcast or targeted at this node
        // Only store if message doesn't contain blocked tags
        if ((!msg.recipient || msg.recipient === state.node?.peerId.toString()) &&
            !msg.tags?.some(tag => state.blockedTags.has(tag))) {
          await storeMessage(msg)
        }
        
        // Always relay messages unless from blocked peers
        if (msg.recipient) {
          relayMessage(msg)
        }
        
        // Only emit message events for non-blocked tags
        if (!msg.tags?.some(tag => state.blockedTags.has(tag))) {
          emitter.emit('message', msg)
        }
      } catch (err) {
        console.error('Error processing message:', err)
      }
    })

    // Subscribe to peer announcements
    state.node.pubsub.subscribe('peer-announcements', async (message) => {
      try {
        const announcement = JSON.parse(new TextDecoder().decode(message.data))
        const tags = await getPeerTags(announcement.peerId)
        const blocked = state.blockedPeers.has(announcement.peerId)
        await storePeerKey(announcement.peerId, announcement.publicKey, tags, blocked)
        if (state.peers.has(announcement.peerId)) {
          const peer = state.peers.get(announcement.peerId)!
          state.peers.set(announcement.peerId, { ...peer, tags, blocked })
        }
      } catch (err) {
        console.error('Error processing peer announcement:', err)
      }
    })
  }

  const setupWebSocket = () => {
    state.wsServer = new WebSocketServer({ port: wsPort })
    
    state.wsServer.on('connection', (ws) => {
      ws.on('message', async (data) => {
        try {
          const msg: Message = JSON.parse(data.toString())
          await broadcast(msg)
        } catch (err) {
          console.error('Error processing WebSocket message:', err)
        }
      })
      
      // Send peer list on connection
      ws.send(JSON.stringify({
        type: 'peers',
        data: Array.from(state.peers.values())
      }))
    })
  }

  const validateMessage = async (message: Message): Promise<boolean> => {
    const senderKey = await getPeerKey(message.sender)
    if (!senderKey) return false
    return verifySignature(message, senderKey)
  }

  const validateAndAddResult = async (message: Message): Promise<Message> => {
    if (!state.node) return message

    const senderKey = await getPeerKey(message.sender)
    if (!senderKey) return message

    const isValid = verifySignature(message, senderKey)
    const validation: ValidationResult = {
      relayId: state.node.peerId.toString(),
      isValid,
      timestamp: Date.now()
    }

    return {
      ...message,
      validations: [...(message.validations || []), validation]
    }
  }

  const broadcast = async (message: Message) => {
    if (!state.node || !state.keyPair) return
    
    const baseMessage = {
      ...message,
      timestamp: Date.now(),
      sender: state.node.peerId.toString(),
      relayPath: message.relayPath || [],
      validations: [],
      tags: message.tags || []
    }

    const signature = signMessage(baseMessage, state.keyPair.privateKey)
    const signedMessage = { ...baseMessage, signature }
    const validatedMessage = await validateAndAddResult(signedMessage)
    
    // Store message only if it doesn't contain blocked tags
    if ((!validatedMessage.recipient || validatedMessage.recipient === state.node.peerId.toString()) &&
        !validatedMessage.tags?.some(tag => state.blockedTags.has(tag))) {
      await storeMessage(validatedMessage)
    }
    
    const msgBuffer = new TextEncoder().encode(JSON.stringify(validatedMessage))
    await state.node.pubsub.publish('network-messages', msgBuffer)
  }

  const updateTags = async (tags: string[]) => {
    if (!state.node) return
    
    const message: Message = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'update-tags',
      data: { tags: [...state.baseTags, ...tags] },
      sender: state.node.peerId.toString(),
      timestamp: Date.now(),
      signature: '',
      validations: [],
      tags: []
    }

    await broadcast(message)
  }

  const updateBaseTags = async (tags: string[]) => {
    state.baseTags = tags
    process.env.BASE_TAGS = tags.join(',')
    await updateTags([])
  }

  const updateBlockedTags = async (tags: string[]) => {
    await updateBlockedTagsInDb(tags)
    state.blockedTags = new Set(tags)
  }

  const blockPeer = async (peerId: string, blocked: boolean) => {
    if (blocked) {
      state.blockedPeers.add(peerId)
    } else {
      state.blockedPeers.delete(peerId)
    }
    process.env.BLOCKED_PEERS = Array.from(state.blockedPeers).join(',')
    await updatePeerBlocked(peerId, blocked)
    
    if (state.peers.has(peerId)) {
      const peer = state.peers.get(peerId)!
      state.peers.set(peerId, { ...peer, blocked })
    }
  }

  const relayMessage = async (message: Message) => {
    if (!message.recipient || !state.node) return
    
    // Don't relay if we're the recipient
    if (message.recipient === state.node.peerId.toString()) {
      return
    }
    
    // Don't relay if we've already relayed this message
    if (message.relayPath?.includes(state.node.peerId.toString())) {
      return
    }
    
    // Don't relay messages from blocked peers
    if (state.blockedPeers.has(message.sender) || await isPeerBlocked(message.sender)) {
      return
    }
    
    // Add ourselves to the relay path and validate
    const validatedMessage = await validateAndAddResult({
      ...message,
      relayPath: [...(message.relayPath || []), state.node.peerId.toString()]
    })
    
    await broadcast(validatedMessage)
  }

  const announcePublicKey = async () => {
    if (!state.node || !state.keyPair) return

    const announcement = {
      peerId: state.node.peerId.toString(),
      publicKey: forge.pki.publicKeyToPem(state.keyPair.publicKey)
    }

    const msgBuffer = new TextEncoder().encode(JSON.stringify(announcement))
    await state.node.pubsub.publish('peer-announcements', msgBuffer)
  }

  const start = async () => {
    // Set up key pair - either load from env or generate new
    const privateKeyPem = process.env.PRIVATE_KEY?.trim()
    state.keyPair = privateKeyPem
      ? loadExistingKeyPair(privateKeyPem)
      : await generateKeyPair()

    // Load blocked tags from database
    const blockedTags = await getBlockedTagsFromDb()
    state.blockedTags = new Set(blockedTags)

    state.node = await createLibp2p({
      addresses: {
        listen: [`/ip4/0.0.0.0/tcp/${port}`]
      },
      transports: [tcp()],
      connectionEncryption: [noise()],
      streamMuxers: [mplex()],
      dht: kadDHT(),
      peerDiscovery: [
        bootstrap({
          list: state.bootstrapNodes
        }),
        pubsubPeerDiscovery()
      ]
    })

    state.node.addEventListener('peer:discovery', async (evt) => {
      const peerId = evt.detail.id.toString()
      const tags = await getPeerTags(peerId)
      const blocked = state.blockedPeers.has(peerId)
      state.peers.set(peerId, {
        id: peerId,
        multiaddr: evt.detail.multiaddrs.map(m => m.toString()),
        lastSeen: Date.now(),
        publicKey: '',
        tags,
        blocked
      })
      emitter.emit('peer:discovered', state.peers.get(peerId))
    })

    await state.node.start()
    setupPubSub()
    setupWebSocket()
    await announcePublicKey()
    
    console.log(`P2P Node started with ID: ${state.node.peerId.toString()}`)
    console.log(`WebSocket server listening on port ${wsPort}`)

    // Log the private key if newly generated
    if (!privateKeyPem) {
      console.log('\nNew key pair generated. To reuse this identity, set this private key in your .env file:')
      console.log('\nPRIVATE_KEY="' + forge.pki.privateKeyToPem(state.keyPair.privateKey) + '"\n')
    }
  }

  const stop = async () => {
    if (state.node) {
      await state.node.stop()
      state.node = null
    }
    if (state.wsServer) {
      state.wsServer.close()
      state.wsServer = null
    }
  }

  const getPeers = (): PeerInfo[] => {
    return Array.from(state.peers.values())
  }

  const getBaseTags = (): string[] => {
    return [...state.baseTags]
  }

  const getBlockedTags = (): Set<string> => {
    return new Set(state.blockedTags)
  }

  const getBlockedPeers = (): Set<string> => {
    return new Set(state.blockedPeers)
  }

  const getBootstrapNodes = (): string[] => {
    return [...state.bootstrapNodes]
  }

  return {
    start,
    stop,
    broadcast,
    updateTags,
    updateBaseTags,
    updateBlockedTags,
    blockPeer,
    getPeers,
    getBaseTags,
    getBlockedPeers,
    getBlockedTags,
    getBootstrapNodes
  }
}