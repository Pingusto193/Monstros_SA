import type { ID, ISODateTime } from './common';
import type { UserSummary } from './user';

export interface Comment {
  id: ID;
  sightingId: ID;
  author: UserSummary;
  text: string;
  createdAt: ISODateTime;
}

export interface CreateCommentInput {
  sightingId: ID;
  text: string;
}
