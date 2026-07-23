import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services/commentService';
import { attachmentService } from '../services/attachmentService';
import { feedbackService } from '../services/feedbackService';
import { TicketResponse } from '../types';
import { 
  MessageSquare, 
  Paperclip, 
  Send, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  File, 
  Download, 
  Star, 
  Cpu 
} from 'lucide-react';

interface TicketInteractionsProps {
  ticket: TicketResponse;
  refetchTicket: () => void;
}

export const TicketInteractions: React.FC<TicketInteractionsProps> = ({ ticket, refetchTicket }) => {
  const ticketId = ticket.id;
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Comments Query
  const { data: commentsRes } = useQuery({
    queryKey: ['comments', ticketId],
    queryFn: () => commentService.getCommentsByTicket(ticketId),
  });

  // Attachments Query
  const { data: attachmentsRes } = useQuery({
    queryKey: ['attachments', ticketId],
    queryFn: () => attachmentService.getAttachments(ticketId),
  });

  // Feedback Query
  const { data: feedbackRes, error: feedbackError } = useQuery({
    queryKey: ['feedback', ticketId],
    queryFn: () => feedbackService.getFeedbackByTicket(ticketId),
    retry: false,
  });

  // Add Comment Mutation
  const commentMutation = useMutation({
    mutationFn: (content: string) => commentService.addComment({ ticketId, content }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['comments', ticketId] });
    },
  });

  // Submit Feedback Mutation
  const feedbackMutation = useMutation({
    mutationFn: (data: { rating: number; comments: string }) => 
      feedbackService.submitFeedback({ ticketId, rating: data.rating, comments: data.comments }),
    onSuccess: () => {
      setFeedbackSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['feedback', ticketId] });
    },
  });

  const comments = commentsRes?.data || [];
  const attachments = attachmentsRes?.data || [];
  const existingFeedback = feedbackRes?.data;

  // Real-time SLA Countdowns
  const [responseSlaText, setResponseSlaText] = useState('');
  const [resolutionSlaText, setResolutionSlaText] = useState('');

  useEffect(() => {
    const updateCountdowns = () => {
      const getRemaining = (deadline: string | null, completed: string | null) => {
        if (completed) return 'Completed';
        if (!deadline) return 'N/A';
        const diff = new Date(deadline).getTime() - Date.now();
        if (diff <= 0) return 'Breached';
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        if (hours >= 48) {
          const days = Math.floor(hours / 24);
          const remHours = hours % 24;
          return `${days}d ${remHours}h remaining`;
        }
        return `${hours}h ${minutes}m remaining`;
      };
      setResponseSlaText(getRemaining(ticket.slaResponseDeadline, ticket.respondedAt));
      setResolutionSlaText(getRemaining(ticket.slaResolutionDeadline, ticket.resolvedAt));
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 30000);
    return () => clearInterval(interval);
  }, [ticket]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      await attachmentService.uploadFile(ticketId, files[0]);
      queryClient.invalidateQueries({ queryKey: ['attachments', ticketId] });
    } catch (err: any) {
      setUploadError('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    feedbackMutation.mutate({ rating: feedbackRating, comments: feedbackComments });
  };

  return (
    <div className="space-y-6">
      
      {/* SLA & Asset Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Response SLA */}
        <div className="space-y-1.5 border-r border-slate-50 last:border-0 pr-4">
          <div className="flex items-center space-x-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Response SLA</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-bold ${
              responseSlaText === 'Breached' ? 'text-red-500' : responseSlaText === 'Completed' ? 'text-green-600' : 'text-slate-700'
            }`}>
              {responseSlaText}
            </span>
            {responseSlaText === 'Completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            {responseSlaText === 'Breached' && <AlertTriangle className="w-4 h-4 text-red-500" />}
          </div>
        </div>

        {/* Resolution SLA */}
        <div className="space-y-1.5 border-r border-slate-50 last:border-0 pr-4">
          <div className="flex items-center space-x-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Resolution SLA</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-bold ${
              resolutionSlaText === 'Breached' ? 'text-red-500' : resolutionSlaText === 'Completed' ? 'text-green-600' : 'text-slate-700'
            }`}>
              {resolutionSlaText}
            </span>
            {resolutionSlaText === 'Completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            {resolutionSlaText === 'Breached' && <AlertTriangle className="w-4 h-4 text-red-500" />}
          </div>
        </div>

        {/* Asset Details */}
        <div className="space-y-1.5 pr-4">
          <div className="flex items-center space-x-2 text-slate-400">
            <Cpu className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Linked Asset</span>
          </div>
          <div>
            {ticket.assetTag ? (
              <p className="text-sm font-bold text-slate-700">
                {ticket.assetName} <span className="text-xs text-indigo-500 font-medium font-mono">[{ticket.assetTag}]</span>
              </p>
            ) : (
              <p className="text-sm font-semibold text-slate-400 italic">No asset linked</p>
            )}
          </div>
        </div>

      </div>

      {/* SLA Breach Indicator Header */}
      {ticket.slaBreached && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-200 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-bounce" />
          <div className="text-xs">
            <p className="font-bold">Service Level Agreement Breach Detected</p>
            <p className="text-red-600/80 mt-0.5">This ticket has exceeded its response or resolution thresholds and has been escalated.</p>
          </div>
        </div>
      )}

      {/* Main Commenting & Attachment section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Comments Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span>Comments & Collaboration</span>
          </h2>

          {/* List of comments */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {comments.length > 0 ? (
              comments.map((c) => (
                <div key={c.id} className="bg-slate-50/50 p-4 rounded-xl space-y-1.5 border border-slate-100/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">{c.userName}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-600 uppercase">
                      {c.userRole}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                  <span className="text-[9px] text-slate-400 block pt-1">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">No comments posted yet.</p>
            )}
          </div>

          {/* Comment post form */}
          <form onSubmit={handlePostComment} className="flex items-center space-x-2 border-t border-slate-50 pt-4">
            <input
              type="text"
              placeholder="Post an update or reply..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={commentMutation.isPending}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center disabled:bg-slate-300"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Attachments Column */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Paperclip className="w-4 h-4 text-indigo-500" />
            <span>Attachments</span>
          </h2>

          {/* Upload Box */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
            <input
              type="file"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <Paperclip className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Click to Upload File</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Images, PDFs, or Logs up to 10MB</p>
            {uploading && <p className="text-xs text-indigo-600 font-semibold mt-2">Uploading...</p>}
            {uploadError && <p className="text-xs text-red-500 font-semibold mt-2">{uploadError}</p>}
          </div>

          {/* Attachments List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {attachments.length > 0 ? (
              attachments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-2 border border-slate-100 rounded-lg hover:bg-slate-50 transition-all">
                  <div className="flex items-center space-x-2 min-w-0">
                    <File className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-700 truncate" title={a.fileName}>
                        {a.fileName}
                      </p>
                      <p className="text-[9px] text-slate-400">By {a.uploadedByName}</p>
                    </div>
                  </div>
                  <a
                    href={`http://localhost:8080${a.filePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-2">No attachments.</p>
            )}
          </div>

        </div>

      </div>

      {/* Customer Feedback section */}
      {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            Resolution Feedback
          </h2>

          {existingFeedback ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < existingFeedback.rating ? 'fill-yellow-400' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-lg leading-relaxed whitespace-pre-wrap">
                {existingFeedback.comments || <span className="text-slate-400 italic">No feedback comments provided.</span>}
              </p>
              <p className="text-[9px] text-slate-400">Submitted by ticket owner.</p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4 max-w-lg">
              <p className="text-xs text-slate-500">Rate the support staff resolution compliance and service response:</p>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFeedbackRating(i + 1)}
                    className="p-1 hover:scale-115 transition-transform"
                  >
                    <Star 
                      className={`w-6 h-6 ${i < feedbackRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
                    />
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Submit any feedback details (optional)..."
                rows={3}
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={feedbackMutation.isPending || feedbackSubmitted}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
              >
                Submit Rating
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
};
