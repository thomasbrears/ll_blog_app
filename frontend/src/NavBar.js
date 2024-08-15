import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import useUser from './hooks/useUser';

const NavBar = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        signOut(getAuth()).then(() => {
            navigate('/');
        }).catch(error => {
            console.error("Error signing out:", error);
        });
    };

    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/about">About</Link>
                </li>
                <li>
                    <Link to="/articles">Articles</Link>
                </li>
                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>
            </ul>
            <div className="nav-right">
                {user
                    ? <button onClick={handleLogout}>Log Out</button>
                    : <button onClick={() => navigate('/login')}>Log In</button>}
            </div>
        </nav>
    );
}

export default NavBar;
