import React from "react";

const presetFooterMapping = {
  themeBlue: "bg-blue-600",
  themeGreen: "bg-green-600",
  themePurple: "bg-purple-600",
};

const Footer = ({ theme, customColor, customTextColor }) => {
  const style = theme === "custom" ? { backgroundColor: customColor, color: customTextColor } : { color: "#ffffff" };
  const footerClasses = theme === "custom" ? "" : presetFooterMapping[theme];
  return (
    <footer style={style} className={`${footerClasses} fixed bottom-0 left-0 right-0 z-50 p-4 text-center`}>
      &copy; {new Date().getFullYear()} HDD Diagnostics. All rights reserved.
    </footer>
  );
};

export default Footer;
