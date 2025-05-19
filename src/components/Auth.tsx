import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";

export default function AuthComponent(){
    return (
        <div className="auth-container">
            <h1 className="text-3xl font-bold mb-4">Welcome to DocuChat</h1>
            <p className="mb-4">Please sign in to continue.</p>
            <Auth
                supabaseClient={supabase}
                appearance={{
                    theme: ThemeSupa,
                    variables: {
                        default: {
                            colors: {
                                brand: "#3b82f6",
                                brandAccent: "#3b82f6",
                            },
                        },
                    },
                }}
                theme="dark"
                providers={["google"]}
                socialLayout="horizontal"
            />
            <Auth 
             supabaseClient={supabase}
             appearance={{theme: ThemeSupa}}
             providers={['github', 'google']}
             redirectTo={`${window.location.origin}/auth/callback`}
             socialLayout="vertical"
             />
             <style jsx>{
               ` auth-container{
                max-width:400px
                margin:0 auto 
                padding:40px 20px
               }
                        h1 {
          margin-bottom: 16px;
        }
        
        p {
          margin-bottom: 24px;
          color: #666;
        }
`
              }</style>
        </div>
    )
}