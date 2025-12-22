import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  getOneWhatsappRoutine,
  createBlock,
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

  return <BlocksStack blocks={blocks} onCreateBlock={handleCreate} />;
}
