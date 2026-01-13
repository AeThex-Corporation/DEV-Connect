import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-glass p-8 rounded-2xl border border-red-500/30 text-center max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-2">Payment Failed</h1>
            <p className="text-gray-300 mb-8">Something went wrong with your transaction. No charges were made.</p>
            <div className="flex flex-col gap-3">
                <Button onClick={() => navigate('/business/upgrade')} className="w-full bg-white text-black hover:bg-gray-200">Try Again</Button>
                <Button variant="ghost" onClick={() => navigate('/contact')}>Contact Support</Button>
            </div>
        </div>
    </div>
  );
};

export default PaymentFailed;