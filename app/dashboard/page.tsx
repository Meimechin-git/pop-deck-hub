// app/dashboard/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createDeck, deleteDeck } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/");

  const decks = await prisma.deck.findMany({
    where: { userId: session.user?.id },
    orderBy: { createdAt: "desc" },
    include: { 
      _count: { select: { sections: true } } 
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Header />

      <main className="max-w-5xl mx-auto p-6 md:p-12">
        <div className="mb-8">
          <Link href="/" className="text-sm font-bold text-zinc-400 hover:text-zinc-600 transition flex items-center gap-1">
            ← Back to Overview
          </Link>
        </div>
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
            <p className="text-zinc-500 mt-1">作成した単語帳の管理</p>
          </div>
        </div>

        {/* --- 新規作成フォーム --- */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm mb-12">
          <div className="flex items-center gap-2 mb-4 text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            <h2 className="font-bold text-sm uppercase tracking-wider">Create New Deck</h2>
          </div>
          
          <form action={createDeck} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-zinc-500 mb-1">Title</label>
              <input
                name="title"
                type="text"
                required
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="例: 英単語 (基本編)"
              />
            </div>
            <div className="flex-[2] w-full">
              <label className="block text-xs font-bold text-zinc-500 mb-1">Description (Optional)</label>
              <input
                name="description"
                type="text"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="内容のメモなど"
              />
            </div>
            <button className="bg-zinc-900 text-white px-6 py-2.5 rounded-lg hover:bg-zinc-800 font-bold shadow-md transition w-full md:w-auto">
              Create
            </button>
          </form>
        </div>

        {/* --- 単語帳リスト --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {decks.map((deck) => (
            <div key={deck.id} className="group relative bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
              
              {/* 削除ボタン: 右上に常時表示 (薄いグレー -> ホバーで赤) */}
              <form action={deleteDeck.bind(null, deck.id)} className="absolute top-4 right-4 z-10">
                <button className="text-zinc-300 hover:text-red-500 p-2 transition-colors" title="削除">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
                </button>
              </form>

              <Link href={`/deck/${deck.id}`} className="block h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:scale-110 transition">
                    <span className="font-bold text-lg">Aa</span>
                  </div>
                  {/* Section数バッジはここから移動しました */}
                </div>
                
                {/* タイトル (削除ボタンと被らないように右側に余白 pr-8 を追加) */}
                <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-indigo-600 transition pr-8">{deck.title}</h3>
                <p className="text-zinc-500 text-sm line-clamp-2 mb-4">{deck.description || "No description provided."}</p>
                
                {/* Section数バッジを下に移動 */}
                <div className="inline-block bg-zinc-100 text-zinc-500 text-xs px-2 py-1 rounded-full font-mono">
                   {deck._count.sections} Sections
                </div>
              </Link>
            </div>
          ))}
          
          {decks.length === 0 && (
            <div className="col-span-1 md:col-span-2 py-16 text-center border-2 border-dashed border-zinc-200 rounded-2xl">
              <p className="text-zinc-400 font-medium">No decks created yet.</p>
              <p className="text-sm text-zinc-300 mt-1">上のフォームから最初の単語帳を作りましょう</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}