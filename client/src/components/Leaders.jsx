import yashImg from '../assets/yash_president.png';
import manjushImg from '../assets/manjush_vp.png';
import './Leaders.css';

const Leaders = () => {
    return (
        <section className="leaders-section">
            <div className="container">
                <h2 className="section-title text-center">The Pillars of GareebGang</h2>

                <div className="leaders-grid">

                    {/* President Card */}
                    <div className="leader-card card-yash">
                        <div className="aura-ring ring-orange"></div>
                        <div className="leader-img-wrapper">
                            <img src={yashImg} alt="Diwate Yash" className="leader-img" />
                        </div>
                        <div className="leader-info">
                            <h3 className="leader-name">Diwate Yash</h3>
                            <p className="leader-title-marathi">अध्यक्ष (President)</p>
                            <p className="leader-desc">The Visionary in Orange.</p>
                        </div>
                    </div>

                    {/* Vice President Card */}
                    <div className="leader-card card-manjush">
                        <div className="aura-ring ring-blue"></div>
                        <div className="leader-img-wrapper">
                            <img src={manjushImg} alt="Manjush Farad" className="leader-img" />
                        </div>
                        <div className="leader-info">
                            <h3 className="leader-name">Manjush Farad</h3>
                            <p className="leader-title-marathi">उपाध्यक्ष (Vice President)</p>
                            <p className="leader-desc">Watumull Mitra Mandal.</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Leaders;
