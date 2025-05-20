import { useState ,useRef,useEffect} from "react";
import PdfUpload from "./PdfUpload";
import { useAuth } from "@/contexts/AuthContext";
import { FaSignOutAlt } from "react-icons/fa";

type Message = { role: string; content: string };

export default function Chat(){
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [pdfText, setPdfText] = useState<string | null>(null);
    const [chatId, setChatId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const { signOut } = useAuth();


    useEffect(()=>{
    messageEndRef.current?.scrollIntoView({behavior:'smooth'})
},[messages])

const handleSubmit = async(e:React.FormEvent)=>{
   e.preventDefault();
   if(!input.trim())return;

   const userMessage = input;
   setInput('');
   setMessages(prev=>[...prev,{role:'user',content: userMessage}]);

   try{
    setLoading(true);
    const response =await fetch('/api/chat',{
       method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          chatId,
          pdfText
        }),
    })
    const data = await response.json();
    if(response.ok){
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        if(!chatId && data.chatId){
            setChatId(data.chatId);
        }
    }else{
        console.log('error',data.error);
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error processing your request.'}]);
    }
   }catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request.' 
      }]);
    } finally {
      setLoading(false);
    }
  };
 
  const handlePdfText = (text:string)=>{
    if (!text) {
        setMessages(prev => [...prev, {
            role: 'system',
            content: 'Failed to process PDF. Please try again.'
        }]);
        return;
    }
    setPdfText(text);
    // Truncate the PDF text for the success message to show a preview (not used currently)
    // const previewText = text.length > 100 ? `${text.substring(0, 100)}...` : text;
    setMessages(prev => [...prev, {
        role: 'system',
        content: `PDF uploaded and processed successfully! (${text.length} characters extracted)`
    }]);
    
    // Provide a helpful prompt to the user
    setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'You can now ask questions about the PDF content. What would you like to know?'
    }]);
  };
  return (
    <div className="chat-outer">
      <header className="chat-header">
        <span className="chat-title">PDF Chatbot</span>
        <button onClick={signOut} className="sign-out">
          <FaSignOutAlt /> Sign Out
        </button>
      </header>
      <div className="chat-container">
        <PdfUpload onPdfText={handlePdfText} />
        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          {loading && <div className="message assistant loading">Thinking...</div>}
          <div ref={messageEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the PDF or anything else..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>Send</button>
        </form>
      </div>
      <style jsx>{`
        .chat-outer {
          min-height: 100vh;
          background: #181818;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .chat-header {
          width: 100%;
          max-width: 600px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          color: #fff;
        }
        .chat-title {
          font-size: 1.5rem;
          font-weight: bold;
        }
        .sign-out {
          background: #f44336;
          color: #fff;
          border: none;
          border-radius: 5px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .chat-container {
          background: #222;
          border-radius: 12px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.2);
          padding: 2rem;
          max-width: 600px;
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .messages {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 1rem;
          background: #111;
          border-radius: 8px;
          padding: 1rem;
          min-height: 200px;
        }
        .message {
          margin-bottom: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 16px;
          max-width: 80%;
        }
        .user {
          background: #3b82f6;
          color: #fff;
          align-self: flex-end;
        }
        .assistant {
          background: #f1f1f1;
          color: #222;
          align-self: flex-start;
        }
        .system {
          background: #fffde7;
          color: #666;
          align-self: center;
          font-style: italic;
        }
        .input-form {
          display: flex;
          gap: 0.5rem;
        }
        input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #333;
          border-radius: 8px;
          background: #181818;
          color: #fff;
        }
        button {
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        button:disabled {
          background: #cccccc;
        }
        @media (max-width: 700px) {
          .chat-container, .chat-header {
            max-width: 98vw;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
