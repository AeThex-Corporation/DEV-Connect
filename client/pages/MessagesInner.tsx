import { useEffect, useState } from "react";
import { useUser } from "@/lib/fake-stack";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost, Message } from "@/services/api";

export default function MessagesInner() {
  const user = useUser();
  const [peer, setPeer] = useState(
    () => new URLSearchParams(window.location.search).get("peer") || "",
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");

  const load = async () => {
    if (!user || !peer) return;
    const data = await apiGet<Message[]>(
      `/api/messages?stack_user_id=${encodeURIComponent(user.id)}&peer_stack_user_id=${encodeURIComponent(peer)}`,
    );
    setMessages(data);
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [peer, user?.id]);

  const send = async () => {
    if (!user || !peer || !body) return;
    await apiPost<Message>(`/api/messages`, {
      sender_stack_user_id: user.id,
      recipient_stack_user_id: peer,
      body,
    });
    setBody("");
    load();
  };

  if (!user)
    return (
      <div className="text-sm text-muted-foreground">
        Sign in to use messages.
      </div>
    );

  return (
    <div className="grid gap-4">
      <div className="rounded-xl border bg-card p-4 grid gap-3">
        <div className="grid sm:grid-cols-[1fr,auto] gap-3">
          <input
            className="rounded-md border bg-background px-3 py-2"
            placeholder="Peer Stack User ID (temporary MVP)"
            value={peer}
            onChange={(e) => setPeer(e.target.value)}
          />
          <Button onClick={load}>Load</Button>
        </div>
        <div className="h-80 overflow-auto rounded-md border bg-background p-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`mb-2 ${m.sender_stack_user_id === user.id ? "text-right" : ""}`}
            >
              <div
                className={`inline-block rounded-lg px-3 py-2 text-sm ${m.sender_stack_user_id === user.id ? "bg-primary text-primary-foreground" : "bg-accent"}`}
              >
                {m.body}
              </div>
            </div>
          ))}
          {!messages.length && (
            <div className="text-sm text-muted-foreground">
              No messages yet.
            </div>
          )}
        </div>
        <div className="grid sm:grid-cols-[1fr,auto] gap-3">
          <input
            className="rounded-md border bg-background px-3 py-2"
            placeholder="Write a message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button onClick={send} disabled={!body}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
