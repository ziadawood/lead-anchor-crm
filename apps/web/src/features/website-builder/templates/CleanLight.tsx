import React from 'react';
import { Phone, CheckCircle, MapPin, Clock } from 'lucide-react';
import ChatWidget from '../../chat-widget/ChatWidget';

export const CleanLight = ({ data }: { data: any }) => {
  const { primaryColor } = data.theme;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: primaryColor }}>
            {data.companyName}
          </h1>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
              <a href="#services" className="hover:text-slate-900 transition-colors">Services</a>
              <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
            </nav>
            <a 
              href={`tel:${data.phone}`}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-full font-medium transition-transform hover:scale-105 shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{data.phone}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white py-24 px-6 text-center border-b border-slate-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            {data.heroTitle}
          </h2>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            {data.heroSubtitle}
          </p>
          <button 
            className="text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-transform hover:-translate-y-1"
            style={{ backgroundColor: primaryColor }}
          >
            Get a Free Quote
          </button>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-16">Our Services</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.services.map((service: string, i: number) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg mb-2">{service}</h4>
              <p className="text-slate-500 text-sm">Professional and reliable service you can count on.</p>
            </div>
          ))}
        </div>
      </section>

      {/* Info Bar */}
      <section className="bg-slate-900 text-slate-300 py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-3">
            <MapPin className="w-6 h-6 text-slate-400" />
            <h4 className="text-white font-bold">Location</h4>
            <p>{data.address}</p>
          </div>
          <div className="flex flex-col items-center md:items-start gap-3">
            <Clock className="w-6 h-6 text-slate-400" />
            <h4 className="text-white font-bold">Hours</h4>
            <p>{data.hours}</p>
          </div>
          <div className="flex flex-col items-center md:items-start gap-3">
            <Phone className="w-6 h-6 text-slate-400" />
            <h4 className="text-white font-bold">Contact</h4>
            <p>{data.phone}</p>
          </div>
        </div>
      </section>

      {/* Embedded Chat Widget for Public Site */}
      <ChatWidget />
    </div>
  );
};
