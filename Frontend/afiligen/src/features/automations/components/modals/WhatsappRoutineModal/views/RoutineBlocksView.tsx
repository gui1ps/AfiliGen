import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  getOneWhatsappRoutine,
  createBlock,
  updateBlock,
  removeBlock,
  Block,
} from '../../../../../../services/automations/routines/whatsapp/whatsapp-routines';

import { BlocksStack } from '../../../data-display/BlobksStack';

interface Props {
  routineId: number;
}

export function RoutineBlocksView({ routineId }: Props) {
  const [blocks, setBlocks] = useState<Block[]>([]);

  const load = async () => {
    const routine = await getOneWhatsappRoutine(routineId);
    setBlocks(routine?.chatAppMessageBlock ?? []);
  };

  useEffect(() => {
    load();
  }, [routineId]);

  const handleCreate = async (block: { triggerTime: string }) => {
    try {
      await createBlock({ ...block, routineId });
      await load();
      toast.success('Bloco criado!');
    } catch {
      toast.error('Erro ao criar bloco.');
    }
  };

  const handleDelete = async (blockId: number) => {
    try {
      await removeBlock(blockId);
      await load();
      toast.success('Bloco removido!');
    } catch {
      toast.error('Erro ao remover bloco.');
    }
  };

  const handleUpdateTime = async (blockId: number, triggerTime: string) => {
    try {
      await updateBlock(blockId, { triggerTime });
      await load();
      toast.success('Horário atualizado!');
    } catch {
      toast.error('Erro ao atualizar horário.');
    }
  };

  return (
    <BlocksStack
      blocks={blocks}
      onCreateBlock={handleCreate}
      onDeleteBlock={handleDelete}
      onUpdateBlockTime={handleUpdateTime}
    />
  );
}
