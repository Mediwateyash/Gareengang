import API_URL from '../config';

const AdminUsers = ({ onBack }) => {

    const handleSubmit = async (e) => {
        e.preventDefault();
        const username = e.target.adminUser.value;
        const password = e.target.adminPass.value;

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (res.ok) {
                alert('New Admin Added Successfully!');
                e.target.reset();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to add admin');
        }
    };

    return (
        <div className="admin-subview">
            <div className="subview-header">
                <button onClick={onBack} className="btn-back">← Back to Dashboard</button>
                <h2>Manage Access</h2>
            </div>

            <section className="form-section">
                <h3>Grant Admin Access</h3>
                <p style={{ marginBottom: '1rem', color: '#666' }}>Create new credentials for other team members to access this dashboard.</p>

                <form onSubmit={handleSubmit} className="memory-form">
                    <div className="form-group">
                        <label>New Username</label>
                        <input type="text" name="adminUser" required placeholder="e.g. yash_diwate" />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <input type="password" name="adminPass" required placeholder="Strong password" />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-submit">Create Admin User</button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default AdminUsers;
