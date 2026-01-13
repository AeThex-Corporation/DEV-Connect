import React from "react";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "../components/Footer";
import {
  Download,
  Mail,
  Image as ImageIcon
} from "lucide-react";

export default function Press() {
  const logos = [
    { name: "Primary Logo (PNG)", size: "2.5 MB" },
    { name: "White Logo (PNG)", size: "2.1 MB" },
    { name: "Black Logo (PNG)", size: "2.3 MB" },
    { name: "Logo Pack (ZIP)", size: "8.7 MB" }
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
      <div className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Press & <span className="gradient-text">Media</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Resources and information for journalists and media professionals
          </p>
        </div>
      </div>

      {/* Press Contact */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Card className="glass-card border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 mb-12">
            <CardContent className="p-8 text-center">
              <Mail className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">Media Inquiries</h2>
              <p className="text-gray-400 mb-6">
                For press inquiries, interviews, or media requests, please contact:
              </p>
              <a href="mailto:press@dev-link.io" className="text-indigo-400 hover:text-indigo-300 text-lg font-semibold">
                press@dev-link.io
              </a>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Brand Assets */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <ImageIcon className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Brand Assets</h2>
              </div>
              <Card className="glass-card border-0 p-6 mb-4">
                <p className="text-gray-400 text-sm mb-4">
                  Download our official logos and brand assets for your articles and coverage.
                </p>
              </Card>
              <div className="space-y-3">
                {logos.map((logo, i) => (
                  <Card key={i} className="glass-card border-0 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{logo.name}</p>
                        <p className="text-gray-500 text-sm">{logo.size}</p>
                      </div>
                      <Button size="sm" className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Company Info */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">About Devconnect</h2>
              <Card className="glass-card border-0 p-8">
                <h3 className="text-white font-semibold mb-3">Company Overview</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Devconnect is a new platform launching in 2025 to connect Roblox developers with studios and opportunities. 
                  We're dedicated to empowering the Roblox development community with tools for collaboration, skill development, and career growth.
                </p>
                
                <h3 className="text-white font-semibold mb-3">Key Facts</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>• Founded: 2024</li>
                  <li>• Status: Pre-launch (Accepting waitlist signups)</li>
                  <li>• Platform Launch: Q2 2025</li>
                  <li>• Focus: Roblox developer ecosystem</li>
                  <li>• Mission: Empower developers worldwide</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer isAuthenticated={false} />
    </div>
  );
}