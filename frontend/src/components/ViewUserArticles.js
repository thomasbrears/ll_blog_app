import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';

const ViewUserArticles = ({ user }) => {
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        const fetchUserArticles = async () => {
            try {
                const auth = getAuth();
                const token = await auth.currentUser.getIdToken();

                console.log('User UID:', user.uid); // Log user ID

                const response = await fetch(`/api/users/${user.uid}/articles`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch articles');
                }

                const userArticles = await response.json();
                console.log('Fetched user articles:', userArticles); // Log fetched articles
                setArticles(userArticles);
            } catch (error) {
                console.error('Error fetching user articles:', error);
            }
        };

        fetchUserArticles();
    }, [user]);

    return (
        <div>
            <h3>Your Articles</h3>
            {articles.length > 0 ? (
                <ul>
                    {articles.map((article) => (
                        <li key={article._id}>
                            <Link to={`/articles/${article.name}`}>
                                {article.title} ({new Date(article.createdAt).toLocaleString()})
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>You haven't created any articles yet.</p>
            )}
        </div>
    );
};

export default ViewUserArticles;
