import { useState, useRef } from "react";
import { FaFilePdf, FaUpload, FaSpinner } from "react-icons/fa";

export default function PdfUpload({onPdfText}:{onPdfText:(text:string)=>void}){
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleFileChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
        // Reset states
        setError(null);
        
        // Triggered when the user selects a PDF file
        const file = e.target.files?.[0];
        if(!file) return;
        
        setFileName(file.name);
        
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('pdf', file);
            
            console.log('Uploading PDF:', file.name);
            const response = await fetch('/api/extract-pdf', {
                method: 'POST',
                body: formData,
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (!response.ok) {
                throw new Error(data.error || data.details || 'Failed to process PDF');
            }
            
            if (!data.text) {
                throw new Error('No text was extracted from the PDF');
            }
            
            console.log(`Successfully extracted ${data.text.length} characters`);
            onPdfText(data.text);
            // Call the onPdfText function with the extracted text
        } catch (error) {
            console.error('Error uploading PDF:', error);
            setError(typeof error === 'object' && error !== null && 'message' in error 
                ? (error as Error).message 
                : 'Failed to extract text from PDF');
        } finally {
            setLoading(false);
        }
    };
    
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return(
        <div className="pdf-upload-container">
            <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={loading}
                ref={fileInputRef}
                className="hidden-file-input"
                style={{ display: 'none' }}
            />
            
            <div className="upload-button-container">
                <button 
                    onClick={triggerFileInput} 
                    disabled={loading}
                    className="upload-button"
                >
                    {loading ? (
                        <FaSpinner className="spinner" />
                    ) : fileName ? (
                        <>
                            <FaFilePdf /> {fileName.length > 20 ? `${fileName.substring(0, 20)}...` : fileName}
                        </>
                    ) : (
                        <>
                            <FaUpload /> Upload PDF
                        </>
                    )}
                </button>
                
                {loading && <p className="processing-text">Processing PDF...</p>}
                {error && <p className="error-text">{error}</p>}
            </div>
            
            <style jsx>{`
                .pdf-upload-container {
                    margin-bottom: 1.5rem;
                    width: 100%;
                }
                
                .upload-button-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .upload-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background-color: #3b82f6;
                    color: white;
                    padding: 10px 16px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    font-weight: 500;
                }
                
                .upload-button:hover {
                    background-color: #2563eb;
                }
                
                .upload-button:disabled {
                    background-color: #9ca3af;
                    cursor: not-allowed;
                }
                
                .processing-text {
                    margin-top: 8px;
                    color: #60a5fa;
                    font-style: italic;
                }
                
                .error-text {
                    margin-top: 8px;
                    color: #ef4444;
                    font-size: 0.875rem;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .spinner {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}