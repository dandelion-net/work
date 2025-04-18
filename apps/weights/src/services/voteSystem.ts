import { prisma } from '../db';
import { Vote, VoteResult, VouchPath, VouchTree } from '@dandelion/types';
import dotenv from 'dotenv';

dotenv.config();

const DIRECT_VOUCH_WEIGHT = parseFloat(process.env.DIRECT_VOUCH_WEIGHT || '0.2');
const INDIRECT_VOUCH_DECAY_RATE = parseFloat(process.env.INDIRECT_VOUCH_DECAY_RATE || '0.5');

export async function getVouchTree(
  userId: string,
  topicId: string,
  level: number = 0,
  visited = new Set<string>()
): Promise<VouchTree> {
  const result: VouchTree = {
    direct: [],
    indirect: [],
    totalWeight: 1.0 // Base weight
  };

  if (visited.has(userId)) {
    return result;
  }
  visited.add(userId);

  // Get direct vouches
  const directVouches = await prisma.vouch.findMany({
    where: {
      vouchedId: userId,
      topicId
    },
    select: {
      voucherId: true
    }
  });

  // Process direct vouches
  for (const directVouch of directVouches) {
    const weight = DIRECT_VOUCH_WEIGHT;
    result.direct.push({
      userId: directVouch.voucherId,
      level: 1,
      weight,
      path: [directVouch.voucherId]
    });
    result.totalWeight += weight;

    // Get indirect vouches for each direct voucher
    if (!visited.has(directVouch.voucherId)) {
      const indirectTree = await getVouchTree(directVouch.voucherId, topicId, level + 1, visited);
      
      // Process indirect vouches with decay
      for (const indirect of [...indirectTree.direct, ...indirectTree.indirect]) {
        if (!visited.has(indirect.userId)) {
          const decayedWeight = indirect.weight * INDIRECT_VOUCH_DECAY_RATE;
          const newPath = [directVouch.voucherId, ...indirect.path];
          
          result.indirect.push({
            userId: indirect.userId,
            level: indirect.level + 1,
            weight: decayedWeight,
            path: newPath
          });
          result.totalWeight += decayedWeight;
        }
      }
    }
  }

  return result;
}

export async function vouch(voucherId: string, vouchedId: string, topicId: string): Promise<boolean> {
  if (voucherId === vouchedId) return false;

  try {
    await prisma.vouch.create({
      data: {
        voucher: { connectOrCreate: { where: { id: voucherId }, create: { id: voucherId } } },
        vouched: { connectOrCreate: { where: { id: vouchedId }, create: { id: vouchedId } } },
        topic: { connectOrCreate: { where: { id: topicId }, create: { id: topicId } } }
      }
    });
    return true;
  } catch (error) {
    return false;
  }
}

export async function calculateVoteResult(topicId: string, votes: Vote[]): Promise<VoteResult> {
  const result: VoteResult = {
    totalWeight: 0,
    weightedVotes: {}
  };

  for (const vote of votes) {
    const vouchTree = await getVouchTree(vote.userId, topicId);
    
    result.weightedVotes[vote.userId] = {
      vote: vote.vote,
      weight: vouchTree.totalWeight,
      vouchTree
    };

    result.totalWeight += vote.vote ? vouchTree.totalWeight : -vouchTree.totalWeight;
  }

  return result;
}