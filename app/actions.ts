// app/actions.ts
"use server";

import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

// ユーザー登録 (バリデーションと自動ログイン付き)
export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // --- 1. バリデーション (入力チェック) ---
  
  // 空欄チェック
  if (!name || !email || !password) {
    redirect("/register?error=missing");
  }

  // パスワードの長さ (6文字以上)
  if (password.length < 6) {
    redirect("/register?error=password_too_short");
  }

  // メールの形式チェック (簡易的な正規表現)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    redirect("/register?error=invalid_email");
  }

  // --- 2. 重複チェック ---
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    redirect("/register?error=exists");
  }

  // --- 3. ユーザー作成 ---
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // --- 4. 自動ログイン & リダイレクト ---
  // 登録できたら、そのままログイン処理を走らせてダッシュボードへ飛ばします
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/register?error=auth_error");
    }
    throw error; // リダイレクト処理のために必要
  }
}

// 単語帳を作成する機能
export async function createDeck(formData: FormData) {
  // 1. ログイン中のユーザー情報を取得
  const session = await auth();
  if (!session?.user?.id) return;

  // 2. フォームからタイトルを取得
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title) return;

  // 3. データベースに保存
  await prisma.deck.create({
    data: {
      title,
      description,
      userId: session.user.id, // 誰が作ったか紐付け
    },
  });

  // 4. 画面を更新
  revalidatePath("/");
}

// 単語帳を削除する機能（ついでに作っておきます）
export async function deleteDeck(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  // 自分の単語帳か確認してから削除
  await prisma.deck.deleteMany({
    where: {
      id,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
}

// ▼ 新規追加: セクションを作成
export async function createSection(deckId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.section.create({
    data: {
      name,
      deckId,
    },
  });

  revalidatePath(`/deck/${deckId}`);
}

// セクションの削除
export async function deleteSection(sectionId: string, deckId: string) {
    await prisma.section.delete({
        where: { id: sectionId }
    });
    revalidatePath(`/deck/${deckId}`);
}

// カードを作成
export async function createCard(sectionId: string, deckId: string, formData: FormData) {
  const term = formData.get("term") as string;
  const definition = formData.get("definition") as string;

  if (!term || !definition) return;

  await prisma.card.create({
    data: {
      term,
      definition,
      sectionId,
    },
  });
  
  // 画面更新のためにDeckのIDが必要
  revalidatePath(`/deck/${deckId}`);
}

// カードの削除
export async function deleteCard(cardId: string, deckId: string) {
  // ログイン確認などは必要に応じて追加（今回は簡易実装）
  await prisma.card.delete({
    where: { id: cardId },
  });

  // 画面を更新
  revalidatePath(`/deck/${deckId}`);
}

// クラスルームを作成する (先生向け)
export async function createClassroom(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const name = formData.get("name") as string;
  // ランダムな6文字のコードを生成
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  await prisma.classroom.create({
    data: {
      name,
      code,
      teacherId: session.user.id,
    },
  });

  revalidatePath("/");
}

// ログイン処理
export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // 成功するとここでリダイレクトエラーが投げられ、catchブロックを飛び越えて画面遷移します
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    // 認証エラー（パスワード違いなど）の場合
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return redirect("/login?error=failed");
        default:
          return redirect("/login?error=unknown");
      }
    }
    
    // リダイレクトエラー（成功時）はここで再スローされ、Next.jsが処理します
    throw error;
  }
}

// クラスルームに参加する (生徒向け)
export async function joinClassroom(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const code = formData.get("code") as string;

  // コードからクラスを探す
  const classroom = await prisma.classroom.findUnique({
    where: { code },
  });

  if (!classroom) {
    // 本当はエラー表示すべきですが今回は簡易的にリターン
    return;
  }

  // 既に参加済みかチェックしても良いですが、connectは重複しても大丈夫な場合が多い
  await prisma.classroom.update({
    where: { id: classroom.id },
    data: {
      students: {
        connect: { id: session.user.id },
      },
    },
  });

  revalidatePath("/");
}

// クラスに単語帳を追加する (先生が自分の単語帳を共有)
export async function addDeckToClassroom(deckId: string, classroomId: string) {
  await prisma.classroom.update({
    where: { id: classroomId },
    data: {
      decks: {
        connect: { id: deckId },
      },
    },
  });
  revalidatePath(`/classroom/${classroomId}`);
}