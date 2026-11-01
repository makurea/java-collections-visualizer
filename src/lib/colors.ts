export type CategoryAccent = 'emerald' | 'violet' | 'sky' | 'amber';

export function categoryAccent(category: string): CategoryAccent {
  switch (category) {
    case 'set':
      return 'violet';
    case 'map':
      return 'sky';
    case 'queue':
      return 'amber';
    default:
      return 'emerald';
  }
}

export const accentBg: Record<CategoryAccent, string> = {
  emerald: 'from-emerald-500/20 to-teal-500/10',
  violet: 'from-violet-500/20 to-fuchsia-500/10',
  sky: 'from-sky-500/20 to-cyan-500/10',
  amber: 'from-amber-500/20 to-orange-500/10',
};

export const accentText: Record<CategoryAccent, string> = {
  emerald: 'text-emerald-400',
  violet: 'text-violet-400',
  sky: 'text-sky-400',
  amber: 'text-amber-400',
};

export const accentBorder: Record<CategoryAccent, string> = {
  emerald: 'group-hover:border-emerald-500/60',
  violet: 'group-hover:border-violet-500/60',
  sky: 'group-hover:border-sky-500/60',
  amber: 'group-hover:border-amber-500/60',
};