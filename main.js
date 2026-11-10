// Divia: portafolio de reels e imágenes
// Para agregar un reel nuevo: copia el bloque de PomPom en REELS, cambia los datos y apunta
// "video" y "poster" a tus archivos en assets/reels/. Los reels con "pronto: true"
// se muestran como "En producción"; bórralos cuando tengas los reels reales.
// Para agregar una imagen: deja el archivo en assets/imagenes/ y suma una línea en IMAGENES
// (más abajo). Se muestran completas, en vertical (9:16), tres por línea.

const REELS = [
  {
    id: 'pompom',
    brand: 'PomPom',
    product: 'Aceites bronceadores',
    cat: 'Belleza',
    video: 'assets/reels/pompom.mp4',
    poster: 'assets/reels/pompom-poster.jpg',
    goal: 'Presentar tres tonos de aceite bronceador y ayudar a elegir el tuyo.',
    facts: [
      ['Duración', '0:15'],
      ['Formato', 'Vertical 9:16'],
      ['Tonos', 'Dorado, Chocolate y Black']
    ]
  },
  { id: 'molienda', brand: 'Molienda', product: 'Café de especialidad', cat: 'Comida y bebida', color: '#4A3426', ink: '#F4EFE8', pronto: true },
  { id: 'ladera', brand: 'Ladera', product: 'Vino natural', cat: 'Comida y bebida', color: '#7A2E3A', ink: '#F7ECEC', pronto: true },
  { id: 'faro', brand: 'Faro', product: 'Audífonos', cat: 'Tecnología', color: '#3C4A62', ink: '#EEF2F7', pronto: true }
];

const WALL = {
  1: ['img:assets/reels/pompom-cuadro-1.jpg', 'video:pompom', 'img:assets/reels/pompom-cuadro-4.jpg', 'block:molienda'],
  2: ['img:assets/reels/pompom-cuadro-2.jpg', 'block:ladera', 'img:assets/reels/pompom-cuadro-5.jpg', 'img:assets/reels/pompom-cuadro-6.jpg'],
  3: ['block:faro', 'img:assets/reels/pompom-cuadro-3.jpg', 'video:pompom', 'img:assets/reels/pompom-cuadro-6.jpg']
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const byId = (id) => REELS.find((r) => r.id === id);
const el = (tag, attrs = {}, children = []) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'style') n.style.cssText = v;
    else n.setAttribute(k, v);
  }
  children.forEach((c) => n.append(c));
  return n;
};

/* Muro del hero */
function wallItem(spec) {
  const [kind, val] = spec.split(':');
  if (kind === 'img') {
    return el('div', { class: 'wall-item' }, [el('img', { src: val, alt: '', loading: 'lazy' })]);
  }
  if (kind === 'video') {
    const r = byId(val);
    const v = el('video', { src: r.video, poster: r.poster, playsinline: '', muted: '', loop: '', preload: 'none' });
    v.muted = true;
    if (!reduceMotion) v.autoplay = true;
    return el('div', { class: 'wall-item' }, [v]);
  }
  const r = byId(val);
  return el('div', { class: 'wall-item block', style: `background:${r.color};color:${r.ink}` }, [
    el('b', { text: r.brand }), el('span', { text: r.product })
  ]);
}
document.querySelectorAll('.col').forEach((col) => {
  const specs = WALL[col.dataset.col];
  // Se duplica la lista para que el desplazamiento sea continuo.
  specs.concat(specs).forEach((s) => col.append(wallItem(s)));
});

/* Filtros, grilla y reproductor a pantalla completa */
const state = { cat: 'Todos', open: null, sound: true };
const tabsBox = document.querySelector('.tabs');
const grid = document.getElementById('grid');
const player = document.getElementById('player');
const pVideo = document.getElementById('player-video');
const pBars = player.querySelector('.bars');
const pSound = player.querySelector('.sound');
const pBrand = player.querySelector('.case-brand');
const pCat = player.querySelector('.case-cat');
const pGoal = player.querySelector('.case-goal');
const pFacts = player.querySelector('.case-facts');
const pNav = player.querySelector('.player-nav');

const cats = ['Todos', ...new Set(REELS.map((r) => r.cat))];
const visible = () => (state.cat === 'Todos' ? REELS : REELS.filter((r) => r.cat === state.cat));
const playable = () => visible().filter((r) => !r.pronto);

function renderTabs() {
  tabsBox.replaceChildren(...cats.map((c) => {
    const b = el('button', { class: 'tab', type: 'button', 'aria-pressed': String(c === state.cat), text: c });
    b.addEventListener('click', () => { state.cat = c; renderTabs(); renderGrid(); });
    return b;
  }));
}

function renderGrid() {
  grid.replaceChildren(...visible().map((r, i) => {
    if (r.pronto) {
      return el('div', { class: 'tile soon', style: `background:${r.color};color:${r.ink};--i:${i}` }, [
        el('span', { class: 'dur', text: 'En producción' }),
        el('div', { class: 'meta' }, [el('b', { text: r.brand }), el('span', { text: r.product })])
      ]);
    }
    const preview = el('video', { src: r.video, poster: r.poster, playsinline: '', muted: '', loop: '', preload: 'none' });
    preview.muted = true;
    const t = el('button', { class: 'tile', type: 'button', style: `--i:${i}`, 'aria-label': `Ver el reel de ${r.brand} con sonido` }, [
      preview,
      el('span', { class: 'dur', text: r.facts[0][1] }),
      el('span', { class: 'play', 'aria-hidden': 'true' }),
      el('div', { class: 'meta' }, [el('b', { text: r.brand }), el('span', { text: r.product })])
    ]);
    if (!reduceMotion) {
      t.addEventListener('mouseenter', () => preview.play().catch(() => {}));
      t.addEventListener('mouseleave', () => { preview.pause(); preview.currentTime = 0; });
    }
    t.addEventListener('click', () => { preview.pause(); openReel(r.id); });
    return t;
  }));
}

