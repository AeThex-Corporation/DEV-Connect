// Enhanced Messaging Types

export interface MessageThread {
  id: string;
  participants: string[]; // userIds
  participantDetails: ThreadParticipant[];
  type: 'direct' | 'job_application' | 'group';
  subject?: string;
  jobId?: string; // If related to a job
  lastMessage?: MessagePreview;
  unreadCount: number;
  archived: boolean;
  muted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadParticipant {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  online: boolean;
}

export interface MessagePreview {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  read: boolean;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  attachments?: MessageAttachment[];
  replyTo?: string; // messageId
  edited: boolean;
  sentAt: string;
  readBy: string[]; // userIds who have read this message
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'video' | 'audio';
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface ThreadListItem {
  id: string;
  participants: ThreadParticipant[];
  type: 'direct' | 'job_application' | 'group';
  subject?: string;
  jobId?: string;
  lastMessage?: MessagePreview;
  unreadCount: number;
  archived: boolean;
  muted: boolean;
  updatedAt: string;
}

export interface ThreadFilters {
  type?: 'direct' | 'job_application' | 'group';
  archived?: boolean;
  unread?: boolean;
  search?: string;
}

export interface GetThreadsRequest {
  filters?: ThreadFilters;
  page?: number;
  limit?: number;
}

export interface GetThreadsResponse {
  threads: ThreadListItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  totalUnread: number;
}

export interface CreateThreadRequest {
  participantIds: string[];
  type: 'direct' | 'job_application' | 'group';
  subject?: string;
  jobId?: string;
  initialMessage?: string;
}

export interface GetMessagesRequest {
  threadId: string;
  page?: number;
  limit?: number;
  before?: string; // messageId - for pagination
}

export interface GetMessagesResponse {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SendMessageRequest {
  threadId: string;
  content: string;
  attachments?: string[]; // attachment IDs from upload
  replyTo?: string; // messageId
}

export interface UploadAttachmentRequest {
  file: File;
  threadId: string;
}

export interface UploadAttachmentResponse {
  attachment: MessageAttachment;
}

export interface MarkThreadReadRequest {
  threadId: string;
  messageId?: string; // Mark read up to this message
}

export interface UpdateThreadRequest {
  archived?: boolean;
  muted?: boolean;
}
