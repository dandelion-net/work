export interface Vote {
  userId: string;
  vote: boolean;
}

export interface VouchPath {
  userId: string;
  level: number;
  weight: number;
  path: string[];
}

export interface VouchTree {
  direct: VouchPath[];
  indirect: VouchPath[];
  totalWeight: number;
}

export interface VoteResult {
  totalWeight: number;
  weightedVotes: {
    [userId: string]: {
      vote: boolean;
      weight: number;
      vouchTree: VouchTree;
    };
  };
}

export interface User {
  id: string;
  apiKey: string;
}

export interface Topic {
  id: string;
}

export interface Vouch {
  id: string;
  voucherId: string;
  vouchedId: string;
  topicId: string;
  createdAt: Date;
}