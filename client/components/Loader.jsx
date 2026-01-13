import React from 'react';
import { motion } from 'framer-motion';

export const Loader = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.5,
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.8,
        ease: "easeInOut"
      }
    }
  };

  const logoVariants = {
    initial: {
      scale: 0.8,
      opacity: 0,
    },
    animate: {
      scale: [0.8, 1.1, 1],
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror"
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: (i) => ({
      opacity: 1,
      transition: {
        delay: i * 0.1 + 0.5,
        duration: 0.5,
      },
    }),
  };

  const text = "AETHEX".split("");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0e1a]"
    >
      <motion.img
        src="https://horizons-cdn.hostinger.com/23e3e5a2-7cad-4f6a-82a6-9851760b7835/42bc9e965e38daffbb51dfbb0664caa0.png"
        alt="AeThex Logo"
        className="w-24 h-24 mb-6"
        variants={logoVariants}
        initial="initial"
        animate="animate"
      />
      <div className="flex">
        {text.map((char, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-3xl font-bold text-glow tracking-widest"
          >
            {char}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};