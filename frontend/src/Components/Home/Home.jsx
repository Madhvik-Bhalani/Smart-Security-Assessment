import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Home.css';
import backgroundVideo from '../../assets/berth.mp4';
import logo from '../../assets/Astrap_nobg.png';
import astraVideo from '../../assets/astra_video_bg.mp4';
import Astra from '../Astra/Astra.jsx';
import AboutUs from '../AboutUs/AboutUs.jsx';
import ReportTurn from '../ReportTurn/ReportTurn.jsx';
import USP from '../USP/USP.jsx';
import Pricing from '../Pricing/Pricing.jsx';
import Newsletter from "../Newsletter/Newsletter.jsx";
import Footer from "../Footer/Footer.jsx";

const Hero = () => {
  const [typedText, setTypedText] = useState('');
  const videoRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [activeSection, setActiveSection] = useState('');

  const [refAstra, inViewAstra] = useInView({ threshold: 0.2 });
  const [refAbout, inViewAbout] = useInView({ threshold: 0.2 });
  const [refReport, inViewReport] = useInView({ threshold: 0.2 });
  const [refUSPs, inViewUSPs] = useInView({ threshold: 0.2 });
  const [refPricing, inViewPricing] = useInView({ threshold: 0.2 });
  const [refNewsletter, inViewNewsletter] = useInView({ threshold: 0.2 });

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'astra', ref: refAstra },
        { id: 'about', ref: refAbout },
        { id: 'report', ref: refReport },
        { id: 'usps', ref: refUSPs },
        { id: 'pricing', ref: refPricing },
        { id: 'newsletter', ref: refNewsletter },
      ];

      sections.forEach(({ id, ref }) => {
        if (ref.current) {
          const bounding = ref.current.getBoundingClientRect();
          if (bounding.top < window.innerHeight / 2 && bounding.top > -window.innerHeight / 2) {
            setActiveSection(id);
          }
        }
      });

      const logo = document.querySelector('.astra-logo');
      const links = document.querySelector('.navbar-links');
      const button = document.querySelector('.btn-outline-sm');

      if (window.scrollY > 50) {
        logo.classList.add('scrolled');
        links.classList.add('scrolled');
        button.classList.add('scrolled');
      } else {
        logo.classList.remove('scrolled');
        links.classList.remove('scrolled');
        button.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [refAstra, refAbout, refReport, refUSPs, refPricing, refNewsletter]);

  useEffect(() => {
    if (inViewAstra) setActiveSection('astra');
    if (inViewAbout) setActiveSection('about');
    if (inViewUSPs) setActiveSection('usps');
    if (inViewReport) setActiveSection('report');
    if (inViewPricing) setActiveSection('pricing');
    if (inViewNewsletter) setActiveSection('newsletter');
  }, [
    inViewAstra,
    inViewAbout,
    inViewUSPs,
    inViewReport,
    inViewPricing,
    inViewNewsletter,
  ]);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLeaveAboutUs = () => {

    const reportSection = document.getElementById("report");
    if (reportSection) {
      reportSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fullText = "Hi there! I’m Astra – your personal cybersecurity companion. My mission is to make protecting your website as easy and stress-free as possible. With just a few clicks, I’ll help ensure your digital space stays secure. Think of me as the only chatbot you’ll ever need – combining the precision of AI with the warmth of human-like assistance. Ready to get started? Sign up and let’s secure your website together!";

  const handleTalkToAstra = () => {
    if (isPaused) {

      setIsPaused(false);
      videoRef.current.play();
      typeWriter(currentIndex);
    } else if (isTyping) {

      setIsPaused(true);
      videoRef.current.pause();
      clearTimeout(typingTimeout);
    } else {

      setIsTyping(true);
      setIsPaused(false);
      setTypedText("");
      setCurrentIndex(0);

      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.muted = false;
        videoRef.current.play();
      }

      typeWriter(0);
    }
  };

  const typeWriter = (index) => {
    if (index < fullText.length) {
      setTypedText(`"${fullText.slice(0, index + 1)}"`);
      setCurrentIndex(index + 1);
      const timeout = setTimeout(() => typeWriter(index + 1), 100);
      setTypingTimeout(timeout);
    } else {
      setIsTyping(false);
      setIsPaused(false);
    }
  };

  const colors = ['#ffcc33', '#9d4edd', '#ff6699', '#33ccff'];

  const addPermanentSparklingStars = () => {
    const container = document.querySelector('.sparkling-container');
    const stars = 20;

    for (let i = 0; i < stars; i++) {
      const star = document.createElement('div');
      star.classList.add('star');
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 2}s`;
      star.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      container.appendChild(star);
    }
  };

  window.addEventListener('load', addPermanentSparklingStars);

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section relative text-white h-screen flex flex-col justify-start items-center px-6 lg:px-16 pt-10">
        <video autoPlay muted loop playsInline className="absolute top-0 left-0 w-full h-full object-cover" preload="metadata">
          <source src={backgroundVideo} type="video/mp4" />
        </video>

        {/* Upper Navbar */}
        <div className="upper-navbar">

          {/* Astra Logo */}
          <motion.img
            src={logo}
            alt="Astra Logo"
            className="astra-logo"
            loading="lazy"
            animate={{
              opacity: [1, 0.8, 1],
              scale: [1, 1.05, 1],
              rotate: [0, 1, -1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          />

          {/* Navigation Links */}
          <div className="navbar-links">
            <a
              onClick={() => scrollToSection('about')}
              className={`btn-nav ${activeSection === 'about' ? 'active-link' : ''}`}
            >
              About
            </a>
            <a
              onClick={() => scrollToSection('report')}
              className={`btn-nav ${activeSection === 'report' ? 'active-link' : ''}`}
            >
              Report
            </a>
            <a
              onClick={() => scrollToSection('usps')}
              className={`btn-nav ${activeSection === 'usps' ? 'active-link' : ''}`}
            >
              USPs
            </a>
            <a
              onClick={() => scrollToSection('newsletter')}
              className={`btn-nav ${activeSection === 'newsletter' ? 'active-link' : ''
                }`}
            >
              Newsletters
            </a>
            <a
              onClick={() => scrollToSection('pricing')}
              className={`btn-nav ${activeSection === 'pricing' ? 'active-link' : ''}`}
            >
              Pricing
            </a>
            <a
              onClick={() => scrollToSection('contact')}
              className={`btn-nav ${activeSection === 'contact' ? 'active-link' : ''}`}
            >
              Contact
            </a>
          </div>

          {/* Get Started Button */}
          <Link to="/signup" className="btn-outline-sm">
            Get Started
          </Link>
        </div>

        {/* Hero Text */}
        <motion.div
          className="text-section text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
            <span className="text-white font-extrabold">
              Where Cybersecurity Meets
            </span>
          </h1>

          {/* Sparkling Container for Astra */}
          <div className="sparkling-container mt-4">
            <span className="outline-text">Astra</span>
          </div>

          <p className="text-lg lg:text-2xl text-white-300 mt-6 italic">
            Cybersecurity Reimagined, Chat by Chat. No Complications, Just Secure Conversations.
          </p>
        </motion.div>

      </div>

      {/* Astra Section */}
      <div><Astra refAstra={refAstra} videoRef={videoRef} astraVideo={astraVideo} typedText={typedText} handleTalkToAstra={handleTalkToAstra} />
      </div>

      {/* About Section */}
      <div id="about" ref={refAbout}>
        <AboutUs onLeaveSection={handleLeaveAboutUs} />
      </div>

      {/* Report Overview Section */}
      <div id="report" ref={refReport} >
        <ReportTurn />
      </div>

      {/* USP Section */}
      <div id="usps" ref={refUSPs}>
        <USP />
      </div>

      {/*Newsletter Section */}
      <div id="newsletter" ref={refNewsletter} ><Newsletter /></div>

      {/* Pricing Section */}
      <div id="pricing" ref={refPricing} ><Pricing /></div>

      {/* Footer Section */}
      <div><Footer /></div>

    </>
  );
};

export default Hero;
