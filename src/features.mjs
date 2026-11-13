// Extra markup + script that only some pages need. page.mjs adds the 'lightbox' feature to any page whose HTML
// contains data-viewer markup (gallery pictures, video thumbnails); shell.mjs then appends it to that page only.
//
// The viewer is one native <dialog>. Its items are links marked data-viewer="image" | "embed" | "video".
// Links inside the same [data-viewer-group] container are stepped through with the previous/next buttons;
// a link outside any group opens on its own.

import { renderTemplate } from './template.mjs';

export const LIGHTBOX_HTML = renderTemplate('lightbox');
export const LIGHTBOX_JS = `(function(){
  var dlg=document.getElementById('lightbox'); if(!dlg||!dlg.showModal) return;
  var media=dlg.querySelector('.lb-media'), cap=dlg.querySelector('.lb-cap'), items=[], i=0;
  function clear(){ media.textContent=''; }   // removing an iframe/video element also stops it playing
  function make(a){
    var k=a.dataset.viewer, el;
    if(k==='image'){ el=document.createElement('img'); el.onload=el.onerror=function(){ el.classList.add('ready'); }; el.src=a.href; el.alt=a.dataset.alt||''; }
    else if(k==='embed'){
      el=document.createElement('iframe'); el.src=a.dataset.src; el.title=a.dataset.title||'Video';
      el.allow='autoplay; encrypted-media; picture-in-picture; fullscreen'; el.allowFullscreen=true;
    } else {
      el=document.createElement('video'); el.controls=true; el.autoplay=true; el.playsInline=true;
      el.setAttribute('aria-label',a.dataset.title||'Video');
      var s=document.createElement('source'); s.src=a.dataset.src; s.type=a.dataset.type||''; el.appendChild(s);
    }
    el.className='lb-'+k; return el;
  }
  var t, reduce=matchMedia('(prefers-reduced-motion: reduce)');
  function render(){
    var a=items[i]; clear(); media.appendChild(make(a));
    var label=a.dataset.group||a.dataset.title||'';
    cap.textContent=label+(items.length>1?(label?' \\u2014 ':'')+(i+1)+' / '+items.length:'');
    [i-1,i+1].forEach(function(k){ var b=items[(k+items.length)%items.length]; if(b.dataset.viewer==='image') new Image().src=b.href; });
    dlg.classList.remove('swapping');
  }
  // Opening renders straight away (the dialog itself fades in); stepping prev/next fades the old picture out first.
  function show(n,soft){
    i=(n+items.length)%items.length; clearTimeout(t);
    if(soft&&media.firstChild&&!reduce.matches){ dlg.classList.add('swapping'); t=setTimeout(render,160); } else render();
  }
  [].forEach.call(document.querySelectorAll('[data-viewer]'),function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();
      var g=a.closest('[data-viewer-group]');
      items=g?[].slice.call(g.querySelectorAll('[data-viewer]')):[a];
      dlg.classList.toggle('single',items.length<2); show(items.indexOf(a),false); dlg.showModal();
    });
  });
  dlg.querySelector('.lb-prev').addEventListener('click',function(){show(i-1,true)});
  dlg.querySelector('.lb-next').addEventListener('click',function(){show(i+1,true)});
  dlg.querySelector('.lb-close').addEventListener('click',function(){dlg.close()});
  dlg.addEventListener('close',function(){
    clearTimeout(t); dlg.classList.remove('swapping');
    [].forEach.call(media.querySelectorAll('video'),function(v){ v.pause(); });
    [].forEach.call(media.querySelectorAll('iframe'),function(f){ f.remove(); });
    t=setTimeout(function(){ if(!dlg.open) clear(); },450);   // after the fade-out
  });
  dlg.addEventListener('click',function(e){
    var c=e.target.classList; if(e.target===dlg||c.contains('lb-stage')||c.contains('lb-media')) dlg.close();
  });
  dlg.addEventListener('keydown',function(e){
    if(e.target.tagName==='VIDEO') return;   // let the video's own controls use the arrow keys
    if(e.key==='ArrowLeft'){e.preventDefault();show(i-1,true)} else if(e.key==='ArrowRight'){e.preventDefault();show(i+1,true)}
  });
  var x0=null;
  dlg.addEventListener('touchstart',function(e){x0=e.target.tagName==='VIDEO'?null:e.changedTouches[0].clientX},{passive:true});
  dlg.addEventListener('touchend',function(e){
    if(x0===null) return; var dx=e.changedTouches[0].clientX-x0; x0=null;
    if(Math.abs(dx)>50) show(dx<0?i+1:i-1,true);
  });
})();`;

export const FEATURES = { lightbox: { html: LIGHTBOX_HTML, js: LIGHTBOX_JS } };
