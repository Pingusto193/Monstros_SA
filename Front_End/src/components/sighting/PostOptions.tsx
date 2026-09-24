import { FileText, Link2, Trash, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ActionSheet, type SheetAction } from '@/components/ui/ActionSheet';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDeleteSighting } from '@/hooks/queries/useSightings';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Sighting } from '@/types';
import { paths } from '@/utils/routes';
import { absoluteUrl, copyToClipboard } from '@/utils/share';

interface PostOptionsProps {
  sighting: Sighting;
  open: boolean;
  onClose: () => void;
  showViewAction?: boolean;
  onDeleted?: () => void;
}

export function PostOptions({ sighting, open, onClose, showViewAction = true, onDeleted }: PostOptionsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const removeSighting = useDeleteSighting({
    onDeleted: () => {
      setConfirmOpen(false);
      onDeleted?.();
    },
  });

  const actions: SheetAction[] = [];
  if (showViewAction) {
    actions.push({
      id: 'view',
      label: 'Ver registro completo',
      icon: <FileText size={18} aria-hidden="true" />,
      onSelect: () => navigate(paths.sighting(sighting.id)),
    });
  }
  actions.push(
    {
      id: 'profile',
      label: `Ver perfil de @${sighting.author.username}`,
      icon: <UserRound size={18} aria-hidden="true" />,
      onSelect: () => navigate(paths.profile(sighting.author.username)),
    },
    {
      id: 'copy',
      label: 'Copiar link',
      icon: <Link2 size={18} aria-hidden="true" />,
      onSelect: async () => {
        const copied = await copyToClipboard(absoluteUrl(paths.sighting(sighting.id)));
        if (copied) toast.success('Link do avistamento copiado.');
        else toast.error('Não foi possível copiar o link.');
      },
    },
  );
  if (user?.id === sighting.author.id) {
    actions.push({
      id: 'delete',
      label: 'Excluir avistamento',
      tone: 'danger',
      icon: <Trash size={18} aria-hidden="true" />,
      onSelect: () => setConfirmOpen(true),
    });
  }

  return (
    <>
      <ActionSheet open={open} onClose={onClose} title="Opções do avistamento" actions={actions} />
      <ConfirmDialog
        open={confirmOpen}
        title="Excluir avistamento?"
        description="A publicação, as curtidas e os comentários serão removidos. Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        tone="danger"
        loading={removeSighting.isPending}
        onConfirm={() => removeSighting.mutate(sighting.id)}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
