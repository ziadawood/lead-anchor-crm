import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Phone, MessageSquare, Globe } from 'lucide-react';

interface DealCardProps {
  deal: any;
}

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'ghost_lead':
    case 'call': return <Phone className="w-3 h-3 text-red-400" />;
    case 'chat': return <MessageSquare className="w-3 h-3 text-blue-400" />;
    case 'website': return <Globe className="w-3 h-3 text-emerald-400" />;
    default: return null;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high': return 'badge-red';
    case 'medium': return 'badge-amber';
    case 'low': return 'badge-slate';
    default: return 'badge-slate';
  }
};

export const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id, data: { type: 'Deal', deal } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={{ ...style, background: 'rgba(59,130,246,0.05)' }}
        className="h-28 border-2 border-dashed border-blue-500/30 rounded-xl opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="deal-card"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-slate-200 text-sm truncate pr-2">
          {deal.contact?.first_name} {deal.contact?.last_name}
        </h4>
        <span className={`badge text-[10px] ${getPriorityBadge(deal.priority)}`}>
          {deal.priority}
        </span>
      </div>
      
      <div className="text-xs text-slate-400 mb-3 truncate">
        {deal.title}
      </div>

      <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid rgba(148,163,184,0.06)' }}>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{new Date(deal.created_at).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {getSourceIcon(deal.source)}
          {deal.value && (
            <span className="font-semibold text-sm text-emerald-400">
              ${deal.value.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
