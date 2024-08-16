import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';

const ViewComments = ({ user }) => {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const fetchUserComments = async () => {
            try {
                const auth = getAuth();
                const token = await auth.currentUser.getIdToken();

                const response = await fetch(`/api/users/${user.uid}/comments`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch comments');
                }

                const userComments = await response.json();
                console.log("Fetched user comments:", userComments); // Log the fetched data
                setComments(userComments);
            } catch (error) {
                console.error('Error fetching user comments:', error);
            }
        };

        fetchUserComments();
    }, [user]);

    return (
        <div>
            <h3>Your Comments</h3>
            {comments.length > 0 ? (
                <ul>
                    {comments.map((comment, index) => (
                        <li key={index}>
                            <p>
                                <strong>Article: </strong> 
                                <Link to={`/articles/${comment.articleName}`}>
                                    {comment.articleName || "Unknown Article"}
                                </Link>
                                {comment.timestamp && (
                                    <span> ({new Date(comment.timestamp).toLocaleString()})</span>
                                )}
                                <br />
                                <strong>Comment:</strong> {comment.text}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>You haven't commented on any articles yet.</p>
            )}
        </div>
    );
};

export default ViewComments;
