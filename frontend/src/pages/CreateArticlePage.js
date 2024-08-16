import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useUser from '../hooks/useUser';

const CreateArticlePage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { user } = useUser();
    const navigate = useNavigate();

    // Function to generate name from title
    const generateNameFromTitle = (title) => {
        return title.toLowerCase().replace(/\s+/g, '-');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const name = generateNameFromTitle(title).trim(); // Ensure no leading/trailing spaces
        const token = user && await user.getIdToken();
    
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
        try {
            // Prepare the article data with createdAt and createdBy
            const articleData = {
                name,
                title,
                content: content.split('\n').map(paragraph => paragraph.trim()), // Ensure clean content
                createdAt: new Date().toISOString(), // Store the current timestamp
                createdBy: user?.email || "Unknown", // Store the email or default to "Unknown"
            };
    
            await axios.post('/api/articles', articleData, { headers });
            navigate(`/articles/${name}`);
        } catch (error) {
            console.error('Error creating article:', error);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <h1>Create a New Article</h1>
            <input
                type="text"
                placeholder="Article Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <textarea
                placeholder="Article Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="10"
                required
            ></textarea>
            <button type="submit">Create Article</button>
        </form>
    );
};

export default CreateArticlePage;
