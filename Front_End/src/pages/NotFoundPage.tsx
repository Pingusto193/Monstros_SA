import { Footprints } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ButtonLink } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { paths } from '@/utils/routes';

export default function NotFoundPage() {
  useDocumentTitle('Página não encontrada');
  return (
    <EmptyState
      icon={<Footprints size={28} />}
      title="Este rastro esfriou"
      description="A página que você procurou não existe ou foi movida."
      action={
        <>
          <ButtonLink to={paths.home}>Voltar ao início</ButtonLink>
          <ButtonLink to={paths.explore} variant="secondary">
            Explorar avistamentos
          </ButtonLink>
        </>
      }
    />
  );
}
