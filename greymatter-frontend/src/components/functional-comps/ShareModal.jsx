import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../../styles/ShareModal.css";
import phoneIcon from "../../assets/images/func-images/phone-icon.png";
import linkIcon from "../../assets/images/func-images/link-icon.png";

function ShareModal({ isOpen, onClose, subject, topic, score, total, percentage }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subjectSlug = subject?.toLowerCase().replace(/\s+/g, "-") || "";
  const shareUrl = subjectSlug
    ? `https://greymatterschool.co.za/${subjectSlug}`
    : "https://greymatterschool.co.za";

  const shareText = percentage
    ? `I just scored ${percentage}% on ${topic || subject} on Grey Matter. Try it free:`
    : `Check out Grey Matter - free high school practice for South Africa:`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${shareText} ${shareUrl}`
  )}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="share-modal-overlay">
      <div className="share-modal" ref={modalRef}>
        <button
          type="button"
          className="share-modal-close"
          onClick={onClose}
          aria-label="Close share modal"
        >
          ×
        </button>

        <div className="share-modal-header">
          <h3>Share with your class</h3>
          <p>
            {percentage
              ? `You scored ${score}/${total} (${percentage}%). Challenge a classmate!`
              : "Help a classmate study smarter."}
          </p>
        </div>

        <div className="share-modal-options">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="share-option share-option-whatsapp"
          >
            <img
              src={phoneIcon}
              alt=""
              className="share-option-icon-img share-option-icon-phone"
              aria-hidden="true"
            />
            <span className="share-option-label">Share on WhatsApp</span>
          </a>

          <button
            type="button"
            className="share-option share-option-copy"
            onClick={handleCopyLink}
          >
            <img
              src={linkIcon}
              alt=""
              className="share-option-icon-img share-option-icon-link"
              aria-hidden="true"
            />
            <span className="share-option-label">Copy link</span>
          </button>
        </div>

        <div className="share-modal-footer">
          <Link to={`/${subjectSlug}`} className="share-modal-link">
            Try another {subject} exercise →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;