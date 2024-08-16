import { useState } from 'react';
import axios from 'axios';
import useUser from '../hooks/useUser';

const AddCommentForm = ({ articleName, onArticleUpdated }) => {
    const [commentText, setCommentText] = useState('');
    const { user } = useUser();

    const addComment = async () => {
        try {
            const token = user && await user.getIdToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.post(`/api/articles/${articleName}/comments`, {
                text: commentText,
            }, { headers });

            const updatedArticle = response.data;
            onArticleUpdated(updatedArticle);
            setCommentText(''); // Clear the comment field after posting
        } catch (error) {
            console.error('Error adding comment:', error);
            // Optionally, you can handle the error in the UI, e.g., show an error message.
        }
    }

    return (
        <div id="add-comment-form">
            <h3>Add a Comment</h3>
            {user && <p>You are posting as {user.displayName || user.email}</p>}
            <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows="4"
                cols="50" />
            <button onClick={addComment}>Add Comment</button>
        </div>
    )
}

export default AddCommentForm;
