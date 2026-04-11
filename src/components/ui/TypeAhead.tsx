import React from "react";
import Select, { StylesConfig } from "react-select";

export interface TypeAheadOption {
  value: string;
  label: string;
}

interface TypeAheadProps {
  options: TypeAheadOption[];
  value: TypeAheadOption | null;
  onChange: (value: TypeAheadOption | null) => void;
  className?: string;
  placeholder?: string;
  menuPlacement?: "auto" | "top" | "bottom";
  instanceId?: string;
}

const customStyles: StylesConfig<TypeAheadOption, false> = {
  control: (base) => ({
    ...base,
    minHeight: "38px",
    borderRadius: "0.25rem",
    borderColor: "#cbd5e1",
    "&:hover": {
      borderColor: "#94a3b8",
    },
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: "0 8px",
    color: "#334155",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#334155",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#64748b",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
    overflowX: "hidden",
    width: "max-content",
    minWidth: "100%",
  }),
  menuList: (base) => ({
    ...base,
    overflowX: "hidden",
  }),
  option: (base) => ({
    ...base,
    color: "#334155",
  }),
};

export const TypeAhead: React.FC<TypeAheadProps> = ({
  options,
  value,
  onChange,
  className = "",
  placeholder = "Select...",
  menuPlacement = "auto",
  instanceId,
}) => {
  // Avoid using a portal on iOS devices (mobile Safari) because creating a
  // MenuPortal can cause focus/blur and reflow behaviors that lead to nested
  // update issues in some environments. Use the document body portal only on
  // non-iOS platforms.
  const isIos =
    typeof navigator !== "undefined" &&
    /iP(hone|od|ad)/i.test(navigator.userAgent);
  return (
    <Select
      instanceId={instanceId || "typeahead-select"}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      classNamePrefix="react-select"
      styles={customStyles}
      menuPlacement={menuPlacement}
      menuPortalTarget={
        typeof document !== "undefined" && !isIos ? document.body : undefined
      }
    />
  );
};
