// app/deck/[id]/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createSection, createCard, deleteSection, deleteCard } from "@/app/actions";
import Link from "next/link";
import Header from "@/components/Header";

export default async function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  // 単語帳データ取得
  const deck = await prisma.deck.findUnique({
    where: { id },
    include: {
      sections: {
        include: { cards: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!deck) return <div className="p-12 text-center text-zinc-500">Deck not found</div>;

  const isOwner = session?.user?.id === deck.userId;

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Header />

      <main className="max-w-4xl mx-auto p-6 md:p-12">
        {/* --- Back Link --- */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm font-bold text-zinc-400 hover:text-zinc-600 transition flex items-center gap-1">
            ← Back to Dashboard
          </Link>
        </div>

        {/* --- Deck Header --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-zinc-200 pb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">{deck.title}</h1>
            <p className="text-zinc-500">{deck.description || "No description provided."}</p>
          </div>
          
          <Link href={`/deck/${deck.id}/test`}>
            <button className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-zinc-200 hover:bg-zinc-800 hover:scale-105 transition flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
              Start Test
            </button>
          </Link>
        </header>

        {/* --- Sections List --- */}
        <div className="space-y-8">
          {deck.sections.map((section) => (
            <div key={section.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
              
              {/* Section Header */}
              <div className="bg-zinc-50/80 px-6 py-4 border-b border-zinc-100 flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-zinc-800">{section.name}</h2>
                  
                  {/* Play Section Test Button */}
                  {section.cards.length > 0 && (
                    <Link href={`/deck/${deck.id}/test?sectionId=${section.id}`}>
                      <button 
                        className="bg-white border border-zinc-200 text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition shadow-sm"
                        title="このセクションだけテスト"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </Link>
                  )}
                </div>

                {isOwner && (
                  <form action={deleteSection.bind(null, section.id, deck.id)}>
                     <button className="text-zinc-400 text-xs hover:text-red-500 font-medium transition flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
                       Delete
                     </button>
                  </form>
                )}
              </div>

              {/* Cards List */}
              <div className="divide-y divide-zinc-100">
                {section.cards.map((card) => (
                  <div key={card.id} className="px-6 py-4 flex justify-between items-start hover:bg-zinc-50/50 transition group">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <span className="font-bold text-zinc-900 break-words">{card.term}</span>
                      <span className="text-zinc-600 md:col-span-2 break-words border-l-2 border-zinc-100 pl-4 md:border-none md:pl-0">{card.definition}</span>
                    </div>

                    {isOwner && (
                      <form action={deleteCard.bind(null, card.id, deck.id)}>
                        <button 
                          className="ml-4 text-zinc-300 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="削除"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      </form>
                    )}
                  </div>
                ))}
                
                {section.cards.length === 0 && (
                  <div className="px-6 py-8 text-center text-zinc-400 text-sm italic">
                    No cards added yet.
                  </div>
                )}
              </div>

              {/* Add Card Form */}
              {isOwner && (
                <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-100">
                  <form action={createCard.bind(null, section.id, deck.id)} className="flex gap-3">
                    <input name="term" placeholder="Term" required className="flex-1 min-w-0 bg-white border border-zinc-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                    <input name="definition" placeholder="Definition" required className="flex-[2] min-w-0 bg-white border border-zinc-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                    <button className="bg-white border border-zinc-200 text-zinc-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-100 hover:border-zinc-300 transition shadow-sm flex-shrink-0">
                      Add
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- Create Section Area --- */}
        {isOwner && (
          <div className="mt-16 pt-8 border-t border-zinc-200">
            <div className="max-w-md mx-auto text-center">
              <h3 className="text-zinc-400 font-bold text-sm uppercase tracking-wider mb-4">Add New Section</h3>
              <form action={createSection.bind(null, deck.id)} className="flex gap-2">
                <input 
                  name="name" 
                  placeholder="Section Name (e.g. Chapter 1)" 
                  required 
                  className="flex-1 bg-white border border-zinc-200 p-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition shadow-lg">
                  Create
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}