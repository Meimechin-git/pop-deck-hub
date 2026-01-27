// components/Header.tsx
import { auth, signOut } from "@/auth";
import Link from "next/link";

export default async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
          <span className="font-bold text-lg tracking-tight text-zinc-900">PopDeckHub</span>
        </Link>

        {/* ナビゲーション */}
        <nav className="flex items-center gap-6">
          {session ? (
            <>
              {/* ログイン時 */}
              <Link href="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition">
                Dashboard
              </Link>
              <div className="flex items-center gap-4 pl-6 border-l border-zinc-200">
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <button className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-3 py-1.5 rounded-md font-medium transition">
                    Logout
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              {/* ログアウト時 */}
              <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition">
                Log in
              </Link>
              <Link href="/register" className="text-sm font-medium bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}