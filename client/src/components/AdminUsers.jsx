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
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem',
                                                background: user.role === 'admin' ? '#fef08a' : '#e0e7ff',
                                                color: user.role === 'admin' ? '#854d0e' : '#3730a3'
                                            }}>
                                                {user.role}
                                            </span>
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
