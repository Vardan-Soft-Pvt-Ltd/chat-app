import { ChatInput } from "@/components/custom/chatinput";
import { PreviewMessage, ThinkingMessage } from "../../components/custom/message";
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { useState, useRef, useEffect } from "react";
import { message } from "../../interfaces/interfaces";
import { Overview } from "@/components/custom/overview";
import { Header } from "@/components/custom/header";
import { v4 as uuidv4 } from 'uuid';
import { io, Socket } from "socket.io-client";
const agentId = import.meta.env.VITE_AGENT_ID;
const apiUrl = import.meta.env.VITE_API_URL;


const URL = process.env.NODE_ENV === 'production' ? apiUrl : 'http://localhost:5000';

export function Chat() {
  const [convId, setConvId] = useState<string>("");
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [messages, setMessages] = useState<message[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messageHandlerRef = useRef<((data: string) => void) | null>(null);

  useEffect(() => {
    socketRef.current = io(URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
    setConvId(crypto.randomUUID());
    const socket = socketRef.current;

    // Connection status handlers
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, []);

  const cleanupMessageHandler = () => {
    if (messageHandlerRef.current && socketRef.current) {
      socketRef.current.off("json", messageHandlerRef.current);
      messageHandlerRef.current = null;
    }
  };

  async function handleSubmit(text?: string) {
    if (!socketRef.current || isLoading) return;

    const messageText = text || question;
    setIsLoading(true);
    cleanupMessageHandler();

    const userMessageId = uuidv4();
    setMessages(prev => [...prev, {
      content: messageText,
      role: "user",
      id: userMessageId
    }]);

    socketRef.current.emit("json", {
      message: messageText,
      conv_id: convId,
      agent_id: agentId
    });
    setQuestion("");

    try {
      const messageHandler = (data: any) => {
        console.log("received");
        console.log(data);
        if (data instanceof String && data.includes("[END]")) {
          setIsLoading(false);
          cleanupMessageHandler();
          return;
        }

        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];

          if (lastMessage?.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: lastMessage.content + data.response }
            ];
          } else {
            const assistantMessageId = uuidv4();
            return [
              ...prev,
              {
                content: data.response,
                role: "assistant",
                id: assistantMessageId
              }
            ];
          }
        });
      };

      messageHandlerRef.current = messageHandler;
      socketRef.current.on("json", messageHandler);
    } catch (error) {
      console.error("WebSocket error:", error);
      setIsLoading(false);
      cleanupMessageHandler();
    }
  }

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <Header isConnected={isConnected} />
      <div
        className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
        ref={messagesContainerRef}
      >
        {messages.length === 0 && <Overview />}
        {messages.map((message) => (
          <PreviewMessage key={message.id} message={message} />
        ))}
        {isLoading && <ThinkingMessage />}
        <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
      </div>
      <div className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <ChatInput
          question={question}
          setQuestion={setQuestion}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}