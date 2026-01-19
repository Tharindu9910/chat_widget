import { useEffect, useRef, useState } from 'react';
import { generateUUID, issueWidgetToken, sendMessage } from './utils/apis';
import { v4 as uuidv4 } from 'uuid';
import {
  Send,
  X,
  Minimize2,
  MessageCircle,
  Sparkles,
  Paperclip,
  File,
  SendHorizontal
} from 'lucide-react';

let VALID_TOKEN = null;

export default function App({ id = 'chat-widget' }) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [tempssid, setTempssid] = useState('');
  const [loading, setLoading] = useState(false);
  const portalRef = useRef(null);
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState([
    { text: 'Hello! How can I assist you today?', sender: 'bot', msgId: 1 }
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
    const trueee = false;
    if (token) {
      // console.log('got the token');
      let ws;
      let reconnectTimeout;
      const connect = () => {
        // ws = new WebSocket(`wss://widget-web-socket-temp-210250062313.asia-south1.run.app/ws/123456`);
        // const ssId = uuidv4();
        // setTempssid(ssId);
        const ssId = sessionStorage.getItem('ssId');
        if (ssId) {
          //wss://widget-web-socket-v2-210250062313.asia-south1.run.app/ws?token=${token}
          ws = new WebSocket(
            `wss://widget-web-socket-v2-210250062313.asia-south1.run.app/ws?token=${token}`
          );
        }

        ws.onopen = () => console.log('✅ WebSocket connected');
        ws.onmessage = (event) => {
          setLoading(false);
          // console.log('Message:', event.data);
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
      console.log('');
    }
  }, [token]);

  //Dummy flow
  // STEP 1: get token when widget loads
  useEffect(() => {
    const fetchToken = async () => {
      const res = await issueWidgetToken(ssId); // pretend API call
      console.log('token received:', res);
      console.log('token:', res.data.access_token);
      setToken(res.data.access_token);
    };

    generateUUID();
    const ssId = sessionStorage.getItem('ssId');
    if (ssId) {
      fetchToken();
    }
  }, []);

  // STEP 2: send message using token
  const handleMessageSend = async () => {
    setLoading(true);
    if (!message.trim()) return;
    const formattedMsg = message.trim()
    setMessage('')
    setMessageList((prevMessages) => [
      ...prevMessages,
      { text: formattedMsg, sender: 'me', msgId: prevMessages.length + 1 }
    ]);

    try {

      const response = await sendMessage(formattedMsg, token);
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

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            ry="2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="8.5"
            cy="8.5"
            r="1.5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="21 15 16 10 5 21"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    return <File className="w-4 h-4" />;
  };

  const quickReplies = ['What can you do?', 'Pricing info', 'Talk to support'];

  const formatBotMessage = (text) => {
    // Split by bullet points and format
    const lines = text.split('\n');
    const formatted = [];
    let currentList = [];
    let inList = false;

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check if line is a bullet point
      if (trimmed.startsWith('* **') || trimmed.startsWith('*')) {
        inList = true;
        // Extract title and description
        const match = trimmed.match(/\* \*\*(.+?):\*\* (.+)/);
        if (match) {
          currentList.push({ title: match[1], desc: match[2] });
        } else {
          currentList.push({ title: '', desc: trimmed.replace('* ', '').replace(/\*\*/g, '') });
        }
      } else if (trimmed) {
        // Regular text
        if (inList && currentList.length > 0) {
          formatted.push({ type: 'list', items: [...currentList] });
          currentList = [];
          inList = false;
        }
        formatted.push({ type: 'text', content: trimmed });
      }
    });
    if (currentList.length > 0) {
      formatted.push({ type: 'list', items: currentList });
    }

    return formatted;
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat Portal */}
      {open && (
        <div className="flex flex-col w-96 max-w-[90vw] h-[600px] max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl bg-white/95 border border-white/20 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header with Gradient */}
          <div className="relative bg-blue-800 text-white px-6 py-4">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center font-semibold text-lg border-2 border-white/40">
                    N
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    Chat With Us
                    {/* <Sparkles className="w-4 h-4 text-yellow-300" /> */}
                  </h3>
                  <p className="text-xs text-white/80">Online • Avg. response: 20 sec</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
                  aria-label="Minimize">
                  <Minimize2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
                  aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messageList.map((msg, index) => (
              <div
                key={msg.msgId}
                className={`flex ${
                  msg.sender === 'me' ? 'justify-end' : 'justify-start'
                } animate-in slide-in-from-bottom-2 duration-300`}
                style={{ animationDelay: `${index * 50}ms` }}>
                {msg.sender === 'bot' && (
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-lg">
                      N
                    </div>
                    <div>
                      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
                        {formatBotMessage(msg.text).map((block, blockIdx) => (
                          <div key={blockIdx}>
                            {block.type === 'text' && (
                              <p className="text-gray-800 text-sm leading-relaxed mb-3 last:mb-0">
                                {block.content}
                              </p>
                            )}
                            {block.type === 'list' && (
                              <div className="space-y-3 my-3">
                                {block.items.map((item, itemIdx) => (
                                  <div key={itemIdx} className="flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                                    <div className="flex-1">
                                      {item.title && (
                                        <span className="font-semibold text-violet-700 text-sm">
                                          {item.title}:{' '}
                                        </span>
                                      )}
                                      <span className="text-gray-700 text-sm">{item.desc}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 ml-1 block">
                        {msg.timestamp
                          ? msg.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : ''}
                      </span>
                    </div>
                  </div>
                )}

                {msg.sender === 'me' && (
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div>
                      <div className="bg-gradient-to-br from-blue-700 to-blue-800 rounded-2xl rounded-tr-sm px-4 py-2 shadow-md hover:shadow-lg transition-shadow duration-200">
                        <p className="text-white text-sm leading-relaxed">{msg.text}</p>

                        {/* Display attached files */}
                        {msg.files && msg.files.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {msg.files.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                                {getFileIcon(file.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-xs font-medium truncate">
                                    {file.name}
                                  </p>
                                  {/* <p className="text-white/70 text-xs">{formatFileSize(file.size)}</p> */}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* <span className="text-xs text-gray-400 mt-1 mr-1 block text-right">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span> */}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-start gap-2 animate-in slide-in-from-bottom-2 duration-300">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-lg">
                  N
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-3 shadow-md border border-gray-100">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Replies */}
            {messageList.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 mt-2 animate-in fade-in duration-500 delay-300">
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMessage(reply);
                      // setTimeout(handleMessageSend, 100);
                    }}
                    className="px-4 py-[5px] bg-white border border-blue-200 text-blue-700 rounded-full text-sm hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md">
                    {reply}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area with Glassmorphism */}
          <div className="p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200">
            {/* Attached Files Preview */}
            {/* {attachedFiles.length > 0 && (
                <div className="mb-3 space-y-2">
                  {attachedFiles.map(file => (
                    <div key={file.id} className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-3 py-2">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-violet-900 text-xs font-medium truncate">{file.name}</p>
                        <p className="text-violet-600 text-xs">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-violet-400 hover:text-violet-600 transition-colors p-1"
                        aria-label="Remove file">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )} */}

            <div className="flex items-center justify-end gap-2">
              {/* File Attachment Button */}
              <button
                type="button"
                className="text-gray-400 hover:bg-violet-50 rounded-xl p-2 transition-all duration-200 flex-shrink-0"
                aria-label="Attach file">
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="file"
                multiple
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />

              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-xl px-4 py-2 pr-4 border-[1px] border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent bg-white shadow-sm transition-all duration-200 text-sm placeholder:text-gray-400"
                />
              </div>

              <button
                type="button"
                onClick={handleMessageSend}
                // disabled={!message.trim() && attachedFiles.length === 0}
                className="bg-gradient-to-br from-blue-600 to-blue-900 text-white rounded-2xl p-3 hover:from-blue-700 hover:to-blue-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                aria-label="Send message">
                <SendHorizontal className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-2 text-center">Powered by Neo-Ji</p>
          </div>
        </div>
        // <div
        //   ref={portalRef}
        //   className="flex flex-col w-80 max-w-[90vw] h-[500px] max-h-[90vh] bg-white shadow-2xl rounded-xl overflow-hidden animate-fade-in">
        //   {/* Header */}
        //   <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
        //     <h3 className="font-semibold">Chat with us</h3>
        //     <button onClick={() => setOpen(false)} className="text-white text-xl font-bold">
        //       ×
        //     </button>
        //   </div>

        //   {/* <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        //     <div className="text-gray-500 text-sm">Your chat messages will appear here...</div>
        //   </div> */}

        //   {/* Chat Messages Area */}
        //   <div className="flex-1 p-5 pl-2 bg-gray-100 border border-gray-200 rounded-t-2xl mx-4 mt-2 overflow-y-auto no-scrollbar">
        //     <div className="flex-1 overflow-y-auto mb-4 space-y-2">

        //       {messageList.map((msg) => (
        //         <div
        //           key={msg.msgId}
        //           className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
        //           {/* User Message */}
        //           {msg.sender === 'me' ? (
        //             <div className="flex items-start gap-3 justify-end mb-6">
        //               <div>
        //                 <div className="bg-gray-500 rounded-2xl rounded-tr-none px-5 py-3 inline-block">
        //                   <p className="text-white">{msg.text}</p>
        //                 </div>
        //               </div>
        //             </div>
        //           ) : (
        //             <div className="flex items-start gap-3 mb-6">
        //               <div className="w-6 h-6 rounded-full bg-[#005994] flex items-center justify-center text-white text-xs flex-shrink-0">
        //                 N
        //               </div>
        //               <div>
        //                 <div className="bg-gray-200 rounded-2xl rounded-tl-none px-5 py-3 inline-block">
        //                   {/* <p className="text-gray-800"> {origin ==="sendMessage" && loading ?"Thinking...":msg.text}</p> */}
        //                   <p className="text-gray-800 text-sm">{msg.text}</p>
        //                 </div>
        //               </div>
        //             </div>
        //           )}
        //           <div ref={messagesEndRef} />
        //         </div>
        //       ))}
        //       {loading && (
        //         <div className="flex items-start gap-3 mb-6">
        //           <div className="w-6 h-6 rounded-full bg-[#005994] flex items-center justify-center text-white text-xs flex-shrink-0">
        //             N
        //           </div>
        //           <div>
        //             {/* <div className="font-semibold text-gray-900 mb-2">Neo-Ji</div> */}
        //             <div className="bg-gray-200 rounded-2xl rounded-tl-none px-5 py-3 inline-block">
        //               <p className="text-gray-800 animate-pulse">Thinking...</p>
        //             </div>
        //           </div>
        //         </div>
        //       )}
        //     </div>
        //   </div>

        //   {/* Input */}
        //   <div className="px-4 py-3 bg-gray-100 flex items-center gap-2">
        //     <input
        //       type="text"
        //       placeholder="Type your message..."
        //       value={message}
        //       onChange={(e) => setMessage(e.target.value)}
        //       onKeyDown={handleKeyDown}
        //       className="flex-1 rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        //     />
        //     <button
        //       type="button"
        //       onClick={handleMessageSend}
        //       className="bg-indigo-600 text-white rounded-full px-4 py-2 hover:bg-indigo-700 transition">
        //       Send
        //     </button>
        //   </div>
        // </div>
      )}

      {/* Floating Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(!open)}
          className="w-14 h-14 rounded-full overflow-hidden bg-white p-1 border border-gray-500 text-white shadow-lg flex items-center justify-center hover:scale-105 transition">
          <img className="overflow-hidden" src="https://storage.googleapis.com/neojichat_media/do_not_delete/call-agent.svg" />
        </button>
      )}
    </div>
  );
}

// // STEP 2: proxy chat request
// export function proxyChatRequest(token, message) {
//   console.log('📨 Server received token:', token);

//   if (token !== VALID_TOKEN) {
//     throw new Error('Unauthorized: invalid or expired token');
//   }

//   // Simulate real API call
//   return {
//     reply: `reply to: "${message}"`
//   };
// }
