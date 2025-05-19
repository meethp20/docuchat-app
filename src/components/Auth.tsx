import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";

export default function AuthComponent(){
    return (
        <div className="auth-container">
            <Auth 
             supabaseClient={supabase}
             appearance={{theme: ThemeSupa}}
             providers={['github', 'google', 'apple']}
             />
             <style jsx>{
               ` auth-container{
                max-width:400px
                margin:0 auto 
                padding:40px 20px
               }
                
               `
              }</style>
        </div>
    )
}