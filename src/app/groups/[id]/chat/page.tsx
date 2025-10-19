async function getMessages(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/groups/${id}/chat`, { cache: "no-store" });
  if (!res.ok) return { messages: [] };
  return res.json();
}

export default async function GroupChatPage({ params }: { params: { id: string } }) {
    const res = await fetch(`/api/groups/${params.id}/chat`, { cache: "no-store" });
    const { messages = [] } = await res.json();
  return (
    <div className="page-wrap py-6 space-y-3">
      <div className="section-card p-4 space-y-3">
        {messages.map((m: any) => (
          <div key={m._id} className="flex gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="h-6 w-6 rounded-full" src={m.sender?.profilePic || "/images/avatar-fallback.png"} alt="" />
            <div>
              <b className="text-sm">{m.sender?.name || "User"}</b>
              <p>{m.content}</p>
            </div>
          </div>
        ))}
      </div>

      <ChatInput groupId={params.id} />
    </div>
  );
}

import ChatInput from "../_client/ChatInput";
