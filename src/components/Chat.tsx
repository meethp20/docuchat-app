import { useState ,useRef,useEffect} from "react";
import PdfUpload from "./PdfUpload";
import { useAuth } from "@/contexts/AuthContext";
import { Content } from "next/font/google";
type Message = { role: string; content: string };

export default function Chat(){
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [pdfText, setPdfText] = useState<string | null>(null);
    const [chatId, setChatId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const { user, signOut } = useAuth();


    useEffect(()=>{
    messageEndRef.current?.scrollIntoView({behavior:'smooth'})
},[messages])

const handleSubmit = async(e:React.FormEvent)=>{
   e.preventDefault();
   if(!input.trim())return;

   const userMessage = input;
   setInput(' ');
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
    setPdfText(text);
    setMessages(prev =>[...prev,{
        role:'system',
        content:'PDf uploaded and processed successfully!!'
    }]);
  };
  return (
    <div className="chat-container">
      <div className="header">
        <h1>PDF Chatbot</h1>
        <button onClick={signOut} className="sign-out">Sign Out</button>
      </div>
      
      <PdfUpload onPdfText={handlePdfText} />
      
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="message assistant loading">Thinking...</div>}
        <div ref={messagesEndRef} />
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
      
      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
          background: #f9f9f9;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        
        .message {
          padding: 10px 15px;
          border-radius: 10px;
          margin-bottom: 10px;
          max-width: 80%;
        }
        
        .user {
          background: #e1f5fe;
          align-self: flex-end;
          margin-left: auto;
        }
        
        .assistant {
          background: #f1f1f1;
          align-self: flex-start;
        }
        
        .system {
          background: #fffde7;
          align-self: center;
          font-style: italic;
        }
        
        .input-form {
          display: flex;
          gap: 10px;
        }
        
        input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        
        button {
          padding: 10px 20px;
          background: #4285f4;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        
        button:disabled {
          background: #cccccc;
        }
        
        .sign-out {
          background: #f44336;
        }
      `}</style>
    </div>
  );
}
