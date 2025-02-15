import { createContext, useContext, useEffect, useState, useRef } from "react";
import { EventSource } from "extended-eventsource";

const SSEContext = createContext<{ connected: boolean }>({ connected: false });

export function SSEProvider({ URL, handleMessage, children }: { URL: string, handleMessage: (data: any) => void, children: React.ReactNode }) {
    const [connected, setConnected] = useState(false);
    const esRef = useRef<EventSource | null>(null);

    useEffect(() => {
        let isMounted = true;

        const connect = () => {
            if (esRef.current) {
                esRef.current.close();
            }

            const es = new EventSource(URL);
            esRef.current = es;

            es.onopen = () => {

                console.log(">>> Connection opened!");
                setConnected(true);

            };

            es.onerror = (e) => {
                console.log("ERROR!", e);

                setConnected(false);

                es.close();
                setTimeout(connect, 1000); // Reconnect after 1 second
            };

            es.onmessage = (event: MessageEvent) => {
                try {
                    const data = JSON.parse(event.data);
                    handleMessage(data);
                } catch (error) {
                    console.error("Failed to parse SSE message:", event.data, error);
                }
            };
        };

        connect();
        // TODO: shouldn't do set connected true here
        setConnected(true);


        return () => {
            isMounted = false;
            if (esRef.current) {
                esRef.current.close();
                esRef.current = null;
            }
            setConnected(false);
        };
    }, [URL, handleMessage]);

    return (
        <SSEContext.Provider value={{ connected }}>
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
