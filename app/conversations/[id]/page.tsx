import ConversationDetailClient from "@/components/conversations/ConversationDetailClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-5 border-b border-stone-200 bg-white flex items-center gap-3">
        <Link
          href="/conversations"
          className="text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-stone-900">Conversación #{id}</h1>
          <p className="text-stone-500 text-xs">Hilo de mensajes con el cliente</p>
        </div>
      </div>
      <ConversationDetailClient id={id} />
    </div>
  );
}
