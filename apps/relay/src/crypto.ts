import forge from 'node-forge'
import type { Message } from './types'

export const generateKeyPair = () => {
  return new Promise<forge.pki.rsa.KeyPair>((resolve, reject) => {
    forge.pki.rsa.generateKeyPair({ bits: 2048 }, (err, keyPair) => {
      if (err) reject(err)
      else resolve(keyPair)
    })
  })
}

export const loadExistingKeyPair = (privateKeyPem: string): {
  privateKey: forge.pki.rsa.PrivateKey
  publicKey: forge.pki.rsa.PublicKey
} => {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
  const publicKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e)
  return { privateKey, publicKey }
}

export const signMessage = (message: Omit<Message, 'signature'>, privateKey: forge.pki.rsa.PrivateKey): string => {
  const md = forge.md.sha256.create()
  const messageString = JSON.stringify({
    id: message.id,
    type: message.type,
    data: message.data,
    sender: message.sender,
    recipient: message.recipient,
    timestamp: message.timestamp
  })
  md.update(messageString, 'utf8')
  return forge.util.encode64(privateKey.sign(md))
}

export const verifySignature = (
  message: Message,
  publicKey: string
): boolean => {
  try {
    const md = forge.md.sha256.create()
    const messageString = JSON.stringify({
      id: message.id,
      type: message.type,
      data: message.data,
      sender: message.sender,
      recipient: message.recipient,
      timestamp: message.timestamp
    })
    md.update(messageString, 'utf8')
    
    const publicKeyObj = forge.pki.publicKeyFromPem(publicKey)
    const signature = forge.util.decode64(message.signature)
    
    return publicKeyObj.verify(md.digest().bytes(), signature)
  } catch (err) {
    console.error('Signature verification failed:', err)
    return false
  }
}

export const exportPrivateKey = (keyPair: forge.pki.rsa.KeyPair): string => {
  return forge.pki.privateKeyToPem(keyPair.privateKey)
}