import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';

const ViewUpvotedArticles = ({ user }) => {
    const [upvotedArticles, setUpvotedArticles] = useState([]);

    useEffect(() => {
        const fetchUpvotedArticles = async () => {
            try {
                const auth = getAuth();
                const token = await auth.currentUser.getIdToken();

                const response = await fetch(`/api/users/${user.uid}/upvoted-articles`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch upvoted articles');
                }

                const articles = await response.json();
                setUpvotedArticles(articles);
            } catch (error) {
                console.error('Error fetching upvoted articles:', error);
            }
        };

        fetchUpvotedArticles();
    }, [user]);

    return (
        <div>
            <h3>Your Upvoted Articles</h3>
            {upvotedArticles.length > 0 ? (
                <ul>
                    {upvotedArticles.map((article, index) => (
                        <li key={index}>{article.name || "Unknown/Untitled Article"}</li>
                    ))}
                </ul>
            ) : (
                <p>You haven't upvoted any articles yet.</p>
            )}
        </div>
    );
};

export default ViewUpvotedArticles;
