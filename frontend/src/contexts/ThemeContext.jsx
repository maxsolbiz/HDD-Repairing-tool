import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const defaultTheme = "themeBlue";
  const defaultCustomColor = "#2563eb";

  const [theme, setTheme] = useState(defaultTheme);
  const [customColor, setCustomColor] = useState(defaultCustomColor);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedCustomColor = localStorage.getItem("customColor");
    if (savedTheme) setTheme(savedTheme);
    if (savedCustomColor) setCustomColor(savedCustomColor);
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const changeCustomColor = (color) => {
    setCustomColor(color);
    localStorage.setItem("customColor", color);
  };

  return (
    <ThemeContext.Provider value={{ theme, customColor, changeTheme, changeCustomColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
