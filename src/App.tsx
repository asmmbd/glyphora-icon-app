import { useEffect, useMemo, useRef, useState } from 'react';
import { ICONS, type IconRecord } from './icons';

type Theme = 'light' | 'dark';

const CATEGORIES = ['All icons', 'Interface', 'Navigation', 'Development'];
const SWATCHES = ['#7657f6', '#202026', '#f07857', '#168f83', '#3978e6'];

const UI_PATHS: Record<string, string[]> = {
  search: ['M11 19a8 8 0 1 1 5.7-2.3L21 21', 'm16.7 16.7 4.3 4.3'],
  moon: ['M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z'],
  sun: ['M12 3v2', 'M12 19v2', 'm4.9 4.9 1.4 1.4', 'm17.7 17.7 1.4 1.4', 'M3 12h2', 'M19 12h2', 'm4.9 19.1 1.4-1.4', 'm17.7 6.3 1.4-1.4', 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z'],
  copy: ['M8 8V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3', 'M5 8h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z'],
  chevron: ['m9 18 6-6-6-6'],
  package: ['M12 3 3.5 7.5 12 12l8.5-4.5L12 3Z', 'M3.5 7.5V17L12 21l8.5-4V7.5', 'M12 12v9', 'M7.7 5.3 16 9.7'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  arrow: ['M5 12h14', 'm12 5 7 7-7 7'],
  check: ['m5 12 4 4L19 6'],
  sliders: ['M4 7h8', 'M16 7h4', 'm12 5 0 4', 'M4 17h4', 'M12 17h8', 'm8 15 0 4'],
  code: ['m8 8-4 4 4 4', 'm16 8 4 4-4 4', 'm14 5-4 14']
};

function UiIcon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {(UI_PATHS[name] ?? []).map((d, index) => <path d={d} key={`${name}-${index}`} />)}
    </svg>
  );
}

function IconGlyph({ icon, size = 32, color = 'currentColor', strokeWidth = 1.8, decorative = true }: { icon: IconRecord; size?: number; color?: string; strokeWidth?: number; decorative?: boolean }) {
  return (
    <svg
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : icon.name}
      role={decorative ? undefined : 'img'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon.paths.map((d, index) => <path d={d} key={`${icon.id}-${index}`} />)}
    </svg>
  );
}

