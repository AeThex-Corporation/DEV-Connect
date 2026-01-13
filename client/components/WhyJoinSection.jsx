import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const benefits = [
  "Early Access to our marketplace & tools",
  "Exclusive Workshops with industry pros",
  "Beta Testing Opportunities for AeThex games & services",
  "Founding Member Perks (discounts, lifetime recognition)"
];

export const WhyJoinSection = () => {
  return (
    <section className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-12">Why Join the Waitlist?</h2>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 text-left">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="flex items-start space-x-3"
            >
              <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
              <span className="text-lg text-gray-200">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};