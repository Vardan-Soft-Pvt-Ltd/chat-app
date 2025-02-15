import { createContext, useContext, useEffect, useState } from "react";
import { EventSource } from "extended-eventsource";

const SSEContext = createContext<{ connected: boolean }>({ connected: false });

export function SSEProvider({ URL, handleMessage, children }: { URL: string, handleMessage: (data: any) => void, children: React.ReactNode }) {
    const [connected, setConnected] = useState(false);
    let es: EventSource | null = null;

    useEffect(() => {

        const connect = () => {
            es = new EventSource(URL);

            es.onopen = () => {
                console.log(">>> Connection opened!");
                setConnected(true);
            };

            es.onerror = (e) => {
                console.log("ERROR!", e);
                setConnected(false);
                if (es) es.close();
                setTimeout(connect, 1000);
            };

            es.onmessage = (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                handleMessage(data);
            };
        };

        connect();

        return () => {
            if (es) {
                es.close();
                setConnected(false);
            }
        };
    }, [URL, handleMessage]);
    return (
        <SSEContext.Provider value={{ connected }}>
            {children}
        </SSEContext.Provider>
    );
};
export function useSSE() {
    const context = useContext(SSEContext);
    if (context === undefined) {
        throw new Error('useSSE must be used within a SSEProvider');
    }
    return context;
}
