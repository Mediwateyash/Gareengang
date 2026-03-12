import { useState, useEffect } from 'react';
import apiUrl from '../config';
import './ServerLoader.css';

const loadingMessages = [
    "Waking up the GareebGang servers... 😴",
    "Hold on, data is getting loaded for you! 🚀",
    "Almost there! Our free server is doing some stretching... 🧘‍♂️",
    "Still loading? It's not you, our free hosting is just taking a power nap! 🛌",
    "Processing memories... packing bags... finding tickets... 🎒",
    "Any second now! Don't leave us hanging! 🥺",
    "Seriously, almost done... Just putting on shoes... 👟",
];

const ServerLoader = ({ onReady }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        let isMounted = true;

        // Message cycler
        const messageInterval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % loadingMessages.length);
        }, 5000); // Change message every 5 seconds

        // Ping the server to check if it's awake
        const pingServer = async () => {
            try {
                // Ping a lightweight endpoint, e.g. settings or a simple root health check
                const res = await fetch(`${apiUrl}/settings`);
                if (res.ok) {
                    if (isMounted) {
                        setIsLoading(false);
                        onReady(); // Tell App we are good to go
                    }
                } else {
                    // If it failed but didn't throw, try again soon
                    if (isMounted) setTimeout(pingServer, 2000);
                }
            } catch (err) {
                // Server is down/sleeping, keep trying
                if (isMounted) setTimeout(pingServer, 2000);
            }
        };

        // Start pinging immediately
        pingServer();

        // Safety fallback: if 50 seconds pass, just let the app load anyway
        // to prevent permanent freezing if the ping route suddenly breaks
        const fallbackTimeout = setTimeout(() => {
            if (isMounted && isLoading) {
                setIsLoading(false);
                onReady();
            }
        }, 50000); // 50 seconds max wait

        return () => {
            isMounted = false;
            clearInterval(messageInterval);
            clearTimeout(fallbackTimeout);
        };
    }, [onReady, isLoading]);

    if (!isLoading) return null;

    return (
        <div className="server-loader-overlay">
            <div className="server-loader-content">
                <div className="loader-spinner"></div>
                <h2 className="loader-title">GareebGang</h2>
                <p className="loader-message fade-text" key={messageIndex}>
                    {loadingMessages[messageIndex]}
                </p>
                <div className="loader-progress-bar">
                    <div className="loader-progress-fill"></div>
                </div>
            </div>
        </div>
    );
};

export default ServerLoader;
