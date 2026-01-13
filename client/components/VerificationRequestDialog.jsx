import React, { useState } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Textarea } from '@/components/ui/textarea';
    import { Loader2 } from 'lucide-react';

    const VerificationRequestDialog = ({ open, onOpenChange, onSubmitted }) => {
      const { toast } = useToast();
      const [message, setMessage] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
          setIsSubmitting(false);
          return;
        }

        const { error } = await supabase
          .from('verification_requests')
          .insert({ user_id: user.id, message: message });

        if (error) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
        } else {
          toast({ title: 'Success', description: 'Your verification request has been submitted.' });
          onSubmitted();
          onOpenChange(false);
          setMessage('');
        }
        setIsSubmitting(false);
      };

      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Verification</DialogTitle>
              <DialogDescription>
                Explain why you should be verified. This will be sent to the administrators for review.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <Textarea
                  id="message"
                  placeholder="e.g., I am a notable developer in the community, here is a link to my work..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };

    export default VerificationRequestDialog;