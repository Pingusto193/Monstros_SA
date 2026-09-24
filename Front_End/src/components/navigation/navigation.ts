import { Compass, House, SquarePlus, type LucideIcon } from 'lucide-react';
import type { Params } from 'react-router';
import { paths } from '@/utils/routes';

export interface NavItem {
  to: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  end?: boolean;
  primary?: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { to: paths.home, label: 'Início', shortLabel: 'Início', icon: House, end: true },
  { to: paths.explore, label: 'Explorar', shortLabel: 'Explorar', icon: Compass },
  { to: paths.createSighting, label: 'Registrar avistamento', shortLabel: 'Registrar', icon: SquarePlus, primary: true },
];

/** Metadados de rota usados pelo cabeçalho mobile (título e botão voltar). */
export interface RouteHandle {
  title?: string | ((params: Params) => string);
  back?: boolean;
}

export function isRouteHandle(value: unknown): value is RouteHandle {
  return typeof value === 'object' && value !== null && ('title' in value || 'back' in value);
}
