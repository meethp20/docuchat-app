import { useState } from "react";
export default function PdfUpload({onPdfText}:{onPdfText:(text:string)=>void}){
    const [loading,setLoading] = useState(false);
    const handleFileChange = async(e:React.ChangeEvent<HTMLInputElement>)=>{
        //Triggered when the user selects a PDF file
        const file =e.target.files?.[0];
        if(!file) return ;
        
        
        try {
              setLoading(true);
              const formData =new FormData();
              formData.append('pdf',file);
               const response = await fetch('/app/api/pdf',{
                method:'POST',
                body: formData,
               })
               const data= await response.json();
               onPdfText(data.text);
               // Call the onPdfText function with the extracted text
        }catch (error) {
            console.error('Error uploading PDF:', error);       
          alert('failed to extract text from pdf');
        
    }finally{
        setLoading(false);
    }
};

return(
    <div className="pdf-upload">
        <input
           type="file"
           accept=".pdf"
           onChange={handleFileChange}
           disabled={loading} />
           {loading && <p>Processing PDF ... </p>}
    </div>
)
}