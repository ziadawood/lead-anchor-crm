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
    <div className="max-w-4xl mx-auto flex flex-col h-full animate-fade-in-up">
      <div className="mb-6 flex justify-between items-end page-header">
        <div>
          <h2>Website Builder</h2>
          <p>Configure your public-facing, AI-powered website.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving || !slug}
          className="btn-primary disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <h4 className="font-semibold text-emerald-300 text-sm">Website updated successfully!</h4>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="glass p-6 rounded-xl">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400"/>
              Domain Settings
            </h3>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Website URL Slug</label>
              <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(148,163,184,0.12)' }}>
                <span className="inline-flex items-center px-3 text-xs text-slate-500" style={{ background: 'rgba(15,23,42,0.6)' }}>
                  /site/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1 block w-full px-3 py-2.5 text-sm text-slate-200 outline-none focus:ring-0"
                  style={{ background: 'rgba(15,23,42,0.4)' }}
                  placeholder="my-plumbing-biz"
                />
              </div>
              <p className="text-[11px] text-slate-600 mt-2">Only lowercase letters, numbers, and hyphens.</p>
            </div>

            {slug && (
              <a 
                href={`/site/${slug}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-400 text-xs font-medium flex items-center gap-1 hover:text-blue-300 transition-colors"
              >
                View live site <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="glass p-6 rounded-xl">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-400"/>
              Theme Settings
            </h3>
            
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-400 mb-2">Template</label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className={`rounded-xl p-3 cursor-pointer transition-all ${template === 'clean-light' ? '' : ''}`}
                  style={{
                    border: template === 'clean-light' ? '2px solid rgba(59,130,246,0.4)' : '2px solid rgba(148,163,184,0.08)',
                    background: template === 'clean-light' ? 'rgba(59,130,246,0.05)' : 'transparent',
                  }}
                  onClick={() => setTemplate('clean-light')}
                >
                  <div className="h-14 rounded-lg mb-2 flex items-center justify-center" style={{ background: 'rgba(248,250,252,0.05)', border: '1px solid rgba(148,163,184,0.06)' }}>
                    <span className="text-[10px] text-slate-500 font-medium">Clean Light</span>
                  </div>
                  <p className="text-xs font-medium text-slate-300 text-center">Modern & Minimal</p>
                </div>
                
                <div 
                  className={`rounded-xl p-3 cursor-pointer transition-all`}
                  style={{
                    border: template === 'professional-dark' ? '2px solid rgba(59,130,246,0.4)' : '2px solid rgba(148,163,184,0.08)',
                    background: template === 'professional-dark' ? 'rgba(59,130,246,0.05)' : 'transparent',
                  }}
                  onClick={() => setTemplate('professional-dark')}
                >
                  <div className="h-14 rounded-lg mb-2 flex items-center justify-center" style={{ background: 'rgba(15,23,42,0.8)' }}>
                    <span className="text-[10px] text-slate-600 font-medium">Dark Mode</span>
                  </div>
                  <p className="text-xs font-medium text-slate-300 text-center">Bold & High Contrast</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Brand Primary Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 p-1 rounded-lg cursor-pointer"
                  style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.12)' }}
                />
                <input 
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="dark-input w-24 text-sm"
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
