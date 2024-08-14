import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const login = async () => {
        try {
            await signInWithEmailAndPassword(getAuth(), email, password);
            navigate('/articles');
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <>
        <h1>Login Page</h1>
        {error && <p className="error">{error}</p>}

        <input 
            placeholder="your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}/>
        <input 
            type="password"
            placeholder="your password"
            value={password}
            onChange={e => setPassword(e.target.value)}/>
            
        <button onClick={login}>Login</button>
        <Link to="/create-account">Dont have an account? Create one here</Link>
        </>
        
    );
}

export default LoginPage;