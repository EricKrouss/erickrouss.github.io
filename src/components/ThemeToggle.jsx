// src/components/ThemeToggle.jsx
import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('light');

  // On component mount, check for saved theme or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // If no saved theme, respect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  // Toggle theme and save preference
  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 bg-neutral-200 dark:bg-indigo-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-110"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? (
        // Sun Icon for Light Mode
        <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-yellow-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414-1.414M17.95 17.95l-1.414-1.414M6.05 6.05L4.636 7.464M12 8a4 4 0 100 8 4 4 0 000-8z"
        />
      </svg>
      

      ) : (
        // Moon Icon for Dark Mode
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
