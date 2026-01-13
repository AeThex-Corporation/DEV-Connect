import { supabase } from '@/lib/customSupabaseClient';

// Contractor specific database operations

export const api = {
  // --- Contractor Operations ---

  async createContractorApplication(userId, profileData, quizResponses) {
    try {
      const { data: contractor, error: contractorError } = await supabase
        .from('contractors')
        .insert({
          user_id: userId,
          status: 'pending',
          github_url: profileData.githubUrl,
          portfolio_url: profileData.portfolioUrl,
          linkedin_url: profileData.linkedinUrl,
          skills: profileData.skills,
          experience_years: profileData.experience,
          bio: profileData.bio,
          hourly_rate: profileData.rate,
          availability: profileData.availability
        })
        .select()
        .single();

      if (contractorError) throw contractorError;

      if (quizResponses && quizResponses.length > 0) {
        const formattedResponses = quizResponses.map(r => ({
          contractor_id: contractor.id,
          question_id: r.id,
          question_text: r.question,
          answer_text: r.answer
        }));

        const { error: responsesError } = await supabase
          .from('verification_responses')
          .insert(formattedResponses);

        if (responsesError) throw responsesError;
      }

      await this.logEvent('application_submitted', userId, { contractor_id: contractor.id });
      return { success: true, data: contractor };
    } catch (error) {
      console.error('Error submitting application:', error);
      return { success: false, error };
    }
  },

  async getContractorById(contractorId) {
    const { data, error } = await supabase
      .from('contractors')
      .select(`
        *,
        profiles:user_id (
          display_name, 
          username, 
          avatar_url, 
          location, 
          verification_status,
          reputation
        ),
        portfolio (*),
        ratings_reviews (*),
        availability_calendar (*)
      `)
      .eq('id', contractorId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCurrentContractor(userId) {
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); 
      
    if (error) throw error;
    return data;
  },

  // --- Phase 1: Portfolio & Availability ---

  async getPortfolio(contractorId) {
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .eq('contractor_id', contractorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addPortfolioItem(itemData) {
    const { data, error } = await supabase
      .from('portfolio')
      .insert(itemData)
      .select()
      .single();
    if (error) throw error;
    
    // Award badge for first portfolio item (Mock logic)
    if(itemData.contractor_id) {
        await this.checkAndAwardBadge(itemData.contractor_id, 'portfolio_starter');
    }
    
    return data;
  },

  async updatePortfolioItem(itemId, updates) {
    const { data, error } = await supabase
      .from('portfolio')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePortfolioItem(itemId) {
    const { error } = await supabase
      .from('portfolio')
      .delete()
      .eq('id', itemId);
    if (error) throw error;
  },

  async getAvailability(contractorId, startDate, endDate) {
    const { data, error } = await supabase
      .from('availability_calendar')
      .select('*')
      .eq('contractor_id', contractorId)
      .gte('date', startDate)
      .lte('date', endDate);
    if (error) throw error;
    return data;
  },

  async setAvailability(contractorId, date, status) {
    const { data, error } = await supabase
      .from('availability_calendar')
      .upsert({ contractor_id: contractorId, date, status }, { onConflict: 'contractor_id, date' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Phase 1: Ratings & Leaderboards ---

  async addReview(reviewData) {
    const { data, error } = await supabase
      .from('ratings_reviews')
      .insert(reviewData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getLeaderboard() {
    const { data, error } = await supabase
      .from('leaderboards_stats')
      .select(`
        *,
        contractors (
          id,
          skills,
          profiles:user_id (display_name, avatar_url, username)
        )
      `)
      .order('avg_rating', { ascending: false })
      .limit(50);
    
    if (error) {
        console.log("Leaderboard fetch error or empty, returning raw contractors as fallback");
        const { data: fallback } = await supabase
            .from('contractors')
            .select('*, profiles:user_id(display_name, avatar_url, username)')
            .eq('status', 'approved')
            .limit(20);
            
        return fallback?.map(c => ({
            contractor_id: c.id,
            avg_rating: 0, 
            total_ratings: 0,
            contractors: c
        })) || [];
    }
    return data;
  },

  // --- Phase 2: Subscription & Billing ---

  async getSubscriptionPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getBusinessSubscription(businessId) {
    const { data, error } = await supabase
      .from('business_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('business_id', businessId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getPaymentHistory(businessId) {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createCheckoutSession(businessId, planId) {
    console.log(`[MOCK] Creating checkout session for ${businessId} on plan ${planId}`);
    return { 
      sessionId: `cs_test_${Math.random().toString(36).substring(7)}`, 
      url: `/business/billing/success?session_id=mock_session&plan_id=${planId}` 
    };
  },

  async updateSubscriptionStatus(businessId, planId, status = 'active') {
    const { data, error } = await supabase
      .from('business_subscriptions')
      .upsert({
        business_id: businessId,
        plan_id: planId,
        status: status,
        current_period_start: new Date(),
        current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)) 
      }, { onConflict: 'business_id' })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async createPaymentTransaction(transactionData) {
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert(transactionData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Phase 3: Engagement & Retention ---

  // Notifications
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return data;
  },

  async markNotificationRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) throw error;
  },
  
  async createNotification(userId, title, body, type='system', link=null) {
      const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title,
            body,
            type,
            link,
            is_read: false
        });
      if (error) console.error('Failed to create notification', error);
  },

  // Gamification
  async getGamificationProfile(userId) {
    // Try to fetch existing profile
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) return data;
    
    if (error) throw error;

    // If not found, try to insert (with race condition handling)
    const { data: newData, error: insertError } = await supabase
      .from('user_points')
      .insert({ user_id: userId })
      .select()
      .single();
      
    if (insertError) {
      // Code 23505 is for unique constraint violation
      if (insertError.code === '23505') {
        const { data: retryData, error: retryError } = await supabase
          .from('user_points')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (retryError) throw retryError;
        return retryData;
      }
      throw insertError;
    }
    
    return newData;
  },
  
  async checkAndAwardBadge(userId, badgeSlug) {
      // Simplified logic: In production, this would check criteria against `user_points` or `achievements` table
      const profile = await this.getGamificationProfile(userId);
      const badges = profile.badges_earned_json || [];
      
      if (!badges.find(b => b.slug === badgeSlug)) {
          const newBadge = { slug: badgeSlug, earned_at: new Date().toISOString() };
          const updatedBadges = [...badges, newBadge];
          
          await supabase
            .from('user_points')
            .update({ 
                badges_earned_json: updatedBadges,
                total_points: (profile.total_points || 0) + 50 
            })
            .eq('user_id', userId);
            
          await this.createNotification(userId, "New Badge Earned!", `You earned the ${badgeSlug} badge!`, 'achievement', '/dashboard/gamification');
      }
  },

  // Referrals
  async getReferralData(userId) {
    const { count } = await supabase
      .from('referral_program')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId);
      
    const { data: referrals } = await supabase
      .from('referral_program')
      .select('*, referred:referred_id(display_name, avatar_url, created_at)')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });
      
    return { count: count || 0, referrals: referrals || [] };
  },

  // Email & Push
  async mockSendEmail(to, templateName, data) {
    // Mock email sending
    console.log(`[MOCK EMAIL] Sending '${templateName}' to ${to} with data:`, data);
    // In real app: await supabase.functions.invoke('send-email', { body: { to, templateName, data } })
    return { success: true };
  },
  
  async subscribePush(userId, subscription) {
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({ user_id: userId, subscription_json: subscription });
      if (error) throw error;
  },

  // --- Admin Operations ---

  async getPendingApplications() {
    const { data, error } = await supabase
      .from('contractors')
      .select(`
        *,
        profiles:user_id (display_name, email, avatar_url, username),
        verification_responses (question_text, answer_text)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateApplicationStatus(contractorId, status) {
    const { data, error } = await supabase
      .from('contractors')
      .update({ status, updated_at: new Date() })
      .eq('id', contractorId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAdminStats() {
    const { count: pendingCount } = await supabase
      .from('contractors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: approvedCount } = await supabase
      .from('contractors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
      
    const { count: totalCount } = await supabase
      .from('contractors')
      .select('*', { count: 'exact', head: true });

    const { count: jobCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    return {
      pending: pendingCount || 0,
      approved: approvedCount || 0,
      total: totalCount || 0,
      jobs: jobCount || 0
    };
  },

  // --- Job Operations ---

  async getJobs(filters = {}) {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        profiles:created_by (display_name, avatar_url, username)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createJob(jobData) {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        ...jobData,
        status: 'active',
        created_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;
    
    // Mock sending notifications to relevant users (e.g. those with matching skills)
    console.log("[MOCK] Sending job alert emails for job:", data.title);
    
    return data;
  },

  async applyToJob(jobId, userId, message) {
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('applicant_id', userId)
      .maybeSingle();

    if (existing) throw new Error("You have already applied to this job.");

    const { data, error } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        applicant_id: userId,
        message,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    
    await this.logEvent('job_application', userId, { job_id: jobId });
    
    // Award first application badge
    await this.checkAndAwardBadge(userId, 'first_application');
    
    return data;
  },

  async getJobApplications(jobId) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        profiles:applicant_id (display_name, username, avatar_url),
        contractor:applicant_id (
           contractors (id, skills, status, availability) 
        )
      `)
      .eq('job_id', jobId);
    
    if (error) throw error;
    return data;
  },

  // --- Messaging Operations ---
  
  async getConversations(userId) {
    const { data, error } = await supabase
      .from('direct_messages_v2')
      .select(`
        *,
        sender:sender_id(id, display_name, avatar_url, username),
        recipient:recipient_id(id, display_name, avatar_url, username)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const conversationsMap = new Map();

    data.forEach(msg => {
      const isSender = msg.sender_id === userId;
      const otherUser = isSender ? msg.recipient : msg.sender;
      
      if (!otherUser) return;

      if (!conversationsMap.has(otherUser.id)) {
        conversationsMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: (!isSender && !msg.is_read) ? 1 : 0,
          messages: []
        });
      } else {
        const conv = conversationsMap.get(otherUser.id);
        if (!isSender && !msg.is_read) conv.unreadCount += 1;
      }
      
      conversationsMap.get(otherUser.id).messages.push(msg);
    });

    return Array.from(conversationsMap.values());
  },

  async sendMessage(senderId, recipientId, body) {
    const { data, error } = await supabase
      .from('direct_messages_v2')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        body,
        is_read: false
      })
      .select(`
        *,
        sender:sender_id(id, display_name, avatar_url, username),
        recipient:recipient_id(id, display_name, avatar_url, username)
      `)
      .single();

    if (error) throw error;
    
    // Create notification for recipient
    await this.createNotification(
        recipientId, 
        "New Message", 
        `You have a new message from ${data.sender?.display_name || 'a user'}.`, 
        'message', 
        `/messages/user/${data.sender?.username}`
    );
    
    return data;
  },

  async markMessagesRead(userId, otherUserId) {
    const { error } = await supabase
      .from('direct_messages_v2')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('sender_id', otherUserId)
      .eq('is_read', false);

    if (error) throw error;
  },
  
  async searchUsers(query) {
      const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, username, avatar_url')
          .ilike('display_name', `%${query}%`)
          .limit(5);
      if(error) throw error;
      return data;
  },

  // --- Analytics & Events ---

  async logEvent(eventName, userId = null, properties = {}) {
    await supabase.from('analytics_events').insert({
      event_name: eventName,
      user_id: userId,
      properties,
      url: window.location.pathname
    });
  },

  async getAnalyticsReport() {
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: totalJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
    const { count: totalApps } = await supabase.from('applications').select('*', { count: 'exact', head: true });
    const { count: verifications } = await supabase.from('contractors').select('*', { count: 'exact', head: true });
    const { count: approvals } = await supabase.from('contractors').select('*', { count: 'exact', head: true }).eq('status', 'approved');

    return {
        overview: {
            totalUsers: totalUsers || 0,
            totalJobs: totalJobs || 0,
            totalApps: totalApps || 0,
            conversionRate: totalUsers ? ((verifications / totalUsers) * 100).toFixed(1) : 0
        },
        funnel: [
            { step: 'Signups', value: totalUsers || 0, fill: '#3b82f6' },
            { step: 'Verifications', value: verifications || 0, fill: '#8b5cf6' },
            { step: 'Approved Talent', value: approvals || 0, fill: '#10b981' },
            { step: 'Job Applications', value: totalApps || 0, fill: '#f59e0b' }
        ]
    };
  },

  // --- Foundation / Courses ---

  async getCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getCourseDetails(courseId) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        lessons (*)
      `)
      .eq('id', courseId)
      .single();
    
    if (error) throw error;
    // sort lessons manually if needed or use order in query
    data.lessons.sort((a, b) => a.order_index - b.order_index);
    return data;
  },

  // --- Business Dashboard ---

  async searchContractors(filters = {}) {
    let query = supabase
      .from('contractors')
      .select(`
        *,
        profiles:user_id (display_name, avatar_url, username, location, reputation)
      `)
      .eq('status', 'approved'); 

    if (filters.skills && filters.skills.length > 0) {
      query = query.contains('skills', filters.skills);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  async getBusinessJobs(userId) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, applications(count)')
      .eq('created_by', userId);
    if(error) throw error;
    return data;
  }
};