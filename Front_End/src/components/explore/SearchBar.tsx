import { Search, X } from 'lucide-react';
import { useId } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar por local, cidade, região ou @usuário',
  label = 'Buscar avistamentos',
}: SearchBarProps) {
  const id = useId();
  return (
    <div className={styles.search} role="search">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search size={18} className={styles.icon} aria-hidden="true" />
      <input
        id={id}
        type="search"
        className={styles.input}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        maxLength={80}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button type="button" className={styles.clear} onClick={() => onChange('')} aria-label="Limpar busca">
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
