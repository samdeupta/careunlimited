// The one HTML page template: <head>, header + menu, footer, and the small shared script. Everything comes from site.md.
import { BRAND_DARK } from './config.mjs';
import { site } from './content.mjs';
import { esc } from './util.mjs';
import { imgTag, imgUrl } from './images.mjs';
import { FEATURES } from './features.mjs';

/** <link rel="icon"> for every page. Uses `favicon:` from site.md (a file in assets/img), else an auto-generated
 *  initials badge as an inline SVG, so browsers never fall back to requesting a missing /favicon.ico. */
function iconLink() {
  const types = {
    svg: 'image/svg+xml',
    png: 'image/png',
    ico: 'image/x-icon',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  const url = site.favicon ? imgUrl(site.favicon) : '';
  if (url)
    return `<link rel="icon" href="${esc(url)}" type="${types[url.split('.').pop().toLowerCase()] || 'image/png'}">`;
  const initials = (site.name || 'C')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="${BRAND_DARK}"/>` +
    `<text x="32" y="33" font-family="Georgia,serif" font-size="${initials.length > 1 ? 28 : 34}" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#fff">${esc(initials)}</text></svg>`;
  return `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg)}" type="image/svg+xml">`;
}

export function shell({ title, description, url, body, jsonld, features = [] }) {
  const fullTitle = title ? `${title} – ${site.name}` : `${site.name} – ${site.tagline}`;
  const logo = site.logo && imgTag(site.logo, site.name, 'logo');
  const nav = site.nav
    .map(
      (n) =>
        `<li><a href="${esc(n.url)}"${n.url === url ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`,
    )
    .join('');
  const social = (site.social || [])
    .map((s) => `<a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a>`)
    .join(' · ');
  const addr = (site.address || []).map(esc).join('<br>');
  const canonical = site.url
    ? `<link rel="canonical" href="${esc(site.url.replace(/\/$/, '') + url)}">`
    : '';
  const desc = description || site.description || '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
${canonical}
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="${BRAND_DARK}">
${iconLink()}
<script>document.documentElement.classList.add('js')</script>
<link rel="preload" href="/fonts/source-sans-3-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/lora-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/style.css">
${[]
  .concat(jsonld || [])
  .map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`)
  .join('\n')}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap bar">
    <a class="brand" href="/">${logo || esc(site.name)}</a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav id="nav" aria-label="Main"><ul>${nav}</ul></nav>
  </div>
</header>
<main id="main">
${body}
</main>
${[...features].map((f) => `${FEATURES[f].html}<script>${FEATURES[f].js}</script>`).join('\n')}
<footer class="site-footer">
  <div class="wrap foot">
    <div>
      <p class="foot-name">${esc(site.name)}</p>
      <p>${esc(site.footer_blurb || '')}</p>
      <p>${social}</p>
    </div>
    <div>
      <p class="foot-name">Contact us</p>
      <p>${addr}<br><a href="tel:${esc((site.phone || '').replace(/\s+/g, ''))}">${esc(site.phone)}</a><br><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
    </div>
  </div>
  <p class="copy-line">© ${new Date().getFullYear()} ${esc(site.name)}</p>
</footer>
<script>
  const b=document.querySelector('.nav-toggle'),n=document.getElementById('nav');
  b.addEventListener('click',()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
  // Scroll fade-in: sections start faded (CSS, only when JS is on) and get .in once they scroll into view.
  (()=>{const els=document.querySelectorAll('.reveal');
    if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){els.forEach(e=>e.classList.add('in'));return}
    const io=new IntersectionObserver((es)=>es.forEach((e)=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:0.12,rootMargin:'0px 0px -6% 0px'});
    els.forEach((e)=>io.observe(e));})();
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
</script>
</body>
</html>`;
}
