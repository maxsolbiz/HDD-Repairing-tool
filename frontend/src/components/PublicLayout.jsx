// src/components/PublicLayout.jsx
import React, { useState, useEffect } from "react";
import PublicHeader from "./PublicHeader";
import Footer from "./Footer";
import FloatingThemeSelector from "./FloatingThemeSelector";

// Helper: calculates contrast color based on brightness.
function getContrastColor(hexColor) {
  let color = hexColor.replace("#", "");
  if (color.length === 3) color = color.split("").map((c) => c + c).join("");
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128 ? "#ffffff" : "#000000";
}

// Helper: adjustColor – darkens or lightens a hex color.
function adjustColor(color, percent) {
  let num = parseInt(color.slice(1), 16);
  let amt = Math.round(2.55 * percent);
  let R = Math.min(255, Math.max(0, (num >> 16) + amt));
  let G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  let B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

const presetThemes = {
  themeBlue: {
    headerFooterBg: "#2563eb",
    headerFooterText: "#ffffff",
  },
  themeGreen: {
    headerFooterBg: "#16a34a",
    headerFooterText: "#ffffff",
  },
  themePurple: {
    headerFooterBg: "#7c3aed",
    headerFooterText: "#ffffff",
  },
};

const PublicLayout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState("themeBlue");
  const [customColor, setCustomColor] = useState("#2563eb");

  // For a custom theme, compute header/footer background by darkening the base color.
  const customHeaderFooterBg = adjustColor(customColor, -20);
  const headerBg = theme === "custom" ? customHeaderFooterBg : presetThemes[theme].headerFooterBg;
  const headerText = theme === "custom" ? getContrastColor(customHeaderFooterBg) : presetThemes[theme].headerFooterText;

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedCustomColor = localStorage.getItem("customColor");
    if (savedTheme) setTheme(savedTheme);
    if (savedCustomColor) setCustomColor(savedCustomColor);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleCustomColorChange = (color) => {
    setCustomColor(color);
    localStorage.setItem("customColor", color);
  };

  return (
    <div
      style={{ "--header-bg": headerBg }}  // Set CSS variable
      className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    >
      <PublicHeader
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        theme={theme}
        customColor={headerBg}
        customTextColor={headerText}
      />
      <FloatingThemeSelector
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        customColor={customColor}
        onCustomColorChange={handleCustomColorChange}
        floatingColor={headerBg}
      />
      <div className="flex flex-grow pt-20 pb-16">
        <main className="flex-grow p-4 bg-white dark:bg-gray-800 animate-fadeIn">
          {children}
        </main>
      </div>
      <Footer
        theme={theme}
        customColor={headerBg}
        customTextColor={headerText}
      />
    </div>
  );
};

export default PublicLayout;