function buildSvg(icon: IconRecord, size: number, color: string, strokeWidth: number) {
  const paths = icon.paths.map((d) => `  <path d="${d}" />`).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round">\n${paths}\n</svg>`;
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return window.localStorage.getItem('icon-gallery-theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All icons');
  const [tag, setTag] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(ICONS[0].id);
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [size, setSize] = useState(48);
  const [color, setColor] = useState(SWATCHES[0]);
  const [strokeWidth, setStrokeWidth] = useState(1.8);
  const [toast, setToast] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem('icon-gallery-theme', theme);
    } catch {
      // The gallery still works when browser storage is unavailable.
    }
  }, [theme]);

  useEffect(() => {
    if (!previewOpen) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
      const focusable = dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
      if (!dialog || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previewTriggerRef.current?.focus();
    };
  }, [previewOpen]);

  const tags = useMemo(() => Array.from(new Set(ICONS.flatMap((icon) => icon.tags))).sort(), []);
  const filteredIcons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return ICONS.filter((icon) => {
      const matchesCategory = category === 'All icons' || icon.category === category;
      const matchesTag = !tag || icon.tags.includes(tag);
      const searchable = `${icon.name} ${icon.component} ${icon.category} ${icon.description} ${icon.tags.join(' ')}`.toLowerCase();
      return matchesCategory && matchesTag && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, query, tag]);

  const selectedIcon = filteredIcons.find((icon) => icon.id === selectedId) ?? filteredIcons[0] ?? null;
  const reactSnippet = selectedIcon
    ? `import { ${selectedIcon.component} } from 'glyphora-icon';\n\n<${selectedIcon.component} size={${size}} strokeWidth={${strokeWidth.toFixed(1)}} style={{ color: '${color}' }} />`
    : '';

  async function copyText(text: string, label: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (!copied) throw new Error('Copy unavailable');
      }
      setToast(`${label} copied to clipboard`);
      window.setTimeout(() => setToast(''), 2400);
    } catch {
      setToast('Could not copy — please try again.');
      window.setTimeout(() => setToast(''), 2800);
    }
  }

  function selectCategory(nextCategory: string) {
    setCategory(nextCategory);
    setTag(null);
  }

  return (
    <div className={`app-shell theme-${theme}`}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Go to the top of the icon library">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span className="brand-copy"><strong>Icon Library</strong><small>PERSONAL COLLECTION</small></span>
        </a>
        <div className="topbar-center"><span className="version-dot" /> React · Next.js · SVG</div>
        <div className="topbar-actions">
          <span className="package-chip"><UiIcon name="package" size={15} /> v0.2.0</span>
          <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? 'Enable dark mode' : 'Enable light mode'} title={theme === 'light' ? 'Dark mode' : 'Light mode'}>
            <UiIcon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
          </button>
        </div>
      </header>

      <div className="workspace" id="top">
        <aside className="sidebar" aria-label="Icon categories">
          <div className="side-section-label">BROWSE</div>
          <p className="sidebar-title">Categories</p>
          <nav className="category-list">
            {CATEGORIES.map((item, index) => (
              <button className={`category-button ${category === item ? 'active' : ''}`} key={item} onClick={() => selectCategory(item)} aria-pressed={category === item}>
                <span className={`category-symbol symbol-${index}`}>{index === 0 ? '✳' : index === 1 ? '◈' : index === 2 ? '↗' : '</>'}</span>
                <span>{item === 'All icons' ? 'All icons' : item}</span>
                <span className="category-count">{index === 0 ? ICONS.length : ICONS.filter((icon) => icon.category === item).length}</span>
              </button>
            ))}
          </nav>
          <div className="side-divider" />
          <div className="side-section-label">THE COLLECTION</div>
          <div className="sidebar-note">
            <div className="mini-mark"><UiIcon name="code" size={17} /></div>
            <strong>Personal icon pack</strong>
            <p>A hand-built collection for React and Next.js.</p>
            <span className="license-tag">MIT · Open source</span>
          </div>
          <div className="sidebar-footer"><span className="live-dot" /> {ICONS.length} icons · version 0.2.0</div>
        </aside>

        <main className="main-content">
          <section className="hero-card" aria-labelledby="hero-title">
            <div className="hero-copy">
              <span className="eyebrow"><span className="eyebrow-star">✳</span> CODE-READY ICONS</span>
              <h1 id="hero-title">Find the<br /><em>right icon</em> for your code.</h1>
              <p>Preview it, tune the details, and copy it into your project.</p>
              <div className="hero-meta"><span className="hero-count">{ICONS.length} icons</span><span className="hero-meta-separator">/</span><span>SVG + React component</span></div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="hero-orbit orbit-one" />
              <div className="hero-orbit orbit-two" />
              <span className="hero-icon hero-icon-one"><IconGlyph icon={ICONS[0]} size={47} color="currentColor" /></span>
              <span className="hero-icon hero-icon-two"><IconGlyph icon={ICONS[1]} size={35} color="currentColor" /></span>
              <span className="hero-icon hero-icon-three"><IconGlyph icon={ICONS[2]} size={40} color="currentColor" /></span>
              <span className="hero-spark">✳</span>
            </div>
            <span className="hero-index" aria-hidden="true">01 / 03</span>
          </section>

          <section className="collection-heading" aria-label="Icon gallery heading">
            <div><span className="section-kicker">THE LIBRARY</span><h2>All icons <span className="heading-count">({filteredIcons.length})</span></h2></div>
            <label className="search-box">
              <UiIcon name="search" size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or tag…" aria-label="Search icons by name or tag" />
              <kbd>/</kbd>
            </label>
          </section>

          <div className="tag-row" aria-label="Filter by tag">
            <span className="tag-label">TAGS</span>
            {tags.map((item) => <button key={item} className={`tag-chip ${tag === item ? 'selected' : ''}`} onClick={() => setTag(tag === item ? null : item)} aria-pressed={tag === item}>{item}</button>)}
            {(tag || query || category !== 'All icons') && <button className="clear-filters" onClick={() => { setTag(null); setQuery(''); selectCategory('All icons'); }}>Clear filters</button>}
          </div>

          <div className="content-layout">
            <section className="icon-results" aria-label="Icon results">
              {filteredIcons.length > 0 ? (
                <div className="icon-grid">
                  {filteredIcons.map((icon, index) => (
                    <button key={icon.id} className={`icon-card ${selectedIcon?.id === icon.id ? 'selected' : ''}`} onClick={(event) => { previewTriggerRef.current = event.currentTarget; setSelectedId(icon.id); setPreviewOpen(true); }} aria-haspopup="dialog" aria-pressed={selectedIcon?.id === icon.id}>
                      <span className="card-topline"><span className="card-number">{String(index + 1).padStart(2, '0')}</span><span className="card-category">{icon.category}</span></span>
                      <span className="card-icon"><IconGlyph icon={icon} size={35} color={color} strokeWidth={strokeWidth} /></span>
                      <span className="card-title-row"><strong>{icon.name}</strong><span className="card-arrow"><UiIcon name="arrow" size={15} /></span></span>
                      <span className="card-component">{icon.component}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-state"><div className="empty-mark"><UiIcon name="search" size={24} /></div><h3>No icons found</h3><p>Try another name or tag.</p><button onClick={() => { setTag(null); setQuery(''); selectCategory('All icons'); }}>Show all icons</button></div>
              )}
              <div className="collection-footnote"><span>Showing {filteredIcons.length} of {ICONS.length}</span><span className="footnote-line" /><span>PERSONAL ICON SET</span></div>
            </section>

            {previewOpen && selectedIcon && (
              <div className="preview-modal-backdrop" role="presentation" onClick={() => setPreviewOpen(false)}>
                <aside className="inspector preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-modal-title" onClick={(event) => event.stopPropagation()}>
                  <div className="modal-sheet-handle" aria-hidden="true" />
                  <div className="inspector-heading"><div><span className="section-kicker">ICON INSPECTOR</span><h2 id="preview-modal-title">Preview</h2></div><div className="modal-heading-actions"><span className="inspector-index">#{String(ICONS.findIndex((icon) => icon.id === selectedIcon.id) + 1).padStart(2, '0')}</span><button className="modal-close" type="button" onClick={() => setPreviewOpen(false)} aria-label="Close preview" title="Close preview" autoFocus><UiIcon name="close" size={17} /></button></div></div>
                <div className="preview-stage">
                  <span className="preview-corner corner-top" /><span className="preview-corner corner-bottom" />
                  <IconGlyph icon={selectedIcon} size={size} color={color} strokeWidth={strokeWidth} decorative={false} />
                  <span className="preview-dimension">{size} × {size}</span>
                </div>
                <div className="selected-info"><div><h3>{selectedIcon.name}</h3><span className="component-name">{selectedIcon.component}</span></div><span className="selected-category">{selectedIcon.category}</span></div>
                <p className="icon-description">{selectedIcon.description}</p>
                <div className="control-block">
                  <div className="control-label-row"><label htmlFor="size-control">Size</label><output htmlFor="size-control">{size}px</output></div>
                  <div className="range-row"><span>24</span><input id="size-control" type="range" min="24" max="96" step="2" value={size} onChange={(event) => setSize(Number(event.target.value))} /><span>96</span></div>
                </div>
                <div className="control-block">
                  <div className="control-label-row"><label htmlFor="stroke-control">Stroke weight</label><output htmlFor="stroke-control">{strokeWidth.toFixed(1)}</output></div>
                  <div className="range-row"><span>0.8</span><input id="stroke-control" type="range" min="0.8" max="3.2" step="0.2" value={strokeWidth} onChange={(event) => setStrokeWidth(Number(event.target.value))} /><span>3.2</span></div>
                </div>
                <div className="control-block color-control">
                  <div className="control-label-row"><span>Color</span><span className="color-value">{color.toUpperCase()}</span></div>
                  <div className="swatch-row">{SWATCHES.map((swatch) => <button key={swatch} className={`swatch ${color.toLowerCase() === swatch.toLowerCase() ? 'active' : ''}`} style={{ '--swatch-color': swatch } as React.CSSProperties} onClick={() => setColor(swatch)} aria-label={`Select ${swatch} color`} aria-pressed={color.toLowerCase() === swatch.toLowerCase()} />)}<label className="custom-color" title="Choose a custom color"><input type="color" value={color} onChange={(event) => setColor(event.target.value)} aria-label="Choose a custom color" /><span><UiIcon name="sliders" size={16} /></span></label></div>
                </div>
                <div className="copy-actions">
                  <button className="copy-primary" onClick={() => copyText(reactSnippet, 'React snippet')}><UiIcon name="code" size={16} /><span>Copy React code</span><UiIcon name="copy" size={15} /></button>
                  <button className="copy-secondary" onClick={() => copyText(buildSvg(selectedIcon, size, color, strokeWidth), 'SVG')}><UiIcon name="copy" size={15} /><span>Copy SVG</span></button>
                </div>
                <div className="inspector-footer"><span><span className="status-dot" /> ready to use</span><span>stroke · {strokeWidth.toFixed(1)}</span></div>
                </aside>
              </div>
            )}
          </div>
          <footer className="page-footer"><span>A small icon collection, built with care.</span><span>MADE FOR THE DETAILS <span className="footer-star">✳</span></span></footer>
        </main>
      </div>

      {toast && <div className="toast" role="status" aria-live="polite"><span className="toast-check"><UiIcon name="check" size={14} /></span>{toast}</div>}
    </div>
  );
}

export default App;
