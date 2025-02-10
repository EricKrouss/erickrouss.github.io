import React from 'react';
import LinkedInIcon from '../icons/LinkedIn.svg';
import GitHubIcon from '../icons/GitHub.svg';
import BlueskyIcon from '../icons/Bluesky.jpeg';
import EmailIcon from '../icons/Email.svg';

const Contact = () => {
  return (
    <div className="py-20 px-4 text-center fade-in-up">
      <h2 className="text-4xl font-extrabold mb-4 animate-fadeInUp">
        Contact Me
      </h2>
      <p className="text-lg dark:text-gray-300 text-gray-700 mb-8 animate-fadeInUp delay-200">
        I'd love to connect and create amazing websites for you.
      </p>
      <div className="fade-in-up delay-10000 flex justify-center space-x-10 animate-fadeInUp delay-800">
        <a
          href="https://www.linkedin.com/in/erickrouss"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
        >
          <img
            src={LinkedInIcon}
            alt="LinkedIn"
            className="w-12 h-12 hover:scale-110 transition-transform duration-300 shadow-md hover:shadow-xl rounded-xl"
          />
        </a>
        <a
          href="https://github.com/EricKrouss"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
        >
          <img
            src={GitHubIcon}
            alt="GitHub"
            className="w-12 h-12 hover:scale-110 transition-transform duration-300 shadow-md hover:shadow-xl rounded-xl"
          />
        </a>
        <a
          href="https://bsky.app/profile/krouss.net"
          target="_blank"
          rel="noreferrer"
          aria-label="Bluesky"
        >
          <img
            src={BlueskyIcon}
            alt="Bluesky"
            className="w-12 h-12 hover:scale-110 transition-transform duration-300 shadow-md hover:shadow-xl rounded-xl"
          />
        </a>
        <a
          href="mailto:eric@krouss.net"
          target="_blank"
          rel="noreferrer"
          aria-label="Email"
        >
          <img
            src={EmailIcon}
            alt="Email"
            className="relative bottom-0.75 w-13.5 h-13.5 hover:scale-110 transition-transform duration-300 shadow-md hover:shadow-xl rounded-xl"
          />
        </a>
      </div>
    </div>
  );
};

export default Contact;
