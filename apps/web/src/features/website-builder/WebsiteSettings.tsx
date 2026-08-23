import React, { useState } from 'react';
import { useAuth } from '../auth/use-auth';
import { Globe, Palette, Save, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const WebsiteSettings = () => {
  const { session } = useAuth();
  const tenantId = session?.user?.app_metadata?.tenant_id;
  
  const [slug, setSlug] = useState('');
  const [template, setTemplate] = useState('clean-light');
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9');
  
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // In a real app, you'd fetch the current tenant's settings on load
  // For the MVP, we assume they are setting it for the first time

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess(false);
    
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          slug,
          theme_config: { template, primaryColor }
        })
        .eq('id', tenantId);

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save website settings:', err.message);
      alert('Error saving settings. Note: Slug must be unique.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Website Builder</h2>
          <p className="text-slate-500">Configure your public-facing, AI-powered website.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving || !slug}
          className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <h4 className="font-semibold">Website updated successfully!</h4>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-slate-400"/> Domain Settings</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Website URL Slug</label>
              <div className="flex shadow-sm rounded-lg overflow-hidden border border-slate-300">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
                  localhost:5173/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1 block w-full px-3 py-2 sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="my-plumbing-biz"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Only lowercase letters, numbers, and hyphens.</p>
            </div>

            {slug && (
              <a 
                href={`/${slug}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"
              >
                View live site <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="glass p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Palette className="w-5 h-5 text-slate-400"/> Theme Settings</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Template</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${template === 'clean-light' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  onClick={() => setTemplate('clean-light')}
                >
                  <div className="h-16 bg-slate-50 rounded mb-2 border border-slate-100 flex items-center justify-center">
                    <span className="text-xs text-slate-400 font-medium">Clean Light</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 text-center">Modern & Minimal</p>
                </div>
                
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${template === 'professional-dark' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  onClick={() => setTemplate('professional-dark')}
                >
                  <div className="h-16 bg-slate-900 rounded mb-2 flex items-center justify-center">
                    <span className="text-xs text-slate-500 font-medium">Dark Mode</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 text-center">Bold & High Contrast</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Brand Primary Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 p-1 rounded border border-slate-200 cursor-pointer"
                />
                <input 
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="block w-24 px-3 py-2 border border-slate-300 rounded-lg sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteSettings;
