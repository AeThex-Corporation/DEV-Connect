import React, { useState } from "react";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Footer from "../components/Footer";
import {
  MessageSquare,
  Send,
  CheckCircle,
  Lightbulb,
  Bug,
  Heart
} from "lucide-react";

export default function Feedback() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.category || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setSubmitting(false);
  };

  const categories = [
    { value: "bug", label: "Bug Report", icon: Bug },
    { value: "feature", label: "Feature Request", icon: Lightbulb },
    { value: "feedback", label: "General Feedback", icon: MessageSquare },
    { value: "other", label: "Other", icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <style>{`
        .glass-card {
          background-color: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .gradient-text {
          background-image: linear-gradient(to right, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d9d1f385dfdd1e5c5c92d0/c5979f609_Gemini_Generated_Image_q227rdq227rdq2271.png"
                alt="Devconnect Logo"
                className="w-10 h-10"
              />
              <span className="text-white font-bold text-xl">Devconnect</span>
            </div>
            <Button onClick={() => window.location.href = createPageUrl("Waitlist")} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              Join Waitlist
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-32 pb-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Send <span className="gradient-text">Feedback</span>
          </h1>
          <p className="text-xl text-gray-400">
            We'd love to hear from you! Your feedback helps us build a better platform.
          </p>
        </div>
      </div>

      {/* Form */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {!submitted ? (
            <Card className="glass-card border-0 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      Name
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Your name"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="your@email.com"
                      required
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    Category *
                  </label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center">
                            <cat.icon className="w-4 h-4 mr-2" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    Subject
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Brief description"
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    Message *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Tell us what's on your mind..."
                    required
                    rows={6}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg py-6"
                >
                  {submitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Feedback
                    </>
                  )}
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="glass-card border-0 p-12 bg-gradient-to-br from-green-500/10 to-emerald-500/10 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Thank You!
              </h2>
              <p className="text-gray-400 mb-6">
                We've received your feedback and will review it carefully. 
                We'll get back to you if we need any additional information.
              </p>
              <Button 
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", category: "", subject: "", message: "" });
                }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              >
                Send Another Message
              </Button>
            </Card>
          )}

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {categories.slice(0, 3).map((cat, i) => (
              <Card 
                key={i} 
                className="glass-card border-0 p-6 text-center cursor-pointer hover:bg-white/10 transition-all"
                onClick={() => !submitted && setFormData({...formData, category: cat.value})}
              >
                <cat.icon className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold">{cat.label}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer isAuthenticated={false} />
    </div>
  );
}