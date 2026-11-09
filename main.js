// Divia: portafolio de reels
// Para agregar un reel nuevo: copia el bloque de PomPom, cambia los datos y apunta
// "video" y "poster" a tus archivos en assets/reels/. Los reels con "pronto: true"
// se muestran como "En producción"; bórralos cuando tengas los reels reales.

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

/* Filtros, grilla y visor */
const state = { cat: 'Todos', open: 'pompom', sound: false };
const tabsBox = document.querySelector('.tabs');
const grid = document.getElementById('grid');
const viewer = document.getElementById('viewer');
const vVideo = document.getElementById('viewer-video');
const vSoon = viewer.querySelector('.stage-soon');
const vBars = viewer.querySelector('.bars');
const vSound = viewer.querySelector('.sound');
const vCat = viewer.querySelector('.case-cat');
const vGoal = viewer.querySelector('.case-goal');
const vFacts = viewer.querySelector('.case-facts');

const cats = ['Todos', ...new Set(REELS.map((r) => r.cat))];
const visible = () => (state.cat === 'Todos' ? REELS : REELS.filter((r) => r.cat === state.cat));

function renderTabs() {
  tabsBox.replaceChildren(...cats.map((c) => {
    const b = el('button', { class: 'tab', type: 'button', 'aria-pressed': String(c === state.cat), text: c });
    b.addEventListener('click', () => {
      state.cat = c;
      if (!visible().some((r) => r.id === state.open)) state.open = (visible().find((r) => !r.pronto) || {}).id || null;
      render();
    });
    return b;
  }));
}

function renderGrid() {
  grid.replaceChildren(...visible().map((r) => {
    if (r.pronto) {
      return el('div', { class: 'tile soon', style: `background:${r.color};color:${r.ink}` }, [
        el('span', { class: 'dur', text: 'En producción' }),
        el('div', { class: 'meta' }, [el('b', { text: r.brand }), el('span', { text: r.product })])
      ]);
    }
    const preview = el('video', { src: r.video, poster: r.poster, playsinline: '', muted: '', loop: '', preload: 'none' });
    preview.muted = true;
    const t = el('button', {
      class: 'tile', type: 'button', 'aria-label': `Ver el reel de ${r.brand}`,
      'aria-current': String(r.id === state.open)
    }, [
      preview,
      el('span', { class: 'dur', text: r.facts[0][1] }),
      el('div', { class: 'meta' }, [el('b', { text: r.brand }), el('span', { text: r.product })])
    ]);
    if (!reduceMotion) {
      t.addEventListener('mouseenter', () => preview.play().catch(() => {}));
      t.addEventListener('mouseleave', () => { preview.pause(); preview.currentTime = 0; });
    }
    t.addEventListener('click', () => {
      state.open = r.id;
      render();
      viewer.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
    return t;
  }));
}

function renderViewer() {
  const list = visible().filter((r) => !r.pronto);
  const r = byId(state.open);
  if (!r || r.pronto) { viewer.hidden = true; vVideo.pause(); return; }
  viewer.hidden = false;
  const idx = list.indexOf(r);

  vBars.replaceChildren(...list.map((x, i) => el('span', { class: 'bar' }, [
    el('i', { style: i < idx ? 'width:100%' : '' })
  ])));

  vSoon.hidden = true;
  if (vVideo.getAttribute('src') !== r.video) {
    vVideo.src = r.video;
    vVideo.poster = r.poster;
  }
  vVideo.muted = !state.sound;
  vSound.textContent = state.sound ? 'Silenciar' : 'Activar sonido';
  vSound.setAttribute('aria-pressed', String(state.sound));
  if (!reduceMotion || state.sound) vVideo.play().catch(() => {});

  vCat.textContent = `${r.cat}, ${r.product.toLowerCase()}`;
  vGoal.textContent = r.goal;
  vFacts.replaceChildren(...r.facts.map(([k, v]) => el('div', {}, [el('dt', { text: k }), el('dd', { text: v })])));

  const multi = list.length > 1;
  viewer.querySelectorAll('[data-go]').forEach((b) => { b.hidden = !multi; });
}

vVideo.addEventListener('timeupdate', () => {
  const list = visible().filter((r) => !r.pronto);
  const idx = list.findIndex((r) => r.id === state.open);
  const bar = vBars.children[idx];
  if (bar && vVideo.duration) bar.firstChild.style.width = (vVideo.currentTime / vVideo.duration * 100) + '%';
});

vSound.addEventListener('click', () => {
  state.sound = !state.sound;
  vVideo.muted = !state.sound;
  vSound.textContent = state.sound ? 'Silenciar' : 'Activar sonido';
  vSound.setAttribute('aria-pressed', String(state.sound));
  vVideo.play().catch(() => {});
});

viewer.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => {
  const list = visible().filter((r) => !r.pronto);
  const idx = list.findIndex((r) => r.id === state.open);
  const n = (Math.max(idx, 0) + Number(b.dataset.go) + list.length) % list.length;
  state.open = list[n].id;
  render();
}));
viewer.querySelector('[data-close]').addEventListener('click', () => {
  state.open = null;
  render();
});

// Pausa el visor cuando sale de pantalla
new IntersectionObserver(([e]) => {
  if (!e.isIntersecting) vVideo.pause();
  else if (!viewer.hidden && (!reduceMotion || state.sound)) vVideo.play().catch(() => {});
}, { threshold: 0.25 }).observe(viewer);

function render() { renderTabs(); renderGrid(); renderViewer(); }
render();

/* Comparador */
const range = document.getElementById('rango');
const compare = document.querySelector('.compare');
range.addEventListener('input', () => compare.style.setProperty('--pos', range.value + '%'));
