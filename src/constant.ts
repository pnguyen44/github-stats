export const PR_STATE = {
  open: 'open',
  closed: 'closed',
  all: 'all',
} as const;

export type PullRequestState = keyof typeof PR_STATE;
