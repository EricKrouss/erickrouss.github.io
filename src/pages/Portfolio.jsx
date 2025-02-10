import React from 'react';
import javascript from '../icons/javascript.svg';
import html from '../icons/html.svg';
import reactIcon from '../icons/react.svg';
import tailwind from '../icons/tailwind.svg';
import css from '../icons/css.svg';
import python from '../icons/python.svg';
import ollama from '../icons/ollama.png';


const frameworkIcons = {
  javascript,
  html,
  react: reactIcon,
  tailwind,
  css,
  python,
  ollama
};

const projects = [
  {
    title: "Bluesky Flex",
    description:
      "A Bluesky web app for seeing the top most followed people and most liked posts.",
    image: "https://erickrouss.github.io/assets/projects/blueskyflex.png",
    demoUrl: "https://erickrouss.github.io/Bluesky-Flex/",
    repoUrl: "https://github.com/EricKrouss/Bluesky-Flex",
    // Using a mix: imported values for html and css, and string keys for the rest.
    frameworks: ['html', 'css', 'javascript', 'react'],
  },
  {
    title: "Bluesky Shield",
    description:
      "An AI powered web app for creating and moderating Bluesky block lists.",
    image: "https://erickrouss.github.io/assets/projects/blueskyshield.png",
    repoUrl: "https://github.com/EricKrouss/Bluesky-Shield",
    frameworks: ['html', 'javascript', 'react', 'tailwind', 'ollama', 'python'],
  },
  {
    title: "Retro YouTube Player Recreation",
    description:
      "A 1-to-1 recreation of the YouTube player from 2007.",
    image: "https://erickrouss.github.io/assets/projects/yt2007.png",
    demoUrl: "https://erickrouss.github.io/2007-YouTube-Player-HTML5/",
    repoUrl: "https://github.com/EricKrouss/2007-YouTube-Player-HTML5",
    frameworks: ['html', 'css', 'javascript'],
  },
];

const Portfolio = () => {
  return (
    <div className="py-20 px-4 fade-in-up">
      <h2 className="text-3xl font-bold mb-8 text-center">My Portfolio</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <div
            key={index}
            className="relative rounded-md overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300"
          >
            {/* Project image fills the card */}
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-75 object-cover"
            />
            {/* Information overlay with frosted glass effect */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/10 backdrop-blur-md">
              <h3 className="text-xl font-semibold text-white">
                {project.title}
              </h3>
              <p className="text-gray-100 text-sm mb-2">
                {project.description}
              </p>
              {/* Framework icons */}
              {project.frameworks && (
                <div className="flex space-x-2 mb-2">
                  {project.frameworks.map((framework, i) => {
                    // If the framework is a string, get the corresponding imported icon.
                    // Otherwise, assume it’s already an imported asset.
                    const iconSrc =
                      typeof framework === 'string'
                        ? frameworkIcons[framework]
                        : framework;
                    return (
                      <img
                        key={i}
                        src={iconSrc}
                        alt={`${typeof framework === 'string' ? framework : 'icon'} icon`}
                        className="w-6 h-6"
                      />
                    );
                  })}
                </div>
              )}
              <div className="flex justify-between">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-300 hover:text-indigo-400 transition-colors duration-300 text-sm"
                  >
                    Demo
                  </a>
                )}
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-300 hover:text-indigo-400 transition-colors duration-300 text-sm"
                >
                  Repo
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;
