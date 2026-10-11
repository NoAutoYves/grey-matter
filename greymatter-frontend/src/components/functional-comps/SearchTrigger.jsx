import { useState } from "react";
import SearchOverlay from "./SearchOverlay";
import searchIcon from "../../assets/images/func-images/search-icon.png";

function SearchTrigger({ className = "", iconClassName = "nav-img", label = "SEARCH" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
        aria-label="Open search"
      >
        <img src={searchIcon} alt="" className={iconClassName} aria-hidden="true" />
        {label}
      </button>
      {open && <SearchOverlay onClose={() => setOpen(false)} />}
    </>
  );
}

export default SearchTrigger;