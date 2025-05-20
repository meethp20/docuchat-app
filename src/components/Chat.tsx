import { useState ,useRef,useEffect} from "react";
import PdfUpload from "./PdfUpload";
import { useAuth } from "@/contexts/AuthContext";
export default function Chat(){
    const [message,setMessage]=useState("");
    const [input,setInput] = useState("");
    const[pdfText,setPdfText] = useState<string|null>(null);
    const[chatId,setChatId] =useState<string|null>(null);
    const [loading,setLoading]=useState(false);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const {user,signOut} = useAuth();
}