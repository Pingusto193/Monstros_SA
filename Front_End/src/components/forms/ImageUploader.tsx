import { CircleAlert, ImagePlus, RefreshCw, Trash } from 'lucide-react';
import { useId, useRef, useState, type Ref } from 'react';
import { Button } from '@/components/ui/Button';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import { cn } from '@/utils/cn';
import { ACCEPTED_IMAGE_ATTR, validateImageFile } from '@/utils/image';
import styles from './ImageUploader.module.css';

interface ImageUploaderProps {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
  /** Ref do botão principal, para levar o foco até aqui quando faltar a foto. */
  triggerRef?: Ref<HTMLButtonElement>;
}

export function ImageUploader({ file, onChange, error, disabled = false, triggerRef }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useObjectUrl(file);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const messageId = useId();
  const message = fileError ?? error;

  function pickFile(files: FileList | null) {
    const selected = files?.[0];
    if (!selected) return;
    const validation = validateImageFile(selected);
    if (validation) {
      setFileError(validation);
      return;
    }
    setFileError(null);
    onChange(selected);
  }

  const openPicker = () => inputRef.current?.click();

  return (
    <div className={styles.uploader}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_ATTR}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        onChange={(event) => {
          pickFile(event.target.files);
          event.target.value = '';
        }}
      />

      {previewUrl ? (
        <figure className={styles.preview}>
          <img src={previewUrl} alt="Pré-visualização da foto do avistamento" className={styles.previewImage} />
          <figcaption className={styles.previewBar}>
            <span className={styles.fileName} title={file?.name}>
              {file?.name}
            </span>
            <div className={styles.previewActions}>
              <Button
                ref={triggerRef}
                size="sm"
                variant="secondary"
                icon={<RefreshCw size={14} />}
                onClick={openPicker}
                disabled={disabled}
              >
                Trocar
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon={<Trash size={14} />}
                onClick={() => onChange(null)}
                disabled={disabled}
              >
                Remover
              </Button>
            </div>
          </figcaption>
        </figure>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          className={cn(styles.dropzone, dragging && styles.dragging, message && styles.invalid)}
          onClick={openPicker}
          disabled={disabled}
          aria-describedby={message ? messageId : undefined}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            pickFile(event.dataTransfer.files);
          }}
        >
          <span className={styles.dropIcon} aria-hidden="true">
            <ImagePlus size={28} />
          </span>
          <span className={styles.dropTitle}>Adicionar foto do avistamento</span>
          <span className={styles.dropHint}>Arraste a imagem para cá ou clique para escolher</span>
          <span className={styles.dropFormats}>JPG, PNG ou WEBP · até 15 MB</span>
        </button>
      )}

      {message && (
        <p id={messageId} className={styles.error}>
          <CircleAlert size={14} aria-hidden="true" />
          {message}
        </p>
      )}
    </div>
  );
}
