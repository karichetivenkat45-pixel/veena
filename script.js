(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  // Nav: mobile toggle and scroll spy
  var navLinks = document.getElementById('navLinks');
  var navToggle = document.getElementById('navToggle');
  navToggle.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', false);
    }
  });
  var links = Array.prototype.slice.call(navLinks.querySelectorAll('a'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) spy.observe(target);
    });
  }

  // Count-up numbers
  function countUp(el) {
    var end = +el.dataset.count;
    if (reduceMotion || !end) return;
    var start = performance.now();
    (function tick(now) {
      var p = Math.min(1, (now - start) / 900);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  // Scroll reveal
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        entry.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // Project carousel
  var carousel = document.getElementById('carousel');
  function slide(dir) {
    var card = carousel.querySelector('.project');
    carousel.scrollBy({ left: dir * (card.offsetWidth + 22), behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  document.getElementById('prevProject').addEventListener('click', function () { slide(-1); });
  document.getElementById('nextProject').addEventListener('click', function () { slide(1); });

  // Decorative mosaic on each project panel (seeded so it is stable between loads)
  var MOSAIC_COLORS = ['#ffffff', '#4f7dff', '#f4c95a', '#d3202f'];
  document.querySelectorAll('.project-visual').forEach(function (panel) {
    var seed = +panel.dataset.seed || 1;
    function rand() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var number = panel.firstElementChild;
    for (var i = 0; i < 48; i++) {
      var cell = document.createElement('i');
      cell.style.setProperty('--c', MOSAIC_COLORS[Math.floor(rand() * rand() * MOSAIC_COLORS.length)]);
      cell.style.setProperty('--o', (0.1 + rand() * 0.9).toFixed(2));
      panel.insertBefore(cell, number);
    }
  });

  // Periodic table of skills
  var FAMILIES = {
    lang: ['Languages', '#d3202f'],
    fw: ['Frameworks & libraries', '#161b33'],
    ai: ['AI model development', '#b9821c'],
    delivery: ['Applied AI delivery', '#5b6078'],
    cloud: ['Cloud', '#1c46c8'],
    tools: ['Tools & practices', '#8f8672']
  };
  var SKILLS = [
    ['Py', 'Python', 'lang'], ['Sq', 'SQL', 'lang'],
    ['Lc', 'LangChain', 'fw'], ['Lg', 'LangGraph', 'fw'], ['Hf', 'Hugging Face', 'fw'], ['Fa', 'FAISS', 'fw'],
    ['St', 'Streamlit', 'fw'], ['Mc', 'MCP', 'fw'],
    ['Ll', 'LLMs', 'ai'], ['Rg', 'RAG pipeline design', 'ai'], ['Em', 'Embeddings', 'ai'], ['Ss', 'Semantic search', 'ai'],
    ['Pe', 'Prompt engineering', 'ai'], ['Me', 'Model evaluation', 'ai'], ['Ft', 'Fine-tuning', 'ai'], ['Ag', 'Agentic AI', 'ai'],
    ['Aa', 'AI assistant development', 'delivery'], ['Ba', 'Billing automation', 'delivery'], ['Ap', 'API integration', 'delivery'],
    ['Wo', 'Workflow orchestration', 'delivery'], ['Cf', 'Cross-functional collaboration', 'delivery'],
    ['Az', 'Azure', 'cloud'], ['Ao', 'Azure OpenAI', 'cloud'],
    ['Gh', 'GitHub', 'tools'], ['Ci', 'CI/CD', 'tools'], ['Am', 'Agile methodologies', 'tools']
  ];
  var ptable = document.getElementById('ptable');
  var legend = document.getElementById('legend');
  var detail = document.getElementById('elementDetail');
  var tiles = [];
  function show(tile) {
    tiles.forEach(function (t) { t.classList.toggle('active', t === tile); });
    detail.style.setProperty('--c', FAMILIES[tile.dataset.cat][1]);
    document.getElementById('elNum').textContent = 'No. ' + tile.dataset.num;
    document.getElementById('elSym').textContent = tile.dataset.sym;
    document.getElementById('elName').textContent = tile.dataset.name;
    document.getElementById('elCat').textContent = FAMILIES[tile.dataset.cat][0];
  }
  SKILLS.forEach(function (sk, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'el';
    b.dataset.sym = sk[0]; b.dataset.name = sk[1]; b.dataset.cat = sk[2]; b.dataset.num = i + 1;
    b.style.setProperty('--c', FAMILIES[sk[2]][1]);
    b.setAttribute('aria-label', sk[1] + ', ' + FAMILIES[sk[2]][0]);
    var num = document.createElement('i'); num.textContent = i + 1;
    var sym = document.createElement('b'); sym.textContent = sk[0];
    var name = document.createElement('small'); name.textContent = sk[1];
    b.append(num, sym, name);
    ['mouseenter', 'focus', 'click'].forEach(function (ev) { b.addEventListener(ev, function () { show(b); }); });
    ptable.appendChild(b);
    tiles.push(b);
  });
  var activeFamily = null;
  Object.keys(FAMILIES).forEach(function (key) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = FAMILIES[key][0];
    btn.style.setProperty('--c', FAMILIES[key][1]);
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', function () {
      activeFamily = activeFamily === key ? null : key;
      Array.prototype.forEach.call(legend.children, function (c) { c.setAttribute('aria-pressed', c === btn && activeFamily ? 'true' : 'false'); });
      tiles.forEach(function (t) { t.classList.toggle('dim', !!activeFamily && t.dataset.cat !== activeFamily); });
    });
    legend.appendChild(btn);
  });
  show(tiles[0]);

  // 3D parallax on the hero portrait: the layered stage turns toward the pointer, the name drifts the other way
  var stage = document.getElementById('stage');
  var ghost = document.getElementById('ghost');
  if (stage && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', function (e) {
      var x = (e.clientX / window.innerWidth) * 2 - 1;
      var y = (e.clientY / window.innerHeight) * 2 - 1;
      stage.style.transform = 'rotateY(' + (x * 16).toFixed(2) + 'deg) rotateX(' + (-y * 11).toFixed(2) + 'deg)';
      ghost.style.transform = 'translate(calc(-50% + ' + (-x * 26).toFixed(1) + 'px),' + (-y * 12).toFixed(1) + 'px)';
    }, { passive: true });
  }
})();
