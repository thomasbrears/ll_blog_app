import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, browserSessionPersistence, browserLocalPersistence } from "firebase/auth";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    // Get the redirect location from the state, or default to articles
    const redirectPath = location.state?.from || '/articles';

    const login = async () => {
        try {
            const auth = getAuth();

            // Set persistence based on Remember Me option
            const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await auth.setPersistence(persistence);

            await signInWithEmailAndPassword(auth, email, password);
            navigate(redirectPath); // Redirect to the intended page after login
        } catch (e) {
            if (e.code === 'auth/wrong-password') {
                setError('The password you entered is incorrect.');
            } else if (e.code === 'auth/user-not-found') {
                setError('No account found with this email.');
            } else {
                setError(e.message);
            }
        }
    };

    return (
        <>
        <h1>Login Page</h1>
        {error && <p className="error">{error}</p>}

        <input 
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}/>
        <input 
            type="password"
            placeholder="Your password"
            value={password}
            onChange={e => setPassword(e.target.value)}/>
        
        <div>
            <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={e => setRememberMe(e.target.checked)} 
            />
            <label>Remember Me</label>
        </div>

        <button onClick={login}>Login</button>
        <Link to="/create-account">Don't have an account? Create one here</Link>
        <br />
        <Link to="/reset-password">Forgot your password? Reset it here</Link>
        </>
    );
}

export default LoginPage;
