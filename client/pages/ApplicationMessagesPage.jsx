import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Star, DollarSign, ListChecks, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

function ApplicationMessagesPage() {
  const { applicationId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [application, setApplication] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRatingOpen, setRatingOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const fetchInitialData = async () => {
    if (!user || !applicationId) return;
    setLoading(true);

    const { data: appData, error: appError } = await supabase
      .from('applications')
      .select('*, jobs(*), applicant:profiles!applications_applicant_id_fkey(*), job_owner:profiles!public_jobs_created_by_fkey(*)')
      .eq('id', applicationId).single();

    if (appError || !appData) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load conversation.' });
      navigate('/dashboard');
      return;
    }
    setApplication(appData);

    const { data: projectData, error: projectError } = await supabase
      .from('project_history').select('*').eq('job_id', appData.job_id).single();
    if (!projectError) setProject(projectData);

    const { data: messagesData, error: messagesError } = await supabase
      .from('messages').select('*, sender:profiles!messages_sender_id_fkey(*)').eq('application_id', applicationId).order('created_at', { ascending: true });
    if (messagesError) toast({ variant: 'destructive', title: 'Error', description: 'Could not load messages.' });
    else setMessages(messagesData);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, [applicationId, user, toast, navigate]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (!applicationId) return;
    const channel = supabase.channel(`messages:${applicationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `application_id=eq.${applicationId}` }, async (payload) => {
        const { data: senderProfile, error } = await supabase.from('profiles').select('*').eq('id', payload.new.sender_id).single();
        if (!error) {
            setMessages(prev => [...prev, {...payload.new, sender: senderProfile}]);
        }
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [applicationId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !application) return;
    const recipientId = user.id === application.applicant_id ? application.jobs.created_by : application.applicant_id;
    const { error } = await supabase.from('messages').insert({ application_id: applicationId, sender_id: user.id, recipient_id: recipientId, body: newMessage });
    if (error) toast({ variant: 'destructive', title: 'Error sending message', description: error.message });
    else setNewMessage('');
  };

  const handleFundProject = async () => {
    const { data, error } = await supabase.from('project_history').insert({
      job_id: application.job_id,
      employer_id: application.jobs.created_by,
      developer_id: application.applicant_id,
      payment_status: 'funded'
    }).select().single();
    if (error) toast({ variant: 'destructive', title: 'Escrow Failed', description: error.message });
    else {
      toast({ title: 'Project Funded!', description: 'Funds are now held in escrow.' });
      setProject(data);
    }
  };

  const handleReleasePayment = async () => {
    const { data, error } = await supabase.from('project_history').update({ payment_status: 'released' }).eq('id', project.id).select().single();
    if (error) toast({ variant: 'destructive', title: 'Payment Release Failed', description: error.message });
    else {
      toast({ title: 'Payment Released!', description: 'The developer has been paid. A 2.5% escrow fee has been applied.' });
      setProject(data);
      setRatingOpen(true);
    }
  };

  const handleRate = async () => {
    const revieweeId = user.id === project.employer_id ? project.developer_id : project.employer_id;
    const { error } = await supabase.from('ratings').insert({
      project_id: project.id,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating,
      comment
    });
    if (error) toast({ variant: 'destructive', title: 'Rating Failed', description: error.message });
    else toast({ title: 'Review Submitted!', description: 'Thank you for your feedback.' });
    setRatingOpen(false);
  };

  if (loading) return <div className="text-center py-20 text-2xl">Loading Messages...</div>;
  
  if (!application) {
    return (
      <div className="text-center py-20 text-2xl">Application not found.</div>
    );
  }

  const otherUser = user.id === application.applicant_id ? application.job_owner : application.applicant;
  const isEmployer = user.id === application.jobs.created_by;

  return (
    <>
      <Helmet><title>Application Messages | Devconnect</title></Helmet>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-glass p-6 rounded-lg border-glow h-[80vh] flex flex-col">
          <div className="border-b border-gray-700 pb-4 mb-4">
            <h1 className="text-2xl font-bold">Conversation with {otherUser?.display_name || 'User'}</h1>
            <p className="text-gray-400">Regarding job: <span className="font-semibold">{application.jobs?.title || 'Job'}</span></p>
            {isEmployer && !project && <Button onClick={handleFundProject} className="mt-2 bg-green-600 hover:bg-green-700"><DollarSign className="mr-2 h-4 w-4" /> Secure Payment (Fund Escrow)</Button>}
            {isEmployer && project?.payment_status === 'funded' && <Button onClick={handleReleasePayment} className="mt-2 bg-blue-600 hover:bg-blue-700"><DollarSign className="mr-2 h-4 w-4" /> Release Payment</Button>}
            {project?.payment_status === 'released' && <Button onClick={() => setRatingOpen(true)} className="mt-2"><Star className="mr-2 h-4 w-4" /> Rate Experience</Button>}
          </div>
          <div className="flex-grow overflow-y-auto pr-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                {msg.sender_id !== user.id && <img src={msg.sender?.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${msg.sender?.display_name}`} alt="avatar" className="w-8 h-8 rounded-full" />}
                <div className={`max-w-lg px-4 py-2 rounded-lg ${msg.sender_id === user.id ? 'bg-blue-600' : 'bg-gray-700'}`}><p>{msg.body}</p></div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="mt-4 flex gap-4">
            <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-grow" />
            <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
        <div className="text-center mt-8">
          <Link to="/dashboard"><Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white">Back to Dashboard</Button></Link>
        </div>
      </div>
      <Dialog open={isRatingOpen} onOpenChange={setRatingOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rate Your Experience</DialogTitle><DialogDescription>Provide feedback for {otherUser?.display_name}.</DialogDescription></DialogHeader>
          <div className="flex justify-center text-yellow-400 my-4">{[1, 2, 3, 4, 5].map(i => <Star key={i} onClick={() => setRating(i)} className={`w-8 h-8 cursor-pointer ${i <= rating ? 'fill-current' : ''}`} />)}</div>
          <Input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a public comment..." />
          <DialogFooter><Button onClick={handleRate}>Submit Rating</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ApplicationMessagesPage;