// app/register/page.tsx
import { register } from "@/app/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

// エラーメッセージの定義
const errors = {
  missing: "すべての項目を入力してください",
  password_too_short: "パスワードは6文字以上で入力してください",
  invalid_email: "メールアドレスの形式が正しくありません",
  exists: "このメールアドレスは既に登録されています",
  auth_error: "アカウント作成後のログインに失敗しました",
};

export default async function RegisterPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const errorMessage = searchParams.error ? errors[searchParams.error as keyof typeof errors] : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">アカウント作成</h1>
          <p className="text-sm text-zinc-500 mt-2">PopDeckHubへようこそ</p>
        </div>

        {/* ▼ エラーメッセージ表示エリア */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mt-0.5 flex-shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </div>
        )}

        <form action={register} className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Name</label>
            <input name="name" type="text" placeholder="例: Taro Yamada" required className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</label>
            <input name="email" type="email" placeholder="example@email.com" required className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Password</label>
            <input name="password" type="password" placeholder="6文字以上" required className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          </div>
          <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition mt-2 shadow-lg shadow-indigo-200">
            登録して始める
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-8">
          すでにアカウントをお持ちですか？ <Link href="/login" className="text-zinc-900 font-bold hover:underline">ログイン</Link>
        </p>
      </div>
    </div>
  );
}