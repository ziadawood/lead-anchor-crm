import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContacts } from './use-contacts';
import { Search, Filter, Phone, Mail, Loader2, UserPlus } from 'lucide-react';

export const ContactsPage = () => {
  const { contacts, isLoading } = useContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredContacts = contacts.filter((c: any) => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col animate-fade-in-up">
      <div className="mb-6 flex justify-between items-end page-header">
        <div>
          <h2>Contacts</h2>
          <p>Manage your customers and leads.</p>
        </div>
        <button className="btn-primary">
          <UserPlus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex gap-3" style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              className="dark-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : filteredContacts.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Source</th>
                  <th className="text-right">Tags</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact: any) => (
                  <tr 
                    key={contact.id} 
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                    className="cursor-pointer"
                  >
                    <td>
                      <span className="font-semibold text-slate-200">
                        {contact.first_name} {contact.last_name}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Phone className="w-3.5 h-3.5" />
                        {contact.phone || '—'}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Mail className="w-3.5 h-3.5" />
                        {contact.email || '—'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-slate text-[10px]">
                        {contact.source || 'Manual'}
                      </span>
                    </td>
                    <td className="text-right">
                      {contact.tags?.map((tag: string) => (
                        <span key={tag} className="badge badge-blue text-[10px] ml-1">
                          {tag}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <p className="font-medium">No contacts found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
