import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DealCard } from './DealCard';

interface PipelineColumnProps {
  stage: { id: string; name: string; position: number };
  deals: any[];
}

export const PipelineColumn: React.FC<PipelineColumnProps> = ({ stage, deals }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: 'Column', stage },
  });

  const dealIds = deals.map((d) => d.id);
  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);

  return (
    <div className="pipeline-column">
      <div className="pipeline-column-header">
        <h3>{stage.name}</h3>
        <div className="flex items-center gap-2">
          <span className="badge badge-slate text-[10px]">
            {deals.length}
          </span>
          <span className="text-xs font-medium text-slate-500">
            ${totalValue.toLocaleString()}
          </span>
        </div>
      </div>

      <div 
        ref={setNodeRef} 
        className={`flex-1 overflow-y-auto min-h-[150px] transition-all rounded-xl p-1 ${
          isOver ? 'ring-2 ring-blue-500/20' : ''
        }`}
        style={isOver ? { background: 'rgba(59,130,246,0.04)' } : {}}
      >
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>
        
        {deals.length === 0 && (
          <div className="h-full flex items-center justify-center border-2 border-dashed rounded-xl m-1 opacity-40" style={{ borderColor: 'rgba(148,163,184,0.15)' }}>
            <span className="text-sm font-medium text-slate-500">Drop deals here</span>
          </div>
        )}
      </div>
    </div>
  );
};
