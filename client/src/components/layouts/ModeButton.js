import React, { useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { FaRegSun, FaRegMoon } from 'react-icons/fa';

const ModeButton = () => {
  // prevent flash of incorrect theme
  let currentTheme;
  if (typeof window !== 'undefined') {
    currentTheme = localStorage.getItem('theme');
    if (!currentTheme) localStorage.setItem('theme', 'light')
  };
  const [ theme, setTheme ] = useState(currentTheme);

  const toggleTheme = (value) => {
    setTheme(value);
    localStorage.setItem('theme', value);
  };

  return (
    <>
    <HelmetProvider>
      <Helmet>
        <html className={theme} />
      </Helmet>
    </HelmetProvider>
    {theme && theme === 'light' ? <FaRegMoon className="nav__theme-btn" onClick={() => toggleTheme('dark')} /> : <FaRegSun className="nav__theme-btn" onClick={() => toggleTheme('light')} />}
    </>
  )
};
export default ModeButton;