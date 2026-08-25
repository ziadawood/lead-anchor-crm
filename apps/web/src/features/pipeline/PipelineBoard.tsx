import React, { useMemo, useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { PipelineColumn } from './PipelineColumn';
import { DealCard } from './DealCard';
import { usePipeline } from './use-pipeline';
import { Loader2, Plus } from 'lucide-react';

export const PipelineBoard = () => {
  const { deals, isLoading, updateStage } = usePipeline();
  const [activeDeal, setActiveDeal] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const stages = useMemo(() => {
    const defaultStages = [
      { id: 'stage-1', name: 'New Opportunity', position: 1 },
      { id: 'stage-2', name: 'Quote Sent', position: 2 },
      { id: 'stage-3', name: 'Deposit Paid', position: 3 },
      { id: 'stage-4', name: 'Completed', position: 4 }
    ];

    const dbStages = new Map();
    deals.forEach((d: any) => {
      if (d.stage && !dbStages.has(d.stage.id)) {
        dbStages.set(d.stage.id, d.stage);
      }
    });

    return dbStages.size > 0 ? Array.from(dbStages.values()).sort((a, b) => a.position - b.position) : defaultStages;
  }, [deals]);

  const columns = useMemo(() => {
    return stages.map(stage => ({
      ...stage,
      deals: deals.filter((d: any) => d.stage_id === stage.id || (stage.id === 'stage-1' && !d.stage_id))
    }));
  }, [deals, stages]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'Deal') {
      setActiveDeal(active.data.current.deal);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    const isOverColumn = over.data.current?.type === 'Column';
    const isOverDeal = over.data.current?.type === 'Deal';

    let targetStageId: string | null = null;
    if (isOverColumn) targetStageId = over.id as string;
    if (isOverDeal) targetStageId = over.data.current?.deal.stage_id;

    const activeDeal = active.data.current?.deal;
    if (targetStageId && activeDeal && activeDeal.stage_id !== targetStageId) {
      updateStage({ dealId, stageId: targetStageId });
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] animate-fade-in-up">
      <div className="mb-6 flex justify-between items-end page-header">
        <div>
          <h2>Pipeline</h2>
          <p>Manage your deals and active jobs.</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          New Deal
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-[calc(100%-5rem)] overflow-x-auto pb-4">
          {columns.map(col => (
            <PipelineColumn key={col.id} stage={col} deals={col.deals} />
          ))}
        </div>

        <DragOverlay>
          {activeDeal ? <DealCard deal={activeDeal} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default PipelineBoard;
