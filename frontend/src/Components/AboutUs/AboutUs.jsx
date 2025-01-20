import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motion } from 'framer-motion';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./AboutUs.css";

gsap.registerPlugin(ScrollTrigger);

const AboutUs = () => {
  const containerRef = useRef(null);
  const sectionsRef = useRef([]);

  // Timeline Data
  const timelineData = [
    {
      date: "October 2024",
      title: "The Birth of Codefinity",
      text: "We began as a small but passionate team of five and created Codefinity. Our vision was clear: to offer boundless security and infinite trust to our users. Codefinity embodies a commitment to reliability and protection. Our brand colors, white and blue, symbolize purity, trust, and the limitless potential of the digital space.",
    },
    {
      date: "November 2024",
      title: "Introducing Astra",
      text: "November marked the birth of Astra, the flagship product of Codefinity. Astra is more than a tool—she's a part of us. A security chatbot with human-like assistance and machine-like precision, Astra delivers unparalleled protection and guidance. Her brand colors—white, purple, and black—represent clarity, sophistication, and resilience. Astra is for everyone, bridging the gap between people and secure digital experiences.",
    },
    {
      date: "December 2024",
      title: "Building Astra: Listening and Learning",
      text: "In December, we embarked on the journey to bring Astra to life. We engaged with users to understand their challenges, concerns, and expectations. Simultaneously, we collaborated with cybersecurity experts to ensure Astra meets industry standards. This phase was all about learning, refining, and preparing to offer a solution that truly addresses real-world needs.",
    },
    {
      date: "January 2024",
      title: "Empowering Users with Astra",
      text: "January was a milestone as we integrated user-focused features into Astra. From downloadable security reports to real-time chats, Astra began empowering users to understand their website's vulnerabilities and enhance their security. Astra is now a trusted companion, helping users navigate the complexities of cybersecurity with ease.",
    },
    {
      date: "February 2024",
      title: "Endgame: The Future Awaits",
      text: "As February unfolds, we’re gearing up for something extraordinary. The endgame is near, and our journey is culminating in a revolutionary offering. Stay tuned—something remarkable is coming soon!",
    },
  ];

  useEffect(() => {
    const container = containerRef.current;
    const sections = sectionsRef.current;

    let scrollTween = gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () => "+=" + container.offsetWidth,
        markers: false,
      },
    });

    sections.forEach((section) => {
      let texts = section.querySelectorAll(".anim");

      gsap.fromTo(
        texts,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.2,
          scrollTrigger: {
            trigger: section,
            containerAnimation: scrollTween,
            start: "left right",
            end: "right left",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => {
      scrollTween.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="about-section">
      <div className="black-background"></div>
      <motion.h1 className="about-heading text-purple-400"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}>
        About Us
      </motion.h1>
      <div className="container scrollx" ref={containerRef}>
        {timelineData.map((data, index) => (
          <section
            key={`timeline-section-${index}`}
            className={`sec${index + 1} pin`}
            ref={(el) => (sectionsRef.current[index] = el)}
          >
            {/* Date */}
            <span className="anim date">{data.date}</span>

            {/* Title */}
            <h1 className="anim title">{data.title}</h1>

            {/* Description */}
            <div className="col">
              <p className="anim">{data.text}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;
