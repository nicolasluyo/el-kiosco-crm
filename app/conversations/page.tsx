import ConversationsClient from "@/components/conversations/ConversationsClient";

export const dynamic = "force-dynamic";

export default function ConversationsPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-stone-200 bg-white">
        <h1 className="text-xl font-bold text-stone-900">Conversaciones</h1>
        <p className="text-stone-500 text-sm mt-0.5">Mensajes recibidos por Instagram DM</p>
      </div>
      <ConversationsClient />
    </div>
  );
}
