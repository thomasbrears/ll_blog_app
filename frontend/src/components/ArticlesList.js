import { Link } from 'react-router-dom';

const ArticlesList = ({ articles }) => {
    if (!articles || articles.length === 0) {
        return <p>No articles found.</p>;
    }

    return (
        <>
            {articles.map((article, index) => (
                <Link key={`${article.name}-${index}`} className="article-list-item" to={`/articles/${article.name}`}>
                    <h3>{article.title}</h3>
                    <p>{article.content && article.content[0] ? article.content[0].substring(0, 150) : 'No content available'}...</p>
                </Link>
            ))}
        </>
    );
}

export default ArticlesList;
