import React from 'react';
import { Phone, Shield, Wrench, Zap } from 'lucide-react';
import ChatWidget from '../../chat-widget/ChatWidget';

export const ProfessionalDark = ({ data }: { data: any }) => {
  const { primaryColor } = data.theme;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
            {data.companyName}
          </h1>
          <a 
            href={`tel:${data.phone}`}
            className="flex items-center gap-2 text-slate-950 px-6 py-3 rounded font-bold transition-transform hover:scale-105"
            style={{ backgroundColor: primaryColor }}
          >
            <Phone className="w-5 h-5" />
            <span className="hidden sm:inline">{data.phone}</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-32 px-6 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-slate-950 to-slate-950"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-sm font-medium mb-8" style={{ color: primaryColor }}>
            <Zap className="w-4 h-4" /> 24/7 Emergency Response
          </div>
          <h2 className="text-6xl font-black tracking-tighter text-white mb-8 leading-[1.1]">
            {data.heroTitle}
          </h2>
          <p className="text-2xl text-slate-400 mb-10 max-w-2xl font-light">
            {data.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              className="text-slate-950 px-8 py-4 rounded font-black text-lg uppercase tracking-wide transition-all hover:brightness-110"
              style={{ backgroundColor: primaryColor }}
            >
              Request Service
            </button>
            <button className="text-white px-8 py-4 rounded font-bold text-lg uppercase tracking-wide border border-slate-700 hover:bg-slate-800 transition-colors">
              Our Services
            </button>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-slate-900 border-b border-slate-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center sm:justify-between items-center gap-8">
          <div className="flex items-center gap-3 text-white font-bold">
            <Shield className="w-8 h-8" style={{ color: primaryColor }}/> Fully Licensed & Insured
          </div>
          <div className="flex items-center gap-3 text-white font-bold">
            <Wrench className="w-8 h-8" style={{ color: primaryColor }}/> Expert Technicians
          </div>
          <div className="flex items-center gap-3 text-white font-bold">
            <Clock className="w-8 h-8" style={{ color: primaryColor }}/> {data.hours}
          </div>
        </div>
      </section>

      {/* Embedded Chat Widget for Public Site */}
      <ChatWidget />
    </div>
  );
};

// Simple Clock icon since it wasn't imported from lucide-react above
const Clock = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
