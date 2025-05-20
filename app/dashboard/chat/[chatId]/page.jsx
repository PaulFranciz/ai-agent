import ChatInterface from "@/components/ChatInterface";
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

/**
 * The chat page component for displaying and interacting with a specific chat.
 * Using JSX to bypass TypeScript errors in Next.js 15.
 */
export default async function ChatPage(context) {
  // In Next.js 15, we need to await the params before accessing properties
  const params = await context.params;
  const chatId = params.chatId;
  
  try {
    // Get user authentication
    const { userId } = await auth();

    if (!userId) {
      redirect("/");
    }

    try {
      // Get Convex client and fetch chat and messages
      const convex = getConvexClient();

      // Check if chat exists & user is authorized to view it
      const chat = await convex.query(api.chats.getChat, {
        id: chatId,
        userId,
      });

      if (!chat) {
        console.log(
          "⚠️ Chat not found or unauthorized, redirecting to dashboard"
        );
        redirect("/dashboard");
      }

      // Get messages
      const initialMessages = await convex.query(api.messages.list, { chatId });

      return (
        <div className="flex-1 overflow-hidden">
          <ChatInterface chatId={chatId} initialMessages={initialMessages} />
        </div>
      );
    } catch (error) {
      console.error("🔥 Error loading chat:", error);
      redirect("/dashboard");
    }
  } catch (error) {
    console.error("🔥 An unexpected error occurred:", error);
    // Handle unexpected errors, maybe show a generic error page or redirect
    redirect("/error"); // Assuming you have an error page
  }
}
