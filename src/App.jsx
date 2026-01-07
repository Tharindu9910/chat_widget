import { useEffect, useRef, useState } from "react";

export default function App({ apiKey="this is the apikey" }) {
  const [open, setOpen] = useState(false);
  const portalRef = useRef(null);

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
        <div  ref={portalRef} className="flex flex-col w-80 max-w-[90vw] h-[500px] max-h-[90vh] bg-white shadow-2xl rounded-xl overflow-hidden animate-fade-in">
          
          {/* Header */}
          <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-semibold">Chat with us</h3>
            <button onClick={() => setOpen(false)} className="text-white text-xl font-bold">
              ×
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="text-gray-500 text-sm">Your chat messages will appear here...</div>
          </div>
          
          {/* Input */}
          <div className="px-4 py-3 bg-gray-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button className="bg-indigo-600 text-white rounded-full px-4 py-2 hover:bg-indigo-700 transition">
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:scale-105 transition"
      >
        💬
      </button>
    </div>
  );
}