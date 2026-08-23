import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Phone, MessageSquare, Globe } from 'lucide-react';

interface DealCardProps {
  deal: any; // We'll refine typing later
}

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'ghost_lead':
    case 'call': return <Phone className="w-3 h-3 text-red-500" />;
    case 'chat': return <MessageSquare className="w-3 h-3 text-blue-500" />;
    case 'website': return <Globe className="w-3 h-3 text-emerald-500" />;
    default: return null;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-700 border-red-200';
    case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'low': return 'bg-slate-100 text-slate-700 border-slate-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
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
        style={style} 
        className="h-28 border-2 border-dashed border-primary rounded-xl bg-blue-50 opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing mb-3 group"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-slate-900 truncate pr-2">
          {deal.contact?.first_name} {deal.contact?.last_name}
        </h4>
        <div className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(deal.priority)}`}>
          {deal.priority}
        </div>
      </div>
      
      <div className="text-sm text-slate-600 mb-3 truncate">
        {deal.title}
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{new Date(deal.created_at).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {getSourceIcon(deal.source)}
          {deal.value && (
            <span className="font-semibold text-slate-700">
              ${deal.value.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
