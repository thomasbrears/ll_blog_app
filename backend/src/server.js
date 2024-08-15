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
})

app.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : req.headers.authtoken; // Fallback to 'authtoken' header

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
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }
    } else {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    next();
});


app.use((req, res, next) => {
    if (req.user && req.user.uid) {
        next();
    } else {
        res.sendStatus(401);
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
        // Find all articles that contain comments from this user
        const articles = await db.collection('articles').find({ 'comments.postedByUid': uid }).toArray();

        // Extract comments made by the user
        const userComments = articles.flatMap(article => 
            article.comments
                .filter(comment => comment.postedByUid === uid) // Filter by postedByUid
                .map(comment => ({
                    ...comment,
                    articleName: article.name, // You can also add article title if needed
                }))
        );

        res.json(userComments);
    } catch (error) {
        console.error("Error fetching user comments:", error);
        res.sendStatus(500);
    }
});


app.get('/api/articles/:name', async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;

    const article = await db.collection('articles').findOne({ name });

    if (article) {
        const upvoteIds = article.upvoteIds || [];
        article.canUpvote = uid && !upvoteIds.includes(uid);
        res.json(article);
    } else {
        res.sendStatus(404);
    }
});

app.put('/api/articles/:name/upvote', async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;

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
});

app.post('/api/articles/:name/comments', async (req, res) => {
    const { name } = req.params;
    const { text } = req.body;
    const { email, displayName, uid } = req.user;

    const postedBy = displayName || email; // Use displayName if available, otherwise use email

    await db.collection('articles').updateOne({ name }, {
        $push: { comments: { postedBy, text, postedByUid: uid } }, // Add postedByUid to track user ID
    });
    const article = await db.collection('articles').findOne({ name });

    if (article) {
        res.json(article);
    } else {
        res.send('That article doesn\'t exist!');
    }
});

const PORT = process.env.PORT || 8000;

connectToDb(() => {
    console.log('Successfully connected to database!');
    app.listen(PORT, () => {
        console.log('Server is listening on port ' + PORT);
    });
});
