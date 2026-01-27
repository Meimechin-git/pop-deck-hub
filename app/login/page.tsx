// app/login/page.tsx
import { signIn } from "@/auth";
import Link from "next/link";
import { login } from "@/app/actions"; // 👈 作成したlogin関数をインポート

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const isError = searchParams.error === "failed";

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">おかえりなさい</h1>
          <p className="text-sm text-zinc-500 mt-2">アカウントにログインして学習を再開しましょう</p>
        </div>

        {/* エラーメッセージ */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            メールアドレスかパスワードが間違っています
          </div>
        )}

        {/* ▼▼▼ 修正箇所: ここをシンプルな action={login} に変更 ▼▼▼ */}
        <form action={login} className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</label>
            <input name="email" type="email" required className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 transition" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Password</label>
            <input name="password" type="password" required className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 transition" />
          </div>
          <button type="submit" className="w-full bg-zinc-900 text-white font-bold py-3 rounded-lg hover:bg-zinc-800 transition mt-2">
            ログイン
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-200"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-zinc-400">Or continue with</span></div>
        </div>

        {/* GitHubログイン (こちらはそのままでOK) */}
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <button type="submit" className="w-full border border-zinc-300 text-zinc-700 font-bold py-3 rounded-lg hover:bg-zinc-50 transition flex items-center justify-center gap-2">
            GitHubでログイン
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-8">
          アカウントをお持ちでないですか？ <Link href="/register" className="text-indigo-600 font-bold hover:underline">新規登録</Link>
        </p>
      </div>
    </div>
  );
}