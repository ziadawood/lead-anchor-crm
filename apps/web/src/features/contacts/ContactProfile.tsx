import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { useContactProfile } from './use-contacts';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Clock, MessageSquare } from 'lucide-react';

export const ContactProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, isLoading } = useContactProfile(id);

  if (isLoading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center text-red-500">Contact not found.</div>;

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'sms': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'ghost_lead': return <Phone className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-6">
      <button 
        onClick={() => navigate('/contacts')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors w-fit font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </button>

      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: Profile Card */}
        <div className="col-span-1 glass rounded-2xl p-6 shadow-sm h-fit">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
            {profile.first_name[0]}{profile.last_name[0]}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
            {profile.first_name} {profile.last_name}
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="w-5 h-5 text-slate-400" />
              <span>{profile.phone}</span>
            </div>
            {profile.email && (
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-5 h-5 text-slate-400" />
                <span>{profile.email}</span>
              </div>
            )}
            {profile.address && (
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin className="w-5 h-5 text-slate-400" />
                <span>{profile.address}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-slate-600 pt-4 border-t border-slate-100">
              <Calendar className="w-5 h-5 text-slate-400" />
              <span>Added {new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="col-span-2 glass rounded-2xl flex flex-col shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-white/50">
            <h3 className="text-lg font-bold text-slate-900">Activity Timeline</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
              {profile.interactions?.map((interaction: any) => (
                <div key={interaction.id} className="relative pl-6">
                  <div className="absolute -left-[21px] top-1 w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                    {getInteractionIcon(interaction.type)}
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-slate-800 capitalize">
                        {interaction.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(interaction.created_at).toLocaleString()}
                      </span>
                    </div>
                    {interaction.metadata?.summary && (
                      <p className="text-sm text-slate-600 mt-2">{interaction.metadata.summary}</p>
                    )}
                    {interaction.metadata?.duration && (
                      <p className="text-xs text-slate-400 mt-2">Duration: {interaction.metadata.duration}s</p>
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
