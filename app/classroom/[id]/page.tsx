// app/classroom/[id]/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addDeckToClassroom } from "@/app/actions";
import Link from "next/link";
import Header from "@/components/Header";

export default async function ClassroomPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const classroom = await prisma.classroom.findUnique({
    where: { id },
    include: {
      teacher: true,
      students: true,
      decks: {
        include: { _count: { select: { sections: true } } }
      }
    }
  });

  if (!classroom) return <div className="p-12 text-center text-zinc-500">Classroom not found</div>;

  const isTeacher = session?.user?.id === classroom.teacherId;

  // 先生の場合のみ、追加候補を取得
  let myDecksToAdd: any[] = [];
  if (isTeacher) {
    myDecksToAdd = await prisma.deck.findMany({
      where: {
        userId: session.user?.id,
        classrooms: { none: { id: classroom.id } }
      }
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Header />

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="mb-8">
          <Link href="/" className="text-sm font-bold text-zinc-400 hover:text-zinc-600 transition flex items-center gap-1">
            ← Back to Home
          </Link>
        </div>

        {/* --- Classroom Header Info --- */}
        <header className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-indigo-50 to-orange-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isTeacher ? "bg-indigo-100 text-indigo-700" : "bg-orange-100 text-orange-700"}`}>
                  {isTeacher ? "Teacher View" : "Student View"}
                </span>
                <span className="text-zinc-400 text-xs flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {classroom.teacher.name}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">{classroom.name}</h1>
            </div>
            
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-center min-w-[160px]">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Class Code</p>
              <p className="text-3xl font-mono font-bold text-zinc-900 tracking-widest select-all">{classroom.code}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* --- Main Content: Decks --- */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <span>📚 Shared Decks</span>
              <span className="bg-zinc-200 text-zinc-600 text-xs px-2 py-0.5 rounded-full">{classroom.decks.length}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {classroom.decks.map(deck => (
                <Link key={deck.id} href={`/deck/${deck.id}`} className="block bg-white border border-zinc-200 p-5 rounded-xl hover:shadow-md hover:border-indigo-300 transition group">
                  <h3 className="font-bold text-lg text-zinc-900 mb-1 group-hover:text-indigo-600 transition">{deck.title}</h3>
                  <p className="text-zinc-500 text-sm mb-3 line-clamp-1">{deck.description || "No description"}</p>
                  <div className="text-xs text-zinc-400 font-mono">
                     {deck._count.sections} Sections
                  </div>
                </Link>
              ))}
              {classroom.decks.length === 0 && (
                <div className="col-span-2 py-10 text-center border-2 border-dashed border-zinc-200 rounded-xl text-zinc-400 text-sm">
                  まだ単語帳がありません
                </div>
              )}
            </div>

            {/* --- (Teacher Only) Add Deck Area --- */}
            {isTeacher && (
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="font-bold text-sm text-indigo-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Your Deck
                </h3>
                
                {myDecksToAdd.length === 0 ? (
                  <p className="text-sm text-indigo-700/70">
                    追加できる単語帳がありません。<Link href="/dashboard" className="underline font-bold hover:text-indigo-900">Dashboard</Link> で作成してください。
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {myDecksToAdd.map(deck => (
                      <form key={deck.id} action={addDeckToClassroom.bind(null, deck.id, classroom.id)}>
                        <button className="bg-white border border-indigo-200 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-transparent transition shadow-sm text-sm font-bold flex items-center gap-2">
                          {deck.title}
                          <span className="opacity-50">+</span>
                        </button>
                      </form>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --- Sidebar: Students --- */}
          <div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              Students <span className="text-zinc-300">({classroom.students.length})</span>
            </h3>
            
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
              <div className="space-y-3">
                  {classroom.students.map(student => (
                      <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 transition">
                          <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden">
                             {student.image ? (
                               <img src={student.image} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-bold">
                                 {student.name?.charAt(0)}
                               </div>
                             )}
                          </div>
                          <span className="text-sm font-bold text-zinc-700">{student.name}</span>
                      </div>
                  ))}
                  {classroom.students.length === 0 && (
                    <p className="text-zinc-400 text-sm text-center py-4">まだ誰も参加していません</p>
                  )}
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100">
               <p className="text-xs text-orange-800 leading-relaxed">
                 <strong>Invite Students:</strong><br/>
                 生徒にClass Code <span className="font-mono font-bold">{classroom.code}</span> を共有してください。
               </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}