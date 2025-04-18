# Dandelion Relay - A Decentralized P2P Network Node

A TypeScript-based peer-to-peer networking node that enables direct connections between instances, message relaying, and real-time communication. Built with libp2p for robust P2P functionality.

## Features

- 🌐 Completely decentralized architecture with no central server
- 🔍 Automatic peer discovery and connection management
- 📨 Message relaying with deduplication
- 🔒 Secure communication using noise encryption
- 🚀 REST API for easy integration
- ⚡ WebSocket support for real-time updates
- 📝 TypeScript for type safety
- 🎯 Event-based architecture
- 🔑 Cryptographic message signing and validation
- 📦 Stateless server with configurable private key

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/p2p-network-node.git
   cd p2p-network-node
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   P2P_PORT=6000
   WS_PORT=6001
   API_PORT=6002

   # Optional: RSA Private Key in PEM format
   # If not provided, a new key pair will be generated
   PRIVATE_KEY=""

   # Admin key for maintenance operations
   ADMIN_KEY=""

   # Base tags for this node (comma-separated)
   BASE_TAGS="node,server"

   # Personal blocklist (comma-separated peer IDs)
   BLOCKED_PEERS=""

   # Blocked tags (comma-separated)
   BLOCKED_TAGS=""

   # Bootstrap nodes (comma-separated multiaddrs)
   BOOTSTRAP_NODES="/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ"

   # Database Configuration
   DATABASE_URL="file:./dev.db"
   ```

4. Start the node:
   ```bash
   npm run dev
   ```

### Running Multiple Instances

To test P2P functionality locally, run multiple instances with different ports:

```bash
# Terminal 1
P2P_PORT=6000 WS_PORT=6001 API_PORT=6002 npm run dev

# Terminal 2
P2P_PORT=7000 WS_PORT=7001 API_PORT=7002 npm run dev
```

### Transferring Node Identity

When a node starts for the first time, it generates a new key pair and outputs the private key. To transfer this identity to another instance:

1. Copy the private key from the console output
2. Add it to the new instance's `.env` file:
   ```env
   PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
   ```
3. Start the new instance with the same identity

## API Documentation

### REST Endpoints

#### GET /health
Returns the current health status of the API.

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-04-17T21:19:00Z"
}
```

#### GET /peers
Returns a list of all known peers in the network.

Response:
```json
[
  {
    "id": "QmPeer1...",
    "multiaddr": ["/ip4/127.0.0.1/tcp/6000/p2p/QmPeer1..."],
    "lastSeen": 1689897654321,
    "publicKey": "-----BEGIN PUBLIC KEY-----\n...",
    "tags": ["node", "server"],
    "blocked": false
  }
]
```

#### GET /messages
Returns messages within a specified timeframe.

Query Parameters:
- `start` (optional): Start timestamp in milliseconds (defaults to 24 hours ago)
- `end` (optional): End timestamp in milliseconds (defaults to current time)
- `tags` (optional): Filter messages by tags (comma-separated)

Response:
```json
[
  {
    "id": "abc123",
    "type": "message",
    "data": {
      "content": "Hello, network!"
    },
    "sender": "QmPeer1...",
    "timestamp": 1689897654321,
    "signature": "...",
    "tags": ["chat", "public"]
  }
]
```

#### POST /broadcast
Broadcasts a message to all peers in the network.

Request:
```json
{
  "type": "message",
  "data": {
    "content": "Hello, network!"
  },
  "recipient": "QmPeer2...", // Optional: specific peer ID
  "tags": ["chat", "public"] // Optional: message tags
}
```

Response:
```json
{
  "success": true,
  "messageId": "abc123"
}
```

### Admin Endpoints

All admin endpoints require the `Authorization: Bearer <ADMIN_KEY>` header.

#### GET /admin/tags
Returns the list of base tags for this node.

#### PUT /admin/tags
Updates the list of base tags.

Request:
```json
{
  "tags": ["node", "server", "relay"]
}
```

#### GET /admin/blocked-tags
Returns the list of blocked tags.

#### PUT /admin/blocked-tags
Updates the list of blocked tags.

Request:
```json
{
  "tags": ["spam", "nsfw"]
}
```

#### PUT /admin/peers/{peerId}/block
Updates the blocked status of a peer.

Request:
```json
{
  "blocked": true
}
```

#### GET /admin/blocked
Returns the list of blocked peer IDs.

### WebSocket Events

Connect to the WebSocket server at `ws://localhost:<WS_PORT>` to receive real-time updates:

- Receive peer list on connection
- Receive new messages as they arrive (excluding messages with blocked tags)
- Send messages through the WebSocket connection

## Architecture

The P2P Network Node uses:

- [libp2p](https://github.com/libp2p/js-libp2p) for P2P networking - A modular peer-to-peer networking framework
- [Noise Protocol](https://github.com/ChainSafe/js-libp2p-noise) for encryption - A modern replacement for TLS
- [DHT](https://github.com/libp2p/js-libp2p-kad-dht) and [bootstrap nodes](https://github.com/libp2p/js-libp2p-bootstrap) for peer discovery
- [PubSub](https://github.com/libp2p/js-libp2p-pubsub) for message broadcasting
- [Express](https://expressjs.com/) for REST API
- [WebSocket](https://github.com/websockets/ws) for real-time communication - [WebSocket Protocol RFC](https://datatracker.ietf.org/doc/html/rfc6455)
- [RSA key pairs](https://github.com/digitalbazaar/forge) for message signing and validation - [Understanding RSA Encryption](https://en.wikipedia.org/wiki/RSA_(cryptosystem))
- [SQLite](https://www.sqlite.org/index.html) for storing peer public keys and message history - [SQLite Documentation](https://sqlite.org/docs.html)

### Message Handling

- Messages are cryptographically signed by the sender
- Signatures are validated at each relay hop
- Messages with blocked tags are not stored or emitted as events
- Messages from blocked peers are not relayed
- All messages are relayed regardless of their tags

### Database Schema

The node uses SQLite for persistence with the following schema:

#### PeerKey
- `id` (string, primary key): Peer identifier
- `publicKey` (string): PEM-encoded public key
- `tags` (string): JSON array of peer tags
- `blocked` (boolean): Whether the peer is blocked
- `createdAt` (datetime): Record creation timestamp
- `updatedAt` (datetime): Last update timestamp

#### Message
- `id` (string, primary key): Message identifier
- `type` (string): Message type
- `data` (string): JSON-encoded message payload
- `sender` (string): Sender's peer ID
- `recipient` (string, optional): Recipient's peer ID
- `timestamp` (datetime): Message creation time
- `signature` (string): Cryptographic signature
- `relayPath` (string): JSON array of relay peer IDs
- `validations` (string): JSON array of validation results
- `tags` (string): JSON array of message tags
- `createdAt` (datetime): Record creation timestamp

#### BlockedTag
- `tag` (string, primary key): Blocked tag name
- `createdAt` (datetime): Record creation timestamp
- `updatedAt` (datetime): Last update timestamp

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Use meaningful commit messages

## License

MIT License - see LICENSE file for details