import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, DollarSign } from "lucide-react";

export default function StripeConnect({ user, onConnected }) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // In a real implementation, this would redirect to Stripe Connect OAuth
      // For now, we'll simulate the connection
      const simulatedStripeId = `acct_${Math.random().toString(36).substr(2, 9)}`;
      
      await base44.auth.updateMe({
        stripe_account_id: simulatedStripeId
      });

      // Create notification
      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'application_update',
        title: 'Stripe Connected!',
        message: 'Your Stripe account has been connected. You can now receive payments.',
        link: '/Profile'
      });

      if (onConnected) onConnected(simulatedStripeId);
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      alert('Failed to connect Stripe. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const isConnected = !!user?.stripe_account_id;

  return (
    <Card className="glass-card border-0">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-white" />
          <CardTitle className="text-white text-lg">Payment Setup</CardTitle>
          {isConnected && (
            <Badge className="bg-green-500/20 text-green-400 border-0">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {!isConnected ? (
          <>
            <div className="glass-card rounded-lg p-4 bg-blue-500/10">
              <div className="flex gap-3">
                <DollarSign className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm mb-1">Connect Stripe for Payments</p>
                  <p className="text-gray-400 text-xs">
                    Set up your Stripe account to receive escrow payments when milestones are completed.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full btn-primary text-white"
            >
              {connecting ? 'Connecting...' : 'Connect Stripe Account'}
            </Button>

            <p className="text-gray-500 text-xs text-center">
              Secure payment processing powered by Stripe
            </p>
          </>
        ) : (
          <>
            <div className="glass-card rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-medium text-sm">Stripe Account</p>
                  <p className="text-gray-400 text-xs mt-1">
                    ID: {user.stripe_account_id}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-0">
                  Ready to receive payments
                </Badge>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
              className="w-full glass-card border-0 text-white hover:bg-white/5"
            >
              View Stripe Dashboard
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}