import facebook from "../../assets/images/social-media/facebook.png";
import twitter from "../../assets/images/social-media/twitter.png";
import instagram from "../../assets/images/social-media/instagram.png";
import tiktok from "../../assets/images/social-media/tik-tok.png";
import whatsapp from "../../assets/images/social-media/whatsapp-icon.png";
import '../../styles/LandingSubjectsAndMedia.css';

function SocialMedia() {
    return (
        <section className="social">
            <p className="social-title"><b>FOLLOW US ON</b></p>
            <div className="social-links">
                <a href="https://whatsapp.com/channel/0029Vb94e0660eBoDTDgBL2L" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Channel">
                    <img src={whatsapp} alt="WhatsApp" />
                </a>
                <a href="https://web.facebook.com/profile.php?id=61591544020692" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <img src={facebook} alt="Facebook" />
                </a>
                <a href="https://x.com/GreyMatter43836" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <img src={twitter} alt="Twitter" />
                </a>
                <a href="https://www.instagram.com/greymatterschool1/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <img src={instagram} alt="Instagram" />
                </a>
                <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                    <img src={tiktok} alt="Tik Tok" />
                </a>
            </div>
        </section>
    );
}

export default SocialMedia;