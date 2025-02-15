import { useEffect, useState } from 'react';
import { EventSource } from "extended-eventsource";

const useSSE = (URL: string, handleResponse: (data: any) => void) => {
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        let es: EventSource | null = null;

        const connect = () => {
            es = new EventSource(URL);

            es.onopen = () => {
                console.log(">>> Connection opened!");
                setConnected(true);
            };

            es.onerror = (e) => {
                console.log("ERROR!", e);
                setConnected(false); // Update state on error

                if (es) {
                    es.close(); // Close the current connection before reconnecting
                }
                setTimeout(connect, 1000); // Retry connection after 1 second
            };

            es.onmessage = (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                handleResponse(data);
            };
        };

        // Initial connection
        connect();

        // Cleanup when component is unmounted
        return () => {
            if (es) {
                es.close();
                setConnected(false); // Ensure state is updated when unmounted
            }
        };
    }, [URL, handleResponse]);

    return connected;
};

export default useSSE;
