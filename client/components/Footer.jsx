
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Footer({ isAuthenticated }) {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d9d1f385dfdd1e5c5c92d0/c5979f609_Gemini_Generated_Image_q227rdq227rdq2271.png"
                alt="Devconnect"
                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              />
              <span className="text-white font-bold text-xl">Devconnect</span>
            </div>
            <p className="text-gray-400 text-sm">
              The premier platform for Roblox developers and studios to connect, collaborate, and create.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to={createPageUrl("Jobs")} className="text-gray-400 hover:text-white text-sm transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("BrowseProfiles")} className="text-gray-400 hover:text-white text-sm transition-colors">
                  Find Developers
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Marketplace")} className="text-gray-400 hover:text-white text-sm transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Resources")} className="text-gray-400 hover:text-white text-sm transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to={createPageUrl("About")} className="text-gray-400 hover:text-white text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Blog")} className="text-gray-400 hover:text-white text-sm transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Press")} className="text-gray-400 hover:text-white text-sm transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Feedback")} className="text-gray-400 hover:text-white text-sm transition-colors">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://discord.gg/athx" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Discord Community
                </a>
              </li>
              <li>
                <a href="mailto:support@devlink.io" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <Link to={createPageUrl("AIGuide")} className="text-gray-400 hover:text-white text-sm transition-colors">
                  AI Guide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d9d1f385dfdd1e5c5c92d0/c5979f609_Gemini_Generated_Image_q227rdq227rdq2271.png"
              alt="Devconnect"
              style={{ width: '24px', height: '24px', objectFit: 'contain' }}
            />
            <p className="text-gray-400 text-sm">
              © 2025 Devconnect. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
