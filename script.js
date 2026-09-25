(() => {
  'use strict';
  const data = window.PORTFOLIO || { projects: [] };
  const projects = data.projects || [];
  const $ = (selector) => document.querySelector(selector);
  const pad = (n) => String(n).padStart(2, '0');
  const categoryName = (p) => ({ film: 'FILM', ads: 'ADS', photography: 'PHOTOGRAPHY' })[p.category] || p.category.toUpperCase();
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function appendDescription(element, description) {
    if (Array.isArray(description)) {
      description.forEach((part) => {
        const text = typeof part === 'string' ? part : part?.text || '';
        element.append(part?.bold ? make('strong', '', text) : document.createTextNode(text));
      });
    } else element.textContent = description || '';
  }
  function image(src, alt, position, lazy = true) {
    const img = make('img');
    img.src = src || 'media/demo/01.svg';
    img.alt = alt || '';
    img.draggable = false;
    img.loading = lazy ? 'lazy' : 'eager';
    img.decoding = 'async';
    img.style.objectPosition = position || '50% 50%';
    img.addEventListener('error', () => {
      img.alt = 'Image unavailable — check the media path';
      img.classList.add('media-error');
    }, { once: true });
    return img;
  }
  $('#nav-count').textContent = pad(projects.length);
  const dialog = $('#project-dialog');
  const fades = new WeakMap();
  async function fadeChange(element, update) {
    const previous = fades.get(element);
    if (previous) previous.cancel();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { update(); return; }
    const out = element.animate([{ opacity: getComputedStyle(element).opacity }, { opacity: 0 }], { duration: 140, easing: 'ease-in', fill: 'forwards' });
    fades.set(element, out);
    try { await out.finished; } catch { return; }
    if (fades.get(element) !== out) return;
    update();
    out.cancel();
    const incoming = element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 230, easing: 'ease-out' });
    fades.set(element, incoming);
    try { await incoming.finished; } catch { return; }
    if (fades.get(element) === incoming) fades.delete(element);
  }
  let openingCleanup = null;
  async function expandFromCard(source, start) {
    const target = dialog.querySelector('.youtube-player, .detail-media');
    if (!target) { dialog.classList.remove('from-orbit'); return; }
    const clone = source.cloneNode(false);
    clone.className = 'project-opening-image';
    clone.alt = '';
    clone.setAttribute('aria-hidden', 'true');
    Object.assign(clone.style, { left: `${start.left}px`, top: `${start.top}px`, width: `${start.width}px`, height: `${start.height}px` });
    dialog.append(clone);
    let cancelled = false;
    let animation;
    let reveal;
    const cleanup = () => {
      cancelled = true;
      animation?.cancel();
      reveal?.cancel();
      clone.remove();
      dialog.classList.remove('from-orbit', 'orbit-revealing');
      openingCleanup = null;
    };
    openingCleanup = cleanup;
    try {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (cancelled) return;
      const end = target.getBoundingClientRect();
      const rect = r => ({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
      Object.assign(clone.style, rect(start));
      animation = clone.animate([rect(start), rect(end)], {
        duration: 560, easing: 'cubic-bezier(.22,.75,.2,1)', fill: 'forwards'
      });
      await animation.finished;
      if (cancelled) return;
      dialog.classList.add('orbit-revealing');
      reveal = clone.animate([{opacity:1},{opacity:0}], {duration:320,fill:'forwards',easing:'ease-out'});
      await reveal.finished;
    } catch { /* Closing mid-transition cancels the opening cleanly. */ }
    finally { if (!cancelled) cleanup(); }
  }
  let closingDialog = false;
  async function closeProject() {
    if (!dialog.open || closingDialog) return;
    closingDialog = true;
    openingCleanup?.();
    dialog.classList.add('is-closing');
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await dialog.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 170, easing: 'ease-in' }).finished;
    }
    dialog.close();
    dialog.classList.remove('is-closing');
    closingDialog = false;
  }
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeProject(); });

  function openProject(project, sourceCard = null) {
    if (dialog.open || closingDialog) return;
    clearOrbitPreview();
    const source = sourceCard?.querySelector('img');
    const start = source?.getBoundingClientRect();
    const expand = source && start.width > 0 && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    dialog.classList.toggle('orbit-open', Boolean(expand));
    dialog.classList.toggle('from-orbit', Boolean(expand));
    const content = $('#project-content');
    content.replaceChildren();
    const heading = make('div', 'project-heading');
    const titleGroup = make('div');
    titleGroup.append(make('small', '', `${categoryName(project)} / ${project.year || ''}`));
    const title = make('h2', '', project.title); title.id = 'project-title';
    titleGroup.append(title);
    const description = make('p');
    appendDescription(description, project.description);
    heading.append(titleGroup, description);
    content.append(heading);
    const media = project.media?.length ? project.media : [{ type: 'image', src: project.cover }];
    media.forEach((item, index) => {
      const figure = make('figure', 'media-figure');
      let element;
      if (item.type === 'youtube' && /^[A-Za-z0-9_-]{11}$/.test(item.videoId)) {
        element = make('iframe', 'youtube-player');
        element.src = `https://www.youtube.com/embed/${item.videoId}${item.shareId ? `?si=${encodeURIComponent(item.shareId)}` : ""}`;
        element.title = `YouTube — ${project.title}`;
        element.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        element.allowFullscreen = true;
        element.referrerPolicy = 'strict-origin-when-cross-origin';
        if (location.protocol === 'file:') {
          figure.append(make('p', 'video-local-notice', 'Para reproducir YouTube aquí, abre el portfolio con «Abrir portfolio.command» en vez de index.html.'));
        }
        const watchLink = make('a', 'youtube-watch-link', 'Ver en YouTube ↗');
        watchLink.href = `https://www.youtube.com/watch?v=${item.videoId}`;
        watchLink.target = '_blank';
        watchLink.rel = 'noopener noreferrer';
        const linkCaption = make('figcaption');
        linkCaption.append(watchLink);
        figure.append(linkCaption);

      } else if (item.type === 'video') {
        element = make('video', 'detail-media');
        element.controls = true;
        element.playsInline = true;
        element.preload = 'metadata';
        element.poster = item.poster || project.cover || '';
        element.src = item.src;
        element.setAttribute('aria-label', item.alt || project.title);
        element.addEventListener('error', () => {
          figure.append(make('p', 'media-error', 'Video unavailable. Check the file path and use a browser-compatible MP4 or WebM.'));
        }, { once: true });
      } else {
        element = image(item.src, item.alt || project.title, null);
        element.className = 'detail-media';
        // Reserve the first image's final proportions before its lazy load.
        if (index === 0 && source?.naturalWidth && item.src === project.cover) {
          element.width = source.naturalWidth;
          element.height = source.naturalHeight;
          element.style.height = 'auto';
        }
      }
      figure.insertBefore(element, figure.querySelector('figcaption'));
      if (item.caption) figure.append(make('figcaption', '', item.caption));
      content.append(figure);
    });
    document.body.classList.add('modal-open');
    dialog.showModal();
    dialog.scrollTop = 0;
    $('#close-project').focus({ preventScroll: true });
    if (expand) expandFromCard(source, start);
  }
  $('#close-project').addEventListener('click', () => closeProject());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeProject();
  }});
  dialog.addEventListener('close', () => {
    openingCleanup?.();
    dialog.classList.remove('orbit-open');
    dialog.querySelectorAll('video').forEach((v) => { v.pause(); v.removeAttribute('src'); v.load(); });
    dialog.querySelectorAll('iframe').forEach((frame) => frame.remove());
    document.body.classList.remove('modal-open');
  });
  let filter = 'all';
  function renderWorks() {
    const selected = projects.filter((p) => filter === 'all' || p.category === filter);
    $('#work-count').textContent = `(${pad(selected.length)})`;
    const grid = $('#project-grid'); grid.replaceChildren();
    selected.forEach((project) => {
      const card = make('button', 'work-card');
      card.setAttribute('aria-label', `Open ${project.title}`);
      const photo = make('div', 'work-image');
      photo.append(image(project.cover, '', project.coverPosition));
      if (project.category === 'film') photo.append(make('span', 'film-badge', '▶'));
      const info = make('div', 'work-info');
      info.append(make('span', 'work-number', pad(projects.indexOf(project) + 1)), make('h2', 'work-title', project.title), make('span', 'work-meta', `${categoryName(project)} / ${project.year || ''}`));
      card.append(photo, info);
      card.addEventListener('click', () => openProject(project));
      grid.append(card);
    });
    if (!selected.length) grid.append(make('p', 'empty-state', 'No projects in this selection yet.'));
  }
  document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    fadeChange($('#project-grid'), renderWorks);
  }));
  document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
    fadeChange($('#project-grid'), () => $('#project-grid').classList.toggle('list', button.dataset.view === 'list'));
    document.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
  }));
  const contact = $('#contact-links');
  if (data.email) {
    const email = make('a', '', data.email); email.href = `mailto:${data.email}`; contact.append(email);
  } else contact.append(make('div', 'contact-pending', 'Contact details coming soon.'));
  [['instagram', 'Instagram'], ['vimeo', 'Vimeo']].forEach(([key, label]) => {
    if (data[key] && /^https?:\/\//i.test(data[key])) { const link = make('a', '', label); link.href = data[key]; link.target = '_blank'; link.rel = 'noopener noreferrer'; contact.append(link); }
  });
  const stage = $('#stage');
  let layout = 'orbit', angle = .3, targetAngle = .3, dragged = false, dragging = false, startX = 0, lastX = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let previewTimer = 0;
  let previewCard = null;
  const hoverPointer = matchMedia('(hover: hover) and (pointer: fine)');
  function clearOrbitPreview() {
    clearTimeout(previewTimer);
    previewTimer = 0;
    previewCard?.classList.remove('preview-active');
    previewCard = null;
    $('#home').classList.remove('orbit-previewing');
  }
  function queueOrbitPreview(card) {
    clearOrbitPreview();
    if (layout !== 'orbit' || dragging || dialog.open || !hoverPointer.matches) return;
    previewTimer = setTimeout(() => {
      if (layout !== 'orbit' || dragging || dialog.open || !card.matches(':hover')) return;
      const photo = card.querySelector('img');
      card.style.setProperty('--preview-height', `${photo.offsetHeight}px`);
      previewCard = card;
      card.classList.add('preview-active');
      $('#home').classList.add('orbit-previewing');
    }, 1000);
  }
  const galleryCards = projects.map((project, i) => {
    const card = make('button', 'gallery-card');
    card.setAttribute('aria-label', `Open ${project.title}`);
    card.append(image(project.cover, '', project.coverPosition, false));
    const caption = make('span', 'card-caption');
    caption.append(make('span', '', `${pad(i + 1)} / ${project.title}`), make('span', '', project.category === 'film' ? '▶' : '↗'));
    card.append(caption);
    const preview = make('span', 'orbit-preview');
    preview.setAttribute('aria-hidden', 'true');
    const previewText = make('span', 'orbit-preview-text');
    previewText.append(make('span', 'orbit-preview-title', project.title));
    const previewDescription = make('span', 'orbit-preview-description');
    appendDescription(previewDescription, project.description);
    previewText.append(previewDescription);
    preview.append(previewText);
    card.append(preview);
    card.addEventListener('pointerenter', () => queueOrbitPreview(card));
    card.addEventListener('pointerleave', clearOrbitPreview);
    card.addEventListener('click', () => { if (!dragged) openProject(project, layout === 'orbit' ? card : null); });
    card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') dragged = false; });
    $('#orbit').append(card); return card;
  });
  function draw() {
    const width = stage.clientWidth, height = stage.clientHeight;
    galleryCards.forEach((card, i) => {
      const theta = i / Math.max(galleryCards.length, 1) * Math.PI * 2 + angle;
      const depth = Math.cos(theta);
      card.classList.toggle('orbit-rear', layout === 'orbit' && depth < .35);
      let x, y, z, rotate;
      if (layout === 'orbit') {
        x = Math.sin(theta) * width * (matchMedia('(max-width:600px)').matches ? .26 : .37);
        y = Math.sin(theta * 2) * height * .17 - depth * height * .085;
        z = depth * 150 - 95;
        rotate = -Math.sin(theta) * 21;
      } else {
        const columns = width < 600 ? 3 : 4;
        const rows = Math.ceil(galleryCards.length / columns);
        const shift = Math.sin(angle - .3) * 25;
        x = ((i % columns) - (columns - 1) / 2) * width / (columns + .3) + shift;
        y = (Math.floor(i / columns) - (rows - 1) / 2) * height / Math.max(rows, 2);
        z = -180;
        rotate = ((i % 3) - 1) * 7;
      }
      card.style.transform = `translate(-50%, -50%) translate3d(${x}px,${y}px,${z}px) rotateY(${rotate}deg)`;
      card.style.zIndex = String(Math.round(depth * 100 + 101));
      card.style.setProperty('--orbit-brightness', layout === 'orbit' ? .68 + (depth + 1) * .16 : 1);
    });
  }
  let frame = 0;
  function tick() {
    frame = 0;
    const delta = targetAngle - angle;
    angle = reducedMotion.matches ? targetAngle : angle + delta * .11;
    draw();
    if (Math.abs(delta) > .001 && !$('#home').hidden) frame = requestAnimationFrame(tick);
  }
  function animate() { clearOrbitPreview(); if (!frame) frame = requestAnimationFrame(tick); }
  stage.addEventListener('wheel', (event) => { event.preventDefault(); targetAngle += (event.deltaY + event.deltaX) * .002; animate(); }, { passive: false });
  stage.addEventListener('pointerdown', (event) => { if (event.button !== 0) return; clearOrbitPreview(); dragging = true; dragged = false; startX = lastX = event.clientX; stage.classList.add('dragging'); });
  window.addEventListener('pointermove', (event) => { if (!dragging) return; if (Math.abs(event.clientX - startX) > 6) dragged = true; targetAngle += (event.clientX - lastX) * .007; lastX = event.clientX; animate(); });
  function endDrag() { dragging = false; stage.classList.remove('dragging'); }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('blur', () => { endDrag(); clearOrbitPreview(); });
  document.addEventListener('visibilitychange', clearOrbitPreview);
  $('#previous').addEventListener('click', () => { targetAngle -= .6; animate(); });
  $('#next').addEventListener('click', () => { targetAngle += .6; animate(); });
  document.querySelectorAll('[data-layout]').forEach((button) => button.addEventListener('click', () => {
    clearOrbitPreview();
    layout = button.dataset.layout;
    $('#home').classList.toggle('is-spread', layout === 'scatter');
    document.querySelectorAll('[data-layout]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    fadeChange($('#orbit'), draw);
  }));
  function route() {
    clearOrbitPreview();
    const page = ['works', 'contact'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
    ['home', 'works', 'contact'].forEach((id) => { $(`#${id}`).hidden = id !== page; });
    document.querySelectorAll('.header nav a').forEach((a) => { if (a.hash === `#${page}`) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.title = `${page === 'home' ? 'JeanPaul' : page === 'works' ? 'All Works — JeanPaul' : 'Contact — JeanPaul'} — Photography & Moving Image`;
    if (dialog.open) dialog.close();
    window.scrollTo(0, 0);
    if (page === 'home') draw();
  }
  window.addEventListener('resize', () => { clearOrbitPreview(); draw(); });
  window.addEventListener('hashchange', () => fadeChange(document.querySelector('main'), route));
  renderWorks(); route();
})();
