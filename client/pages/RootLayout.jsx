import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader } from '@/components/Loader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

const LayoutContent = () => {
    const [isPageLoading, setIsPageLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        const timer = setTimeout(() => setIsPageLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <AnimatePresence>
                {isPageLoading && <Loader />}
            </AnimatePresence>
            
            <AnimatePresence>
            {!isPageLoading && (
                <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="min-h-screen text-foreground overflow-hidden relative transition-colors duration-500"
                >
                {/* Theme Backgrounds */}
                <div className="fixed inset-0 -z-20 transition-colors duration-500 bg-background"></div>
                
                {theme === 'dark' && (
                     <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center -z-10 mix-blend-overlay pointer-events-none" />
                )}
                {theme === 'light' && (
                     <div className="absolute inset-0 opacity-5 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center -z-10 pointer-events-none" />
                )}
                
                <Header />

                <main className="relative z-10 pt-20"> {/* Added pt-20 to ensure content is not hidden behind the fixed header */}
                    <Outlet />
                </main>

                <Footer />
                </motion.div>
            )}
            </AnimatePresence>
        </>
    );
};

function RootLayout() {
  return (
      <ThemeProvider>
          <LayoutContent />
      </ThemeProvider>
  );
}

export default RootLayout;