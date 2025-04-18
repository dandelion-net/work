import { PrismaClient } from '@prisma/client'
import type { Message } from './types'

const prisma = new PrismaClient()

export const storePeerKey = async (peerId: string, publicKey: string, tags: string[] = [], blocked = false) => {
  await prisma.peerKey.upsert({
    where: { id: peerId },
    update: { 
      publicKey,
      tags: JSON.stringify(tags),
      blocked
    },
    create: { 
      id: peerId, 
      publicKey,
      tags: JSON.stringify(tags),
      blocked
    }
  })
}

export const updatePeerTags = async (peerId: string, tags: string[]) => {
  await prisma.peerKey.update({
    where: { id: peerId },
    data: { 
      tags: JSON.stringify(tags)
    }
  })
}

export const updatePeerBlocked = async (peerId: string, blocked: boolean) => {
  await prisma.peerKey.update({
    where: { id: peerId },
    data: { blocked }
  })
}

export const getPeerKey = async (peerId: string) => {
  const peer = await prisma.peerKey.findUnique({
    where: { id: peerId }
  })
  return peer?.publicKey
}

export const getPeerTags = async (peerId: string) => {
  const peer = await prisma.peerKey.findUnique({
    where: { id: peerId }
  })
  return peer ? JSON.parse(peer.tags) : []
}

export const isPeerBlocked = async (peerId: string) => {
  const peer = await prisma.peerKey.findUnique({
    where: { id: peerId }
  })
  return peer?.blocked || false
}

export const getAllPeerKeys = async () => {
  const peers = await prisma.peerKey.findMany()
  return peers.map(peer => ({
    ...peer,
    tags: JSON.parse(peer.tags)
  }))
}

export const storeMessage = async (message: Message) => {
  await prisma.message.create({
    data: {
      id: message.id,
      type: message.type,
      data: JSON.stringify(message.data),
      sender: message.sender,
      recipient: message.recipient,
      timestamp: new Date(message.timestamp),
      signature: message.signature,
      relayPath: message.relayPath ? JSON.stringify(message.relayPath) : null,
      validations: JSON.stringify(message.validations),
      tags: JSON.stringify(message.tags || [])
    }
  })
}

export const getMessages = async (startTime: Date, endTime: Date, tags?: string[], excludeTags?: string[]) => {
  const messages = await prisma.message.findMany({
    where: {
      timestamp: {
        gte: startTime,
        lte: endTime
      }
    },
    orderBy: {
      timestamp: 'desc'
    }
  })

  const parsedMessages = messages.map(msg => ({
    ...msg,
    data: JSON.parse(msg.data),
    relayPath: msg.relayPath ? JSON.parse(msg.relayPath) : undefined,
    validations: JSON.parse(msg.validations),
    tags: JSON.parse(msg.tags),
    timestamp: msg.timestamp.getTime()
  }))

  let filteredMessages = parsedMessages

  // Filter by included tags if provided
  if (tags && tags.length > 0) {
    filteredMessages = filteredMessages.filter(msg => 
      tags.some(tag => msg.tags.includes(tag))
    )
  }

  // Filter out excluded tags if provided
  if (excludeTags && excludeTags.length > 0) {
    filteredMessages = filteredMessages.filter(msg => 
      !excludeTags.some(tag => msg.tags.includes(tag))
    )
  }

  return filteredMessages
}

export const deleteMessagesBefore = async (timestamp: Date) => {
  await prisma.message.deleteMany({
    where: {
      timestamp: {
        lt: timestamp
      }
    }
  })
}

export const getBlockedTags = async (): Promise<string[]> => {
  const blockedTags = await prisma.blockedTag.findMany({
    select: { tag: true }
  })
  return blockedTags.map(t => t.tag)
}

export const updateBlockedTags = async (tags: string[]): Promise<void> => {
  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // Delete all existing blocked tags
    await tx.blockedTag.deleteMany()
    
    // Insert new blocked tags
    if (tags.length > 0) {
      await tx.blockedTag.createMany({
        data: tags.map(tag => ({ tag }))
      })
    }
  })
}