import { useState } from 'react';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';

const ChangePassword = ({ user }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChangePassword = async () => {
        setSuccessMessage('');
        setErrorMessage('');

        if (newPassword !== confirmNewPassword) {
            setErrorMessage('New passwords do not match.');
            return;
        }

        try {
            // Re-authenticate the user
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update the password
            await updatePassword(user, newPassword);
            setSuccessMessage('Password updated successfully!');
        } catch (e) {
            if (e.code === 'auth/wrong-password') {
                setErrorMessage('The current password you entered is incorrect.');
            } else {
                setErrorMessage('Failed to update password: ' + e.message);
            }
        }
    };

    return (
        <div>
            <h3>Change Password</h3>
            <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <button onClick={handleChangePassword}>Update Password</button>
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default ChangePassword;
