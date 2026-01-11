import { useEffect, useRef, useState } from 'react';
import { issueWidgetToken, sendMessage } from './utils/apis';
import { v4 as uuidv4 } from 'uuid';

let VALID_TOKEN = null;

export default function App({ id = 'chat-widget' }) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [tempssid, setTempssid] = useState('');
  const [loading, setLoading] = useState(false);
  const portalRef = useRef(null);
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState([
    { text: 'Hello! what ar u?', sender: 'me', msgId: 1 },
    { text: 'Hello!', sender: 'bot', msgId: 2 }
  ]);
  const messagesEndRef = useRef(null);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleMessageSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageList]);

  useEffect(() => {
    if (!token) {
      console.log('got the token');
      let ws;
      let reconnectTimeout;
      const connect = () => {
        // ws = new WebSocket(`wss://widget-web-socket-temp-210250062313.asia-south1.run.app/ws/123456`);
        const ssId = uuidv4();
        setTempssid(ssId);
        ws = new WebSocket(
          `wss://message-web-socket-v2-210250062313.asia-south1.run.app/ws/${ssId}`
        );
        ws.onopen = () => console.log('✅ WebSocket connected');
        ws.onmessage = (event) => {
          console.log('Message:', event.data);
           setMessageList((prevMessages) => [
        ...prevMessages,
        { text: event.data, sender: 'bot', msgId: prevMessages.length + 1 }
      ]);
        };
        ws.onclose = () => {
          // console.log("❌ WebSocket closed. Reconnecting in 2s...");
          setTimeout(connect, 2000);
        };
        ws.onerror = () => ws.close();
      };

      connect();
      // setWs(ws);

      return () => {
        clearTimeout(reconnectTimeout);
        ws.close();
      };
    } else {
      console.log('no token');
    }
  }, []);

  //Dummy flow
  // STEP 1: get token when widget loads
  // useEffect(() => {
  //   const fetchToken = async () => {
  //     const res = await issueWidgetToken(); // pretend API call
  //     console.log('token received:', res);
  //     setToken(res.access_token);
  //   };
  //   fetchToken();
  // }, []);

  // STEP 2: send message using token
  const handleMessageSend = async () => {
    setLoading(true);
    if (!message.trim()) return;

    setMessageList((prevMessages) => [
      ...prevMessages,
      { text: message, sender: 'me', msgId: prevMessages.length + 1 }
    ]);

    try {
      if (tempssid) {
        const response = await sendMessage(message, tempssid);
      }
      // const response = proxyChatRequest(token, message);
      // const response = await sendMessage(message,tempssid);
      // console.log("response:msg sent",response)
      // setMessageList((prevMessages) => [
      //   ...prevMessages,
      //   { text: response.reply, sender: 'bot', msgId: prevMessages.length + 1 }
      // ]);
    } catch (err) {
      setMessageList((prevMessages) => [
        ...prevMessages,
        { text: err.message, sender: 'bot', msgId: prevMessages.length + 1 }
      ]);
    }

    setMessage('');
    setLoading(false);
  };
  // // Detect outside clicks
  // useEffect(() => {
  //   function handleClickOutside(event) {
  //     if (portalRef.current && !portalRef.current.contains(event.target)) {
  //       setOpen(false);
  //     }
  //   }

  //   if (open) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   } else {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [open]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat Portal */}
      {open && (
        <div
          ref={portalRef}
          className="flex flex-col w-80 max-w-[90vw] h-[500px] max-h-[90vh] bg-white shadow-2xl rounded-xl overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-semibold">Chat with us</h3>
            <button onClick={() => setOpen(false)} className="text-white text-xl font-bold">
              ×
            </button>
          </div>

          {/* <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="text-gray-500 text-sm">Your chat messages will appear here...</div>
          </div> */}

          {/* Chat Messages Area */}
          <div className="flex-1 p-5 pl-2 bg-gray-100 border-1 border-gray-200 rounded-t-2xl mx-4 mt-2 overflow-y-auto no-scrollbar">
            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
              {/* Bot Message */}
              <div className="flex items-start gap-3 mb-6">
                <div className="w-6 h-6 rounded-full bg-[#005994] flex items-center justify-center text-white text-xs flex-shrink-0">
                  N
                </div>
                <div>
                  {/* <div className="font-semibold text-gray-900 mb-2">Neo-Ji</div> */}
                  <div className="bg-gray-200 rounded-2xl rounded-tl-none px-5 py-3 inline-block">
                    <p className="text-gray-800">Hello! How can I assist you today?</p>
                  </div>
                </div>
              </div>

              {messageList.map((msg) => (
                <div
                  key={msg.msgId}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  {/* Bot Message */}
                  {/* User Message */}
                  {msg.sender === 'me' ? (
                    <div className="flex items-start gap-3 justify-end mb-6">
                      <div>
                        {/* <div className="font-semibold text-gray-900 mb-2 text-right">
                        You
                      </div> */}
                        <div className="bg-gray-500 rounded-2xl rounded-tr-none px-5 py-3 inline-block">
                          <p className="text-white">{msg.text}</p>
                        </div>
                      </div>
                      {/* <div className="w-10 h-10 rounded-full bg-[#005994] flex items-center justify-center text-white font-semibold flex-shrink-0">
                      U
                    </div> */}
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 mb-6">
                      <div className="w-6 h-6 rounded-full bg-[#005994] flex items-center justify-center text-white text-xs flex-shrink-0">
                        N
                      </div>
                      <div>
                        {/* <div className="font-semibold text-gray-900 mb-2">
                        Neo-Ji
                      </div> */}
                        <div className="bg-gray-200 rounded-2xl rounded-tl-none px-5 py-3 inline-block">
                          {/* <p className="text-gray-800"> {origin ==="sendMessage" && loading ?"Thinking...":msg.text}</p> */}
                          <p className="text-gray-800">{msg.text}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              ))}
              {origin === 'sendMessage' && loading && (
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-6 h-6 rounded-full bg-[#005994] flex items-center justify-center text-white text-xs flex-shrink-0">
                    N
                  </div>
                  <div>
                    {/* <div className="font-semibold text-gray-900 mb-2">Neo-Ji</div> */}
                    <div className="bg-gray-200 rounded-2xl rounded-tl-none px-5 py-3 inline-block">
                      <p className="text-gray-800 animate-pulse">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-gray-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="button"
              onClick={handleMessageSend}
              className="bg-indigo-600 text-white rounded-full px-4 py-2 hover:bg-indigo-700 transition">
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:scale-105 transition">
        💬
      </button>
    </div>
  );
}

// STEP 1: issue short-lived token
// export function issueWidgetToken() {
//   VALID_TOKEN = 'temp-token-' + Math.random().toString(36).slice(2);

//   console.log('🔐 Server issued token:', VALID_TOKEN);

//   return {
//     token: VALID_TOKEN,
//     expiresIn: 60 // seconds
//   };
// }

// STEP 2: proxy chat request
export function proxyChatRequest(token, message) {
  console.log('📨 Server received token:', token);

  if (token !== VALID_TOKEN) {
    throw new Error('Unauthorized: invalid or expired token');
  }

  // Simulate real API call
  return {
    reply: `reply to: "${message}"`
  };
}
