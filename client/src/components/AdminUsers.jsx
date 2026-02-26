import React, { useState, useEffect } from 'react';
import API_URL from '../config';

const AdminUsers = ({ onBack }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/users`);
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const res = await fetch(`${API_URL}/users/role/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                // Update local state without refetching
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
                alert(`Role updated to ${newRole} successfully.`);
            } else {
                alert('Failed to update role.');
            }
        } catch (err) {
            console.error('Error updating role:', err);
            alert('Error updating role.');
        }
    };

    return (
        <div className="admin-subview animate-fade-in">
            <div className="admin-header-flex">
                <button className="btn-back" onClick={onBack}>&larr; Back to Menu</button>
                <h2>Registered Users</h2>
            </div>

            <div className="admin-card">
                <h3>System Users Directory</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name / Username</th>
                                <th>Phone Number</th>
                                <th>System Role</th>
                                <th>Joined Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4">Loading users...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="4">No users found.</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={user.image || 'https://via.placeholder.com/40'} alt="Avatar" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                                                <strong>{user.name || user.username}</strong>
                                            </div>
                                        </td>
                                        <td>{user.phone || 'N/A'}</td>
                                        <td>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                style={{
                                                    padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem',
                                                    background: user.role === 'admin' ? '#fef08a' : user.role === 'member' ? '#dcfce7' : '#e0e7ff',
                                                    color: user.role === 'admin' ? '#854d0e' : user.role === 'member' ? '#166534' : '#3730a3',
                                                    border: '1px solid #cbd5e1',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="visitor">Visitor</option>
                                                <option value="member">Member</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
