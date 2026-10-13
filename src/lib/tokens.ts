/**
 * Turns src/brand/tokens.json (the club's single source for color, type,
 * spacing, radius, stroke and shadow) into CSS custom properties.
 *
 * Two section themes come out of it:
 *   Paper  (the default, ivory ground)   <section data-theme="paper">
 *   Ink    (the black ground)            <section data-theme="ink">
 * Every component reads the semantic names (--surface, --ink, --line ...),
 * so a section flips its whole palette by changing one attribute.
 */
import tokens from '../brand/tokens.json';

type Themed = string | { light: string; dark: string };

const ref = (v: string) => v.replace(/\{([a-z0-9-]+)\}/g, 'var(--$1)');

function block(selector: string, decls: string[]) {
  return `${selector}{${decls.join(';')}}`;
}

export function tokensCss(): string {
  const base: string[] = [];
  const paper: string[] = [];
  const ink: string[] = [];

  const put = (name: string, value: Themed) => {
    if (typeof value === 'string') base.push(`--${name}:${ref(value)}`);
    else {
      paper.push(`--${name}:${ref(value.light)}`);
      ink.push(`--${name}:${ref(value.dark)}`);
    }
  };

  for (const t of tokens.color.tokens) put(t.name, t.value as Themed);
  for (const t of tokens.spacing.tokens) put(t.name, t.value);
  for (const t of tokens.radius.tokens) put(t.name, t.value);
  for (const t of tokens.stroke.tokens) put(t.name, t.value);
  for (const t of tokens.shadow.tokens) put(t.name, t.value as Themed);

  // Self-hosted variable fonts register as "<Family> Variable" (@fontsource-variable).
  const fam = tokens.type.families;
  base.push(`--font-display:"Geist Variable",${fam.display}`);
  base.push(`--font-sans:"Geist Variable",${fam.sans}`);
  base.push(`--font-serif:"Newsreader Variable",${fam.serif}`);
  base.push(`--font-mono:"Geist Mono Variable",${fam.mono}`);

  return [
    block(':root', base),
    block(':root,[data-theme="paper"]', [...paper, 'color-scheme:light']),
    block('[data-theme="ink"]', [...ink, 'color-scheme:dark']),
  ].join('\n');
}
