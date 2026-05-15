import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * VercelNavTabs – sliding hover-highlight + active-underline effect
 * Adapted from the Vercel tabs UI pattern (no shadcn / TypeScript required).
 *
 * Props:
 *   items: Array<{ name: string; to: string }>
 *   className?: string
 */
export function VercelNavTabs({ items, className = "" }) {
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
  const tabRefs = useRef([]);

  const activeIndex = items.findIndex((item) => item.to === location.pathname);

  // Update hover highlight position
  useEffect(() => {
    if (hoveredIndex !== null) {
      const el = tabRefs.current[hoveredIndex];
      if (el) {
        setHoverStyle({ left: `${el.offsetLeft}px`, width: `${el.offsetWidth}px` });
      }
    }
  }, [hoveredIndex]);

  // Update active underline position
  useEffect(() => {
    const update = () => {
      const el = tabRefs.current[activeIndex];
      if (el) {
        setActiveStyle({ left: `${el.offsetLeft}px`, width: `${el.offsetWidth}px` });
      }
    };
    update();
    // Run after paint to get correct layout
    const id = requestAnimationFrame(update);
    return () => cancelAnimationFrame(id);
  }, [activeIndex]);

  return (
    <div
      className={`relative flex items-center gap-[6px] select-none ${className}`}
      style={{ position: "relative" }}
    >
      {/* Hover highlight pill */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          borderRadius: "6px",
          background: "rgba(255,255,255,0.12)",
          transition: "left 300ms ease-out, width 300ms ease-out, opacity 200ms ease-out",
          opacity: hoveredIndex !== null ? 1 : 0,
          pointerEvents: "none",
          ...hoverStyle,
        }}
      />

      {/* Active underline indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "-6px",
          height: "2px",
          background: "#ffffff",
          borderRadius: "1px",
          transition: "left 300ms ease-out, width 300ms ease-out",
          pointerEvents: "none",
          ...activeStyle,
        }}
      />

      {items.map((item, index) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            style={{ textDecoration: "none" }}
          >
            <button
              ref={(el) => { tabRefs.current[index] = el; }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                position: "relative",
                zIndex: 10,
                height: "32px",
                padding: "0 14px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: "6px",
                outline: "none",
                color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
                fontWeight: isActive ? 700 : 500,
                fontSize: "0.875rem",
                lineHeight: "1.25rem",
                whiteSpace: "nowrap",
                transition: "color 200ms ease-out",
                fontFamily: "inherit",
              }}
            >
              {item.name}
            </button>
          </Link>
        );
      })}
    </div>
  );
}
