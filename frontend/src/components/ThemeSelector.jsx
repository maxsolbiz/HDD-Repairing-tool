// src/components/ThemeSelector.jsx
import React from 'react';

const presetThemes = [
  { name: 'Blue', value: 'themeBlue', hex: '#2563eb' },
  { name: 'Green', value: 'themeGreen', hex: '#16a34a' },
  { name: 'Purple', value: 'themePurple', hex: '#7c3aed' },
];

const ThemeSelector = ({ currentTheme, onThemeChange, customColor, onCustomColorChange }) => {
  return (
    <div className="flex items-center space-x-4 p-4">
      <span className="text-gray-700 dark:text-gray-300">Select Theme:</span>
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
      <div className="flex items-center space-x-2">
        <span className="text-gray-700 dark:text-gray-300">Custom:</span>
        <input
          type="color"
          value={customColor}
          onChange={(e) => {
            onCustomColorChange(e.target.value);
            onThemeChange("custom");
          }}
          className="w-8 h-8 p-0 border-2 border-transparent rounded"
          title="Pick a custom color"
        />
      </div>
    </div>
  );
};

export default ThemeSelector;
