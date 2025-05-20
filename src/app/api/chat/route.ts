import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/getSession";

export async function POST(req: NextRequest) {
  console.log("Chat API route called");
  
  // Use session for authentication if user is logged in
  // For development, we'll make this optional
  let session;
  try {
    session = await getSession();
  } catch (error) {
    console.warn("Could not get session, continuing without authentication", error);
  }

  let message: string;
  let chatId: string | null = null;
  let pdfText: string | null = null;
  let supabaseInstance;
  let userId: string = session?.user?.id || 'anonymous-user';

  try {
    // Parse the request body
    const body = await req.json();
    message = body.message;
    chatId = body.chatId;
    pdfText = body.pdfText ?? null;
    
    console.log("Received message:", message);
    if (pdfText) {
      console.log("PDF text length:", pdfText.length);
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn("Supabase credentials missing, skipping database operations");
    } else {
      supabaseInstance = createClient(supabaseUrl, supabaseServiceKey);
      
      // Create a new chat if chatId not provided
      let currentChatId = chatId;
      if (!currentChatId) {
        try {
          const { data: chat, error: chatError } = await supabaseInstance
            .from("chats")
            .insert({ user_id: userId, title: message.substring(0, 30) })
            .select("id")
            .single();

          if (chatError) throw chatError;
          currentChatId = chat.id;
        } catch (error) {
          console.error("Error creating chat:", error);
          // Generate a temporary chat ID if database operation fails
          currentChatId = `temp-chat-${Date.now()}`;
        }
      }

      // Store user message
      try {
        await supabaseInstance.from("messages").insert({
          chat_id: currentChatId,
          content: message,
          role: "user"
        });
      } catch (error) {
        console.error("Error storing user message:", error);
      }
      
      chatId = currentChatId;
    }

    // Check if Gemini API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined, using fallback response");
      
      // For development, provide a fallback response
      const fallbackMessage = "I'm sorry, but I can't process your request right now. The API key for Gemini is missing. Please check your environment configuration.";
      
      // Store fallback response if Supabase is available
      if (supabaseInstance && chatId) {
        try {
          await supabaseInstance.from("messages").insert({
            chat_id: chatId,
            content: fallbackMessage,
            role: "assistant"
          });
        } catch (error) {
          console.error("Error storing fallback message:", error);
        }
      }
      
      return NextResponse.json({
        message: fallbackMessage,
        chatId: chatId,
        error: "GEMINI_API_KEY is not defined"
      });
    }
    
    console.log("Calling Gemini API with message length:", message.length);
    if (pdfText) {
      console.log("PDF text length:", pdfText.length);
    }
    
    try {
      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
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
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API error:", errorData);
        throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'} (${response.status})`);
      }
      
      const geminiResponse = await response.json();
      console.log("Gemini API response received");
      
      if (!geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error("Unexpected Gemini API response format:", geminiResponse);
      }
      
      const botMessage =
        geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text ?? "I couldn't generate a response. Please try again.";
      
      // Store bot response if Supabase is available
      if (supabaseInstance && chatId) {
        try {
          await supabaseInstance.from("messages").insert({
            chat_id: chatId,
            content: botMessage,
            role: "assistant"
          });
        } catch (error) {
          console.error("Error storing bot message:", error);
        }
      }
      
      return NextResponse.json({
        message: botMessage,
        chatId: chatId
      });
    } catch (error) {
      console.error("Error processing Gemini API request:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      // Provide a fallback response for API errors
      const botMessage = "Sorry, I encountered an error while processing your request. Please try again later.";
      
      // Store error message as bot response if Supabase is available
      if (supabaseInstance && chatId) {
        try {
          await supabaseInstance.from("messages").insert({
            chat_id: chatId,
            content: botMessage,
            role: "assistant"
          });
        } catch (dbError) {
          console.error("Error storing error message:", dbError);
        }
      }
      
      return NextResponse.json({
        message: botMessage,
        chatId: chatId,
        error: errorMessage
      });
    }
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
