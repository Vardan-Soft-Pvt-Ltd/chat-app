import { useEffect } from 'react';
import { EventSource } from "extended-eventsource"

const useSSE = (URL: string, handleResponse: (data: any) => void) => {
    useEffect(() => {
        let es: EventSource | null = null;

        const connect = () => {
            es = new EventSource(URL);

            es.onopen = () => {
                console.log(">>> Connection opened!");
            };

            es.onerror = (e) => {
                console.log("ERROR!", e);
                // Attempt to reconnect after a delay if an error occurs
                if (es) {
                    es.close(); // Close the current connection before reconnecting
                }
                setTimeout(connect, 5000); // Retry connection after 5 seconds
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
            }
        };
    }, [URL, handleResponse]);
};

export default useSSE;
