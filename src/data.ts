import fs from 'fs';
import path from 'path';

export type Visibility = 'private' | 'public' | 'friends';

export type Badge = {
    id: string;
    name: string;
    description: string;
    conditionType: 'first_catch' | 'species_count' | 'total_catches' | 'biggest_fish' | 'location_based';
    conditionValue: number;
    speciesId?: string;
};

export type Species = {
    id: string;
    commonName: string;
    scientificName: string;
    imageUrl: string;
};

export type User = {
    id: string;
    username: string;
    email: string;
    profileImageUrl?: string | null;
    bio?: string;
    badges: Array<{ id: string; name: string; unlockedAt?: string }>;
    createdAt: string;
    updatedAt?: string;
};

export type Catch = {
    id: string;
    userId: string;
    speciesId?: string;
    speciesName?: string;
    lengthCm?: number;
    weightKg?: number;
    quantity?: number;
    caughtAt?: string;
    description?: string;
    imageUrls: string[];
    location?: { latitude: number; longitude: number; name?: string; suburb?: string; state?: string; country?: string };
    visibility: Visibility;
    isPostedToFeed: boolean;
    postId?: string;
    likeCount: number;
    commentCount: number;
    createdAt: string;
    updatedAt: string;
};

export type Post = {
    id: string;
    userId: string;
    catchId?: string;
    caption?: string;
    imageUrls?: string[];
    visibility?: 'public' | 'friends';
    likeCount: number;
    commentCount: number;
    createdAt: string;
    updatedAt: string;
};

export type Comment = {
    id: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
};

export const initialBadges: Badge[] = [
    { id: 'badge_first_catch', name: 'First Catch', description: 'Log your first catch.', conditionType: 'first_catch', conditionValue: 1 },
    { id: 'badge_flathead_hunter', name: 'Flathead Hunter', description: 'Catch 5 flathead.', conditionType: 'species_count', conditionValue: 5, speciesId: 'species_flathead' }
];

export const initialSpecies: Species[] = [
    { id: 'species_flathead', commonName: 'Flathead', scientificName: 'Platycephalidae', imageUrl: 'https://example.com/flathead.jpg' },
    { id: 'species_bream', commonName: 'Bream', scientificName: 'Acanthopagrus australis', imageUrl: 'https://example.com/bream.jpg' }
];

const db = {
    users: new Map<string, User>(),
    catches: new Map<string, Catch>(),
    posts: new Map<string, Post>(),
    comments: new Map<string, Comment>(),
    badges: [...initialBadges],
    species: [...initialSpecies],
    likes: new Set<string>(),
    follows: new Set<string>(),
    refreshTokens: new Set<string>(),
    passwordHashes: new Map<string, string>(),
    emailToUserId: new Map<string, string>(),
    refreshTokenToUserId: new Map<string, string>()
};

type Db = typeof db;
type PersistedData = {
    users?: User[];
    catches?: Catch[];
    posts?: Post[];
    comments?: Comment[];
    badges?: Badge[];
    species?: Species[];
    likes?: string[];
    follows?: string[];
    refreshTokens?: string[];
    passwordHashes?: Array<[string, string]>;
    emailToUserId?: Array<[string, string]>;
    refreshTokenToUserId?: Array<[string, string]>;
};

const defaultDataDir = path.join(__dirname, '..', 'data');
const dataFile = process.env.FISHSTAGRAM_DATA_FILE || path.join(defaultDataDir, 'fishstagram.json');
const dataDir = path.dirname(dataFile);

function mapValues<T extends { id: string }>(items: T[] | undefined) {
    return new Map((items || []).map(item => [item.id, item]));
}

function serialize(): PersistedData {
    return {
        users: [...db.users.values()],
        catches: [...db.catches.values()],
        posts: [...db.posts.values()],
        comments: [...db.comments.values()],
        badges: db.badges,
        species: db.species,
        likes: [...db.likes],
        follows: [...db.follows],
        refreshTokens: [...db.refreshTokens],
        passwordHashes: [...db.passwordHashes],
        emailToUserId: [...db.emailToUserId],
        refreshTokenToUserId: [...db.refreshTokenToUserId]
    };
}

function hydrate(data: PersistedData) {
    db.users = mapValues(data.users);
    db.catches = mapValues(data.catches);
    db.posts = mapValues(data.posts);
    db.comments = mapValues(data.comments);
    db.badges = data.badges || [...initialBadges];
    db.species = data.species || [...initialSpecies];
    db.likes = new Set(data.likes || []);
    db.follows = new Set(data.follows || []);
    db.refreshTokens = new Set(data.refreshTokens || []);
    db.passwordHashes = new Map(data.passwordHashes || []);
    db.emailToUserId = new Map(data.emailToUserId || []);
    db.refreshTokenToUserId = new Map(data.refreshTokenToUserId || []);
}

export function loadData() {
    if (!fs.existsSync(dataFile)) return;
    try {
        const raw = fs.readFileSync(dataFile, 'utf8');
        if (!raw.trim()) return;
        hydrate(JSON.parse(raw));
    } catch (error) {
        console.error('Failed to load persisted data:', error);
    }
}

export function saveData() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const tmpFile = `${dataFile}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(serialize(), null, 2));
    fs.renameSync(tmpFile, dataFile);
}

loadData();

export function getData() {
    return db;
}

export function setData(newData: Db) {
    Object.keys(newData).forEach(key => {
        const value = (newData as any)[key];
        if (Array.isArray(value)) {
            (db as any)[key] = [...value];
        } else if (value instanceof Map) {
            (db as any)[key] = new Map(value);
        } else if (value instanceof Set) {
            (db as any)[key] = new Set(value);
        }
    });
}
