import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import "../../styles/BurgerMenu.css";
import burgerIcon from "../../assets/images/func-images/burger-menu.png";

function BurgerMenu({ items }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current?.contains(e.target)) return;
      if (e.target.closest?.(".burger-panel")) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const linkItems = items.filter((i) => i.type === "link" || i.type === "custom");
  const buttonItems = items.filter((i) => i.type === "button");

  const closeIfNavigating = (e) => {
    if (!e.defaultPrevented) setOpen(false);
  };

  const renderLink = (item, i) => {
    if (item.type === "custom") {
      return (
        <div key={i} className="burger-custom" onClick={() => setOpen(false)}>
          {item.render()}
        </div>
      );
    }
    return (
      <NavLink
        key={i}
        to={item.path}
        end={item.path === "/"}
        className={({ isActive }) => `burger-item ${isActive ? "is-active" : ""}`}
        onClick={(e) => { item.onClick?.(e); closeIfNavigating(e); }}
      >
        {item.icon && <img src={item.icon} alt="" className="burger-item-icon" />}
        <span>{item.label}</span>
      </NavLink>
    );
  };

  const renderButton = (item, i) => (
    <button
      key={i}
      type="button"
      className={`burger-item ${item.danger ? "burger-item-danger" : ""}`}
      onClick={(e) => { item.onClick?.(e); closeIfNavigating(e); }}
    >
      {item.icon && <img src={item.icon} alt="" className="burger-item-icon" />}
      <span>{item.label}</span>
    </button>
  );

  const panel = open ? (
    <>
      <div className="burger-backdrop" onClick={() => setOpen(false)} />
      <nav className="burger-panel" aria-label="Site menu">
        <div className="burger-brand">
          <span className="burger-brand-mark" />
          <div className="burger-brand-text">
            <h2>Grey Matter</h2>
            <span>Menu</span>
          </div>
        </div>

        <div className="burger-items">
          {linkItems.map(renderLink)}
        </div>

        {buttonItems.length > 0 && (
          <div className="burger-items-bottom">
            {buttonItems.map(renderButton)}
          </div>
        )}
      </nav>
    </>
  ) : null;

  return (
    <div className="burger-wrap" ref={wrapRef}>
      <button
        type="button"
        className="burger-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <img src={burgerIcon} alt="" className="burger-icon" />
      </button>

      {panel && createPortal(panel, document.body)}
    </div>
  );
}

export default BurgerMenu;