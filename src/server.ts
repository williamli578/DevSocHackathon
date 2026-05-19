import express, {NextFunction, Response} from 'express';
import cors from 'cors';
import multer from 'multer';
import {v4 as uuid} from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {getData} from './data';

const JWT_SECRET = process.env.JWT_SECRET || 'fishstagram_dev_secret_change_in_prod';
const JWT_EXPIRES_IN = '7d';

declare global {
    namespace Express {
        interface Request { userId?: string; }
    }
}

const upload = multer({storage: multer.memoryStorage()});

// Replace local db with shared data module
const db = getData();
const app = express();
app.use(cors());
app.use(express.json());

const now = () => new Date().toISOString();
const auth = (req: express.Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const tokenStr = authHeader.slice(7);
        try {
            const payload = jwt.verify(tokenStr, JWT_SECRET) as { userId: string };
            req.userId = payload.userId;
            if (!db.users.has(req.userId)) {
                return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not found.' } });
            }
            return next();
        } catch {
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token.' } });
        }
    }
    // Fallback: x-user-id header for local dev without a token
    req.userId = req.header('x-user-id') || 'user_demo';
    if (!db.users.has(req.userId)) db.users.set(req.userId, {
        id: req.userId,
        username: 'fishmaster',
        email: 'user@example.com',
        badges: [],
        createdAt: now()
    });
    next();
};

function paginate(items, limit = 20, cursor = null) {
    const start = cursor ? Number(cursor) : 0;
    const slice = items.slice(start, start + limit);
    const nextCursor = start + limit < items.length ? String(start + limit) : null;
    return {items: slice, nextCursor};
}

