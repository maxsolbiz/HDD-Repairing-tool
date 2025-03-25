// src/components/FloatingThemeSelector.jsx
import React, { useState } from "react";
import { FiSettings } from "react-icons/fi";

const presetThemes = [
  { name: "Blue", value: "themeBlue", hex: "#2563eb" },
  { name: "Green", value: "themeGreen", hex: "#16a34a" },
  { name: "Purple", value: "themePurple", hex: "#7c3aed" },
];

const FloatingThemeSelector = ({
  currentTheme,
  onThemeChange,
  customColor,
  onCustomColorChange,
  floatingColor, // floatingColor prop
}) => {
  const [open, setOpen] = useState(false);

  const buttonStyle = floatingColor ? { backgroundColor: floatingColor } : { backgroundColor: "#2563eb" };

  return (
    <>
      <button
        style={buttonStyle}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 hover:opacity-90 text-white p-3 rounded-full shadow-lg z-50"
        onClick={() => setOpen(!open)}
        title="Change Theme"
      >
        <FiSettings size={24} />
      </button>
      {open && (
        <div className="fixed right-16 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 rounded-lg shadow-lg z-50">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Select Theme
          </h3>
          <div className="flex space-x-2 mb-2">
            {presetThemes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => onThemeChange(theme.value)}
                className={`w-8 h-8 rounded-full border-2 transition-colors duration-300 ${
                  currentTheme === theme.value ? "border-black dark:border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: theme.hex }}
                title={theme.name}
              ></button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 dark:text-gray-300">Custom BG:</span>
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                onCustomColorChange(e.target.value);
                onThemeChange("custom");
              }}
              className="w-8 h-8 p-0 border-2 border-transparent rounded"
              title="Pick a custom background color"
            />
          </div>
          <button
            className="mt-4 block mx-auto text-sm text-blue-600 dark:text-blue-300 hover:underline"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
};

export default FloatingThemeSelector;
