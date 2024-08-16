import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import express from 'express';
import 'dotenv/config';
import { db, connectToDb } from './db.js';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const credentials = JSON.parse(
    fs.readFileSync('./credentials.json')
);
admin.initializeApp({
    credential: admin.credential.cert(credentials),
});

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

// Optional Authentication Middleware
app.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;

    if (token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            const user = await admin.auth().getUser(decodedToken.uid);
            req.user = {
                email: user.email,
                displayName: user.displayName,
                uid: user.uid,
            };
        } catch (e) {
            console.log('Invalid token, proceeding without user:', e);
        }
    }

    next(); // Proceed to the next middleware regardless of authentication status
});

// Public route - Fetch all articles
app.get('/api/articles', async (req, res) => {
    try {
        const articles = await db.collection('articles').find({}).toArray();
        res.status(200).json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.sendStatus(500);
    }
});

// Public route - Fetch a single article by name
app.get('/api/articles/:name', async (req, res) => {
    const { name } = req.params;
    const uid = req.user ? req.user.uid : null;

    try {
        const article = await db.collection('articles').findOne({ name });

        if (article) {
            const upvoteIds = article.upvoteIds || [];
            article.canUpvote = uid ? !upvoteIds.includes(uid) : false;
            res.json(article);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error("Error fetching article:", error);
        res.sendStatus(500);
    }
});

// Fetch user details by UID
app.get('/api/users/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        const userRecord = await admin.auth().getUser(uid);
        res.json({
            displayName: userRecord.displayName,
            email: userRecord.email,
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Failed to fetch user details' });
    }
});

// Ensure that all following routes require authentication
app.use((req, res, next) => {
    if (req.user && req.user.uid) {
        next();
    } else {
        res.sendStatus(401);
    }
});

// Create a new article
app.post('/api/articles', async (req, res) => {
    const { name, title, content } = req.body;
    const { email, displayName, uid } = req.user;

    try {
        const existingArticle = await db.collection('articles').findOne({ name });
        if (existingArticle) {
            return res.status(409).json({ message: 'Article with this name already exists' });
        }

        const createdAt = new Date().toISOString();
        const createdBy = displayName || email;

        const newArticle = {
            name,
            title,
            content,
            createdByUid: uid,
            createdAt,
            upvotes: 0,
            comments: [],
            upvoteIds: [],
        };

        await db.collection('articles').insertOne(newArticle);
        res.status(201).json(newArticle);
    } catch (error) {
        console.error('Error creating article:', error);
        res.sendStatus(500);
    }
});

// Fetch articles created by a user
app.get('/api/users/:uid/articles', async (req, res) => {
    const { uid } = req.params;

    try {
        const articles = await db.collection('articles').find({ createdByUid: uid }).toArray();
        res.json(articles);
    } catch (error) {
        console.error("Error fetching user's articles:", error);
        res.sendStatus(500);
    }
});

// Fetch articles upvoted by a user
app.get('/api/users/:uid/upvoted-articles', async (req, res) => {
    const { uid } = req.params;

    try {
        const articles = await db.collection('articles').find({ upvoteIds: uid }).toArray();
        res.json(articles);
    } catch (error) {
        console.error("Error fetching upvoted articles:", error);
        res.sendStatus(500);
    }
});

// Fetch comments made by a user
app.get('/api/users/:uid/comments', async (req, res) => {
    const { uid } = req.params;

    try {
        const articles = await db.collection('articles').find({ 'comments.postedByUid': uid }).toArray();

        const userComments = articles.flatMap(article => 
            article.comments
                .filter(comment => comment.postedByUid === uid)
                .map(comment => ({
                    ...comment,
                    articleName: article.name, 
                }))
        );

        res.json(userComments);
    } catch (error) {
        console.error("Error fetching user comments:", error);
        res.sendStatus(500);
    }
});

// Upvote an article
app.put('/api/articles/:name/upvote', async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;

    try {
        const article = await db.collection('articles').findOne({ name });

        if (article) {
            const upvoteIds = article.upvoteIds || [];
            const canUpvote = uid && !upvoteIds.includes(uid);

            if (canUpvote) {
                await db.collection('articles').updateOne({ name }, {
                    $inc: { upvotes: 1 },
                    $push: { upvoteIds: uid },
                });
            }

            const updatedArticle = await db.collection('articles').findOne({ name });
            res.json(updatedArticle);
        } else {
            res.send('That article doesn\'t exist');
        }
    } catch (error) {
        console.error("Error upvoting article:", error);
        res.sendStatus(500);
    }
});

// Add a comment to an article
app.post('/api/articles/:name/comments', async (req, res) => {
    const { name } = req.params;
    const { text } = req.body;
    const { email, displayName, uid } = req.user;

    const postedBy = displayName || email;
    const timestamp = new Date().toISOString();

    try {
        await db.collection('articles').updateOne({ name }, {
            $push: { comments: { postedBy, text, postedByUid: uid, timestamp } },
        });
        const article = await db.collection('articles').findOne({ name });

        if (article) {
            res.json(article);
        } else {
            res.send('That article doesn\'t exist!');
        }
    } catch (error) {
        console.error("Error adding comment:", error);
        res.sendStatus(500);
    }
});

const PORT = process.env.PORT || 8000;

connectToDb(() => {
    console.log('Successfully connected to database!');
    app.listen(PORT, () => {
        console.log('Server is listening on port ' + PORT);
    });
});
