"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message, ConversationPreview, MessageWithSender } from "@/types";
import type { Profile, Equipment } from "@/types";

export function useMessages() {
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  const getConversations = async (userId: string): Promise<ConversationPreview[]> => {
    const supabase = createClient();
    const { data: rentals } = await (supabase
      .from("rentals")
      .select("id, equipment(*), renter:profiles!renter_id(*), owner:profiles!owner_id(*)")
      .or(`renter_id.eq.${userId},owner_id.eq.${userId}`)
      .order("created_at", { ascending: false }) as any);

    if (!rentals) return [];

    const conversations: ConversationPreview[] = [];

    for (const rental of rentals as Array<{
      id: string;
      equipment: Equipment;
      renter: Profile;
      owner: Profile;
    }>) {
      const otherUser = rental.renter.id === userId ? rental.owner : rental.renter;

      const { data: lastMessages } = await (supabase
        .from("messages")
        .select("*")
        .eq("rental_id", rental.id)
        .order("created_at", { ascending: false })
        .limit(1) as any);

      const { count: unreadCount } = await (supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("rental_id", rental.id)
        .eq("receiver_id", userId)
        .eq("is_read", false) as any);

      conversations.push({
        rental_id: rental.id,
        other_user: otherUser,
        equipment: rental.equipment,
        last_message: (lastMessages as Message[])?.[0] || null,
        unread_count: (unreadCount as number) || 0,
      });
    }

    return conversations;
  };

  const getMessages = async (rentalId: string): Promise<MessageWithSender[]> => {
    const supabase = createClient();
    const { data, error } = await (supabase
      .from("messages")
      .select("*, sender:profiles!sender_id(*)")
      .eq("rental_id", rentalId)
      .order("created_at", { ascending: true }) as any);
    if (error) return [];
    return (data as MessageWithSender[]) || [];
  };

  const sendMessage = async (
    rentalId: string,
    senderId: string,
    receiverId: string,
    content: string
  ) => {
    const supabase = createClient();
    setLoading(true);
    try {
      const { data, error } = await (supabase
        .from("messages")
        .insert({ rental_id: rentalId, sender_id: senderId, receiver_id: receiverId, content } as any)
        .select("*, sender:profiles!sender_id(*)")
        .single() as any);
      return { data: data as MessageWithSender | null, error };
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (rentalId: string, userId: string) => {
    const supabase = createClient();
    await (supabase
      .from("messages")
      .update({ is_read: true } as never)
      .eq("rental_id", rentalId)
      .eq("receiver_id", userId)
      .eq("is_read", false) as any);
  };

  const subscribeToMessages = (
    rentalId: string,
    callback: (message: MessageWithSender) => void
  ) => {
    const supabase = createClient();
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase
      .channel(`messages:${rentalId}`)
      .on(
        "postgres_changes" as never,
        { event: "INSERT", schema: "public", table: "messages", filter: `rental_id=eq.${rentalId}` },
        async (payload: { new: { id: string } }) => {
          const { data } = await (supabase
            .from("messages")
            .select("*, sender:profiles!sender_id(*)")
            .eq("id", payload.new.id)
            .single() as any);
          if (data) callback(data as MessageWithSender);
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  };

  useEffect(() => {
    return () => {
      const supabase = createClient();
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  return { loading, getConversations, getMessages, sendMessage, markAsRead, subscribeToMessages };
}
