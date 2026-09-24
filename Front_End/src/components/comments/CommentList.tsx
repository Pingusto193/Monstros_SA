import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useComments, useDeleteComment } from '@/hooks/queries/useComments';
import { useAuth } from '@/hooks/useAuth';
import type { ID } from '@/types';
import { Comment } from './Comment';
import styles from './Comments.module.css';

interface CommentListProps {
  sightingId: ID;
  sightingAuthorId: ID;
}

export function CommentList({ sightingId, sightingAuthorId }: CommentListProps) {
  const { user } = useAuth();
  const comments = useComments(sightingId);
  const deleteComment = useDeleteComment(sightingId);
  const [pendingDeleteId, setPendingDeleteId] = useState<ID | null>(null);

  if (comments.isPending) return <CommentListSkeleton />;

  if (comments.isError) {
    return <ErrorState compact error={comments.error} onRetry={() => void comments.refetch()} />;
  }

  if (comments.data.length === 0) {
    return (
      <EmptyState
        compact
        icon={<MessageCircle size={24} />}
        title="Nenhum comentário ainda"
        description="Viu algo parecido nessa região? Seja o primeiro a comentar."
      />
    );
  }

  return (
    <>
      <ul role="list" className={styles.list}>
        {comments.data.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            canDelete={user !== null && (user.id === comment.author.id || user.id === sightingAuthorId)}
            onDelete={() => setPendingDeleteId(comment.id)}
          />
        ))}
      </ul>
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Excluir comentário?"
        description="O comentário será removido para todos. Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        tone="danger"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) deleteComment.mutate(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </>
  );
}

function CommentListSkeleton() {
  return (
    <ul role="list" className={styles.list} aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <li key={item} className={styles.comment}>
          <Skeleton circle width={32} height={32} />
          <div className={styles.content} style={{ display: 'grid', gap: 8 }}>
            <Skeleton width="85%" height={12} />
            <Skeleton width="40%" height={10} />
          </div>
        </li>
      ))}
    </ul>
  );
}
