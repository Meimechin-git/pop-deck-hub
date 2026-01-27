// app/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createClassroom, joinClassroom } from "@/app/actions";
import Link from "next/link";
import Header from "@/components/Header";

export default async function Home() {
  const session = await auth();

  // ---------------------------------------------------------
  // A. 未ログイン時 (LP)
  // ---------------------------------------------------------
  if (!session) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 selection:bg-indigo-100">
        <Header />
        
        <main className="flex flex-col items-center justify-center pt-20 pb-32 px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-600 mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Now available for everyone
          </div>

          <h1 className="max-w-4xl text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 to-zinc-500">
            Knowledge Shared.<br />Instantly.
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-zinc-500 mb-10 leading-relaxed">
            PopDeckHubは、先生と生徒をつなぐ最もシンプルな単語帳プラットフォーム。<br className="hidden md:block"/>
            クラスルームを作成し、瞬間記憶のためのカードを共有しよう。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link href="/register">
              <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white rounded-xl font-bold text-lg hover:bg-zinc-800 transition shadow-xl shadow-zinc-200">
                無料で始める
              </button>
            </Link>
            <Link href="/login">
              <button className="w-full sm:w-auto px-8 py-4 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-bold text-lg hover:bg-zinc-50 transition">
                ログイン
              </button>
            </Link>
          </div>
          
          <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10 blur-3xl" />
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------
  // B. ログイン時 (Dashboard UI)
  // ---------------------------------------------------------
  
  const teachingClasses = await prisma.classroom.findMany({
    where: { teacherId: session.user?.id },
    include: { _count: { select: { students: true, decks: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const learningClasses = await prisma.classroom.findMany({
    where: { students: { some: { id: session.user?.id } } },
    include: { teacher: true, _count: { select: { decks: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Header />
      
      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Overview</h2>
            <p className="text-zinc-500 mt-1">クラスルームと学習の進捗管理</p>
          </div>
        </div>

        {/* Action Cards Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          
          {/* 1. Create Class */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition group">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Create Classroom</h3>
            <p className="text-sm text-zinc-500 mb-4">先生としてクラスを作成</p>
            
            {/* Server Actionを指定したフォーム */}
            <form action={createClassroom} className="flex gap-2 w-full">
              <input 
                name="name" 
                placeholder="Class name" 
                required 
                className="flex-1 min-w-0 bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition" 
              />
              <button 
                type="submit" 
                className="bg-zinc-900 text-white px-3 py-2 rounded text-sm font-bold hover:bg-zinc-800 flex-shrink-0"
              >
                →
              </button>
            </form>
          </div>

          {/* 2. Join Class (機能修正: formタグを適切に配置) */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition group">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-4 text-orange-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Join Classroom</h3>
            <p className="text-sm text-zinc-500 mb-4">招待コードを入力して参加</p>
            
            {/* ▼ 修正: Server Actionを指定したフォーム */}
            <form action={joinClassroom} className="flex gap-2 w-full">
              <input 
                name="code" 
                placeholder="6-digit code" 
                required 
                className="flex-1 min-w-0 bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm uppercase focus:outline-none focus:border-orange-500 transition" 
              />
              <button 
                type="submit" 
                className="bg-zinc-900 text-white px-3 py-2 rounded text-sm font-bold hover:bg-zinc-800 flex-shrink-0"
              >
                →
              </button>
            </form>
          </div>

          {/* 3. My Decks (リンク機能の確認) */}
          <Link href="/dashboard" className="bg-zinc-900 text-white p-6 rounded-2xl shadow-lg hover:bg-black transition flex flex-col justify-between relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition group-hover:bg-white/20"></div>
            <div>
              <h3 className="text-lg font-bold mb-1">Dashboard</h3>
              <p className="text-zinc-400 text-sm">個人の単語帳を管理</p>
            </div>
            <div className="flex justify-end mt-4">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition">→</span>
            </div>
          </Link>
        </div>

        {/* Lists Display Area (表示は問題ないはずですがコードは維持) */}
        <div className="space-y-12">
          {/* Teaching */}
          <section>
             <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Teaching</h3>
             </div>
             {teachingClasses.length === 0 ? (
               <div className="p-8 border border-dashed border-zinc-300 rounded-xl text-center text-zinc-400 text-sm">No classes created yet.</div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {teachingClasses.map(cls => (
                   <Link key={cls.id} href={`/classroom/${cls.id}`} className="group block p-5 bg-white border border-zinc-200 rounded-xl hover:border-indigo-300 transition hover:shadow-sm">
                     <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-zinc-900 group-hover:text-indigo-600 transition">{cls.name}</h4>
                       <span className="text-[10px] font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-500">{cls.code}</span>
                     </div>
                     <div className="flex gap-4 text-xs text-zinc-500">
                       <span className="flex items-center gap-1">👤 {cls._count.students}</span>
                       <span className="flex items-center gap-1">📚 {cls._count.decks}</span>
                     </div>
                   </Link>
                 ))}
               </div>
             )}
          </section>

          {/* Learning */}
          <section>
             <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Learning</h3>
             </div>
             {learningClasses.length === 0 ? (
               <div className="p-8 border border-dashed border-zinc-300 rounded-xl text-center text-zinc-400 text-sm">No classes joined yet.</div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {learningClasses.map(cls => (
                   <Link key={cls.id} href={`/classroom/${cls.id}`} className="group block p-5 bg-white border border-zinc-200 rounded-xl hover:border-orange-300 transition hover:shadow-sm">
                     <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-zinc-900 group-hover:text-orange-600 transition">{cls.name}</h4>
                     </div>
                     <p className="text-xs text-zinc-500">Teacher: {cls.teacher.name}</p>
                   </Link>
                 ))}
               </div>
             )}
          </section>
        </div>

      </main>
    </div>
  );
}