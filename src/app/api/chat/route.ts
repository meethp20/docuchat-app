import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/getSession";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let message: string;
  let chatId: string | null = null;
  let pdfText: string | null = null;
  let supabaseInstance;
  let userId: string;

  try {
    const body = await req.json();
    message = body.message;
    chatId = body.chatId;
    pdfText = body.pdfText ?? null;
    userId = session.user.id;

    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create a new chat if chatId not provided
    let currentChatId = chatId;
    if (!currentChatId) {
      const { data: chat, error: chatError } = await supabaseInstance
        .from("chats")
        .insert({ user_id: userId, title: message.substring(0, 30) })
        .select("id")
        .single();

      if (chatError) throw chatError;
      currentChatId = chat.id;
    }

    // Store user message
    await supabaseInstance.from("messages").insert({
      chat_id: currentChatId,
      content: message,
      role: "user"
    });

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: pdfText
                    ? `Context from PDF: ${pdfText}\n\nUser question: ${message}`
                    : message
                }
              ]
            }
          ]
        })
      }
    );

    const geminiResponse = await response.json();
    const botMessage =
      geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response.";

    // Store bot response
    await supabaseInstance.from("messages").insert({
      chat_id: currentChatId,
      content: botMessage,
      role: "assistant"
    });

    return NextResponse.json({
      message: botMessage,
      chatId: currentChatId
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
