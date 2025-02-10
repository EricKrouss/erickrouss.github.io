import React, { useState, useRef } from 'react';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import NavBar from './components/NavBar';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import FloatingIcons from './components/FloatingIcons';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('about');
  const nodeRef = useRef(null);

  const pages = {
    about: <About />,
    portfolio: <Portfolio />,
    contact: <Contact />,
  };

  const handleNavClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="relative">
      {/* Floating icons background handles the overall background */}
      <FloatingIcons />
      <NavBar onNavClick={handleNavClick} />
      {/* Main content container now uses a 500ms color transition */}
      <div className="pt-20 max-w-6xl mx-auto px-4 relative z-10 content text-gray-900 dark:text-gray-100 transition-colors duration-500">
        <SwitchTransition mode="out-in">
          <CSSTransition key={currentPage} timeout={300} classNames="fade" nodeRef={nodeRef}>
            <div ref={nodeRef}>{pages[currentPage]}</div>
          </CSSTransition>
        </SwitchTransition>
      </div>
    </div>
  );
}

export default App;
