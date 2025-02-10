import React, { useEffect, useState, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import ThemeToggle from './ThemeToggle';

const NavBar = ({ onNavClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Listen for scroll events to adjust background and shadow.
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleNavClickInternal = (page) => {
    setMobileMenuOpen(false); // Close mobile menu on selection.
    onNavClick(page);
  };

  return (
    <nav
      className={`fixed top-0 w-full 
        ${mobileMenuOpen ? 'backdrop-blur-sm' : ''} 
        md:backdrop-blur-sm md:dark:backdrop-blur-none 
        z-20 transition-all duration-500 navbar-animate`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between py-4 px-4">
          {/* Branding */}
          <div className="text-black dark:text-white text-xl font-bold">
            Eric Krouss
          </div>
          {/* Desktop Navigation and Theme Toggle */}
          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex space-x-8">
              <li>
                <button
                  onClick={() => handleNavClickInternal('about')}
                  className="text-gray dark:text-gray-300 hover:text-indigo-300 transition-colors duration-300 focus:outline-none"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClickInternal('portfolio')}
                  className="text-gray dark:text-gray-300 hover:text-indigo-300 transition-colors duration-300 focus:outline-none"
                >
                  Portfolio
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClickInternal('contact')}
                  className="text-gray dark:text-gray-300 hover:text-indigo-300 transition-colors duration-300 focus:outline-none"
                >
                  Contact
                </button>
              </li>
            </ul>
            <ThemeToggle />
          </div>
          {/* Mobile Navigation: Theme Toggle and Hamburger */}
          <div className="flex md:hidden items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={handleMobileToggle}
              className="text-gray dark:text-gray-300 px-7 focus:outline-none"
            >
              {mobileMenuOpen ? (
                // X icon
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Hamburger icon
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 8h16M4 16h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        {/* Mobile Navigation Menu with Animated Transparent Background */}
        <CSSTransition
          in={mobileMenuOpen}
          timeout={300}
          classNames="mobile-menu"
          unmountOnExit
          nodeRef={mobileMenuRef}
        >
          <div
            ref={mobileMenuRef}
            className="md:hidden bg-transparent backdrop-blur-xs rounded-b-lg px-4 py-4"
          >
            <ul className="flex flex-col space-y-4 pb-4">
              <li>
                <button
                  onClick={() => handleNavClickInternal('about')}
                  className="w-full text-left text-gray dark:text-gray-300 hover:text-indigo-300 transition-colors duration-300 focus:outline-none"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClickInternal('portfolio')}
                  className="w-full text-left text-gray dark:text-gray-300 hover:text-indigo-300 transition-colors duration-300 focus:outline-none"
                >
                  Portfolio
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClickInternal('contact')}
                  className="w-full text-left text-gray dark:text-gray-300 hover:text-indigo-300 transition-colors duration-300 focus:outline-none"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
        </CSSTransition>
      </div>
    </nav>
  );
};

export default NavBar;
