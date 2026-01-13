import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Send } from 'lucide-react';

const ContactPage = () => {
    const { toast } = useToast();

    const handleSubmit = (e) => {
        e.preventDefault();
        toast({
            title: "🚧 Feature In Progress",
            description: "The contact form is not yet connected, but we're working on it!",
        });
    };

    return (
        <>
            <Helmet>
                <title>Contact Us | Devconnect</title>
                <meta name="description" content="Get in touch with the Devconnect team for project inquiries, support, or partnership opportunities." />
            </Helmet>
            <div className="max-w-4xl mx-auto px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <Mail className="mx-auto h-16 w-16 text-purple-400 mb-4" />
                    <h1 className="text-5xl font-bold">Contact Us</h1>
                    <p className="text-xl text-gray-300 mt-4">Have a question, a project idea, or just want to say hi? We'd love to hear from you.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <form onSubmit={handleSubmit} className="bg-glass p-8 rounded-lg border-glow space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input type="text" placeholder="Your Name" required className="text-lg p-6" />
                            <Input type="email" placeholder="Your Email" required className="text-lg p-6" />
                        </div>
                        <Input type="text" placeholder="Subject" required className="text-lg p-6" />
                        <Textarea placeholder="Your Message" required rows={6} className="text-lg p-6" />
                        <div className="text-center">
                            <Button type="submit" size="lg" className="w-full md:w-auto text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white glow-effect">
                                <Send className="mr-2 h-5 w-5" />
                                Send Message
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

export default ContactPage;