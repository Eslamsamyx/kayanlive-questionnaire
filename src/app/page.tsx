"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "./_components/Navbar";

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const stats = [
    { number: "500+", label: "Booths Created" },
    { number: "50+", label: "Countries Served" },
    { number: "98%", label: "Client Satisfaction" },
    { number: "15+", label: "Years Experience" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "TechFlow Inc.",
      text: "Kayan Live transformed our trade show presence completely. Our booth was the talk of the event!",
      rating: 5
    },
    {
      name: "Michael Chen",
      company: "InnovateCorp",
      text: "Professional, creative, and delivered beyond our expectations. Highly recommend their services.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      company: "Global Solutions",
      text: "The attention to detail and quality of work is exceptional. They truly understand brand storytelling.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-[#2c2c2b] relative overflow-hidden">
      {/* Glass morphism background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full backdrop-blur-sm filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-white/15 rounded-full backdrop-blur-sm filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-white/10 rounded-full backdrop-blur-sm filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4">
        <Navbar />
      </div>

      {/* Hero Section */}
      <section className="relative px-6 py-32 min-h-screen flex items-center">
        <motion.div
          className="mx-auto max-w-[1600px] text-center"
          style={{ y }}
        >
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm blur-3xl"></div>
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-8 leading-tight">
                Bringing Your Vision
                <motion.span
                  className="block bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] bg-clip-text text-transparent"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  To Life
                </motion.span>
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              We specialize in creating extraordinary booths and mega booths that captivate audiences 
              and elevate your brand presence at events, exhibitions, and conferences worldwide.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/questionnaire/project-brief"
                className="group relative inline-block bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] hover:from-[#6ee8c5] hover:to-[#a694ff] text-[#2c2c2b] font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <span className="relative z-10">Start Your Brief</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#6ee8c5] to-[#a694ff] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <button className="group flex items-center space-x-2 text-white hover:text-[#7afdd6] transition-colors">
                <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:border-[#7afdd6] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <span className="text-lg">Watch Our Work</span>
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div 
              className="w-1 h-3 bg-white rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 bg-white/10 backdrop-blur-sm rounded-[25px] lg:rounded-[61px] mx-4 mb-8">
        <div className="mx-auto max-w-[1600px]">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-gray-300 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="px-6 py-20">
        <div className="mx-auto max-w-[1600px]">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Our Expertise</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From intimate booths to spectacular mega installations, we craft experiences that leave lasting impressions.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Standard Booths",
                description: "Professionally designed booths that maximize your space and budget while delivering exceptional brand visibility and visitor engagement.",
                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              },
              {
                title: "Mega Booths",
                description: "Large-scale installations that command attention and create immersive brand experiences with cutting-edge technology and stunning visual impact.",
                icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
              },
              {
                title: "Custom Solutions",
                description: "Bespoke designs tailored to your unique requirements, brand identity, and event objectives with innovative concepts and flawless execution.",
                icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V5a1 1 0 011-1h3a1 1 0 001-1V2a2 2 0 012-2z"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:border-white/40 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} />
                  </svg>
                </motion.div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-[#7afdd6] transition-colors">{service.title}</h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="px-6 py-20 bg-white/10 backdrop-blur-sm rounded-[25px] lg:rounded-[61px] mx-4 mb-8">
        <div className="mx-auto max-w-[1600px]">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Our Process</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From initial brief to final installation, we ensure every detail exceeds your expectations.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Brief & Discovery", description: "Understanding your vision, goals, and requirements through our comprehensive briefing process." },
              { title: "Design & Concept", description: "Creating innovative designs that align with your brand and captivate your target audience." },
              { title: "Production", description: "Meticulous craftsmanship using premium materials and cutting-edge technology." },
              { title: "Installation", description: "Professional setup and installation ensuring everything is perfect for your event." }
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="w-20 h-20 bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-white font-bold text-2xl">{index + 1}</span>
                </motion.div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-[#7afdd6] transition-colors">{step.title}</h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="px-6 py-20">
        <div className="mx-auto max-w-[1600px]">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">What Our Clients Say</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Don't just take our word for it - hear from the brands we've helped elevate.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:border-white/40 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-[#7afdd6] text-sm">{testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-white/10 backdrop-blur-sm rounded-[25px] lg:rounded-[61px] mx-4 mb-8">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">Ready to Create Something Extraordinary?</h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Share your vision with us through our comprehensive brief form, and let's bring your dream booth to life.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/questionnaire/project-brief"
              className="inline-block bg-gradient-to-r from-[#7afdd6] to-[#b8a4ff] hover:from-[#6ee8c5] hover:to-[#a694ff] text-[#2c2c2b] font-semibold px-12 py-6 rounded-full text-xl transition-all duration-300 shadow-2xl hover:shadow-[#7afdd6]/25"
            >
              Start Your Brief Now
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-white/10 backdrop-blur-sm border-t border-white/20 rounded-t-[25px] lg:rounded-t-[61px] mx-4">
        <div className="mx-auto max-w-[1600px] text-center text-gray-400">
          <p>&copy; 2024 Kayan Live. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
