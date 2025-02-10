import React, { useState } from 'react';
import JavascriptIcon from '../icons/javascript.svg';
import HtmlIcon from '../icons/html.svg';
import ReactIcon from '../icons/react.svg';
import TailwindIcon from '../icons/tailwind.svg';
import CSSIcon from '../icons/css.svg';
import PythonIcon from '../icons/python.svg';
import OllamaIcon from '../icons/ollama.png';

const FloatingIcons = () => {
  const icons = [JavascriptIcon, HtmlIcon, ReactIcon, TailwindIcon, CSSIcon, PythonIcon, OllamaIcon];

  // Generate the bubbles only once on component mount.
  const [bubbles] = useState(() =>
    Array.from({ length: 10 }).map((_, i) => {
      const icon = icons[Math.floor(Math.random() * icons.length)];
      const left = Math.random() * 100; // random left position (percentage)
      const size = 20 + Math.random() * 30; // random size between 20px and 50px
      const delay = Math.random() * 5; // random delay between 0 and 5s
      const duration = 20 + Math.random() * 20; // duration between 20 and 40 seconds
      return (
        <img
          key={i}
          src={icon}
          alt=""
          className="floating-icon"
          style={{
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        />
      );
    })
  );

  return (
    <div
      className="floating-background fixed inset-0 -z-10 pointer-events-none transition-colors duration-500
        bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(200,220,255,0.3),rgba(255,255,255,0))] 
        dark:bg-neutral-950 dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"
      style={{ filter: 'blur(2px)' }}
    >
      {bubbles}
    </div>
  );
};

export default FloatingIcons;
