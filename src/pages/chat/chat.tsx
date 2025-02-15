import { ChatInput } from "@/components/custom/chatinput";
import { PreviewMessage, ThinkingMessage } from "../../components/custom/message";
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { useState } from "react";
import { message } from "../../interfaces/interfaces";
import { Overview } from "@/components/custom/overview";
import { Header } from "@/components/custom/header";
import { v4 as uuidv4 } from 'uuid';
import { useParams } from "react-router-dom";
import { SSEProvider, useSSE } from "@/context/SSEContext";
import { BASE_URL } from "@/lib/utils";

const DEFAULT_AGENT_ID = import.meta.env.VITE_DEFAULT_AGENT_ID;

function getAgentIdByHost(host: string | undefined) {
  switch (host) {
    default:
      return DEFAULT_AGENT_ID
  }
}
export function ChatPage() {
  const [convId] = useState<string>(crypto.randomUUID());
  const [messages, setMessages] = useState<message[]>([]);

  function handleResponse(data: any) {
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.role === "assistant") {
        return [
          ...prev.slice(0, -1),
          { ...lastMessage, content: lastMessage.content + data.response }
        ];
      } else {
        return [
          ...prev,
          {
            content: data.response,
            role: "assistant",
            id: uuidv4()
          }
        ];
      }
    });
  }
  return (
    <SSEProvider URL={BASE_URL + `/stream?channel=${convId}`} handleMessage={handleResponse}>
      <Chat convId={convId} handleResponse={handleResponse} messages={messages} setMessages={setMessages}></Chat>
    </SSEProvider>
  );

}

interface ChatProps {
  convId: string,
  handleResponse: (data: any) => void,
  messages: message[],
  setMessages: React.Dispatch<React.SetStateAction<message[]>>
}

function Chat({ convId, handleResponse, messages, setMessages }: ChatProps) {
  const { agent_id, host } = useParams();
  const final_agent_id = agent_id || getAgentIdByHost(host);
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { connected } = useSSE();

  async function handleSubmit(text?: string) {
    if (isLoading || !connected) return;
    const messageText = text || question;
    setIsLoading(true);
    setMessages(prev => [...prev, {
      content: messageText,
      role: "user",
      id: uuidv4()
    }]);
    setQuestion("");

    fetch(BASE_URL + "/chat/" + final_agent_id, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messageText,
        conv_id: convId
      })
    })
      .then((res) => res.text())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.error("Error:", err);
      }).finally(() => {
        setIsLoading(false);
      });

  }

  return (
    <SSEProvider URL={BASE_URL + `/stream?channel=${convId}`} handleMessage={handleResponse}>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <Header connected={connected} />
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
            isSSEConnected={connected}
          />
        </div>
      </div>
    </SSEProvider>
  );
}
