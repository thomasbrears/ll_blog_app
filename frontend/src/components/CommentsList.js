// CommentsList.js
import React from 'react';

const CommentsList = ({ comments }) => (
    <>
        <h3>Comments:</h3>
        {comments.map((comment, index) => (
            <div key={index} className="comment">
                <p>
                    <strong>{comment.postedBy}</strong> 
                    {comment.timestamp && (
                        <span> ({new Date(comment.timestamp).toLocaleString()})</span>
                    )}
                </p>
                <br />
                <p>{comment.text}</p>
            </div>
        ))}
    </>
);

export default CommentsList;
