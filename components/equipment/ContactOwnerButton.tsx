"use client";

import { useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ContactOwnerButtonProps {
  ownerId: string;
  ownerName: string;
  equipmentId: string;
  equipmentTitle: string;
}

export function ContactOwnerButton({ ownerId, ownerName, equipmentId, equipmentTitle }: ContactOwnerButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);

    // Oturum kontrolü
    const sessionRes = await fetch("/api/auth/session");
    const { authenticated } = await sessionRes.json();
    if (!authenticated) {
      router.push("/giris");
      return;
    }

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: message.trim(),
        receiverId: ownerId,
        equipmentId,
      }),
    });

    setSending(false);
    if (res.ok) {
      toast.success("Mesaj gönderildi!");
      setOpen(false);
      setMessage("");
      router.push("/panel/mesajlar");
    } else {
      toast.error("Mesaj gönderilemedi.");
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <MessageSquare className="w-4 h-4" /> Mesaj Gönder
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark/60" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-playfair font-bold text-dark">{ownerName}'e Mesaj</h3>
                <p className="text-stone text-xs mt-0.5">{equipmentTitle}</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-cream-dark rounded-lg transition-colors">
                <X className="w-5 h-5 text-stone" />
              </button>
            </div>

            <div className="mb-2">
              <div className="bg-orange/10 border border-orange/20 rounded-xl p-3 mb-3">
                <p className="text-xs text-dark/70">💬 Fiyat pazarlığı, teslim detayı veya sorularınızı yazabilirsiniz.</p>
              </div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={`Merhaba, ${equipmentTitle} hakkında sormak istediğim...`}
                rows={4}
                className="w-full border border-cream-dark rounded-xl px-4 py-3 text-sm text-dark resize-none focus:outline-none focus:border-forest"
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSend(); }}
              />
              <p className="text-stone text-xs mt-1">Ctrl+Enter ile gönder</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOpen(false)} fullWidth>İptal</Button>
              <Button onClick={handleSend} loading={sending} fullWidth disabled={!message.trim()}>
                <Send className="w-4 h-4" /> Gönder
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
