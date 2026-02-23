import { useEffect, useState } from 'react';
import API_URL from '../config';
import './Stats.css';

const Stats = () => {
    const [stats, setStats] = useState({
        trips: 0,
        cities: 0,
        memories: 0,
        years: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_URL}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };
        fetchStats();
    }, []);

    const statItems = [
        { label: 'Trips done', value: stats.trips, icon: '✈️' },
        { label: 'Cities visited', value: stats.cities, icon: '🗺️' },
        { label: 'Memories created', value: stats.memories, icon: '📸' },
        { label: 'Years together', value: stats.years, icon: '❤️' }
    ];

    return (
        <section className="stats-section">
            <div className="container">
                <div className="stats-grid">
                    {statItems.map((item, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-icon">{item.icon}</div>
                            <div className="stat-value">{item.value}</div>
                            <div className="stat-label">{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
