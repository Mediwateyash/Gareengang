const Socials = () => {
    return (
        <section className="socials-section" style={{ padding: '60px 0', textAlign: 'center', background: 'var(--dark)' }}>
            <div className="container">
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Follow Our Journey</h3>
                <p style={{ color: '#aaa', marginBottom: '2rem' }}>Raw, real, unfiltered.</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <a href="#" className="btn btn-primary" style={{ background: '#FF0000', color: 'white' }}>YouTube</a>
                    <a href="#" className="btn btn-primary" style={{ background: '#E1306C', color: 'white' }}>Instagram</a>
                </div>
            </div>
        </section>
    );
};

export default Socials;
