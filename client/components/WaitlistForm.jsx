import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { ArrowRight, CheckCircle, Loader as LoaderIcon } from 'lucide-react';

const SITE_ID = 'a7e7b1e1-0c1d-4f1e-8e3a-5b6d7c8f9a0b';

export const WaitlistForm = ({ isSubmitted, setIsSubmitted }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast({
                title: "Email Required",
                description: "Please enter your email address to join the waitlist.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        const { error } = await supabase
            .from('waitlist_submissions')
            .insert({ email, site_id: SITE_ID });
        
        setIsLoading(false);

        if (error) {
            if (error.code === '23505') { 
                toast({
                    title: "Already Registered",
                    description: "This email is already on our waitlist!",
                });
                setIsSubmitted(true);
            } else {
                toast({
                    title: "Submission Error",
                    description: error.message || "An unexpected error occurred. Please try again.",
                    variant: "destructive"
                });
            }
            return;
        }
      
        setIsSubmitted(true);
        toast({
            title: "Welcome to AeThex!",
            description: "You've been added to our exclusive waitlist. We'll be in touch soon!",
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-md mx-auto"
        >
            <AnimatePresence mode="wait">
                {!isSubmitted ? (
                    <motion.form 
                        key="form"
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        onSubmit={handleSubmit} 
                        className="flex items-center space-x-2"
                    >
                        <Input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-glass border-glow text-white placeholder:text-gray-400 h-12 text-lg focus:ring-purple-500 focus:border-purple-500 transition-all flex-grow"
                        />
                        <Button 
                            type="submit"
                            disabled={isLoading}
                            className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg glow-effect transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed px-6"
                        >
                            {isLoading ? (
                                <LoaderIcon className="w-5 h-5 animate-spin" />
                            ) : (
                                "Join"
                            )}
                        </Button>
                    </motion.form>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="bg-glass p-8 rounded-lg border-glow"
                    >
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Welcome Aboard!</h3>
                        <p className="text-gray-300">You're now part of the AeThex revolution. We'll be in touch soon with exclusive updates.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};