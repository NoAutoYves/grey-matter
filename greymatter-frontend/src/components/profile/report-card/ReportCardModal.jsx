import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ReportCard from "./ReportCard";
import downloadIcon from "../../../assets/images/func-images/download-icon.png";
import "../../../styles/profile/report-card/ReportCardModal.css";

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ reports as MacIntel but has touch — detect that case.
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function ReportCardModal({ onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [onClose]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadError("");

    try {
      const el = document.querySelector(".report-card");
      if (!el) throw new Error("Report card not found in DOM");

      await (document.fonts?.ready ?? Promise.resolve());

      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const availW = pdfW - margin * 2;
      const availH = pdfH - margin * 2;

      let imgW = availW;
      let imgH = (canvas.height * imgW) / canvas.width;
      if (imgH > availH) {
        imgH = availH;
        imgW = (canvas.width * imgH) / canvas.height;
      }
      const x = (pdfW - imgW) / 2;

      pdf.addImage(imgData, "PNG", x, margin, imgW, imgH);

      const nameCell = el.querySelector(".rc-value");
      const safeName = (nameCell?.textContent || "student")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-]/g, "");
      const fileName = `report-card-${safeName || "student"}.pdf`;

      const pdfBlob = pdf.output("blob");
      const ios = isIosDevice();

      // iOS Safari ignores <a download> for blob URLs and jsPDF's save()
      // silently opens the PDF in the current tab without saving. Route
      // iOS through the Web Share API so the user gets the OS share sheet
      // with "Save to Files" as an option.
      if (ios && navigator.canShare) {
        try {
          const file = new File([pdfBlob], fileName, { type: "application/pdf" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: "Report Card" });
            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 2200);
            return;
          }
        } catch (shareErr) {
          // User cancelled the share sheet — do nothing else.
          if (shareErr?.name === "AbortError") {
            return;
          }
          // Otherwise fall through to the open-in-tab path.
          console.warn("Share API failed, falling back:", shareErr);
        }
      }

      if (ios) {
        // Fallback for iOS when share isn't available: open the PDF in a
        // new tab so iOS's native viewer takes over. From there the user
        // can tap Share → Save to Files.
        const blobUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.target = "_blank";
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Revoke after a delay — the tab needs time to load the blob first.
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2200);
        return;
      }

      // Desktop and Android Chrome: standard anchor download.
      pdf.save(fileName);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2200);
    } catch (e) {
      console.error("PDF generation failed:", e);
      setDownloadError("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const content = (
    <div className="rcm-root" role="presentation">
      <div className="rcm-backdrop" onClick={onClose}>
        <div
          className="rcm-shell"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rcm-title"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="rcm-header">
            <div className="rcm-header-left">
              <div className="rcm-badge">
                <FileIcon />
              </div>
              <div className="rcm-title-block">
                <h2 className="rcm-title" id="rcm-title">Report Card</h2>
                <p className="rcm-subtitle">School Year {new Date().getFullYear()}</p>
              </div>
            </div>
            <button
              type="button"
              className="rcm-close"
              onClick={onClose}
              aria-label="Close report card"
            >
              <CloseIcon />
            </button>
          </header>

          {downloadError && <div className="rcm-error">{downloadError}</div>}

          <div className="rcm-body">
            <ReportCard />
          </div>

          <footer className="rcm-footer">
            <span className="rcm-hint">
              Press <kbd>Esc</kbd> to close
            </span>
            <button
              type="button"
              className="rcm-btn-primary"
              onClick={handleDownload}
              disabled={downloading}
            >
              <img src={downloadIcon} alt="" className="rcm-btn-icon" aria-hidden="true" />
              {downloading ? "Generating…" : downloaded ? "Downloaded ✓" : "Download PDF"}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default ReportCardModal;