import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

export const ProductSection = ({ title, description, features, image_component, is_reverse, learnMoreLink }) => {
  const { toast } = useToast();

  const showNotImplementedToast = () => {
    toast({
      title: "🚧 Coming Soon!",
      description: "This feature is currently under development. Stay tuned for updates!",
    });
  };

  const renderButton = () => {
    const buttonContent = (
      <>
        Learn More
        <ArrowRight className="w-5 h-5 ml-2" />
      </>
    );

    const buttonClasses = "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-3 glow-effect transform hover:scale-105 transition-all duration-300 w-full sm:w-auto";

    if (learnMoreLink) {
      return (
        <Link to={learnMoreLink}>
          <Button className={buttonClasses}>
            {buttonContent}
          </Button>
        </Link>
      );
    }

    return (
      <Button onClick={showNotImplementedToast} className={buttonClasses}>
        {buttonContent}
      </Button>
    );
  };

  return (
    <section className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
        className={`max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center ${is_reverse ? 'md:grid-flow-col-dense' : ''}`}
      >
        <motion.div
          initial={{ opacity: 0, x: is_reverse ? 50 : -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
          className={is_reverse ? 'md:order-2' : ''}
        >
          {image_component}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: is_reverse ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
          className={is_reverse ? 'md:order-1' : ''}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{title}</h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">{description}</p>
          <ul className="space-y-4 mb-10 text-lg">
            {(features || []).map((feature, index) => (
              <li key={index} className="flex items-start">
                <ArrowRight className="w-5 h-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-200">{feature}</span>
              </li>
            ))}
          </ul>
          {renderButton()}
        </motion.div>
      </motion.div>
    </section>
  );
};