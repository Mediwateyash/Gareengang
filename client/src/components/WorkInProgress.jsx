import './WorkInProgress.css';

const WorkInProgress = () => {
    return (
        <section className="wip-section">
            <div className="container">
                <div className="wip-badge">🚧 Work in Progress</div>
                <h2 className="wip-title">We’re Building Something Special</h2>
                <p className="wip-desc">
                    This platform will soon host <strong>trip planning tools</strong>, a <strong>memory gallery</strong>, and <strong>interactive community features</strong>.
                    Stay tuned!
                </p>

                <div className="progress-container">
                    <div className="progress-bar"></div>
                </div>
            </div>
        </section>
    );
};

export default WorkInProgress;
