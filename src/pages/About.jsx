import React from 'react';
import Portrait from '../assets/erickroussportrait.png';

const About = () => {
return (
    <div className="py-20 px-4 flex flex-col md:flex-row items-center md:space-x-8">
        {/* Portrait image container */}
        <div className="animate-fadeInUp md:w-1/3 flex justify-center fade-in-up delay-200">
            <img
                src={Portrait}
                alt="Portrait of Eric Krouss"
                className="w-48 h-48 object-cover hover:scale-110 transition-transform duration-300 shadow-md hover:shadow-xl rounded-full shadow-lg "
            />
        </div>
        {/* Text content */}
        <div className="fade-in-up md:w-2/3 mt-8 md:mt-0 text-center md:text-left">
            <h2 className="animate-fadeInUp text-3xl font-bold mb-4 ">About Me</h2>
            <p className="text-lg text-gray fade-in-up">
                Hi, I’m Eric Krouss, a passionate developer with experience in React, JavaScript, and Tailwind CSS and a background in Customer Service. I’m currently working as a freelance developer and looking for new opportunities to collaborate with other developers and businesses.
            </p>
            <p className="text-lg text-gray fade-in-up mt-4">
                I love creating modern, responsive websites that are easy to use and look great on any device. I’m always looking for new challenges and opportunities to learn and grow as a developer. Let’s work together to bring your ideas to life!
            </p>
        </div>
    </div>
);
};

export default About;
