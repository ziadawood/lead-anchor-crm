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
import { Loader2 } from 'lucide-react';

export const PipelineBoard = () => {
  const { deals, isLoading, updateStage } = usePipeline();
  const [activeDeal, setActiveDeal] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Group deals by stage. In a real app, stages come from API. Here we deduce them or hardcode MVP stages.
  // We'll mock the default stages if the database isn't fully seeded yet.
  const stages = useMemo(() => {
    const defaultStages = [
      { id: 'stage-1', name: 'New Opportunity', position: 1 },
      { id: 'stage-2', name: 'Quote Sent', position: 2 },
      { id: 'stage-3', name: 'Deposit Paid', position: 3 },
      { id: 'stage-4', name: 'Completed', position: 4 }
    ];

    // If deals have real stages, merge them, otherwise use defaults
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
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pipeline</h2>
          <p className="text-slate-500">Manage your deals and active jobs.</p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors">
          + New Deal
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-[calc(100%-5rem)] overflow-x-auto pb-4">
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
