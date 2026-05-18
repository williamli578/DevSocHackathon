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

export const db = {
    users: new Map<string, User>(),
    catches: new Map<string, Catch>(),
    posts: new Map<string, Post>(),
    comments: new Map<string, Comment>(),
    badges: [...initialBadges],
    species: [...initialSpecies],
    likes: new Set<string>(),
    follows: new Set<string>(),
    refreshTokens: new Set<string>()
};
