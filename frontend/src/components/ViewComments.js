import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';

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
                            <strong>{comment.articleName || "Unknown Article"}:</strong> {comment.text}
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
