import type { Metadata } from "next";

import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DocuChat',
  description: 'Chat with your PDFs using Gemini API',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}