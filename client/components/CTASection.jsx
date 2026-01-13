import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Link } from 'react-router-dom';
    import { useAuth } from '@/contexts/SupabaseAuthContext';

    export const CTASection = () => {
      const { user } = useAuth();

      return (
        <section className="px-6 py-20 bg-black/20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center bg-glass p-12 rounded-lg border-glow"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build the Future?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join Devconnect today to find talent, land your next gig, and connect with the best creators in the world.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to={user ? "/dashboard" : "/signup"}>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-4 glow-effect transform hover:scale-105 transition-all duration-300">
                  Get Started
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="outline" className="w-full sm:w-auto text-lg px-8 py-4 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-300">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      );
    };