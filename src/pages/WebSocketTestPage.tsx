
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebSocketConnection } from "@/services/realtime/useWebSocketConnection";

const WebSocketTestPage: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);

  const { 
    state, 
    lastMessage, 
    errorMessage, 
    send, 
    connect, 
    disconnect 
  } = useWebSocketConnection({
    url: 'wss://echo.websocket.org', // A public WebSocket echo server for testing
    mock: false, // Set to true to use mock WebSocket
    onMessage: (event) => {
      setMessages(prev => [...prev, `Received: ${event.data}`]);
    }
  });

  const handleSendMessage = () => {
    const message = `Test message at ${new Date().toISOString()}`;
    send(message);
    setMessages(prev => [...prev, `Sent: ${message}`]);
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>WebSocket Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <strong>Connection State:</strong> {state}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          </div>
          <div className="flex space-x-2">
            <Button onClick={connect} disabled={state === 'connected'}>
              Connect
            </Button>
            <Button onClick={disconnect} disabled={state !== 'connected'}>
              Disconnect
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={state !== 'connected'}
            >
              Send Message
            </Button>
          </div>
          <div className="border p-2 max-h-40 overflow-y-auto">
            <h3 className="font-bold">Messages:</h3>
            {messages.map((msg, index) => (
              <div key={index} className="text-sm">
                {msg}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebSocketTestPage;
