import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Link } from 'react-router-dom';
    import { ArrowRight, UserPlus, Briefcase } from 'lucide-react';
    import { useAuth } from '@/contexts/SupabaseAuthContext';

    export const HeroSection = () => {
      const { user } = useAuth();
      const getStartedLink = user ? '/dashboard' : '/signup';

      return (
        <section className="relative px-6 py-20 text-center">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-wider">
                The Hub for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 text-glow">World-Class Creators</span>
              </h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Devconnect is the premier platform to find talent, discover job opportunities, and collaborate on groundbreaking projects across all creative domains.
              </motion.p>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link to={getStartedLink}>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-6 glow-effect transform hover:scale-105 transition-all duration-300">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/developers">
                <Button variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-300">
                  Find Talent <UserPlus className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      );
    };