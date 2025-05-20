'use client';


import AuthComponent from '../components/Auth';
import Chat from '../components/Chat';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <main>
      {user ? <Chat /> : <AuthComponent />}
      
      <style jsx>{`
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.5rem;
        }
      `}</style>
    </main>
  );
}