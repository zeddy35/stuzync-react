export default async function GroupChatPage({ params }: { params: { id: string } }) {
  return (
    <div className="page-wrap py-6 space-y-3">
      <ChatList groupId={params.id} />
      <ChatInput groupId={params.id} />
    </div>
  );
}

import ChatInput from "../_client/ChatInput";
import ChatList from "./_client/ChatList";
