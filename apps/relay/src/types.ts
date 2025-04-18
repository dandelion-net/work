import type { Libp2p } from 'libp2p'
import type { WebSocketServer } from 'ws'
import type { pki } from 'node-forge'

export interface Message {
  id: string
  type: string
  data: any
  sender: string
  recipient?: string
  timestamp: number
  signature: string
  relayPath?: string[]
  validations: ValidationResult[]
  tags: string[]
}

export interface ValidationResult {
  relayId: string
  isValid: boolean
  timestamp: number
}

export interface PeerInfo {
  id: string
  multiaddr: string[]
  lastSeen: number
  publicKey: string
  tags: string[]
  blocked: boolean
}

export interface NodeState {
  node: Libp2p | null
  peers: Map<string, PeerInfo>
  processedMessages: Set<string>
  wsServer: WebSocketServer | null
  keyPair: {
    privateKey: pki.rsa.PrivateKey
    publicKey: pki.rsa.PublicKey
  } | null
  baseTags: string[]
  blockedPeers: Set<string>
  blockedTags: Set<string>
  bootstrapNodes: string[]
}