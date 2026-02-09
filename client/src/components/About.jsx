import './About.css';

const About = () => {
    return (
        <section className="about-section">
            <div className="doodle-star">★</div>
            <div className="doodle-arrow">➔</div>

            <div className="about-container">
                <h2 className="section-title">Who We Are</h2>
                <div className="about-card">
                    <p className="about-text">
                        <span className="highlight">GareebGang</span> isn't just a group; it’s a vibe. Starting from the classrooms of <strong>Watumull College</strong>, we are a group of friends who refuse to let college life be boring.
                    </p>
                    <p className="about-text">
                        From random day-outs to planned trips that actually happen, we document our journey, share our unfiltered laughs, and build memories that last a lifetime. This platform is our <span className="highlight">digital home</span>—a place to share our vlogs, photos, and future plans with the world.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default About;
