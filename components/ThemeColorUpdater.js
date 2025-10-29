"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function ThemeColorUpdater({
  lightColor = "#ffffff",
  darkColor = "#0f172a",
}) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // media-specific meta tags (supported by modern browsers)
    const ensureMeta = (media, color) => {
      let m = document.querySelector(`meta[name="theme-color"][media="${media}"]`);
      if (!m) {
        m = document.createElement("meta");
        m.setAttribute("name", "theme-color");
        m.setAttribute("media", media);
        document.head.appendChild(m);
      }
      m.setAttribute("content", color);
    };

    ensureMeta("(prefers-color-scheme: light)", lightColor);
    ensureMeta("(prefers-color-scheme: dark)", darkColor);

    // a general fallback meta (some Android browsers ignore media)
    let general = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!general) {
      general = document.createElement("meta");
      general.setAttribute("name", "theme-color");
      document.head.appendChild(general);
    }
    general.setAttribute("content", resolvedTheme === "dark" ? darkColor : lightColor);

    // cleanup not strictly necessary, we update existing tags in-place
  }, [resolvedTheme, lightColor, darkColor]);

  return null;
}