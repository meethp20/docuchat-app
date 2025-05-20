import { NextRequest,NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import * as pdfParse from "pdf-parse";
export async function POST(req:NextRequest){
    const session = await getSession()
    if(!session){
        return NextResponse.json({error:"unauthorized"},{status:401})
    }

    try{
         const formData= await req.formData();
        const pdfFile =formData.get('get') as File
      if(!pdfFile){
        return NextResponse.json({error:"No PDf File provided"},
            {status:400}
        );
      }
      const buffer = await pdfFile.arrayBuffer();
      const pdfData =await pdfParse(buffer);
      return NextResponse.json({text:pdfData.text});
    }catch(error){
        console.error("Error extracting text from PDF:",error);
        return NextResponse.json({error:"Failed to extract text from PDF"},{status:500});
    }
}