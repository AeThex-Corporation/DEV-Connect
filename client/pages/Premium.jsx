import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Shield,
  Zap,
  TrendingUp,
  Award,
  Crown,
  CheckCircle,
  X,
  Users,
  Briefcase,
  Brain,
  Target,
  BarChart3,
  Building,
  Eye
} from "lucide-react";

export default function Premium() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [userType, setUserType] = useState("developer"); // "developer" or "employer"

  // Developer Plans
  const developerPlans = [
    {
      name: "Free",
      price: 0,
      yearlyPrice: 0,
      icon: Zap,
      color: "from-gray-500 to-gray-600",
      features: [
        { name: "Basic profile & portfolio", included: true },
        { name: "5 job applications/month", included: true },
        { name: "3 portfolio projects", included: true },
        { name: "Basic job matching", included: true },
        { name: "Community access", included: true },
        { name: "Direct messaging", included: true },
        { name: "Unlimited applications", included: false },
        { name: "AI job matching", included: false },
        { name: "Verified badge", included: false },
      ],
      cta: "Current Plan",
      recommended: false
    },
    {
      name: "Devconnect Pro",
      price: 9.99,
      yearlyPrice: 99,
      icon: Sparkles,
      color: "from-indigo-500 to-purple-500",
      features: [
        { name: "Everything in Free", included: true },
        { name: "Unlimited job applications", included: true, highlight: true },
        { name: "10 portfolio projects", included: true, highlight: true },
        { name: "AI job matching", included: true, highlight: true },
        { name: "Advanced analytics", included: true, highlight: true },
        { name: "Featured profile badge", included: true, highlight: true },
        { name: "10 job alerts", included: true, highlight: true },
        { name: "Ad-free experience", included: true, highlight: true },
        { name: "Priority support", included: false },
      ],
      cta: "Start Free Trial",
      recommended: true
    },
    {
      name: "Premium",
      price: 29.99,
      yearlyPrice: 299,
      icon: Crown,
      color: "from-purple-500 to-pink-500",
      features: [
        { name: "Everything in Pro", included: true },
        { name: "Verified developer badge ✓", included: true, highlight: true },
        { name: "Custom profile URL", included: true, highlight: true },
        { name: "Unlimited portfolio", included: true, highlight: true },
        { name: "Priority support (24h)", included: true, highlight: true },
        { name: "Featured in search", included: true, highlight: true },
        { name: "Advanced profile analytics", included: true, highlight: true },
        { name: "Monthly strategy call", included: true, highlight: true },
        { name: "Early feature access", included: true, highlight: true },
      ],
      cta: "Start Free Trial",
      recommended: false
    }
  ];

  // Employer Plans
  const employerPlans = [
    {
      name: "Basic Hiring",
      price: 0,
      yearlyPrice: 0,
      icon: Briefcase,
      color: "from-gray-500 to-gray-600",
      features: [
        { name: "Company profile", included: true },
        { name: "Browse developer profiles", included: true },
        { name: "View public portfolios", included: true },
        { name: "0 job postings/month", included: true, note: "1 trial posting available" },
        { name: "Basic candidate search", included: true },
        { name: "Direct messaging", included: true },
        { name: "AI Talent Scout", included: false },
        { name: "Featured job listings", included: false },
        { name: "Advanced analytics", included: false },
      ],
      cta: "Current Plan",
      recommended: false
    },
    {
      name: "Studio Pro",
      price: 49.99,
      yearlyPrice: 499,
      icon: Building,
      color: "from-blue-500 to-cyan-500",
      features: [
        { name: "Everything in Basic", included: true },
        { name: "10 job postings/month", included: true, highlight: true },
        { name: "AI Talent Scout access", included: true, highlight: true },
        { name: "Advanced candidate filtering", included: true, highlight: true },
        { name: "2 featured job listings/month", included: true, highlight: true },
        { name: "Company profile analytics", included: true, highlight: true },
        { name: "AI Job Description Assistant", included: true, highlight: true },
        { name: "Priority applicant visibility", included: true, highlight: true },
        { name: "Email support", included: true },
      ],
      cta: "Start Free Trial",
      recommended: true
    },
    {
      name: "Enterprise",
      price: 149.99,
      yearlyPrice: 1499,
      icon: Crown,
      color: "from-purple-500 to-pink-500",
      features: [
        { name: "Everything in Studio Pro", included: true },
        { name: "Unlimited job postings", included: true, highlight: true },
        { name: "AI Company Brand Builder", included: true, highlight: true },
        { name: "AI Team Builder", included: true, highlight: true },
        { name: "5 featured job listings/month", included: true, highlight: true },
        { name: "Advanced analytics dashboard", included: true, highlight: true },
        { name: "Dedicated account manager", included: true, highlight: true },
        { name: "Priority support (24h)", included: true, highlight: true },
        { name: "API access for integrations", included: true, highlight: true },
      ],
      cta: "Contact Sales",
      recommended: false
    }
  ];

  const plans = userType === "developer" ? developerPlans : employerPlans;

  const getPrice = (plan) => {
    if (plan.price === 0) return "Free";
    const price = billingCycle === "monthly" ? plan.price : (plan.yearlyPrice / 12).toFixed(2);
    return `$${price}`;
  };

  const getSavings = (plan) => {
    if (billingCycle === "yearly" && plan.price > 0) {
      const monthlyCost = plan.price * 12;
      const savings = ((monthlyCost - plan.yearlyPrice) / monthlyCost * 100).toFixed(0);
      return `Save ${savings}%`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="bg-indigo-500/20 text-indigo-600 border-indigo-500/30 mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Transparent Pricing
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Perfect Plan</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
            Simple, honest pricing for developers and employers. No hidden fees, cancel anytime.
          </p>

          {/* User Type Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setUserType("developer")}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  userType === "developer"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                I'm a Developer
              </button>
              <button
                onClick={() => setUserType("employer")}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  userType === "employer"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Building className="w-4 h-4 inline mr-2" />
                I'm an Employer
              </button>
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center items-center gap-4">
            <span className={`font-medium ${billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === "yearly" ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === "yearly" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`font-medium ${billingCycle === "yearly" ? "text-gray-900" : "text-gray-500"}`}>
              Yearly
              {billingCycle === "yearly" && (
                <Badge className="ml-2 bg-green-100 text-green-700 border-0">Save 17%</Badge>
              )}
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.recommended
                  ? "border-2 border-indigo-500 shadow-xl scale-105"
                  : "border border-gray-200"
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-indigo-600 text-white border-0 px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{getPrice(plan)}</span>
                  {plan.price > 0 && (
                    <span className="text-gray-500">/{billingCycle === "monthly" ? "mo" : "mo"}</span>
                  )}
                </div>
                {getSavings(plan) && (
                  <p className="text-green-600 text-sm font-medium mt-1">{getSavings(plan)}</p>
                )}
                {billingCycle === "yearly" && plan.price > 0 && (
                  <p className="text-gray-500 text-sm">Billed ${plan.yearlyPrice}/year</p>
                )}
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {feature.included ? (
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${feature.highlight ? 'text-indigo-600' : 'text-green-500'}`} />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${feature.included ? (feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-700') : 'text-gray-400'}`}>
                        {feature.name}
                        {feature.note && <span className="text-xs text-gray-500 block">{feature.note}</span>}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.recommended
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                  disabled={plan.price === 0}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Value Proposition based on user type */}
        {userType === "developer" ? (
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 mb-12">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Why Premium Developers Earn 3x More
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    3x
                  </div>
                  <p className="text-gray-700">More profile views with featured placement</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    5x
                  </div>
                  <p className="text-gray-700">More interview invitations with verified badge</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    10x
                  </div>
                  <p className="text-gray-700">Better job matching with AI insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-0 mb-12">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Why Studios Choose Devconnect
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    10%
                  </div>
                  <p className="text-gray-700">Platform fee - lowest in the industry</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    2x
                  </div>
                  <p className="text-gray-700">Faster hiring with AI Talent Scout</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    95%
                  </div>
                  <p className="text-gray-700">Success rate with verified developers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">Can I switch plans later?</h4>
                <p className="text-gray-600 text-sm">
                  Yes! Upgrade or downgrade anytime. Upgrades take effect immediately, downgrades at the end of your billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-gray-600 text-sm">
                  Credit/debit cards via Stripe, PayPal, and cryptocurrency. We'll also accept Robux in the future.
                </p>
              </CardContent>
            </Card>

            {userType === "employer" && (
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">What happens if I exceed my job posting limit?</h4>
                  <p className="text-gray-600 text-sm">
                    You'll be prompted to upgrade your plan. You can either wait until next month's reset or upgrade immediately to post more jobs.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
                <p className="text-gray-600 text-sm">
                  Yes! We offer a 14-day money-back guarantee. No questions asked.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}