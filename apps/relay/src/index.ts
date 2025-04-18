import 'dotenv/config'
import { EventEmitter } from 'events'
import { createP2PNode } from './p2p-node'
import { createAPI } from './api'

const P2P_PORT = parseInt(process.env.P2P_PORT || '6000', 10)
const WS_PORT = parseInt(process.env.WS_PORT || '6001', 10)
const API_PORT = parseInt(process.env.API_PORT || '6002', 10)

async function main() {
  try {
    const emitter = new EventEmitter()
    const node = createP2PNode(P2P_PORT, WS_PORT, emitter)
    await node.start()

    const api = createAPI(node)
    api.listen(API_PORT, () => {
      console.log(`REST API listening on port ${API_PORT}`)
    })

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down...')
      await node.stop()
      process.exit(0)
    })

    // Example of listening to events
    emitter.on('peer:discovered', (peer) => {
      console.log('New peer discovered:', peer.id)
    })

    emitter.on('message', (message) => {
      console.log('New message received:', message.type)
    })
  } catch (err) {
    console.error('Failed to start node:', err)
    process.exit(1)
  }
}

main()