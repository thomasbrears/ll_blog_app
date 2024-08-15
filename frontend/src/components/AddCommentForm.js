import { useState } from 'react';
import axios from 'axios';
import useUser from '../hooks/useUser';

const AddCommentForm = ({ articleName, onArticleUpdated }) => {
    const [commentText, setCommentText] = useState('');
    const { user } = useUser();

    const addComment = async () => {
        const token = user && await user.getIdToken();
        const headers = token ? { authtoken: token } : {};

        // Ensure displayName is used, fallback to email if displayName is not available
        const postedBy = user.displayName || user.email;

        const response = await axios.post(`/api/articles/${articleName}/comments`, {
            postedBy: postedBy,
            text: commentText,
        }, {
            headers,
        });
        const updatedArticle = response.data;
        onArticleUpdated(updatedArticle);
        setCommentText(''); // Clear the comment field after posting
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
