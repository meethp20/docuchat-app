import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import pdfParse from "pdf-parse";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
    // Try to get session but continue if it fails
    try {
        // We don't need the session result, but we still want to attempt authentication
        await getSession();
    } catch (error) {
        console.warn("Could not get session for PDF extraction, continuing without authentication", error);
    }

    try {
        console.log("Processing PDF upload request");
        const formData = await req.formData();
        const pdfFile = formData.get('pdf') as File;

        if (!pdfFile) {
            console.error("No PDF file provided");
            return NextResponse.json(
                { error: "No PDF file provided" },
                { status: 400 }
            );
        }

        console.log(`Received file: ${pdfFile.name}, type: ${pdfFile.type}, size: ${pdfFile.size} bytes`);

        // Validate file type - be more lenient with type checking
        if (pdfFile.type !== 'application/pdf' && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
            console.error(`Invalid file type: ${pdfFile.type}`);
            return NextResponse.json(
                { error: `Invalid file type: ${pdfFile.type}. Please upload a PDF file` },
                { status: 400 }
            );
        }

        // Validate file size
        if (pdfFile.size > MAX_FILE_SIZE) {
            console.error(`File too large: ${pdfFile.size} bytes`);
            return NextResponse.json(
                { error: `File size too large: ${pdfFile.size} bytes. Maximum size is 10MB` },
                { status: 400 }
            );
        }

        console.log("Converting file to array buffer");
        const buffer = await pdfFile.arrayBuffer();
        console.log(`Buffer size: ${buffer.byteLength} bytes`);
        
        console.log("Parsing PDF");
        const pdfData = await pdfParse(new Uint8Array(buffer));

        if (!pdfData || !pdfData.text) {
            console.error("Could not extract text from PDF");
            return NextResponse.json(
                { error: "Could not extract text from PDF" },
                { status: 400 }
            );
        }

        console.log(`Successfully extracted ${pdfData.text.length} characters from PDF`);
        return NextResponse.json({ 
            text: pdfData.text,
            info: {
                pages: pdfData.numpages,
                metadata: pdfData.metadata ? JSON.stringify(pdfData.metadata) : null
            }
        });
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : "No stack trace";
        
        return NextResponse.json(
            { 
                error: "Failed to process PDF file", 
                details: errorMessage,
                stack: errorStack
            },
            { status: 500 }
        );
    }
}