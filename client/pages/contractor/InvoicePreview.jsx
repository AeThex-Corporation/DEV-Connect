import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

// Simple placeholder for now as requested by step 8
const InvoicePreview = () => {
  const { invoiceId } = useParams();
  
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Card className="bg-white text-black min-h-[800px] shadow-xl">
        <CardContent className="p-12">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-blue-900">INVOICE</h1>
                    <p className="text-gray-500 mt-2">#{invoiceId || 'DRAFT'}</p>
                </div>
                <div className="text-right">
                    <h2 className="font-bold text-xl">Devconnect Inc.</h2>
                    <p className="text-gray-600">123 Dev Street</p>
                    <p className="text-gray-600">Tech City, TC 90210</p>
                </div>
            </div>
            
            {/* Placeholder content for visual check */}
            <div className="border-t-2 border-blue-100 py-8 mb-8">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold text-gray-400 text-sm uppercase mb-2">Bill To</h3>
                        <p className="font-bold">Client Name</p>
                        <p className="text-gray-600">client@example.com</p>
                    </div>
                    <div className="text-right">
                         <div className="flex justify-between mb-2">
                             <span className="text-gray-500">Date:</span>
                             <span className="font-medium">{new Date().toLocaleDateString()}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-gray-500">Due Date:</span>
                             <span className="font-medium">{new Date(Date.now() + 12096e5).toLocaleDateString()}</span>
                         </div>
                    </div>
                </div>
            </div>

            <div className="mb-12">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="py-2">Description</th>
                            <th className="py-2 text-right">Hours</th>
                            <th className="py-2 text-right">Rate</th>
                            <th className="py-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="py-4">Frontend Development Services</td>
                            <td className="py-4 text-right">10.0</td>
                            <td className="py-4 text-right">$85.00</td>
                            <td className="py-4 text-right">$850.00</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end">
                <div className="w-64">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium">Subtotal</span>
                        <span>$850.00</span>
                    </div>
                    <div className="flex justify-between py-4">
                        <span className="font-bold text-xl">Total</span>
                        <span className="font-bold text-xl text-blue-600">$850.00</span>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicePreview;