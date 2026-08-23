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
    data: {
      type: 'Column',
      stage,
    },
  });

  const dealIds = deals.map((d) => d.id);
  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);

  return (
    <div className="flex flex-col flex-shrink-0 w-80 bg-slate-100 rounded-2xl p-3 max-h-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bold text-slate-800">{stage.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
            {deals.length}
          </span>
          <span className="text-xs font-medium text-slate-600">
            ${totalValue.toLocaleString()}
          </span>
        </div>
      </div>

      <div 
        ref={setNodeRef} 
        className={`flex-1 overflow-y-auto min-h-[150px] transition-colors rounded-xl p-1 ${
          isOver ? 'bg-slate-200/50 ring-2 ring-primary/20' : ''
        }`}
      >
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>
        
        {deals.length === 0 && (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl m-1 opacity-50">
            <span className="text-sm font-medium text-slate-400">Drop deals here</span>
          </div>
        )}
      </div>
    </div>
  );
};
