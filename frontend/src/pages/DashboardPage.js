import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import ChangeName from '../components/ChangeName';
import ChangePassword from '../components/ChangePassword';
import ViewUpvotedArticles from '../components/ViewUpvotedArticles';
import ViewComments from '../components/ViewComments';

const DashboardPage = () => {
    const [user, setUser] = useState(null);

    const refreshUser = () => {
        const auth = getAuth();
        setUser(auth.currentUser);
    };

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    return (
        <div>
            <h1>User Dashboard</h1>
            {user && (
                <div>
                    <p>Welcome, {user.displayName || user.email}</p>

                    <div>
                        <h2>Manage Your Account</h2>
                        <p>Your email is <strong>{user.email}</strong>
                        <br />If you want to change your email address, please contact us.</p>

                        <ChangeName user={user} onUpdate={refreshUser} />
                        <ChangePassword user={user} />
                    </div>

                    <div>
                        <h2>Your Activity</h2>
                        <ViewUpvotedArticles user={user} />
                        <ViewComments user={user} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;