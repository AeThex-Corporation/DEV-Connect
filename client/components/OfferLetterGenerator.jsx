import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Sparkles,
  Send,
  Eye,
  Download,
  Plus,
  X
} from "lucide-react";

export default function OfferLetterGenerator({ jobId, applicationId, candidateId, employerId, jobTitle, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [preview, setPreview] = useState(false);
  const [template, setTemplate] = useState('standard');
  
  const [offerData, setOfferData] = useState({
    title: `Offer of Employment: ${jobTitle}`,
    content: '',
    salary_details: {
      amount: '',
      currency: 'Robux',
      type: 'project-based'
    },
    benefits_summary: [],
    start_date: '',
    acceptance_deadline: ''
  });

  const [newBenefit, setNewBenefit] = useState('');

  const templates = {
    standard: {
      name: 'Standard Offer',
      description: 'Professional standard offer letter'
    },
    contract: {
      name: 'Contract-Based',
      description: 'For contract/freelance positions'
    },
    partnership: {
      name: 'Partnership',
      description: 'Long-term collaboration offer'
    }
  };

  const generateWithAI = async () => {
    setAiGenerating(true);
    try {
      const prompt = `Generate a professional job offer letter for a Roblox development position.

Job Title: ${jobTitle}
Salary: ${offerData.salary_details.amount} ${offerData.salary_details.currency} (${offerData.salary_details.type})
Start Date: ${offerData.start_date}
Benefits: ${offerData.benefits_summary.join(', ')}
Template Type: ${template}

Create a warm, professional offer letter that:
1. Congratulates the candidate
2. Clearly states the position and compensation
3. Outlines key responsibilities
4. Lists benefits
5. Provides acceptance deadline and next steps
6. Maintains an encouraging tone

Make it specific to Roblox development and include relevant details.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            letter_content: { type: "string" },
            suggested_subject: { type: "string" }
          }
        }
      });

      setOfferData({
        ...offerData,
        content: response.letter_content,
        title: response.suggested_subject || offerData.title
      });
    } catch (error) {
      console.error('Error generating offer letter:', error);
      alert('Failed to generate AI offer letter');
    } finally {
      setAiGenerating(false);
    }
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !offerData.benefits_summary.includes(newBenefit.trim())) {
      setOfferData({
        ...offerData,
        benefits_summary: [...offerData.benefits_summary, newBenefit.trim()]
      });
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefit) => {
    setOfferData({
      ...offerData,
      benefits_summary: offerData.benefits_summary.filter(b => b !== benefit)
    });
  };

  const handleSendOffer = async () => {
    if (!offerData.content || !offerData.start_date || !offerData.acceptance_deadline) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const offer = await base44.entities.OfferLetter.create({
        job_id: jobId,
        application_id: applicationId,
        employer_id: employerId,
        candidate_id: candidateId,
        ...offerData,
        status: 'sent',
        sent_date: new Date().toISOString(),
        template_used: template
      });

      // Update application status
      await base44.entities.Application.update(applicationId, {
        status: 'Accepted'
      });

      // Send notification
      await base44.entities.Notification.create({
        user_id: candidateId,
        type: 'application_update',
        title: '🎉 You Received a Job Offer!',
        message: `Congratulations! You've received an offer for ${jobTitle}`,
        link: createPageUrl('Dashboard')
      });

      if (onComplete) onComplete(offer);
      alert('Offer letter sent successfully!');
    } catch (error) {
      console.error('Error sending offer:', error);
      alert('Failed to send offer letter');
    } finally {
      setLoading(false);
    }
  };

  if (preview) {
    return (
      <Card className="glass-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Preview Offer Letter</CardTitle>
            <Button
              onClick={() => setPreview(false)}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="glass-card rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-white mb-4">{offerData.title}</h1>
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {offerData.content}
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-white font-semibold mb-3">Compensation & Benefits</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">
                  <span className="text-gray-400">Compensation:</span> {offerData.salary_details.amount} {offerData.salary_details.currency} ({offerData.salary_details.type})
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-400">Start Date:</span> {new Date(offerData.start_date).toLocaleDateString()}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-400">Accept By:</span> {new Date(offerData.acceptance_deadline).toLocaleDateString()}
                </p>
                
                {offerData.benefits_summary.length > 0 && (
                  <div>
                    <p className="text-gray-400 mb-2">Benefits:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {offerData.benefits_summary.map((benefit, i) => (
                        <li key={i} className="text-gray-300">{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setPreview(false)}
              variant="outline"
              className="flex-1 glass-card border-0 text-white hover:bg-white/5"
            >
              Edit
            </Button>
            <Button
              onClick={handleSendOffer}
              disabled={loading}
              className="flex-1 btn-primary text-white"
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Offer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Create Offer Letter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div>
          <label className="text-white font-medium text-sm mb-3 block">Template</label>
          <div className="grid md:grid-cols-3 gap-3">
            {Object.entries(templates).map(([key, tmpl]) => (
              <button
                key={key}
                onClick={() => setTemplate(key)}
                className={`glass-card rounded-lg p-4 text-left transition-all ${
                  template === key ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <h4 className="text-white font-medium text-sm mb-1">{tmpl.name}</h4>
                <p className="text-gray-400 text-xs">{tmpl.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-white font-medium text-sm mb-2 block">Offer Title</label>
          <Input
            value={offerData.title}
            onChange={(e) => setOfferData({...offerData, title: e.target.value})}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        {/* Compensation */}
        <div>
          <label className="text-white font-medium text-sm mb-3 block">Compensation</label>
          <div className="grid md:grid-cols-3 gap-3">
            <Input
              type="number"
              placeholder="Amount"
              value={offerData.salary_details.amount}
              onChange={(e) => setOfferData({
                ...offerData,
                salary_details: {...offerData.salary_details, amount: e.target.value}
              })}
              className="bg-white/5 border-white/10 text-white"
            />
            <Select
              value={offerData.salary_details.currency}
              onValueChange={(value) => setOfferData({
                ...offerData,
                salary_details: {...offerData.salary_details, currency: value}
              })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Robux">Robux</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={offerData.salary_details.type}
              onValueChange={(value) => setOfferData({
                ...offerData,
                salary_details: {...offerData.salary_details, type: value}
              })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="project-based">Project-based</SelectItem>
                <SelectItem value="rev-share">Rev-share</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-white font-medium text-sm mb-2 block">Start Date</label>
            <Input
              type="date"
              value={offerData.start_date}
              onChange={(e) => setOfferData({...offerData, start_date: e.target.value})}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="text-white font-medium text-sm mb-2 block">Acceptance Deadline</label>
            <Input
              type="date"
              value={offerData.acceptance_deadline}
              onChange={(e) => setOfferData({...offerData, acceptance_deadline: e.target.value})}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        {/* Benefits */}
        <div>
          <label className="text-white font-medium text-sm mb-2 block">Benefits & Perks</label>
          <div className="flex gap-2 mb-3">
            <Input
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
              placeholder="Add benefit..."
              className="bg-white/5 border-white/10 text-white"
            />
            <Button onClick={addBenefit} size="icon" className="btn-primary text-white flex-shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {offerData.benefits_summary.map((benefit, i) => (
              <Badge key={i} className="bg-green-500/20 text-green-300 border-0">
                {benefit}
                <button onClick={() => removeBenefit(benefit)} className="ml-2">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Letter Content */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-white font-medium text-sm">Letter Content</label>
            <Button
              onClick={generateWithAI}
              disabled={aiGenerating}
              size="sm"
              className="btn-primary text-white"
            >
              {aiGenerating ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
          <Textarea
            value={offerData.content}
            onChange={(e) => setOfferData({...offerData, content: e.target.value})}
            placeholder="Write your offer letter here, or use AI to generate one..."
            className="bg-white/5 border-white/10 text-white h-64"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => setPreview(true)}
            variant="outline"
            className="flex-1 glass-card border-0 text-white hover:bg-white/5"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={handleSendOffer}
            disabled={loading || !offerData.content}
            className="flex-1 btn-primary text-white"
          >
            {loading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Offer
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}