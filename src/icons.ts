import icons from 'glyphora-icon/icons.json';

export type IconRecord = {
  id: string;
  name: string;
  component: string;
  category: string;
  description: string;
  tags: string[];
  paths: string[];
  _searchIndex?: string;
};

/**
 * The gallery reads the same records that ship inside the glyphora-icon package,
 * so the site and the npm package can never drift apart.
 */
export const ICONS: (IconRecord & { _searchIndex: string })[] = (icons as IconRecord[]).map((icon) => ({
  ...icon,
  _searchIndex: `${icon.name} ${icon.component} ${icon.category} ${icon.description} ${icon.tags.join(' ')}`.toLowerCase(),
}));
