import icons from 'glyphora-icon/icons.json';

export type IconRecord = {
  id: string;
  name: string;
  component: string;
  category: string;
  description: string;
  tags: string[];
  paths: string[];
};

/**
 * The gallery reads the same records that ship inside the glyphora-icon package,
 * so the site and the npm package can never drift apart.
 */
export const ICONS: IconRecord[] = icons as IconRecord[];
