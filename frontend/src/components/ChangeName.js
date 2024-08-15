import { useState } from 'react';
import { updateProfile } from 'firebase/auth';

const ChangeName = ({ user, onUpdate }) => {
    const [newName, setNewName] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChangeName = async () => {
        setSuccessMessage('');
        setErrorMessage('');
        try {
            await updateProfile(user, { displayName: newName });
            setSuccessMessage('Name updated successfully!');
            onUpdate(); // Refresh the user info in the dashboard
        } catch (e) {
            setErrorMessage('Failed to update name: ' + e.message);
        }
    };

    return (
        <div>
            <h3>Change Name</h3>
            <input
                type="text"
                placeholder="Enter new name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
            />
            <button onClick={handleChangeName}>Update Name</button>
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default ChangeName;
