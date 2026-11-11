
(function () {
  const BASE = (location.pathname.match(/^(\/awake-filmforge-preview)/) || ['', ''])[1];
  const KEY = 'ff.console.v1';
  const SESSION = 'ff.console.session';
  const STEPS = ['briefing', 'preproductie', 'first-cut', 'revisie', 'opgeleverd'];
  const STEP_LABEL = {
    briefing: 'Briefing',
    preproductie: 'Preproductie',
    'first-cut': 'First cut',
    revisie: 'Revisie',
    opgeleverd: 'Opgeleverd',
  };
  const USERS = {
    'admin@filmforge.nl': { pass: 'VITbouw-Admin-2026', role: 'admin', name: 'Studio VITbouw' },
    'klant@filmforge.nl': { pass: 'VITbouw-Klant-2026', role: 'klant', name: 'Voorbeeld Klant' },
  };

  function seed() {
    return {
      clients: [
        { id: 'c-demo', name: 'Voorbeeld Klant', email: 'klant@filmforge.nl', label: 'Voorbeeld' },
        { id: 'c-studio', name: 'Studio Demo BV', email: 'demo@filmforge.nl', label: 'Voorbeeld' },
      ],
      projects: [
        {
          id: 'p-1',
          clientId: 'c-demo',
          title: 'Voorbeeld · AI promo 30s',
          status: 'revisie',
          brief: 'Korte AI-promo voor social: 30 seconden, merktonaal, eindshot met logo. Voorbeeldproject voor deze preview.',
          deliverables: [
            { name: 'First cut v1 (placeholder)', url: BASE + '/voorstel-vitbouw/ff/og-home.jpg' },
            { name: 'Revisie notes (dummy)', url: BASE + '/voorstel-vitbouw/ff/ff-logo.svg' },
          ],
          notes: [
            { from: 'studio', at: '2026-11-01T10:00:00+01:00', text: 'First cut staat klaar voor review.' },
            { from: 'klant', at: '2026-11-02T14:20:00+01:00', text: 'Graag logo groter in de laatste shot.' },
          ],
          feedback: [],
        },
        {
          id: 'p-2',
          clientId: 'c-demo',
          title: 'Voorbeeld · Website hero reel',
          status: 'preproductie',
          brief: 'Hero-reel voor website homepage. Moodboard akkoord, script in wording. Voorbeeldproject.',
          deliverables: [],
          notes: [{ from: 'studio', at: '2026-11-03T09:00:00+01:00', text: 'Storyboard volgt deze week.' }],
          feedback: [],
        },
        {
          id: 'p-3',
          clientId: 'c-studio',
          title: 'Voorbeeld · Explainer serie',
          status: 'briefing',
          brief: 'Drie korte explainers voor productfeatures. Status: briefing.',
          deliverables: [],
          notes: [],
          feedback: [],
        },
      ],
    };
  }

  function loadDB() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        const s = seed();
        localStorage.setItem(KEY, JSON.stringify(s));
        return s;
      }
      return JSON.parse(raw);
    } catch (e) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
  }
  function saveDB(db) {
    localStorage.setItem(KEY, JSON.stringify(db));
  }
  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION) || 'null');
    } catch {
      return null;
    }
  }
  function setSession(s) {
    if (!s) localStorage.removeItem(SESSION);
    else localStorage.setItem(SESSION, JSON.stringify(s));
  }
  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function fmt(iso) {
    try {
      return new Intl.DateTimeFormat('nl-NL', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Europe/Amsterdam',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  }
  function path() {
    return location.pathname.replace(/\/$/, '') || '/';
  }
  function go(href) {
    if (href.startsWith('/') && BASE) location.href = BASE + href;
    else location.href = href;
  }
  function pill(status) {
    return `<span class="ffq-pill s-${esc(status)}">${esc(STEP_LABEL[status] || status)}</span>`;
  }
  function pipeline(status) {
    const idx = STEPS.indexOf(status);
    return (
      '<div class="ffq-pipe" aria-label="Status pipeline">' +
      STEPS.map((s, i) => {
        let cls = 'ffq-step';
        if (i < idx) cls += ' done';
        if (i === idx) cls += ' on';
        return `<div class="${cls}">${esc(STEP_LABEL[s])}</div>`;
      }).join('') +
      '</div>'
    );
  }

  function requireRole(role) {
    const sess = getSession();
    if (!sess) {
      go('/portaal/');
      return null;
    }
    if (sess.role !== role) {
      go(sess.role === 'admin' ? '/portaal/admin/' : '/portaal/klant/');
      return null;
    }
    return sess;
  }

  function mountLogin(root) {
    const sess = getSession();
    if (sess) {
      go(sess.role === 'admin' ? '/portaal/admin/' : '/portaal/klant/');
      return;
    }
    root.innerHTML = `
      <div class="ffq-banner"><i></i> Preview · geen productie-login op filmforge.nl</div>
      <div class="ffq-hero">
        <div class="ffq-kick"><i></i>VITbouw Console · Over ons</div>
        <h1 class="ffq-t">portaal<span>.</span></h1>
        <p class="ffq-sub">Hoogwaardige preview van het klant- en adminportaal (Console Basis €300/mnd · Pro €600/mnd). Alles blijft lokaal in je browser.</p>
      </div>
      <div class="ffq-shell">
        <div class="ffq-grid2">
          <form class="ffq-panel" id="ffq-login">
            <h2>Inloggen</h2>
            <label class="ffq-label" for="ffq-email">E-mail</label>
            <input class="ffq-input" id="ffq-email" type="email" autocomplete="username" required placeholder="admin@filmforge.nl"/>
            <label class="ffq-label" for="ffq-pass">Wachtwoord</label>
            <input class="ffq-input" id="ffq-pass" type="password" autocomplete="current-password" required/>
            <div class="ffq-err" id="ffq-err"></div>
            <button class="ffq-btn" type="submit">Naar console</button>
          </form>
          <div class="ffq-panel">
            <h2>Demo-logins</h2>
            <p>Gebruik deze preview-accounts. Geen echte accounts — alleen voor deze Awake-preview.</p>
            <div class="ffq-demo">
              <strong>Admin (studio)</strong><br/>
              <code>admin@filmforge.nl</code> / <code>VITbouw-Admin-2026</code>
            </div>
            <div class="ffq-demo">
              <strong>Klant</strong><br/>
              <code>klant@filmforge.nl</code> / <code>VITbouw-Klant-2026</code>
            </div>
            <div class="ffq-row">
              <a class="ffq-btn ghost" href="${BASE}/prijzen">Prijzen</a>
              <a class="ffq-btn ghost" href="${BASE}/contacts">Contact</a>
            </div>
          </div>
        </div>
      </div>`;
    root.querySelector('#ffq-login').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = root.querySelector('#ffq-email').value.trim().toLowerCase();
      const pass = root.querySelector('#ffq-pass').value;
      const u = USERS[email];
      const err = root.querySelector('#ffq-err');
      if (!u || u.pass !== pass) {
        err.textContent = 'Onjuiste combinatie. Gebruik de demo-logins hiernaast.';
        return;
      }
      setSession({ email, role: u.role, name: u.name, at: Date.now() });
      go(u.role === 'admin' ? '/portaal/admin/' : '/portaal/klant/');
    });
  }

  function topbar(sess, title) {
    return `
      <div class="ffq-banner"><i></i> Preview · VITbouw Console (lokaal in je browser)</div>
      <div class="ffq-topbar">
        <div class="ffq-row">
          <span class="ffq-role">${esc(sess.role)}</span>
          <strong>${esc(sess.name)}</strong>
          <span class="ffq-muted">${esc(sess.email)}</span>
        </div>
        <div class="ffq-row">
          <a class="ffq-btn ghost" href="${BASE}/prijzen">Prijzen</a>
          <a class="ffq-btn ghost" href="${BASE}/contacts">Contact</a>
          <button class="ffq-btn danger" type="button" id="ffq-out">Uitloggen</button>
        </div>
      </div>
      <div class="ffq-hero">
        <div class="ffq-kick"><i></i>Over ons</div>
        <h1 class="ffq-t">${esc(title)}<span>.</span></h1>
      </div>`;
  }

  function bindLogout(root) {
    root.querySelector('#ffq-out')?.addEventListener('click', () => {
      setSession(null);
      go('/portaal/');
    });
  }

  function mountKlant(root) {
    const sess = requireRole('klant');
    if (!sess) return;
    const db = loadDB();
    const client = db.clients.find((c) => c.email === sess.email) || db.clients[0];
    let projects = db.projects.filter((p) => p.clientId === client.id);
    let selected = projects[0]?.id || null;

    function render() {
      const list = projects
        .map(
          (p) => `
        <div class="ffq-item" data-id="${esc(p.id)}">
          <div class="ffq-row" style="justify-content:space-between">
            <h3>${esc(p.title)}</h3>
            ${pill(p.status)}
          </div>
          <p class="ffq-muted">${esc(p.brief.slice(0, 110))}${p.brief.length > 110 ? '…' : ''}</p>
          ${pipeline(p.status)}
        </div>`
        )
        .join('');
      const p = projects.find((x) => x.id === selected);
      let detail = '<div class="ffq-empty">Geen project geselecteerd.</div>';
      if (p) {
        const notes = (p.notes || [])
          .map(
            (n) =>
              `<div class="ffq-msg"><span class="who">${esc(n.from)} · ${esc(fmt(n.at))}</span><div>${esc(n.text)}</div></div>`
          )
          .join('') || '<div class="ffq-empty">Nog geen berichten.</div>';
        const dls =
          (p.deliverables || [])
            .map((d) => `<a href="${esc(BASE + d.url)}" download><span>${esc(d.name)}</span><span>Download</span></a>`)
            .join('') || '<div class="ffq-empty">Nog geen deliverables.</div>';
        const fb = (p.feedback || [])
          .map((f) => `<div class="ffq-msg"><span class="who">Jouw feedback · ${esc(fmt(f.at))}</span><div>${esc(f.text)}</div></div>`)
          .join('');
        detail = `
          <div class="ffq-panel">
            <div class="ffq-row" style="justify-content:space-between">
              <h2>${esc(p.title)}</h2>
              ${pill(p.status)}
            </div>
            ${pipeline(p.status)}
            <label class="ffq-label">Brief</label>
            <p>${esc(p.brief)}</p>
            <label class="ffq-label">Deliverables / cuts</label>
            <div class="ffq-downloads">${dls}</div>
            <label class="ffq-label">Berichten &amp; notities</label>
            <div class="ffq-list">${notes}</div>
            <label class="ffq-label">Feedback naar de studio</label>
            <textarea class="ffq-textarea" id="ffq-fb" placeholder="Schrijf je feedback…"></textarea>
            <button class="ffq-btn" type="button" id="ffq-send-fb">Opslaan (lokaal)</button>
            <div class="ffq-list">${fb}</div>
            <label class="ffq-label">Bericht naar studio</label>
            <textarea class="ffq-textarea" id="ffq-note" placeholder="Korte notitie…"></textarea>
            <button class="ffq-btn ghost" type="button" id="ffq-send-note">Stuur notitie</button>
          </div>`;
      }
      root.innerHTML =
        topbar(sess, 'klant') +
        `<div class="ffq-shell">
          <div class="ffq-grid2">
            <div class="ffq-panel">
              <h2>Jouw projecten</h2>
              <p class="ffq-muted">Voorbeeldprojecten — duidelijk gelabeld. Geen echte persoonsgegevens.</p>
              <div class="ffq-list">${list || '<div class="ffq-empty">Nog geen projecten.</div>'}</div>
            </div>
            ${detail}
          </div>
        </div>`;
      bindLogout(root);
      root.querySelectorAll('.ffq-item').forEach((el) => {
        el.addEventListener('click', () => {
          selected = el.getAttribute('data-id');
          render();
        });
      });
      root.querySelector('#ffq-send-fb')?.addEventListener('click', () => {
        const text = root.querySelector('#ffq-fb').value.trim();
        if (!text || !p) return;
        p.feedback = p.feedback || [];
        p.feedback.push({ at: new Date().toISOString(), text });
        saveDB(db);
        render();
      });
      root.querySelector('#ffq-send-note')?.addEventListener('click', () => {
        const text = root.querySelector('#ffq-note').value.trim();
        if (!text || !p) return;
        p.notes = p.notes || [];
        p.notes.push({ from: 'klant', at: new Date().toISOString(), text });
        saveDB(db);
        render();
      });
    }
    render();
  }

  function mountAdmin(root) {
    const sess = requireRole('admin');
    if (!sess) return;
    let db = loadDB();

    function render() {
      const byStatus = Object.fromEntries(STEPS.map((s) => [s, db.projects.filter((p) => p.status === s).length]));
      const openReviews = db.projects.reduce((n, p) => n + (p.feedback?.length || 0) + (p.notes || []).filter((x) => x.from === 'klant').length, 0);
      const inbox = [];
      db.projects.forEach((p) => {
        (p.feedback || []).forEach((f) => inbox.push({ type: 'feedback', project: p, ...f }));
        (p.notes || [])
          .filter((n) => n.from === 'klant')
          .forEach((n) => inbox.push({ type: 'notitie', project: p, ...n }));
      });
      inbox.sort((a, b) => (a.at < b.at ? 1 : -1));

      const rows = db.projects
        .map((p) => {
          const c = db.clients.find((x) => x.id === p.clientId);
          return `<tr>
            <td><strong>${esc(p.title)}</strong><div class="ffq-muted">${esc(c?.name || '')} · ${esc(c?.label || '')}</div></td>
            <td>${pill(p.status)}</td>
            <td>
              <select class="ffq-select ffq-status" data-id="${esc(p.id)}">
                ${STEPS.map((s) => `<option value="${s}" ${s === p.status ? 'selected' : ''}>${esc(STEP_LABEL[s])}</option>`).join('')}
              </select>
            </td>
            <td><button class="ffq-btn ghost" type="button" data-note="${esc(p.id)}">+ notitie</button></td>
          </tr>`;
        })
        .join('');

      const inboxHtml =
        inbox
          .slice(0, 12)
          .map(
            (i) =>
              `<div class="ffq-msg"><span class="who">${esc(i.type)} · ${esc(i.project.title)} · ${esc(fmt(i.at))}</span><div>${esc(i.text)}</div></div>`
          )
          .join('') || '<div class="ffq-empty">Geen openstaande feedback.</div>';

      root.innerHTML =
        topbar(sess, 'admin') +
        `<div class="ffq-shell">
          <div class="ffq-stats">
            <div class="ffq-stat"><b>${db.clients.length}</b><span>Klanten</span></div>
            <div class="ffq-stat"><b>${db.projects.length}</b><span>Projecten</span></div>
            <div class="ffq-stat"><b>${openReviews}</b><span>Open reviews</span></div>
            <div class="ffq-stat"><b>${byStatus.opgeleverd || 0}</b><span>Opgeleverd</span></div>
          </div>
          <div class="ffq-grid2">
            <div class="ffq-panel">
              <h2>Projectenbeheer</h2>
              <div style="overflow:auto">
                <table class="ffq-table">
                  <thead><tr><th>Project</th><th>Status</th><th>Wijzig</th><th></th></tr></thead>
                  <tbody>${rows}</tbody>
                </table>
              </div>
              <form id="ffq-new" class="ffq-list" style="margin-top:1rem">
                <h2>Nieuw project</h2>
                <input class="ffq-input" name="title" required placeholder="Titel (bijv. Voorbeeld · Social clip)"/>
                <select class="ffq-select" name="clientId">${db.clients.map((c) => `<option value="${esc(c.id)}">${esc(c.name)} (${esc(c.label)})</option>`).join('')}</select>
                <select class="ffq-select" name="status">${STEPS.map((s) => `<option value="${s}">${esc(STEP_LABEL[s])}</option>`).join('')}</select>
                <textarea class="ffq-textarea" name="brief" placeholder="Korte brief…"></textarea>
                <button class="ffq-btn" type="submit">Aanmaken</button>
              </form>
            </div>
            <div class="ffq-panel">
              <h2>Review-inbox</h2>
              <p class="ffq-muted">Feedback en notities van klanten (lokaal opgeslagen).</p>
              <div class="ffq-list">${inboxHtml}</div>
              <h2>Klanten</h2>
              <ul class="ffq-list">${db.clients.map((c) => `<li class="ffq-msg"><strong>${esc(c.name)}</strong> · ${esc(c.email)} · <em>${esc(c.label)}</em></li>`).join('')}</ul>
              <div class="ffq-row">
                <button class="ffq-btn danger" type="button" id="ffq-reset">Reset voorbeelddata</button>
              </div>
            </div>
          </div>
        </div>`;
      bindLogout(root);
      root.querySelectorAll('.ffq-status').forEach((sel) => {
        sel.addEventListener('change', () => {
          const p = db.projects.find((x) => x.id === sel.getAttribute('data-id'));
          if (!p) return;
          p.status = sel.value;
          saveDB(db);
          render();
        });
      });
      root.querySelectorAll('[data-note]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const text = prompt('Studio-notitie:');
          if (!text) return;
          const p = db.projects.find((x) => x.id === btn.getAttribute('data-note'));
          if (!p) return;
          p.notes = p.notes || [];
          p.notes.push({ from: 'studio', at: new Date().toISOString(), text });
          saveDB(db);
          render();
        });
      });
      root.querySelector('#ffq-new')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        db.projects.unshift({
          id: 'p-' + Date.now(),
          clientId: fd.get('clientId'),
          title: String(fd.get('title') || 'Nieuw project'),
          status: fd.get('status') || 'briefing',
          brief: String(fd.get('brief') || '—'),
          deliverables: [],
          notes: [],
          feedback: [],
        });
        saveDB(db);
        render();
      });
      root.querySelector('#ffq-reset')?.addEventListener('click', () => {
        if (!confirm('Voorbeelddata resetten?')) return;
        localStorage.removeItem(KEY);
        db = loadDB();
        render();
      });
    }
    render();
  }

  function boot() {
    const root = document.getElementById('ffq-app');
    if (!root) return;
    // Avoid double-mount of event-heavy admin/klant if already interactive
    if (root.getAttribute('data-ffq-ready') === '1' && root.querySelector('#ffq-login, #ffq-out')) return;
    const mode = root.getAttribute('data-mode') || 'login';
    if (mode === 'login') mountLogin(root);
    else if (mode === 'klant') mountKlant(root);
    else if (mode === 'admin') mountAdmin(root);
    root.setAttribute('data-ffq-ready', '1');
    window.__ffqBooted = true;
  }
  window.__ffqBoot = boot;
  function schedule() {
    boot();
    // React hydration may wipe mount — retry a few times
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      const root = document.getElementById('ffq-app');
      if (!root) return;
      const ok = root.querySelector('#ffq-login, #ffq-out, .ffq-stats, .ffq-item');
      if (!ok) {
        root.setAttribute('data-ffq-ready', '0');
        window.__ffqBooted = false;
        boot();
      }
      if (ok || n > 15) clearInterval(id);
    }, 300);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule);
  else schedule();
})();