function updateSound() {
  pVideo.muted = !state.sound;
  pSound.textContent = state.sound ? 'Silenciar' : 'Activar sonido';
  pSound.setAttribute('aria-pressed', String(state.sound));
}

function showReel() {
  const list = playable();
  const r = byId(state.open);
  const idx = list.indexOf(r);
  pBars.replaceChildren(...list.map((x, i) => el('span', { class: 'bar' }, [el('i', { style: i < idx ? 'width:100%' : '' })])));
  if (pVideo.getAttribute('src') !== r.video) { pVideo.src = r.video; pVideo.poster = r.poster; }
  pVideo.currentTime = 0;
  updateSound();
  pVideo.play().catch(() => { state.sound = false; updateSound(); pVideo.play().catch(() => {}); });
  pBrand.textContent = r.brand;
  pCat.textContent = `${r.cat}, ${r.product.toLowerCase()}`;
  pGoal.textContent = r.goal;
  pFacts.replaceChildren(...r.facts.map(([k, v]) => el('div', {}, [el('dt', { text: k }), el('dd', { text: v })])));
  pNav.hidden = list.length < 2;
}

function openReel(id) {
  state.open = id;
  showReel();
  if (!player.open) {
    if (typeof player.showModal === 'function') player.showModal(); else player.setAttribute('open', '');
    document.documentElement.classList.add('no-scroll');
  }
}

function step(d) {
  const list = playable();
  if (list.length < 2) return;
  const idx = list.findIndex((r) => r.id === state.open);
  openReel(list[(idx + d + list.length) % list.length].id);
}

pVideo.addEventListener('timeupdate', () => {
  const idx = playable().findIndex((r) => r.id === state.open);
  const bar = pBars.children[idx];
  if (bar && pVideo.duration) bar.firstChild.style.width = (pVideo.currentTime / pVideo.duration * 100) + '%';
});
pSound.addEventListener('click', () => { state.sound = !state.sound; updateSound(); pVideo.play().catch(() => {}); });
player.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => step(Number(b.dataset.go))));
player.querySelector('.player-close').addEventListener('click', () => player.close());
player.addEventListener('click', (e) => { if (e.target === player) player.close(); });
player.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
});
player.addEventListener('close', () => {
  pVideo.pause();
  state.open = null;
  document.documentElement.classList.remove('no-scroll');
});

renderTabs();
renderGrid();

/* Comparador */
const range = document.getElementById('rango');
const compare = document.querySelector('.compare');
range.addEventListener('input', () => compare.style.setProperty('--pos', range.value + '%'));

/* Imágenes */
const IMAGENES = [
  { src: 'assets/imagenes/pompom-imagen-2.jpg', alt: 'Aceite PomPom Dorado gigante sobre una playa con bañistas' },
  { src: 'assets/imagenes/pompom-imagen-3.jpg', alt: 'Aceite PomPom Chocolate sobre una toalla en la arena, con lentes de sol' },
  { src: 'assets/imagenes/pompom-imagen-4.jpg', alt: 'Aceite PomPom Black al borde de una piscina iluminada de noche' }
];

document.getElementById('gallery').replaceChildren(...IMAGENES.map((im) =>
  el('figure', { class: 'shot' }, [el('img', { src: im.src, alt: im.alt, loading: 'lazy' })])
));

/* Movimiento: entrada del inicio y grilla en cascada */
const root = document.documentElement;
if (root.classList.contains('motion')) {
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  io.observe(grid);
} else {
  grid.classList.add('in');
}

/* Cursor "Ver" sobre los reels (solo con mouse) */
const cursor = document.querySelector('.cursor');
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  grid.addEventListener('mousemove', (e) => {
    const onTile = e.target.closest('.tile:not(.soon)');
    cursor.classList.toggle('on', Boolean(onTile));
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  grid.addEventListener('mouseleave', () => cursor.classList.remove('on'));
  grid.addEventListener('click', () => cursor.classList.remove('on'));
}

/* Contacto: los botones de cotizar eligen el motivo en el formulario */
const form = document.getElementById('contact-form');
const interes = document.getElementById('f-interes');
document.querySelectorAll('[data-interes]').forEach((a) => a.addEventListener('click', () => {
  interes.value = a.dataset.interes;
}));

/* Envío del formulario sin salir de la página (FormSubmit) */
const status = form.querySelector('.form-status');
const WHATSAPP = 'https://wa.me/56978797927';
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (form.querySelector('.honey').value) return;
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true;
  status.className = 'form-status';
  status.textContent = 'Enviando...';
  try {
    const res = await fetch('https://formsubmit.co/ajax/tomasurizarbusiness@gmail.com', {
      method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form)
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    status.classList.add('ok');
    status.textContent = 'Listo, recibí tu mensaje. Te respondo en menos de un día.';
  } catch (err) {
    status.replaceChildren(
      document.createTextNode('No se pudo enviar. Escríbeme por '),
      el('a', { href: WHATSAPP, target: '_blank', rel: 'noopener', text: 'WhatsApp' }),
      document.createTextNode(' o a tomasurizarbusiness@gmail.com.')
    );
  } finally {
    btn.disabled = false;
  }
});
