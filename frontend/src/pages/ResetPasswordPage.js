import { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const ResetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResetPassword = async () => {
        try {
            await sendPasswordResetEmail(getAuth(), email);
            setMessage('Password reset email sent. Please check your inbox.');
            setError(''); // Clear any previous error
        } catch (e) {
            setError(e.message);
            setMessage(''); // Clear any previous message
        }
    };

    return (
        <>
        <h1>Reset Password</h1>
        {message && <p className="message">{message}</p>}
        {error && <p className="error">{error}</p>}
        <input 
            type="email" 
            placeholder="Your email address" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
        />
        <button onClick={handleResetPassword}>Reset Password</button>
        </>
    );
}

export default ResetPasswordPage;
