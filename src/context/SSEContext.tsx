import { createContext, useContext, useEffect, useState, useRef } from "react";
import { EventSource } from "extended-eventsource";

interface SSEContextType {
    connected: boolean;
    registerMessageHandler: (handler: (data: any) => void) => void;
}

const SSEContext = createContext<SSEContextType>({
    connected: false,
    registerMessageHandler: () => {
        console.warn("No SSEProvider found.");
    },
});

export function SSEProvider({ URL, children }: { URL: string; children: React.ReactNode }) {
    const [es, setEs] = useState<EventSource | null>(null);
    const messageHandlerRef = useRef<((data: any) => void) | null>(null); // Explicitly define the type

    // Register a message handler
    const registerMessageHandler = (handler: (data: any) => void) => {
        messageHandlerRef.current = handler;
    };

    // Cleanup function
    const cleanup = () => {
        if (es) {
            es.close();
            setEs(null);
        }
    };

    useEffect(() => {
        const connect = () => {
            cleanup();
            const _es = new EventSource(URL);

            _es.onopen = () => {
                console.log(">>> Connection opened!");
            };

            _es.onerror = (e) => {
                console.error("SSE Error:", e);
                cleanup();
                setTimeout(connect, 1000); // Reconnect after 1 second
            };

            _es.onmessage = (event: MessageEvent) => {
                try {
                    const data = JSON.parse(event.data);
                    if (messageHandlerRef.current) {
                        messageHandlerRef.current(data);
                    }
                } catch (error) {
                    console.error("Failed to parse SSE message:", event.data, error);
                }
            };

            setEs(_es);
        };

        connect();

        return () => {
            cleanup();
        };
    }, [URL]); // Remove messageHandler from dependencies

    return (
        <SSEContext.Provider value={{ connected: es != null, registerMessageHandler }}>
            {children}
        </SSEContext.Provider>
    );
}

export function useSSE() {
    const context = useContext(SSEContext);
    if (context === undefined) {
        throw new Error("useSSE must be used within an SSEProvider");
    }
    return context;
}