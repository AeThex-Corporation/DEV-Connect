import React from 'react';
    import { motion } from 'framer-motion';
    import { Zap, Code, Users, Layers } from 'lucide-react';

    const featuresData = [
      {
        icon: Zap,
        label: 'Find Talent Instantly',
        description: 'Access a global network of verified developers, artists, and creators ready for their next project.'
      },
      {
        icon: Code,
        label: 'Land Your Dream Job',
        description: 'Browse exclusive job opportunities from top studios and indie developers in the creator economy.'
      },
      {
        icon: Users,
        label: 'Build Your Team',
        description: 'Use our Team-Up feature to find collaborators for your next big idea and bring your vision to life.'
      },
      {
        icon: Layers,
        label: 'Manage Your Studio',
        description: 'Create and manage your studio profile, recruit members, and showcase your projects all in one place.'
      },
    ];

    export const FeaturesSection = () => {
      return (
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">The Ultimate Creator Hub</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Devconnect provides the tools you need to succeed, whether you're a solo creator or a growing studio.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {featuresData.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="bg-glass p-8 rounded-lg border-glow flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-blue-600/50 rounded-full flex items-center justify-center mb-6 glow-effect">
                    <feature.icon className="w-8 h-8 text-blue-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.label}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      );
    };