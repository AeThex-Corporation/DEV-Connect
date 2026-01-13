import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getInvoices, createInvoice } from '@/lib/db_time_tracking';
import { supabase } from '@/lib/customSupabaseClient';
import { Plus, FileText, Download, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const InvoiceGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contractorId, setContractorId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const fetchInvoices = async () => {
    if (!user) return;
    try {
        const { data: contractor } = await supabase.from('contractors').select('id').eq('user_id', user.id).single();
        if (!contractor) { setLoading(false); return; }
        setContractorId(contractor.id);

        const data = await getInvoices(contractor.id);
        setInvoices(data || []);
    } catch (error) {
        console.error("Error fetching invoices", error);
    } finally {
        setLoading(false);
    }
  };

  const handleQuickInvoice = async () => {
      // Simplified creation for demo
      toast({ description: "Full invoice wizard coming in next update. Use manual creation for now." });
  };

  const getStatusBadge = (status) => {
      switch(status) {
          case 'paid': return <Badge className="bg-green-600">Paid</Badge>;
          case 'sent': return <Badge className="bg-blue-600">Sent</Badge>;
          case 'draft': return <Badge variant="outline" className="text-gray-400 border-gray-600">Draft</Badge>;
          default: return <Badge variant="secondary">{status}</Badge>;
      }
  };

  if (loading) return <div className="p-8 text-center">Loading invoices...</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white">Invoices</h1>
            <p className="text-gray-400">Manage and track your billing.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-500 gap-2">
            <Plus className="w-4 h-4" /> New Invoice
        </Button>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-800/50">
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-300">Invoice #</TableHead>
                <TableHead className="text-gray-300">Client</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Amount</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-right text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No invoices found. Create your first one!
                        </TableCell>
                    </TableRow>
                ) : (
                    invoices.map((inv) => (
                        <TableRow key={inv.id} className="border-gray-800 hover:bg-gray-800/30">
                            <TableCell className="font-mono text-white">{inv.invoice_number || 'DRAFT'}</TableCell>
                            <TableCell className="text-gray-300">{inv.profiles?.display_name || 'Unknown'}</TableCell>
                            <TableCell className="text-gray-400">{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="font-bold text-white">${inv.total_amount}</TableCell>
                            <TableCell>{getStatusBadge(inv.status)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Simple Dialog for Placeholder Creation */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>This feature will allow you to generate invoices from time entries.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <p className="text-sm text-gray-400">
                    The automated invoice builder (Phase 4 Item 10) is not yet fully wired to the UI but the backend logic exists.
                    For now, you can manage existing invoices.
                </p>
            </div>
            <Button onClick={() => setIsCreateOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceGenerator;