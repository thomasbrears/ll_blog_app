import { useState, useEffect } from 'react';
import axios from 'axios';
import ArticlesList from '../components/ArticlesList';
import useUser from '../hooks/useUser';

const ArticlesListPage = () => {
    const [articles, setArticles] = useState([]);
    const [error, setError] = useState(null);
    const { user, isLoading } = useUser();

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const token = user ? await user.getIdToken() : null; // Get the auth token if the user is logged in
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const response = await axios.get('/api/articles', { headers });
                setArticles(response.data);
            } catch (error) {
                console.error('Error fetching articles:', error);
                setError(error);
            }
        };

        if (!isLoading) {
            fetchArticles();
        }
    }, [isLoading, user]);

    if (error) {
        return <div>Error loading articles. Please try again later.</div>;
    }

    return (
        <div>
            <h1>Articles</h1>
            {articles.length > 0 ? (
                <ArticlesList articles={articles} />
            ) : (
                <p>No articles available</p>
            )}
        </div>
    );
}

export default ArticlesListPage;
