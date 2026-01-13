import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Users, Star } from 'lucide-react';

const missions = [
    {
        icon: Rocket,
        bgColor: 'bg-blue-600',
        title: 'Our Mission',
        description: 'To build the foundational layers of the next digital era through decentralized, intelligent, and user-centric solutions.',
        animation: { initial: { opacity: 0, x: -20 }, delay: 0 }
    },
    {
        icon: Users,
        bgColor: 'bg-purple-600',
        title: 'Our Culture',
        description: 'A high-intensity environment of radical transparency and a founder\'s mindset. We are builders, not employees.',
        animation: { initial: { opacity: 0, y: 20 }, delay: 0.2 }
    },
    {
        icon: Star,
        bgColor: 'bg-green-600',
        title: 'Our Values',
        description: 'Ownership, precision, long-term vision, and an unwavering commitment to pushing the boundaries of what\'s possible.',
        animation: { initial: { opacity: 0, x: 20 }, delay: 0.4 }
    }
];

export const MissionSection = () => {
  return (
    <section className="px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {missions.map((mission) => (
            <motion.div
              key={mission.title}
              initial={mission.animation.initial}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: mission.animation.delay }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className={`w-16 h-16 ${mission.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 glow-effect`}>
                <mission.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{mission.title}</h3>
              <p className="text-gray-300">{mission.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};