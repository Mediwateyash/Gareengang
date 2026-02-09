import yashImg from '../assets/yash_president.png';
import manjushImg from '../assets/manjush_vp.png';
import './Leaders.css';

const Leaders = () => {
    return (
        <section className="leaders-section">
            <div className="leaders-container">
                <h2 className="leaders-title">The Pillars</h2>

                <div className="leaders-grid">

                    {/* President Card */}
                    <div className="leader-card-scrap">
                        <div className="leader-img-box">
                            <img src={yashImg} alt="Diwate Yash" className="leader-img-scrap" />
                        </div>
                        <div className="leader-info-scrap">
                            <h3 className="leader-name-scrap">Diwate Yash</h3>
                            <p className="leader-role-scrap">President (अध्यक्ष)</p>
                            <p className="leader-desc-scrap">Watumull Mitra Mandal.</p>
                        </div>
                        <span className="note-deco">Leader #1</span>
                    </div>

                    {/* Vice President Card */}
                    <div className="leader-card-scrap">
                        <div className="leader-img-box">
                            <img src={manjushImg} alt="Manjush Farad" className="leader-img-scrap" />
                        </div>
                        <div className="leader-info-scrap">
                            <h3 className="leader-name-scrap">Manjush Farad</h3>
                            <p className="leader-role-scrap">Vice President (उपाध्यक्ष)</p>
                            <p className="leader-desc-scrap">Watumull Mitra Mandal.</p>
                        </div>
                        <span className="note-deco">The VP</span>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Leaders;
