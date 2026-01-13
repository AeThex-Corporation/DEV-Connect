import React from "react";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "../components/Footer";
import {
  Calendar,
  User,
  ArrowRight,
  TrendingUp,
  Code,
  Lightbulb
} from "lucide-react";

export default function Blog() {
  const posts = [
    {
      title: "10 Tips for Building a Successful Roblox Game",
      excerpt: "Learn the essential strategies that top developers use to create engaging and profitable Roblox experiences.",
      author: "Alex Chen",
      date: "Jan 15, 2025",
      category: "Game Design",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80"
    },
    {
      title: "The Future of Roblox Development in 2025",
      excerpt: "Explore the emerging trends and technologies shaping the future of Roblox development.",
      author: "Sarah Johnson",
      date: "Jan 12, 2025",
      category: "Industry Trends",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"
    },
    {
      title: "Mastering Lua: Advanced Scripting Techniques",
      excerpt: "Deep dive into advanced Lua patterns and best practices for Roblox development.",
      author: "Marcus Lee",
      date: "Jan 10, 2025",
      category: "Technical",
      readTime: "10 min read",
      image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80"
    },
    {
      title: "How to Price Your Development Services",
      excerpt: "A comprehensive guide to setting competitive rates and negotiating contracts as a Roblox developer.",
      author: "Elena Rodriguez",
      date: "Jan 8, 2025",
      category: "Career",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
    },
    {
      title: "Building Your Portfolio: What Employers Look For",
      excerpt: "Showcase your skills effectively and stand out to potential employers with these portfolio tips.",
      author: "Alex Chen",
      date: "Jan 5, 2025",
      category: "Career",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=800&q=80"
    },
    {
      title: "Optimizing Performance in Roblox Games",
      excerpt: "Learn how to identify and fix performance bottlenecks to create smooth gameplay experiences.",
      author: "Sarah Johnson",
      date: "Jan 3, 2025",
      category: "Technical",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&q=80"
    }
  ];

  const categories = ["All", "Game Design", "Technical", "Career", "Industry Trends"];

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
        .card-hover {
          transition: all 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d9d1f385dfdd1e5c5c92d0/c5979f609_Gemini_Generated_Image_q227rdq227rdq2271.png"
                alt="Dev-Link Logo"
                className="w-10 h-10"
              />
              <span className="text-white font-bold text-xl">Dev-Link</span>
            </div>
            <Button onClick={() => window.location.href = createPageUrl("Waitlist")} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              Join Waitlist
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Dev-Link <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Insights, tutorials, and stories from the Roblox development community
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map((category, i) => (
              <Button
                key={i}
                variant={i === 0 ? "default" : "outline"}
                className={i === 0 
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" 
                  : "glass-card border-white/20 text-white hover:bg-white/5"
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Featured Post */}
          <Card className="glass-card border-0 mb-12 overflow-hidden card-hover cursor-pointer">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto overflow-hidden">
                <img 
                  src={posts[0].image}
                  alt={posts[0].title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-indigo-500/90 text-white border-0">
                  Featured
                </Badge>
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge className="bg-purple-500/20 text-purple-300 border-0 w-fit mb-3">
                  {posts[0].category}
                </Badge>
                <h2 className="text-3xl font-bold text-white mb-4">{posts[0].title}</h2>
                <p className="text-gray-400 mb-6">{posts[0].excerpt}</p>
                <div className="flex items-center text-gray-500 text-sm mb-6">
                  <User className="w-4 h-4 mr-2" />
                  <span className="mr-4">{posts[0].author}</span>
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="mr-4">{posts[0].date}</span>
                  <span>{posts[0].readTime}</span>
                </div>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white w-fit">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </div>
          </Card>

          {/* Blog Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {posts.slice(1).map((post, i) => (
              <Card key={i} className="glass-card border-0 overflow-hidden card-hover cursor-pointer">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <Badge className="bg-purple-500/20 text-purple-300 border-0 mb-3">
                    {post.category}
                  </Badge>
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{post.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center text-gray-500 text-xs mb-4">
                    <User className="w-3 h-3 mr-1" />
                    <span className="mr-3">{post.author}</span>
                    <Calendar className="w-3 h-3 mr-1" />
                    <span className="mr-3">{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300 p-0">
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            <CardContent className="p-12 text-center">
              <Lightbulb className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Never Miss a Post
              </h2>
              <p className="text-gray-400 mb-8">
                Subscribe to get the latest insights and tutorials delivered to your inbox
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500"
                />
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer isAuthenticated={false} />
    </div>
  );
}