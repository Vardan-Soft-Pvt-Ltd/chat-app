import { createContext, useContext, useEffect, useState } from "react";
import { EventSource } from "extended-eventsource";

const SSEContext = createContext<{ connected: boolean }>({ connected: false });

export function SSEProvider({ URL, handleMessage, children }: { URL: string, handleMessage: (data: any) => void, children: React.ReactNode }) {
    const [es, setEs] = useState<EventSource | null>(null);
    function cleanup() {
        es && es.close();
        setEs(null);
    }
    useEffect(() => {
        const connect = () => {
            cleanup();
            const _es = new EventSource(URL);
            _es.onopen = () => {
                console.log(">>> Connection opened!");
            };
            _es.onerror = (e) => {
                console.log("ERROR!", e);
                cleanup();
                setTimeout(connect, 1000); // Reconnect after 1 second
            };
            _es.onmessage = (event: MessageEvent) => {
                try {
                    const data = JSON.parse(event.data);
                    handleMessage(data);
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
    }, [URL, handleMessage]);

    return (
        <SSEContext.Provider value={{ connected: es != null }}>
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
