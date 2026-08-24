import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Supabase automatically parses the URL hash containing the access token
      // and sets the session during this callback.
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        // Successful login/reset -> navigate to dashboard
        navigate('/pipeline', { replace: true });
      } else {
        // No session found -> redirect to login
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center text-red-600">
          <p className="font-bold">Authentication Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="flex flex-col items-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-slate-800">Authenticating...</h2>
      </div>
    </div>
  );
};

export default AuthCallback;
