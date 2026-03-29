export type VoteChoice = 'retain' | 'adopt';

export type SessionUser = {
  email: string;
  role: 'student' | 'admin';
};

type VoteRecord = {
  id: string;
  choice: VoteChoice;
  castAt: string;
};

type PersistedStore = {
  registeredVoters: number;
  votes: VoteRecord[];
  voterIndex: Record<string, string>;
};

export type AggregateResults = {
  totalVotes: number;
  registeredVoters: number;
  retainVotes: number;
  adoptVotes: number;
  lastUpdated: string;
};

const STORAGE_KEY = 'umak_plebiscite_store_v1';
const SESSION_KEY = 'umak_plebiscite_session_v1';
const ADMIN_EMAIL = 'admin@umak.edu.ph';
const DEFAULT_REGISTERED_VOTERS = 25000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isUmakEmail(email: string): boolean {
  return normalizeEmail(email).endsWith('@umak.edu.ph');
}

export function isAdminEmail(email: string): boolean {
  return normalizeEmail(email) === ADMIN_EMAIL;
}

function hashEmail(email: string): string {
  const input = normalizeEmail(email);
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return (hash >>> 0).toString(16);
}

function defaultStore(): PersistedStore {
  return {
    registeredVoters: DEFAULT_REGISTERED_VOTERS,
    votes: [],
    voterIndex: {},
  };
}

function readStore(): PersistedStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultStore();
    }

    const parsed = JSON.parse(raw) as Partial<PersistedStore>;
    return {
      registeredVoters:
        typeof parsed.registeredVoters === 'number' && Number.isFinite(parsed.registeredVoters)
          ? parsed.registeredVoters
          : DEFAULT_REGISTERED_VOTERS,
      votes: Array.isArray(parsed.votes) ? parsed.votes : [],
      voterIndex:
        parsed.voterIndex && typeof parsed.voterIndex === 'object'
          ? (parsed.voterIndex as Record<string, string>)
          : {},
    };
  } catch {
    return defaultStore();
  }
}

function writeStore(store: PersistedStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (!parsed.email || !isUmakEmail(parsed.email)) {
      return null;
    }

    return {
      email: normalizeEmail(parsed.email),
      role: isAdminEmail(parsed.email) ? 'admin' : 'student',
    };
  } catch {
    return null;
  }
}

export function setSession(email: string): SessionUser {
  const normalized = normalizeEmail(email);
  const session: SessionUser = {
    email: normalized,
    role: isAdminEmail(normalized) ? 'admin' : 'student',
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function hasVoted(email: string): boolean {
  const store = readStore();
  return Boolean(store.voterIndex[hashEmail(email)]);
}

export function getVoteForVoter(email: string): VoteChoice | null {
  const store = readStore();
  const voteId = store.voterIndex[hashEmail(email)];
  if (!voteId) {
    return null;
  }

  const vote = store.votes.find((record) => record.id === voteId);
  return vote ? vote.choice : null;
}

export function castVote(
  email: string,
  choice: VoteChoice,
): { ok: true } | { ok: false; reason: 'already-voted' | 'invalid-email' } {
  if (!isUmakEmail(email)) {
    return { ok: false, reason: 'invalid-email' };
  }

  const normalizedEmail = normalizeEmail(email);
  const emailHash = hashEmail(normalizedEmail);
  const store = readStore();

  if (store.voterIndex[emailHash]) {
    return { ok: false, reason: 'already-voted' };
  }

  const voteId = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  store.votes.push({
    id: voteId,
    choice,
    castAt: new Date().toISOString(),
  });
  store.voterIndex[emailHash] = voteId;

  writeStore(store);
  return { ok: true };
}

export function getAggregateResults(): AggregateResults {
  const store = readStore();
  const retainVotes = store.votes.filter((vote) => vote.choice === 'retain').length;
  const adoptVotes = store.votes.filter((vote) => vote.choice === 'adopt').length;
  const totalVotes = retainVotes + adoptVotes;
  const lastUpdated =
    store.votes.length > 0
      ? store.votes[store.votes.length - 1].castAt
      : new Date(0).toISOString();

  return {
    totalVotes,
    registeredVoters: store.registeredVoters,
    retainVotes,
    adoptVotes,
    lastUpdated,
  };
}
