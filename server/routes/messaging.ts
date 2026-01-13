import type { RequestHandler } from "express";
import {
  MessageThread,
  GetThreadsRequest,
  GetThreadsResponse,
  CreateThreadRequest,
  GetMessagesRequest,
  GetMessagesResponse,
  SendMessageRequest,
  MarkThreadReadRequest,
  UpdateThreadRequest,
  Message,
  ThreadListItem,
} from "@shared/messaging";
import { getSupabase } from "../supabase";

// GET /api/messages/threads - Get user's message threads
export const getThreads: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const {
      filters = {},
      page = 1,
      limit = 20,
    } = req.query as unknown as GetThreadsRequest;

    const userId = req.header("x-user-id");
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let query = supabase
      .from("message_threads")
      .select("*", { count: "exact" })
      .contains("participants", [userId]);

    // Apply filters
    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    if (filters.archived !== undefined) {
      query = query.eq("archived", filters.archived);
    }

    if (filters.unread) {
      query = query.gt("unread_count", 0);
    }

    if (filters.search) {
      query = query.or(
        `subject.ilike.%${filters.search}%,last_message->content.ilike.%${filters.search}%`
      );
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching threads:", error);
      return res.status(500).json({ error: "Failed to fetch threads" });
    }

    // TODO: Fetch participant details
    const threads: ThreadListItem[] =
      data?.map((thread: any) => ({
        id: thread.id,
        participants: thread.participant_details || [],
        type: thread.type,
        subject: thread.subject,
        jobId: thread.job_id,
        lastMessage: thread.last_message,
        unreadCount: thread.unread_count || 0,
        archived: thread.archived,
        muted: thread.muted,
        updatedAt: thread.updated_at,
      })) || [];

    const response: GetThreadsResponse = {
      threads,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
      totalUnread: threads.reduce((sum, t) => sum + t.unreadCount, 0),
    };

    res.json(response);
  } catch (error) {
    console.error("Unexpected error in getThreads:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/messages/threads - Create new thread
export const createThread: RequestHandler = async (req, res) => {
  try {
    const threadData: CreateThreadRequest = req.body;
    const supabase = getSupabase();

    const userId = req.header("x-user-id");
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Add creator to participants
    const participants = Array.from(
      new Set([userId, ...threadData.participantIds])
    );

    const { data, error } = await supabase
      .from("message_threads")
      .insert({
        participants,
        type: threadData.type,
        subject: threadData.subject,
        job_id: threadData.jobId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived: false,
        muted: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating thread:", error);
      return res.status(500).json({ error: "Failed to create thread" });
    }

    // Send initial message if provided
    if (threadData.initialMessage) {
      await supabase.from("messages").insert({
        thread_id: data.id,
        sender_id: userId,
        content: threadData.initialMessage,
        sent_at: new Date().toISOString(),
      });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Unexpected error in createThread:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/messages/threads/:threadId/messages - Get messages in thread
export const getMessages: RequestHandler = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { page = 1, limit = 50, before } = req.query as unknown as GetMessagesRequest;
    const supabase = getSupabase();

    const userId = req.header("x-user-id");
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify user is participant
    const { data: thread } = await supabase
      .from("message_threads")
      .select("participants")
      .eq("id", threadId)
      .single();

    if (!thread || !thread.participants.includes(req.user.id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    let query = supabase
      .from("messages")
      .select("*", { count: "exact" })
      .eq("thread_id", threadId);

    if (before) {
      query = query.lt("id", before);
    }

    const offset = (page - 1) * limit;
    query = query
      .order("sent_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }

    const messages: Message[] =
      data?.map((msg: any) => ({
        id: msg.id,
        threadId: msg.thread_id,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        senderAvatar: msg.sender_avatar,
        content: msg.content,
        attachments: msg.attachments || [],
        replyTo: msg.reply_to,
        edited: msg.edited || false,
        sentAt: msg.sent_at,
        readBy: msg.read_by || [],
      })) || [];

    const response: GetMessagesResponse = {
      messages: messages.reverse(),
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    };

    res.json(response);
  } catch (error) {
    console.error("Unexpected error in getMessages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/messages/threads/:threadId/messages - Send message
export const sendMessage: RequestHandler = async (req, res) => {
  try {
    const { threadId } = req.params;
    const messageData: SendMessageRequest = req.body;
    const supabase = getSupabase();

    const userId = req.header("x-user-id");
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify user is participant
    const { data: thread } = await supabase
      .from("message_threads")
      .select("participants")
      .eq("id", threadId)
      .single();

    if (!thread || !thread.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        thread_id: threadId,
        sender_id: userId,
        content: messageData.content,
        attachments: messageData.attachments || [],
        reply_to: messageData.replyTo,
        sent_at: new Date().toISOString(),
        read_by: [userId],
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
      return res.status(500).json({ error: "Failed to send message" });
    }

    // Update thread's last message and updated_at
    await supabase
      .from("message_threads")
      .update({
        last_message: {
          id: data.id,
          senderId: req.user.id,
          senderName: "User", // TODO: Get from profile
          content: messageData.content.substring(0, 100),
          sentAt: data.sent_at,
          read: false,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", threadId);

    res.status(201).json(data);
  } catch (error) {
    console.error("Unexpected error in sendMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/messages/threads/:threadId/read - Mark thread as read
export const markThreadRead: RequestHandler = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { messageId } = req.body as MarkThreadReadRequest;
    const supabase = getSupabase();

    const userId = req.header("x-user-id");
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify user is participant
    const { data: thread } = await supabase
      .from("message_threads")
      .select("participants")
      .eq("id", threadId)
      .single();

    if (!thread || !thread.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Mark all messages as read up to messageId (or all if no messageId)
    let query = supabase
      .from("messages")
      .select("id, read_by")
      .eq("thread_id", threadId)
      .not("sender_id", "eq", userId);

    if (messageId) {
      query = query.lte("id", messageId);
    }

    const { data: messages } = await query;

    if (messages) {
      for (const msg of messages) {
        const readBy = msg.read_by || [];
        if (!readBy.includes(userId)) {
          await supabase
            .from("messages")
            .update({ read_by: [...readBy, userId] })
            .eq("id", msg.id);
        }
      }
    }

    // Reset unread count for this user in thread metadata
    // This would require a more complex structure, for now just return success
    res.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in markThreadRead:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/messages/threads/:threadId - Update thread settings
export const updateThread: RequestHandler = async (req, res) => {
  try {
    const { threadId } = req.params;
    const updates: UpdateThreadRequest = req.body;
    const supabase = getSupabase();

    const userId = req.header("x-user-id");
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify user is participant
    const { data: thread } = await supabase
      .from("message_threads")
      .select("participants")
      .eq("id", threadId)
      .single();

    if (!thread || !thread.participants.includes(req.user.id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updateData: any = {};
    if (updates.archived !== undefined) updateData.archived = updates.archived;
    if (updates.muted !== undefined) updateData.muted = updates.muted;

    const { data, error } = await supabase
      .from("message_threads")
      .update(updateData)
      .eq("id", threadId)
      .select()
      .single();

    if (error) {
      console.error("Error updating thread:", error);
      return res.status(500).json({ error: "Failed to update thread" });
    }

    res.json(data);
  } catch (error) {
    console.error("Unexpected error in updateThread:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/messages/unread-count - Get total unread count
export const getUnreadCount: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();

    const userId = req.header("x-user-id");
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("message_threads")
      .select("unread_count")
      .contains("participants", [userId])
      .eq("archived", false);

    if (error) {
      console.error("Error fetching unread count:", error);
      return res.status(500).json({ error: "Failed to fetch unread count" });
    }

    const totalUnread = data?.reduce((sum, thread) => sum + (thread.unread_count || 0), 0) || 0;

    res.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error("Unexpected error in getUnreadCount:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
