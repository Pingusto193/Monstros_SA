import { SearchX, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { SearchBar } from '@/components/explore/SearchBar';
import { UserResults } from '@/components/explore/UserResults';
import { SightingGrid, SightingGridSkeleton } from '@/components/sighting/SightingGrid';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { flattenPages } from '@/hooks/queries/cache';
import { useRegions, useSightingSearch } from '@/hooks/queries/useSightings';
import { useUserSearch } from '@/hooks/queries/useUsers';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { SightingPeriod, SightingSort } from '@/types';
import { cn } from '@/utils/cn';
import { pluralize } from '@/utils/format';
import styles from './ExplorePage.module.css';

const PERIOD_OPTIONS: Array<{ value: SightingPeriod; label: string }> = [
  { value: 'all', label: 'Qualquer data' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '365d', label: 'Último ano' },
];

const SORT_OPTIONS: Array<{ value: SightingSort; label: string }> = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'popular', label: 'Mais curtidos' },
  { value: 'discussed', label: 'Mais comentados' },
  { value: 'sighting-date', label: 'Data do avistamento' },
];

function parsePeriod(value: string | null): SightingPeriod {
  return PERIOD_OPTIONS.some((option) => option.value === value) ? (value as SightingPeriod) : 'all';
}

function parseSort(value: string | null): SightingSort {
  return SORT_OPTIONS.some((option) => option.value === value) ? (value as SightingSort) : 'recent';
}

export default function ExplorePage() {
  useDocumentTitle('Explorar');
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const region = searchParams.get('regiao') ?? '';
  const period = parsePeriod(searchParams.get('periodo'));
  const sort = parseSort(searchParams.get('ordem'));

  // Campo de busca: estado local imediato + URL atualizada com atraso (debounce).
  const [input, setInput] = useState(query);
  const debouncedInput = useDebouncedValue(input, 300);
  const lastSynced = useRef(query);

  useEffect(() => {
    const next = debouncedInput.trim();
    if (next === lastSynced.current) return;
    lastSynced.current = next;
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        if (next) params.set('q', next);
        else params.delete('q');
        return params;
      },
      { replace: true },
    );
  }, [debouncedInput, setSearchParams]);

  // Se a URL mudar por fora (link de região/cidade, voltar do navegador), atualiza o campo.
  useEffect(() => {
    if (query !== lastSynced.current) {
      lastSynced.current = query;
      setInput(query);
    }
  }, [query]);

  function setParam(key: string, value: string | null) {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        if (value) params.set(key, value);
        else params.delete(key);
        return params;
      },
      { replace: true },
    );
  }

  function clearFilters() {
    lastSynced.current = '';
    setInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  const filters = useMemo(() => ({ query, region, period, sort }), [query, region, period, sort]);
  const results = useSightingSearch(filters);
  const regions = useRegions();
  const people = useUserSearch(query);
  const sightings = useMemo(() => flattenPages(results.data), [results.data]);
  const total = results.data?.pages[0]?.total ?? 0;
  const hasFilters = Boolean(query || region || period !== 'all' || sort !== 'recent');
  const regionOptions = regions.data ?? [];
  const regionInOptions = !region || regionOptions.some((item) => item.region === region);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: () => void results.fetchNextPage(),
    enabled: Boolean(results.hasNextPage) && !results.isFetchingNextPage && !results.isPlaceholderData,
  });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Explorar</h1>
        <p className={styles.subtitle}>Descubra avistamentos registrados pela comunidade.</p>
      </header>

      <SearchBar value={input} onChange={setInput} />

      {regionOptions.length > 0 && (
        <div className={styles.chips} role="group" aria-label="Filtrar por região">
          <button
            type="button"
            className={cn(styles.chip, !region && styles.chipActive)}
            aria-pressed={!region}
            onClick={() => setParam('regiao', null)}
          >
            Todas
          </button>
          {regionOptions.slice(0, 8).map((item) => (
            <button
              key={`${item.region}-${item.country}`}
              type="button"
              className={cn(styles.chip, region === item.region && styles.chipActive)}
              aria-pressed={region === item.region}
              onClick={() => setParam('regiao', region === item.region ? null : item.region)}
            >
              {item.region}
              <span className={styles.chipCount}>{item.count}</span>
            </button>
          ))}
        </div>
      )}

      <div className={styles.filters}>
        <SelectField label="Região" value={region} onChange={(event) => setParam('regiao', event.target.value || null)}>
          <option value="">Todas as regiões</option>
          {!regionInOptions && <option value={region}>{region}</option>}
          {regionOptions.map((item) => (
            <option key={`${item.region}-${item.country}`} value={item.region}>
              {item.region} · {item.country}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Período do avistamento"
          value={period}
          onChange={(event) => setParam('periodo', event.target.value === 'all' ? null : event.target.value)}
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Ordenar por"
          value={sort}
          onChange={(event) => setParam('ordem', event.target.value === 'recent' ? null : event.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </div>

      {people.data && <UserResults users={people.data} />}

      <div className={styles.resultsBar}>
        <p className={styles.count} aria-live="polite">
          {results.isPending ? 'Buscando avistamentos…' : pluralize(total, 'avistamento encontrado', 'avistamentos encontrados')}
          {results.isFetching && !results.isPending && !results.isFetchingNextPage && <Spinner size={14} />}
        </p>
        {hasFilters && (
          <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={clearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>

      {results.isPending ? (
        <SightingGridSkeleton />
      ) : results.isError && sightings.length === 0 ? (
        <ErrorState error={results.error} onRetry={() => void results.refetch()} />
      ) : sightings.length === 0 ? (
        <EmptyState
          icon={<SearchX size={28} />}
          title="Nenhum avistamento encontrado"
          description="Tente outra cidade, região ou @usuário — ou limpe os filtros para ver tudo."
          action={
            hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className={cn(results.isPlaceholderData && styles.stale)}>
          <SightingGrid sightings={sightings} />
          <div ref={sentinelRef} aria-hidden="true" />
          {results.isFetchingNextPage && (
            <div className={styles.loadingMore}>
              <Spinner size={22} label="Carregando mais avistamentos" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
