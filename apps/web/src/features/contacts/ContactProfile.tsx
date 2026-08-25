import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContactProfile } from './use-contacts';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Clock, MessageSquare } from 'lucide-react';

export const ContactProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, isLoading } = useContactProfile(id);

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center text-red-400">Contact not found.</div>;

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'sms': return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'ghost_lead': return <Phone className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col gap-6 animate-fade-in-up">
      <button 
        onClick={() => navigate('/contacts')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-200 transition-colors w-fit font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </button>

      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Profile Card */}
        <div className="col-span-1 glass rounded-2xl p-6 h-fit">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.2))', color: '#60a5fa' }}
          >
            {profile.first_name[0]}{profile.last_name[0]}
          </div>
          <h2 className="text-xl font-bold text-white text-center mb-6">
            {profile.first_name} {profile.last_name}
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <Phone className="w-4 h-4 text-slate-500" />
              <span>{profile.phone}</span>
            </div>
            {profile.email && (
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>{profile.email}</span>
              </div>
            )}
            {profile.address && (
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{profile.address}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-slate-500 text-sm pt-4" style={{ borderTop: '1px solid rgba(148,163,184,0.06)' }}>
              <Calendar className="w-4 h-4" />
              <span>Added {new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="col-span-2 glass rounded-2xl flex flex-col overflow-hidden">
          <div className="p-5" style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
            <h3 className="text-lg font-bold text-white">Activity Timeline</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="relative ml-4 space-y-6" style={{ borderLeft: '2px solid rgba(148,163,184,0.08)' }}>
              {profile.interactions?.map((interaction: any) => (
                <div key={interaction.id} className="relative pl-6">
                  <div className="absolute -left-[21px] top-1 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.1)' }}
                  >
                    {getInteractionIcon(interaction.type)}
                  </div>
                  <div className="glass-light rounded-xl p-4">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-slate-200 text-sm capitalize">
                        {interaction.type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {new Date(interaction.created_at).toLocaleString()}
                      </span>
                    </div>
                    {interaction.metadata?.summary && (
                      <p className="text-sm text-slate-400 mt-2">{interaction.metadata.summary}</p>
                    )}
                    {interaction.metadata?.duration && (
                      <p className="text-xs text-slate-500 mt-2">Duration: {interaction.metadata.duration}s</p>
                    )}
                  </div>
                </div>
              ))}
              {(!profile.interactions || profile.interactions.length === 0) && (
                <div className="pl-6 text-slate-500 text-sm">No activity recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactProfile;
