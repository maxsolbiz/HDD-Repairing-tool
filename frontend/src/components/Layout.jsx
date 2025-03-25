// src/components/Layout.jsx
import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import FloatingThemeSelector from "./FloatingThemeSelector";

// Preset themes mapping for header/footer.
const presetThemes = {
  themeBlue: {
    headerFooterBg: "#2563eb", // blue-600
    headerFooterText: "#ffffff",
  },
  themeGreen: {
    headerFooterBg: "#16a34a", // green-600
    headerFooterText: "#ffffff",
  },
  themePurple: {
    headerFooterBg: "#7c3aed", // purple-600
    headerFooterText: "#ffffff",
  },
};

// Preset sidebar mapping.
const presetSidebar = {
  themeBlue: {
    bg: "#bfdbfe", // blue-200
    text: "#1e3a8a", // blue-900
  },
  themeGreen: {
    bg: "#bbf7d0", // green-200
    text: "#14532d", // green-900
  },
  themePurple: {
    bg: "#e9d5ff", // purple-200
    text: "#4c1d95", // purple-900
  },
};

// Helper: calculates contrast color (white or black) based on perceived brightness.
function getContrastColor(hexColor) {
  let color = hexColor.replace("#", "");
  if (color.length === 3) {
    color = color.split("").map((c) => c + c).join("");
  }
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128 ? "#ffffff" : "#000000";
}

// Helper: adjustColor - darkens (negative percent) or lightens (positive percent) a color.
function adjustColor(color, percent) {
  let num = parseInt(color.slice(1), 16),
      amt = Math.round(2.55 * percent),
      R = Math.min(255, Math.max(0, (num >> 16) + amt)),
      G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt)),
      B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

const Layout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  // theme is either one of the preset keys or "custom"
  const [theme, setTheme] = useState("themeBlue");
  // For a custom theme, store the chosen base color.
  const [customColor, setCustomColor] = useState("#2563eb");

  // For custom theme, compute variants:
  // Header/Footer: darken customColor by 20%
  const customHeaderFooterBg = adjustColor(customColor, -20);
  // Sidebar: lighten customColor by 30%
  const customSidebarBg = adjustColor(customColor, 30);

  // Determine values to use:
  const headerBg = theme === "custom" ? customHeaderFooterBg : presetThemes[theme].headerFooterBg;
  // For presets, force white text; for custom, compute contrast.
  const headerText = theme === "custom" ? getContrastColor(customHeaderFooterBg) : presetThemes[theme].headerFooterText;
  const sidebarBg = theme === "custom" ? customSidebarBg : presetSidebar[theme].bg;
  const sidebarText = theme === "custom" ? getContrastColor(customSidebarBg) : presetSidebar[theme].text;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
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
    // Set CSS variable for header background globally.
    <div style={{ "--header-bg": headerBg }} className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header 
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
        <Sidebar 
          theme={theme} 
          customColor={sidebarBg}
          customTextColor={sidebarText}
        />
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

export default Layout;
