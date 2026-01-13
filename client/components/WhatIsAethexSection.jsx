import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Code, Construction, BookOpen } from 'lucide-react';

const divisions = [
  {
    icon: Gamepad2,
    bgColor: 'bg-blue-600',
    title: 'Games & Assets',
    description: 'High-quality content for Roblox, Fortnite, and UGC platforms.',
    animation: { initial: { opacity: 0, x: -20 }, delay: 0 }
  },
  {
    icon: Code,
    bgColor: 'bg-purple-600',
    title: 'Custom Software',
    description: 'Web apps, enterprise solutions, and API integrations.',
    animation: { initial: { opacity: 0, y: 20 }, delay: 0.15 }
  },
  {
    icon: Construction,
    bgColor: 'bg-green-600',
    title: 'Engineering Services',
    description: 'Contracting, construction, and landscaping solutions.',
    animation: { initial: { opacity: 0, y: 20 }, delay: 0.3 }
  },
  {
    icon: BookOpen,
    bgColor: 'bg-yellow-600',
    title: 'Learning & Marketplace',
    description: 'Workshops, tutorials, and a platform to buy/sell game assets.',
    animation: { initial: { opacity: 0, x: 20 }, delay: 0.45 }
  }
];

export const WhatIsAethexSection = () => {
  return (
    <section className="px-6 py-20 bg-black/20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Divisions</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            AeThex is a global creative and development studio. We deliver excellence across four core divisions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {divisions.map((division) => (
            <motion.div
              key={division.title}
              initial={division.animation.initial}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: division.animation.delay }}
              viewport={{ once: true }}
              className="bg-glass p-8 rounded-lg border-glow text-center flex flex-col items-center"
            >
              <div className={`w-16 h-16 ${division.bgColor} rounded-full flex items-center justify-center mb-6 glow-effect`}>
                <division.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{division.title}</h3>
              <p className="text-gray-300">{division.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};