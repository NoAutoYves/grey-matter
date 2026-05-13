import facebook from "../../assets/images/social-media/facebook.png";
import twitter from "../../assets/images/social-media/twitter.png";
import instagram from "../../assets/images/social-media/instagram.png";
import tiktok from "../../assets/images/social-media/tik-tok.png"

function SocialMedia() {
    return (
        <section className="social">
            <p className="social-title"><b>FOLLOW US ON</b></p>
            <div className="social-links">
                <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
                    <img src={facebook} alt="Facebook" />
                </a>
                <a href="https://x.com/GreyMatter43836" target="_blank" rel="noopener noreferrer">
                    <img src={twitter} alt="Twitter" />
                </a>
                <a href="https://instagram.com/greymatterschool" target="_blank" rel="noopener noreferrer">
                    <img src={instagram} alt="Instagram" />
                </a>
                <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer">
                    <img src={tiktok} alt="Tik Tok" />
                </a>
            </div>
        </section>
    );
}

export default SocialMedia;