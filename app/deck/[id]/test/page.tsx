// app/deck/[id]/test/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TestClient from "./TestClient";
import Header from "@/components/Header"; // 👈 Header追加
import Link from "next/link";

export default async function TestPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ sectionId?: string }> 
}) {
  const session = await auth();
  const { id } = await params;
  const { sectionId } = await searchParams;

  const deck = await prisma.deck.findUnique({
    where: { id },
    include: {
      sections: {
        include: { cards: true }
      }
    }
  });

  if (!deck) return <div className="p-12 text-center text-zinc-500">Deck not found</div>;

  const targetSections = sectionId 
    ? deck.sections.filter((s) => s.id === sectionId)
    : deck.sections;

  const allCards = targetSections.flatMap((section) => 
    section.cards.map((card) => ({
      id: card.id,
      term: card.term,
      definition: card.definition,
      sectionName: section.name
    }))
  );

  if (allCards.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50/50">
        <Header />
        <div className="text-center py-20">
          <h2 className="text-xl font-bold mb-4 text-zinc-900">No cards available</h2>
          <p className="text-zinc-500 mb-8">このセクションにはまだ単語が登録されていません。</p>
          <Link href={`/deck/${id}`} className="text-indigo-600 font-bold hover:underline">
            Back to Deck
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50">
       <Header />
       <div className="max-w-4xl mx-auto pt-8 px-4 pb-20">
         <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Testing Mode</span>
            <h1 className="text-2xl font-bold text-zinc-900 mt-1">
              {deck.title} {sectionId ? <span className="text-zinc-400 font-normal">/ {targetSections[0]?.name}</span> : ""}
            </h1>
         </div>
         
         <TestClient initialCards={allCards} deckId={id} />
       </div>
    </div>
  );
}