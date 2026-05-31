"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Send, MessageSquare } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";

interface Profile { id: string; full_name: string; avatar_url?: string; }
interface Equipment { id: string; title: string; images?: string[]; }
interface Message {
  id: string; content: string; created_at: string; is_read: boolean;
  sender_id: string; receiver_id: string;
  sender: Profile; equipment_id?: string; rental_id?: string;
}
interface Conversation {
  key: string; other_user: Profile; equipment: Equipment | null;
  rental_id: string | null; equipment_id: string | null;
  last_message: Message; unread_count: number;
}

export default function MesajlarPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/auth/session").then(r => r.json()).then(({ userId }) => setMyId(userId));
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const res = await fetch("/api/messages/conversations");
    const { conversations } = await res.json();
    setConversations(conversations || []);
    setLoadingConvs(false);
  };

  const loadMessages = useCallback(async (conv: Conversation) => {
    const params = new URLSearchParams();
    if (conv.rental_id) {
      params.set("rentalId", conv.rental_id);
    } else if (conv.equipment_id && conv.other_user?.id) {
      params.set("equipmentId", conv.equipment_id);
      params.set("withUserId", conv.other_user.id);
    }
    const res = await fetch(`/api/messages?${params}`);
    const { messages } = await res.json();
    setMessages(messages || []);
    // Okundu işaretle
    if (conv.other_user?.id) {
      fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withUserId: conv.other_user.id, equipmentId: conv.equipment_id, rentalId: conv.rental_id }),
      });
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling: aktif konuşmayı 3sn'de bir güncelle
  useEffect(() => {
    if (!activeConv) return;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadMessages(activeConv), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeConv, loadMessages]);

  const selectConversation = (conv: Conversation) => {
    setActiveConv(conv);
    loadMessages(conv);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv || !myId) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: newMessage.trim(),
        receiverId: activeConv.other_user.id,
        equipmentId: activeConv.equipment_id,
        rentalId: activeConv.rental_id,
      }),
    });
    const { message } = await res.json();
    if (message) {
      setMessages(prev => [...prev, message]);
      setNewMessage("");
      loadConversations();
    }
    setSending(false);
  };

  return (
    <div className="flex h-full">
      {/* Sol: Konuşma listesi */}
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
            conversations.map(conv => (
              <button
                key={conv.key}
                onClick={() => selectConversation(conv)}
                className={cn(
                  "w-full p-4 flex gap-3 hover:bg-cream transition-colors text-left border-b border-cream-dark/50",
                  activeConv?.key === conv.key && "bg-cream"
                )}
              >
                <div className="w-10 h-10 bg-forest rounded-full flex items-center justify-center text-cream font-bold text-sm flex-shrink-0">
                  {conv.other_user?.full_name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-dark text-sm truncate">{conv.other_user?.full_name}</p>
                    <span className="text-xs text-stone flex-shrink-0 ml-1">
                      {timeAgo(conv.last_message.created_at)}
                    </span>
                  </div>
                  {conv.equipment && (
                    <p className="text-stone text-xs truncate">{conv.equipment.title}</p>
                  )}
                  <p className="text-stone text-xs truncate mt-0.5">{conv.last_message.content}</p>
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

      {/* Sağ: Aktif konuşma */}
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
                {activeConv.other_user?.full_name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-semibold text-dark text-sm">{activeConv.other_user?.full_name}</p>
                {activeConv.equipment && (
                  <p className="text-stone text-xs">{activeConv.equipment.title}</p>
                )}
              </div>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {messages.map(msg => {
                const isOwn = msg.sender_id === myId;
                return (
                  <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-xs lg:max-w-sm rounded-2xl px-4 py-2.5 text-sm",
                      isOwn ? "bg-forest text-cream rounded-br-sm" : "bg-white text-dark rounded-bl-sm shadow-sm"
                    )}>
                      <p className="break-words">{msg.content}</p>
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
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Mesaj yaz... (pazarlık yapabilirsiniz)"
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
