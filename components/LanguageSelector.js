import React from "react";
import styles from "../styles/LanguageSelector.module.css";

const LanguageSelector = ({ language, setLanguage }) => {
  const languages = ["javascript", "python", "cpp", "java"]; // Match supported Piston languages

  return (
    <div className={styles.languageSelector}>
      <label htmlFor="language"></label>
      <select
        id="language"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
