// The one HTML page template: <head>, header + menu, footer, and the small shared script. Everything comes from site.md.
import { BRAND_DARK } from './config';
import { site } from './content';
import { esc } from './util';
import { imgTag, imgUrl } from './images';
import { FEATURES } from './features';
import { renderTemplate } from './template';

/** <link rel="icon"> for every page. Uses `favicon:` from site.md (a file in assets/img), else an auto-generated
 *  initials badge as an inline SVG, so browsers never fall back to requesting a missing /favicon.ico. */
function iconLink(): string {
  const types: Record<string, string> = {
    svg: 'image/svg+xml',
    png: 'image/png',
    ico: 'image/x-icon',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  const favicon = typeof site.favicon === 'string' ? site.favicon : '';
  const url = favicon ? imgUrl(favicon) : '';
  if (url) {
    const ext = url.split('.').pop()?.toLowerCase() ?? 'png';
    return `<link rel="icon" href="${esc(url)}" type="${types[ext] ?? 'image/png'}">`;
  }
  const siteName = typeof site.name === 'string' && site.name.trim() ? site.name : 'C';
  const initials = siteName
    .split(/\s+/)
    .map((word: string) => word[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="${BRAND_DARK}"/>` +
    `<text x="32" y="33" font-family="Georgia,serif" font-size="${initials.length > 1 ? 28 : 34}" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#fff">${esc(initials)}</text></svg>`;
  return `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg)}" type="image/svg+xml">`;
}

export function shell({
  title,
  description = '',
  url,
  body,
  jsonld = [],
  features = [],
}: {
  title: string;
  description?: string;
  url: string;
  body: string;
  jsonld?: Array<Record<string, unknown>>;
  features?: Iterable<string>;
}): string {
  const siteName = typeof site.name === 'string' && site.name.trim() ? site.name : 'Care Unlimited';
  const siteTagline = typeof site.tagline === 'string' ? site.tagline : '';
  const fullTitle = title ? `${title} – ${siteName}` : `${siteName} – ${siteTagline}`;
  const logo = typeof site.logo === 'string' && site.logo ? imgTag(site.logo, siteName, 'logo') : '';
  const nav = ((site.nav as Array<{ url: string; label: string }> | undefined) ?? [])
    .map(
      (entry) =>
        `<li><a href="${esc(entry.url)}"${entry.url === url ? ' aria-current="page"' : ''}>${esc(entry.label)}</a></li>`,
    )
    .join('');
  const social = ((site.social as Array<{ url: string; label: string }> | undefined) ?? [])
    .map((entry) => `<a href="${esc(entry.url)}" rel="noopener">${esc(entry.label)}</a>`)
    .join(' · ');
  const addr = ((site.address as string[] | undefined) ?? []).map((entry) => esc(entry)).join('<br>');
  const canonical = typeof site.url === 'string' && site.url
    ? `<link rel="canonical" href="${esc(site.url.replace(/\/$/, '') + url)}">`
    : '';
  const desc = description || (typeof site.description === 'string' ? site.description : '');
  const featureHtml = [...features]
    .map((feature) => {
      const featureDef = FEATURES[feature];
      if (!featureDef) return '';
      return `${featureDef.html}<script>${featureDef.js}</script>`;
    })
    .join('\n');
  const structuredData = (jsonld ?? [])
    .map((entry) => `<script type="application/ld+json">${JSON.stringify(entry)}</script>`)
    .join('\n');
  const sharedScript = `
  const b=document.querySelector('.nav-toggle'),n=document.getElementById('nav');
  b.addEventListener('click',()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
  // Scroll fade-in: sections start faded (CSS, only when JS is on) and get .in once they scroll into view.
  // threshold 0 (not a fraction): a tall section on a phone can never be 12% visible, so it would stay invisible.
  (()=>{const els=document.querySelectorAll('.reveal');
    if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){els.forEach(e=>e.classList.add('in'));return}
    const io=new IntersectionObserver((es)=>es.forEach((e)=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:0,rootMargin:'0px 0px -8% 0px'});
    els.forEach((e)=>io.observe(e));})();
  // Pictures fade in once loaded (CSS hides lazy images only when JS is on; if anything goes wrong they still appear).
  document.querySelectorAll('img[loading=lazy]').forEach((i)=>{
    const ok=()=>i.classList.add('loaded');
    if(i.complete)ok();else{i.addEventListener('load',ok,{once:true});i.addEventListener('error',ok,{once:true})}
  });
  // Page-to-page fade for browsers without cross-document View Transitions: fade out on an internal link click, then go.
  (()=>{const h=document.documentElement;
    if(!h.classList.contains('no-vt')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    addEventListener('pageshow',(e)=>{if(e.persisted)h.classList.remove('leaving')});   // back button restores the page
    document.addEventListener('click',(e)=>{
      const a=e.target.closest&&e.target.closest('a[href]');
      if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
      if(a.target&&a.target!=='_self'||a.hasAttribute('download')||a.hasAttribute('data-viewer'))return;
      const u=new URL(a.href,location.href);
      if(u.origin!==location.origin||!/^https?:$/.test(u.protocol))return;
      if(u.pathname===location.pathname&&u.search===location.search)return;   // same-page anchors scroll smoothly instead
      e.preventDefault();h.classList.add('leaving');
      setTimeout(()=>{location.href=u.href},200);
    });})();
  // Smooth FAQ open/close: animate the <details> height (falls back to the instant native toggle if reduced motion is on).
  document.querySelectorAll('.accordion details').forEach((d)=>{
    const s=d.querySelector('summary');let a,want=d.open;
    s.addEventListener('click',(e)=>{
      if(!d.animate||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      e.preventDefault();want=!want;
      const from=d.offsetHeight;if(a)a.cancel();
      if(want)d.open=true;
      const to=want?d.offsetHeight:s.offsetHeight+d.offsetHeight-d.clientHeight;
      d.style.overflow='hidden';
      a=d.animate({height:[from+'px',to+'px']},{duration:320,easing:'ease'});
      a.onfinish=()=>{d.open=want;d.style.overflow='';a=null};
    });
  });
`;
  return renderTemplate('shell', {
    title: esc(fullTitle),
    description: esc(desc),
    canonical,
    themeColor: BRAND_DARK,
    iconLink: iconLink(),
    jsonld: structuredData,
    logo: logo || esc(siteName),
    nav,
    body,
    features: featureHtml,
    siteName: esc(siteName),
    footerBlurb: esc(typeof site.footer_blurb === 'string' ? site.footer_blurb : ''),
    social,
    address: addr,
    phoneHref: esc((typeof site.phone === 'string' ? site.phone : '').replace(/\s+/g, '')),
    phone: esc(typeof site.phone === 'string' ? site.phone : ''),
    email: esc(typeof site.email === 'string' ? site.email : ''),
    year: new Date().getFullYear(),
    sharedScript,
  });
}