app.post('/api/auth/register', async (req, res) => {
    const {username, email, password} = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({error: {code: 'MISSING_FIELDS', message: 'Username, email, and password are required.'}});
    }
    if (db.emailToUserId.has(email)) {
        return res.status(409).json({error: {code: 'EMAIL_IN_USE', message: 'An account with that email already exists.'}});
    }
    const id = `user_${uuid().slice(0, 8)}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {id, username, email, profileImageUrl: null, bio: '', badges: [], createdAt: now(), updatedAt: now()};
    db.users.set(id, user);
    db.passwordHashes.set(id, passwordHash);
    db.emailToUserId.set(email, id);
    const accessToken = jwt.sign({userId: id}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
    const refreshToken = `refresh_${uuid()}`;
    db.refreshTokens.add(refreshToken);
    db.refreshTokenToUserId.set(refreshToken, id);
    res.status(201).json({user: {id, username, email}, accessToken, refreshToken});
});

app.post('/api/auth/login', async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({error: {code: 'MISSING_FIELDS', message: 'Email and password are required.'}});
    }
    const userId = db.emailToUserId.get(email);
    if (!userId) {
        return res.status(401).json({error: {code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.'}});
    }
    const hash = db.passwordHashes.get(userId);
    const valid = await bcrypt.compare(password, hash!);
    if (!valid) {
        return res.status(401).json({error: {code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.'}});
    }
    const user = db.users.get(userId)!;
    const accessToken = jwt.sign({userId}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
    const refreshToken = `refresh_${uuid()}`;
    db.refreshTokens.add(refreshToken);
    db.refreshTokenToUserId.set(refreshToken, userId);
    res.json({user: {id: user.id, username: user.username, email: user.email}, accessToken, refreshToken});
});

app.post('/api/auth/logout', (req, res) => {
    const {refreshToken} = req.body;
    if (refreshToken) {
        db.refreshTokens.delete(refreshToken);
        db.refreshTokenToUserId.delete(refreshToken);
    }
    res.json({message: 'Logged out successfully'});
});

app.post('/api/auth/refresh-token', (req, res) => {
    const {refreshToken} = req.body;
    if (!refreshToken || !db.refreshTokens.has(refreshToken)) {
        return res.status(401).json({error: {code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token.'}});
    }
    const userId = db.refreshTokenToUserId.get(refreshToken)!;
    const accessToken = jwt.sign({userId}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
    res.json({accessToken});
});
app.get('/api/auth/me', auth, (req, res) => res.json(db.users.get(req.userId)));

app.get('/api/users/:userId', (req, res) => {
    const u = db.users.get(req.params.userId);
    if (!u) return res.status(404).json({
        error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found.'
        }
    });
    res.json({
        id: u.id,
        username: u.username,
        profileImageUrl: u.profileImageUrl,
        bio: u.bio,
        totalCatches: [...db.catches.values()].filter(c => c.userId === u.id).length,
        totalBadges: u.badges?.length || 0,
        createdAt: u.createdAt
    });
});
app.patch('/api/me/profile', auth, (req, res) => {
    const u = db.users.get(req.userId);
    Object.assign(u, req.body, {updatedAt: now()});
    res.json(u);
});
app.get('/api/users/:userId/catches', auth, (req, res) => {
    const {userId} = req.params;
    const v = [...db.catches.values()].filter(c => c.userId === userId && (c.visibility === 'public' || c.userId === req.userId));
    res.json(paginate(v, Number(req.query.limit || 20), req.query.cursor));
});
app.get('/api/users/:userId/badges', (req, res) => {
    const u = db.users.get(req.params.userId);
    res.json({
        items: (u?.badges || []).map(b => ({
            ...b,
            unlockedAt: b.unlockedAt || now()
        }))
    });
});

app.post('/api/catches', auth, (req, res) => {
    const id = `catch_${uuid().slice(0, 8)}`;
    const c = {
        id,
        userId: req.userId,
        likeCount: 0,
        commentCount: 0,
        isPostedToFeed: false,
        imageUrls: [],
        quantity: 1, ...req.body,
        createdAt: now(),
        updatedAt: now()
    };
    db.catches.set(id, c);
    const newBadges = [];
    const userCatches = [...db.catches.values()].filter(x => x.userId === req.userId);
    const user = db.users.get(req.userId);
    if (userCatches.length === 1 && !user.badges.some(b => b.id === 'badge_first_catch')) {
        const b = {
            id: 'badge_first_catch',
            name: 'First Catch',
            unlockedAt: now()
        };
        user.badges.push(b);
        newBadges.push(b);
    }
    if (req.body.shareToFeed) {
        const postId = `post_${uuid().slice(0, 8)}`;
        const p = {
            id: postId,
            userId: req.userId,
            catchId: id,
            caption: req.body.description || '',
            imageUrls: req.body.imageUrls || [],
            visibility: req.body.visibility === 'private' ? 'friends' : req.body.visibility,
            likeCount: 0,
            commentCount: 0,
            createdAt: now(),
            updatedAt: now()
        };
        db.posts.set(postId, p);
        c.isPostedToFeed = true;
        c.postId = postId;
    }
    res.status(201).json({catch: c, newBadges});
});
app.get('/api/catches', auth, (req, res) => res.json(paginate([...db.catches.values()].filter(c => c.visibility === 'public' || c.userId === req.userId), Number(req.query.limit || 20), req.query.cursor)));
app.get('/api/catches/:catchId', auth, (req, res) => {
    const c = db.catches.get(req.params.catchId);
    if (!c) return res.status(404).json({
        error: {
            code: 'CATCH_NOT_FOUND',
            message: 'The requested catch could not be found.'
        }
    });
    if (c.visibility !== 'public' && c.userId !== req.userId) return res.status(403).json({
        error: {
            code: 'FORBIDDEN',
            message: 'Not allowed.'
        }
    });
    res.json(c);
});
app.patch('/api/catches/:catchId', auth, (req, res) => {
    const c = db.catches.get(req.params.catchId);
    if (!c) return res.status(404).json({
        error: {
            code: 'CATCH_NOT_FOUND',
            message: 'The requested catch could not be found.'
        }
    });
    if (c.userId !== req.userId) return res.status(403).json({
        error: {
            code: 'FORBIDDEN',
            message: 'Not allowed.'
        }
    });
    Object.assign(c, req.body, {updatedAt: now()});
    res.json(c);
});
app.delete('/api/catches/:catchId', auth, (req, res) => {
    const c = db.catches.get(req.params.catchId);
    if (!c) return res.status(404).json({
        error: {
            code: 'CATCH_NOT_FOUND',
            message: 'The requested catch could not be found.'
        }
    });
    if (c.userId !== req.userId) return res.status(403).json({
        error: {
            code: 'FORBIDDEN',
            message: 'Not allowed.'
        }
    });
    db.catches.delete(c.id);
    res.json({message: 'Catch deleted successfully'});
});

app.get('/api/map/catches', (req, res) => {
    const {minLat, maxLat, minLng, maxLng} = req.query;
    const items = [...db.catches.values()].filter(c => c.visibility === 'public' && c.location && c.location.latitude >= Number(minLat) && c.location.latitude <= Number(maxLat) && c.location.longitude >= Number(minLng) && c.location.longitude <= Number(maxLng)).map(c => ({
        catchId: c.id,
        speciesName: c.speciesName,
        latitude: c.location.latitude,
        longitude: c.location.longitude,
        imageUrl: c.imageUrls?.[0],
        caughtAt: c.caughtAt,
        user: {
            id: c.userId,
            username: db.users.get(c.userId)?.username || 'unknown'
        }
    }));
    res.json({items});
});
app.get('/api/map/catches/nearby', (req, res) => res.json({
    items: [...db.catches.values()].filter(c => c.visibility === 'public').map(c => ({
        catchId: c.id,
        speciesName: c.speciesName,
        distanceKm: 1.4,
        latitude: c.location?.latitude,
        longitude: c.location?.longitude,
        imageUrl: c.imageUrls?.[0],
        caughtAt: c.caughtAt
    }))
}));

app.post('/api/posts', auth, (req, res) => {
    const id = `post_${uuid().slice(0, 8)}`;
    const p = {
        id,
        userId: req.userId,
        likeCount: 0,
        commentCount: 0,
        createdAt: now(),
        updatedAt: now(), ...req.body
    };
    db.posts.set(id, p);
    res.status(201).json(p);
});
app.get('/api/feed', auth, (req, res) => res.json(paginate([...db.posts.values()], Number(req.query.limit || 20), req.query.cursor)));
app.get('/api/posts/:postId', auth, (req, res) => {
    const p = db.posts.get(req.params.postId);
    if (!p) return res.status(404).json({
        error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found.'
        }
    });
    res.json(p);
});
app.patch('/api/posts/:postId', auth, (req, res) => {
    const p = db.posts.get(req.params.postId);
    if (!p) return res.status(404).json({
        error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found.'
        }
    });
    if (p.userId !== req.userId) return res.status(403).json({
        error: {
            code: 'FORBIDDEN',
            message: 'Not allowed.'
        }
    });
    Object.assign(p, req.body, {updatedAt: now()});
    res.json(p);
});
app.delete('/api/posts/:postId', auth, (req, res) => {
    const p = db.posts.get(req.params.postId);
    if (!p) return res.status(404).json({
        error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found.'
        }
    });
    if (p.userId !== req.userId) return res.status(403).json({
        error: {
            code: 'FORBIDDEN',
            message: 'Not allowed.'
        }
    });
    db.posts.delete(p.id);
    res.json({message: 'Post deleted successfully'});
});

app.post('/api/posts/:postId/like', auth, (req, res) => {
    const key = `${req.userId}:${req.params.postId}`;
    db.likes.add(key);
    const p = db.posts.get(req.params.postId);
    if (p) p.likeCount = [...db.likes].filter(l => l.endsWith(`:${p.id}`)).length;
    res.json({
        postId: req.params.postId,
        hasLiked: true,
        likeCount: p?.likeCount || 0
    });
});
app.delete('/api/posts/:postId/like', auth, (req, res) => {
    const key = `${req.userId}:${req.params.postId}`;
    db.likes.delete(key);
    const p = db.posts.get(req.params.postId);
    if (p) p.likeCount = [...db.likes].filter(l => l.endsWith(`:${p.id}`)).length;
    res.json({
        postId: req.params.postId,
        hasLiked: false,
        likeCount: p?.likeCount || 0
    });
});
app.get('/api/posts/:postId/likes', (req, res) => res.json({items: [...db.likes].filter(k => k.endsWith(`:${req.params.postId}`)).map(k => db.users.get(k.split(':')[0])).filter(Boolean)}));

app.post('/api/posts/:postId/comments', auth, (req, res) => {
    const id = `comment_${uuid().slice(0, 8)}`;
    const c = {
        id,
        postId: req.params.postId,
        userId: req.userId,
        content: req.body.content,
        createdAt: now(),
        updatedAt: now()
    };
    db.comments.set(id, c);
    res.status(201).json(c);
});
app.get('/api/posts/:postId/comments', (req, res) => res.json(paginate([...db.comments.values()].filter(c => c.postId === req.params.postId), Number(req.query.limit || 20), req.query.cursor)));
app.patch('/api/comments/:commentId', auth, (req, res) => {
    const c = db.comments.get(req.params.commentId);
    if (!c) return res.status(404).json({
        error: {
            code: 'COMMENT_NOT_FOUND',
            message: 'Comment not found.'
        }
    });
    if (c.userId !== req.userId) return res.status(403).json({
        error: {
            code: 'FORBIDDEN',
            message: 'Not allowed.'
        }
    });
    c.content = req.body.content;
    c.updatedAt = now();
    res.json(c);
});
app.delete('/api/comments/:commentId', auth, (req, res) => {
    const c = db.comments.get(req.params.commentId);
    if (!c) return res.status(404).json({
        error: {
            code: 'COMMENT_NOT_FOUND',
            message: 'Comment not found.'
        }
    });
    db.comments.delete(req.params.commentId);
    res.json({message: 'Comment deleted successfully'});
});

app.get('/api/badges', (_req, res) => res.json({items: db.badges}));
app.get('/api/leaderboard', (_req, res) => {
    const rows = [...db.users.values()].map(u => ({
        userId: u.id,
        username: u.username,
        score: [...db.catches.values()].filter(c => c.userId === u.id).length
    }));
    rows.sort((a, b) => b.score - a.score);
    res.json({
        items: rows.map((r, i) => ({
            rank: i + 1, ...r,
            metric: 'total_catches'
        }))
    });
});
app.get('/api/species', (req, res) => {
    const q = (req.query.query || '').toString().toLowerCase();
    res.json({items: db.species.filter(s => !q || s.commonName.toLowerCase().includes(q))});
});
app.get('/api/species/:speciesId', (req, res) => {
    const sp = db.species.find(s => s.id === req.params.speciesId);
    if (!sp) return res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: 'Species not found.'
        }
    });
    res.json(sp);
});
app.post('/api/uploads/catch-image', auth, upload.single('file'), (_req, res) => res.json({imageUrl: `https://storage.example.com/catches/${uuid()}.jpg`}));
app.post('/api/uploads/profile-image', auth, upload.single('file'), (_req, res) => res.json({imageUrl: `https://storage.example.com/profiles/${uuid()}.jpg`}));

app.post('/api/users/:userId/follow', auth, (req, res) => {
    db.follows.add(`${req.userId}:${req.params.userId}`);
    res.json({
        followingUserId: req.userId,
        followedUserId: req.params.userId,
        isFollowing: true
    });
});
app.delete('/api/users/:userId/follow', auth, (req, res) => {
    db.follows.delete(`${req.userId}:${req.params.userId}`);
    res.json({
        followingUserId: req.userId,
        followedUserId: req.params.userId,
        isFollowing: false
    });
});
app.get('/api/users/:userId/followers', (req, res) => res.json({items: [...db.follows].filter(x => x.endsWith(`:${req.params.userId}`)).map(x => db.users.get(x.split(':')[0])).filter(Boolean)}));
app.get('/api/users/:userId/following', (req, res) => res.json({items: [...db.follows].filter(x => x.startsWith(`${req.params.userId}:`)).map(x => db.users.get(x.split(':')[1])).filter(Boolean)}));

app.get('/api/notifications', (_req, res) => res.json({
    items: [],
    nextCursor: null
}));
app.patch('/api/notifications/:notificationId/read', (req, res) => res.json({
    id: req.params.notificationId,
    isRead: true
}));
app.patch('/api/notifications/read-all', (_req, res) => res.json({message: 'All notifications marked as read'}));
app.get('/api/search', (req, res) => {
    const q = (req.query.query || '').toString().toLowerCase();
    res.json({
        users: [...db.users.values()].filter(u => u.username?.toLowerCase().includes(q)),
        species: db.species.filter(s => s.commonName.toLowerCase().includes(q)),
        catches: [...db.catches.values()].filter(c => c.speciesName?.toLowerCase().includes(q)),
        posts: [...db.posts.values()].filter(p => p.caption?.toLowerCase().includes(q))
    });
});

app.use((_req, res) => res.status(404).json({
    error: {
        code: 'NOT_FOUND',
        message: 'Route not found.'
    }
}));

const PORT = Number(process.env.PORT || 3000);
const server = app.listen(PORT, () => console.log(`Fishing backend running on ${PORT}`));
server.on('error', (err: any) => {
    console.error('Server failed to start:', err && err.code ? `${err.code} - ${err.message}` : err);
    process.exit(1);
});
