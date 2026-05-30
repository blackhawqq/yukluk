"use client";

import { useEffect, useState, useRef } from "react";
import { Send, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { timeAgo } from "@/lib/utils";
import type { ConversationPreview, MessageWithSender } from "@/types";
import { cn } from "@/lib/utils";

export default function MesajlarPage() {
  const { user } = useAuth();
  const { getConversations, getMessages, sendMessage, markAsRead, subscribeToMessages } = useMessages();

  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [activeConv, setActiveConv] = useState<ConversationPreview | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    getConversations(user.id).then((convs) => {
      setConversations(convs);
      setLoadingConvs(false);
    });
  }, [user]);

  useEffect(() => {
    if (!activeConv || !user) return;
    getMessages(activeConv.rental_id).then((msgs) => {
      setMessages(msgs);
      markAsRead(activeConv.rental_id, user.id);
    });

    const unsubscribe = subscribeToMessages(activeConv.rental_id, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return unsubscribe;
  }, [activeConv?.rental_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv || !user) return;
    setSending(true);
    const { data } = await sendMessage(
      activeConv.rental_id,
      user.id,
      activeConv.other_user.id,
      newMessage.trim()
    );
    if (data) setMessages((prev) => [...prev, data]);
    setNewMessage("");
    setSending(false);
  };

  return (
    <div className="flex h-full">
      {/* Conversations list */}
      <div className="w-80 border-r border-cream-dark bg-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-cream-dark">
          <h2 className="font-playfair font-bold text-dark">Mesajlar</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="text-center py-8 text-stone text-sm">Yükleniyor...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-10 h-10 text-stone/30 mx-auto mb-2" />
              <p className="text-stone text-sm">Henüz mesajın yok</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.rental_id}
                onClick={() => setActiveConv(conv)}
                className={cn(
                  "w-full p-4 flex gap-3 hover:bg-cream transition-colors text-left border-b border-cream-dark/50",
                  activeConv?.rental_id === conv.rental_id && "bg-cream"
                )}
              >
                <div className="w-10 h-10 bg-forest rounded-full flex items-center justify-center text-cream font-bold text-sm flex-shrink-0">
                  {conv.other_user.full_name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-dark text-sm truncate">{conv.other_user.full_name}</p>
                    {conv.last_message && (
                      <span className="text-xs text-stone flex-shrink-0 ml-1">
                        {timeAgo(conv.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-stone text-xs truncate mt-0.5">
                    {conv.equipment.title}
                  </p>
                  {conv.last_message && (
                    <p className="text-stone text-xs truncate mt-0.5">{conv.last_message.content}</p>
                  )}
                </div>
                {conv.unread_count > 0 && (
                  <span className="w-5 h-5 bg-orange rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 self-center">
                    {conv.unread_count}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 flex flex-col bg-cream">
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-stone/30 mx-auto mb-3" />
              <p className="text-stone text-sm">Bir konuşma seç</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white border-b border-cream-dark px-5 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-forest rounded-full flex items-center justify-center text-cream font-bold text-sm">
                {activeConv.other_user.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-semibold text-dark text-sm">{activeConv.other_user.full_name}</p>
                <p className="text-stone text-xs">{activeConv.equipment.title}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-xs rounded-2xl px-4 py-2.5 text-sm",
                      isOwn
                        ? "bg-forest text-cream rounded-br-sm"
                        : "bg-white text-dark rounded-bl-sm shadow-sm"
                    )}>
                      <p>{msg.content}</p>
                      <p className={cn("text-xs mt-1", isOwn ? "text-cream/60" : "text-stone")}>
                        {timeAgo(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-cream-dark p-4 flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Mesaj yaz..."
                className="flex-1 border border-cream-dark rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="w-10 h-10 bg-forest rounded-xl flex items-center justify-center text-cream hover:bg-forest-light transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
