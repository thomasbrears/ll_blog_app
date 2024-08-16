import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import NotFoundPage from './NotFoundPage';
import CommentsList from '../components/CommentsList';
import AddCommentForm from '../components/AddCommentForm';
import useUser from '../hooks/useUser';
import { getAuth } from 'firebase/auth';

const ArticlePage = () => {
    const [articleInfo, setArticleInfo] = useState({
        upvotes: 0,
        comments: [],
        canUpvote: false,
        content: [],
        createdAt: '',
        createdByUid: ''
    });
    const [authorName, setAuthorName] = useState('Unknown');
    const { canUpvote, content, createdAt } = articleInfo;
    const { articleId } = useParams();
    const { user, isLoading } = useUser();

    useEffect(() => {
        const loadArticleInfo = async () => {
            try {
                const token = user ? await user.getIdToken() : null; // Get the auth token if the user is logged in
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const response = await axios.get(`/api/articles/${articleId}`, { headers });
                const articleData = response.data;

                // Ensure that content is an array
                if (typeof articleData.content === 'string') {
                    articleData.content = [articleData.content];
                }

                setArticleInfo(articleData);

                // Fetch the author's display name using the createdByUid
                if (articleData.createdByUid) {
                    const auth = getAuth();
                    const currentUser = auth.currentUser;

                    // Check if the author is the current user
                    if (currentUser && currentUser.uid === articleData.createdByUid) {
                        setAuthorName(currentUser.displayName || currentUser.email);
                    } else {
                        // Fetch the author's display name via backend
                        const userResponse = await axios.get(`/api/users/${articleData.createdByUid}`);
                        setAuthorName(userResponse.data.displayName || 'Unknown');
                    }
                }
            } catch (error) {
                console.error('Error fetching article:', error);
            }
        };

        if (!isLoading) {
            loadArticleInfo();
        }
    }, [isLoading, user, articleId]);

    const addUpvote = async () => {
        try {
            const token = user && await user.getIdToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.put(`/api/articles/${articleId}/upvote`, null, { headers });
            setArticleInfo(response.data);
        } catch (error) {
            console.error('Error upvoting article:', error);
        }
    };

    if (!articleInfo) {
        return <NotFoundPage />;
    }

    return (
        <>
            <h1>{articleInfo.title}</h1>
            <div className="upvotes-section">
                <p>
                    {authorName && createdAt ? (
                        `Created by ${authorName} on ${new Date(createdAt).toLocaleString()}`
                    ) : (
                        'Creator information unavailable'
                    )}
                </p>
                <br />
                {user ? (
                    <button onClick={addUpvote}>{canUpvote ? 'Upvote' : 'Already Upvoted'}</button>
                ) : (
                    <button>Log in to upvote</button>
                )}
                <p>This article has {articleInfo.upvotes} upvote(s)</p>
            </div>
            {content && Array.isArray(content) ? (
                content.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                ))
            ) : (
                <p>No content available...</p>
            )}
            {user ? (
                <AddCommentForm
                    articleName={articleId}
                    onArticleUpdated={(updatedArticle) => setArticleInfo(updatedArticle)}
                />
            ) : (
                <button>Log in to add a comment</button>
            )}
            <CommentsList comments={articleInfo.comments} />
        </>
    );    
};

export default ArticlePage;
