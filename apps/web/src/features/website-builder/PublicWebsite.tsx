import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CleanLight } from './templates/CleanLight';
import { ProfessionalDark } from './templates/ProfessionalDark';
import { Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:8787/api/v1';

export const PublicWebsite = () => {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWebsiteData = async () => {
      try {
        const res = await fetch(`${API_URL}/public/website/${slug}`);
        if (!res.ok) throw new Error('Website not found');
        const json = await res.json();
        setData(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsiteData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">404</h1>
        <p>The website for "{slug}" could not be found.</p>
      </div>
    );
  }

  // Render the appropriate template based on theme config
  const template = data.theme?.template || 'clean-light';

  switch (template) {
    case 'professional-dark':
      return <ProfessionalDark data={data} />;
    case 'clean-light':
    default:
      return <CleanLight data={data} />;
  }
};

export default PublicWebsite;
