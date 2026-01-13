import React from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Check, X, Infinity, Zap } from 'lucide-react';

    const limitsData = {
      headers: ['Feature', 'Explorer (Free)', 'Creator', 'Pro', 'Studio', 'Enterprise'],
      rows: [
        { feature: 'Job Applications', limits: ['5 / month', '25 / month', <Infinity key="inf-app" className="text-green-400" />, <Infinity key="inf-app-2" className="text-green-400" />, <Infinity key="inf-app-3" className="text-green-400" />] },
        { feature: 'Active Job Posts', limits: [<X key="x-job" className="text-red-400" />, '1', '2', '5', <Infinity key="inf-job" className="text-green-400" />] },
        { feature: 'Direct Messaging', limits: ['Limited', <Infinity key="inf-msg" className="text-green-400" />, <Infinity key="inf-msg-2" className="text-green-400" />, <Infinity key="inf-msg-3" className="text-green-400" />, <Infinity key="inf-msg-4" className="text-green-400" />] },
        { feature: 'Profile Verification', limits: ['Request', 'Request', <Check key="check-ver" className="text-green-400" />, <Check key="check-ver-2" className="text-green-400" />, <Check key="check-ver-3" className="text-green-400" />] },
        { feature: 'Advanced Developer Search', limits: [<X key="x-search" className="text-red-400" />, <X key="x-search-2" className="text-red-400" />, <X key="x-search-3" className="text-red-400" />, <Check key="check-search" className="text-green-400" />, <Check key="check-search-2" className="text-green-400" />] },
        { feature: 'Profile Analytics', limits: [<X key="x-analytics" className="text-red-400" />, <X key="x-analytics-2" className="text-red-400" />, <Check key="check-analytics" className="text-green-400" />, <Check key="check-analytics-2" className="text-green-400" />, <Check key="check-analytics-3" className="text-green-400" />] },
        { feature: 'Applicant Tracking System (ATS)', limits: [<X key="x-ats" className="text-red-400" />, <X key="x-ats-2" className="text-red-400" />, <X key="x-ats-3" className="text-red-400" />, <Check key="check-ats" className="text-green-400" />, <Check key="check-ats-2" className="text-green-400" />] },
        { feature: 'API Access', limits: [<X key="x-api" className="text-red-400" />, <X key="x-api-2" className="text-red-400" />, <X key="x-api-3" className="text-red-400" />, <X key="x-api-4" className="text-red-400" />, <Check key="check-api" className="text-green-400" />] },
        { feature: 'Dedicated Account Manager', limits: [<X key="x-manager" className="text-red-400" />, <X key="x-manager-2" className="text-red-400" />, <X key="x-manager-3" className="text-red-400" />, <X key="x-manager-4" className="text-red-400" />, <Check key="check-manager" className="text-green-400" />] },
      ]
    };

    function LimitsPage() {
      const pageTitle = "Account Limits | Devconnect";
      const pageDescription = "A detailed breakdown of the features and limits for each subscription tier on Devconnect.";

      return (
        <>
          <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
          </Helmet>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-wider">
                Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 text-glow">Limits & Features</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
                Find the perfect plan for your needs. Here’s a clear comparison of what each tier offers.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-glass border-glow rounded-xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-lg">
                  <thead>
                    <tr className="bg-gray-800/50">
                      {limitsData.headers.map((header, index) => (
                        <th key={index} className={`p-6 text-left font-bold ${index > 0 ? 'text-center' : ''} ${header === 'Pro' ? 'text-yellow-400' : ''}`}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {limitsData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t border-gray-700/50">
                        <td className="p-6 font-semibold">{row.feature}</td>
                        {row.limits.map((limit, limitIndex) => (
                          <td key={limitIndex} className="p-6 text-center">
                            <div className="flex justify-center items-center">
                              {limit}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <div className="text-center mt-16">
              <Link to="/subscription">
                <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold">
                  <Zap className="mr-2 h-5 w-5" /> Upgrade Your Plan
                </Button>
              </Link>
            </div>
          </div>
        </>
      );
    }

    export default LimitsPage;