export const initialData = {
  kunder: [], vikarer: [], salg: [], vakter: [],
  nextId: { kunder: 1, vikarer: 1, salg: 1, vakter: 1 }
};

export const SALG_STAGES = ['Prospekt', 'Møte booket', 'Tilbud sendt', 'Vunnet', 'Tapt'];
export const ROLLER = ['Helsefagarbeider', 'Sykepleier', 'Omsorgsarbeider', 'Assistent', 'Vernepleier'];
export const TILGJENGELIGHET = ['Alle dager', 'Hverdag', 'Helg', 'Natt', 'Helg og natt'];
export const VAKTTYPER = ['Hverdag', 'Helg', 'Helligdag', 'Natt'];

export function today() { return new Date().toISOString().split('T')[0]; }

export function initials(name) {
  return (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export function avatarColor(name) {
  const colors = ['#EBF5FF', '#E1F5EE', '#FAEEDA', '#EEEDFE', '#FAECE7'];
  const textColors = ['#1F4E79', '#0F6E56', '#854F0B', '#3C3489', '#993C1D'];
  const i = ((name || ' ').charCodeAt(0) + ((name || '  ').charCodeAt(1) || 0)) % colors.length;
  return { bg: colors[i], text: textColors[i] };
}

export const STATUS_BADGE = {
  Aktiv: { bg: '#EAF3DE', text: '#3B6D11' },
  Lead: { bg: '#FAEEDA', text: '#854F0B' },
  Inaktiv: { bg: '#F1EFE8', text: '#5F5E5A' },
  Ledig: { bg: '#EBF5FF', text: '#1F4E79' },
  Prospekt: { bg: '#F1EFE8', text: '#5F5E5A' },
  'Møte booket': { bg: '#EBF5FF', text: '#1F4E79' },
  'Tilbud sendt': { bg: '#FAEEDA', text: '#854F0B' },
  Vunnet: { bg: '#EAF3DE', text: '#3B6D11' },
  Tapt: { bg: '#FCEBEB', text: '#A32D2D' },
  Hverdag: { bg: '#EBF5FF', text: '#1F4E79' },
  Helg: { bg: '#FAEEDA', text: '#854F0B' },
  Helligdag: { bg: '#FCEBEB', text: '#A32D2D' },
  Natt: { bg: '#EEEDFE', text: '#3C3489' },
};
