import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const CreateAccountPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [accountName, setAccountName] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const validatePassword = (password) => {
        // Example password requirement: Minimum 8 characters, at least one letter and one number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return passwordRegex.test(password);
    };

    const createAccount = async () => {
        const auth = getAuth();
        try {
            if (password !== confirmPassword) {
                setError('Password and confirm password do not match.');
                return;
            }

            if (!validatePassword(password)) {
                setError('Password must be at least 8 characters long and include both letters and numbers.');
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Set the account name
            await updateProfile(userCredential.user, {
                displayName: accountName
            });

            navigate('/articles');
        } catch (e) {
            if (e.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists.');
            } else {
                setError(e.message);
            }
        }
    };

    return (
        <>
        <h1>Create Account</h1>
        {error && <p className="error">{error}</p>}
        <input
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)} />
        <input
            placeholder="Your account name"
            value={accountName}
            onChange={e => setAccountName(e.target.value)} />
        <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={e => setPassword(e.target.value)} />
        <input
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)} />
        <button onClick={createAccount}>Create Account</button>
        <Link to="/login">Already have an account? Log in here</Link>
        </>
    );
}

export default CreateAccountPage;
