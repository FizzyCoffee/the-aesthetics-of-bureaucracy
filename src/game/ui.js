/* =============================================================================
 * ui.js — THE EXAMINATION DESK · THE WICKET ITSELF
 * -----------------------------------------------------------------------------
 * Screens, stamps, and the small theatre of the queue. Everything the player
 * touches; nothing the player touches matters except the two stamps, which is
 * the design of the game and of the Bureau alike.
 * ===========================================================================*/
(function (Bureau) {
  'use strict';

  var Story = Bureau.Story;
  var Game = Bureau.Game;

  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---- Session ---------------------------------------------------------------*/
  var state = null;        // the career
  var daySnapshot = null;  // the morning, in case the day must be relived
  var dayStart = null;     // {commendations, citations} at open of wicket
  var built = null;        // today's queue
  var idx = 0;             // position in the queue
  var currentDoc = null;
  var decided = false;

  /* ---- Screens ----------------------------------------------------------------*/
  var SCREENS = ['scr-title', 'scr-memo', 'scr-desk', 'scr-summary', 'scr-ending'];
  function show(id) {
    SCREENS.forEach(function (s) { $(s).classList.toggle('active', s === id); });
    window.scrollTo(0, 0);
  }

  /* ---- Title -------------------------------------------------------------------*/
  function renderTitle() {
    var saved = Game.load();
    $('btn-continue').style.display = saved ? '' : 'none';
    if (saved) $('btn-continue').textContent = '⤷ Resume Posting — Day ' + saved.day;
    show('scr-title');
  }

  /* ---- Day intro (the morning memo) ---------------------------------------------*/
  function startDay() {
    Game.save(state);
    daySnapshot = clone(state);
    dayStart = { commendations: state.commendations, citations: state.citations };
    built = Game.buildDay(state);
    idx = 0;

    var d = built.day;
    $('memo-date').textContent = 'DAY ' + d.n + ' · ' + d.date.label;
    $('memo-from').textContent = d.memo.from;
    $('memo-subject').textContent = d.memo.subject;
    var body = $('memo-body'); body.innerHTML = '';
    d.memo.lines.forEach(function (line, i) {
      var p = el('p', 'fade-line', esc(line));
      p.style.animationDelay = (0.15 + i * 0.22) + 's';
      body.appendChild(p);
    });
    $('memo-go').textContent = '⊛ Open the Wicket — Day ' + d.n;
    show('scr-memo');
  }

  /* ---- HUD -----------------------------------------------------------------------*/
  function renderHud() {
    var d = built.day;
    $('hud-day').textContent = 'DAY ' + d.n + ' OF 7';
    $('hud-date').textContent = d.date.label;
    $('hud-queue').textContent = 'In the queue: ' + Math.max(0, built.queue.length - idx);
    $('hud-comm').textContent = state.commendations;
    var marks = '';
    for (var i = 0; i < Story.MAX_CITATIONS; i++) {
      marks += '<span class="' + (i < state.citations ? 'cite-x' : 'cite-o') + '">✕</span>';
    }
    $('hud-cite').innerHTML = marks;
  }

  /* ---- Tools: tabs ------------------------------------------------------------------*/
  var TABS = [
    { id: 'regs', label: 'Regulations' },
    { id: 'ledger', label: 'Desk Ledger' },
    { id: 'shadow', label: 'Torn Page', gated: true },
    { id: 'memo', label: 'Memoranda' }
  ];
  var activeTab = 'regs';

  function renderTabs() {
    var bar = $('tabs'); bar.innerHTML = '';
    TABS.forEach(function (t) {
      if (t.gated && !state.shadowUnlocked) return;
      var b = el('button', 'tab-btn' + (activeTab === t.id ? ' on' : '') + (t.id === 'shadow' ? ' shadow-tab' : ''), esc(t.label));
      b.onclick = function () { activeTab = t.id; renderTabs(); renderTabPanel(); };
      bar.appendChild(b);
    });
  }

  function ledgerRow(e, cls) {
    return '<div class="lg-row ' + (cls || '') + '" data-hash="' + e.hash + '">' +
      '<span class="lg-hash">' + e.hash.slice(0, 12) + '…</span>' +
      '<span class="lg-who">' + esc(e.applicant) + '</span>' +
      '<span class="lg-what">' + esc(e.title) + '</span>' +
      '<span class="lg-date">' + esc(e.dateLabel) + '</span></div>';
  }

  function renderTabPanel() {
    var p = $('tabpanel');
    var day = state.day;
    if (activeTab === 'regs') {
      var h = '<div class="tp-head">STANDING REGULATIONS · AS OF DAY ' + day + '</div>';
      Game.activeRules(day).forEach(function (r, i) {
        h += '<div class="reg"><div class="reg-t">' + (i + 1) + '. ' + esc(r.label) + '</div>' +
             '<div class="reg-b">' + esc(r.reg) + '</div></div>';
      });
      if (day >= 3) {
        h += '<div class="reg-annex"><div class="reg-t">ANNEX · TABLE OF OFFICIALNESS</div><table class="tp-table">' +
          Story.CLEARANCES.map(function (c) {
            return '<tr><td>' + c.label + '</td><td>' + c.level + ' noughts</td></tr>';
          }).join('') + '</table></div>';
      }
      if (day >= 4) {
        h += '<div class="reg-annex"><div class="reg-t">ANNEX · ROLL OF STANDING DEPARTMENTS</div><ul class="tp-list">' +
          Story.DEPARTMENT_ROLL.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div>';
      }
      if (day >= 5) {
        h += '<div class="reg-annex"><div class="reg-t">ANNEX · TABLE OF PROPER FORMS</div><table class="tp-table">' +
          Object.keys(Story.FORM_TABLE).map(function (k) {
            return '<tr><td>' + k + '</td><td>Form ' + Story.FORM_TABLE[k] + '</td></tr>';
          }).join('') + '</table></div>';
      }
      if (day >= 6) {
        h += '<div class="reg-annex"><div class="reg-t">ANNEX · ROLL OF OFFICERS OF THE SECOND CHAIR</div><ul class="tp-list">' +
          Story.OFFICERS.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul></div>';
      }
      p.innerHTML = h;
    } else if (activeTab === 'ledger') {
      p.innerHTML = '<div class="tp-head">DESK LEDGER · FILES OF RECORD · NEWEST FIRST</div>' +
        '<div class="tp-note">The Record begins on the 3rd of Meager. It has always begun on the 3rd of Meager.</div>' +
        state.ledger.map(function (e) { return ledgerRow(e); }).join('');
    } else if (activeTab === 'shadow') {
      p.innerHTML = '<div class="tp-head shadow-head">THE RECORD AS IT STOOD ON THE 2nd OF MEAGER · TORN PAGE · DO NOT POSSESS</div>' +
        '<div class="tp-note">Citations resolving to this page refer, officially, to nothing.</div>' +
        state.shadow.map(function (e) {
          return ledgerRow(e, e.key === 'removals' ? 'lg-removals' : 'lg-shadow');
        }).join('');
    } else if (activeTab === 'memo') {
      var d = built.day;
      p.innerHTML = '<div class="tp-head">MEMORANDUM · DAY ' + d.n + '</div>' +
        '<div class="tp-note">From: ' + esc(d.memo.from) + '<br>Re: ' + esc(d.memo.subject) + '</div>' +
        d.memo.lines.map(function (l) { return '<p class="tp-memo">' + esc(l) + '</p>'; }).join('');
    }
  }

  /* ---- The caller and the document ------------------------------------------------*/
  function presentNext() {
    if (idx >= built.queue.length) return endDay();
    var item = built.queue[idx];
    decided = false;
    renderHud(); renderTabs(); renderTabPanel();
    $('slip').className = 'slip'; $('slip').innerHTML = '';
    $('grounds').classList.remove('open');

    if (item.type === 'note') return presentNote(item);
    presentDoc(item);
    show('scr-desk');
  }

  function fadeLines(container, lines, cls) {
    container.innerHTML = '';
    lines.forEach(function (line, i) {
      var pEl = el('p', (cls || 'speech') + ' fade-line', esc(line));
      pEl.style.animationDelay = (0.1 + i * 0.35) + 's';
      container.appendChild(pEl);
    });
  }

  function presentNote(item) {
    currentDoc = null;
    if (item.unlock === 'shadow') state.shadowUnlocked = true;
    $('caller').style.display = 'none';
    $('stampbar').style.display = 'none';
    var w = $('docwrap');
    w.innerHTML = '';
    var card = el('div', 'note-card');
    card.appendChild(el('div', 'note-title', esc(item.title)));
    var body = el('div', 'note-body');
    fadeLines(body, item.body, 'note-line');
    card.appendChild(body);
    var btn = el('button', 'btn btn-mini', '⤷ Return it to the drawer, and the queue');
    btn.onclick = function () { idx++; renderTabs(); presentNext(); };
    var row = el('div', 'note-actions'); row.appendChild(btn);
    card.appendChild(row);
    w.appendChild(card);
    show('scr-desk');
  }

  function presentDoc(doc) {
    currentDoc = doc;
    $('caller').style.display = '';
    $('stampbar').style.display = '';
    $('btn-approve').disabled = false;
    $('btn-deny').disabled = false;

    // The caller.
    var crest = Bureau.makeSeal(Bureau.sha256('citizen:' + doc.applicant), { size: 200, uid: 'crest-' + idx });
    $('caller-crest').innerHTML = crest.svg;
    $('caller-name').textContent = doc.applicant;
    $('caller-sub').textContent = doc.district + ' · presents 1 document';
    fadeLines($('dialogue'), doc.dialogue);

    // The document.
    var seal = Bureau.makeSeal(doc.sealHash, { size: 240, uid: 'seal-' + idx });
    var w = $('docwrap');
    var counterRow = (doc.countersign || (state.day >= 6 && doc.clearance.level >= 4))
      ? '<div class="field"><span class="lab">Countersigned · Second Chair</span>' +
        '<span class="val">' + (doc.countersign ? esc(doc.countersign) : '<i>— none —</i>') + '</span></div>'
      : '';
    w.innerHTML =
      '<div class="document gdoc" id="gdoc">' +
        '<div class="doc-top">' +
          '<div class="doc-id">FORM ' + esc(doc.formNo) + '<small>' + esc(doc.title) + '</small></div>' +
          '<div class="doc-clearance">Clearance<b>' + doc.clearance.label + '</b></div>' +
        '</div>' +
        '<div class="doc-body">' +
          '<div>' +
            '<div class="gdoc-grid">' +
              '<div class="field"><span class="lab">Applicant / Party of Record</span><span class="val">' + esc(doc.applicant) + '</span></div>' +
              '<div class="field"><span class="lab">District of Residence</span><span class="val">' + esc(doc.district) + '</span></div>' +
              '<div class="field"><span class="lab">Department of Origin</span><span class="val">' + esc(doc.department) + '</span></div>' +
              '<div class="field"><span class="lab">Date of Issue</span><span class="val">' + esc(doc.dateLabel) + '</span></div>' +
              counterRow +
            '</div>' +
            '<div class="field"><span class="lab">Case Reference №</span>' +
              '<span class="val mono-val">' + doc.caseNo.slice(0, 24) + '…</span></div>' +
            '<div class="field"><span class="lab">In Reference To · File №</span>' +
              '<button class="ref-btn" id="ref-btn" title="Consult the card index">' + doc.previousRef.slice(0, 12) + '… ⌕</button>' +
              '<span class="ref-verdict" id="ref-verdict"></span></div>' +
            '<div class="field"><span class="lab">Particulars of the Matter</span>' +
              '<span class="val gdoc-part">' + esc(doc.particulars) + '</span></div>' +
          '</div>' +
          '<div class="doc-seal"><figure class="seal-fig">' + seal.svg +
            '<figcaption class="seal-cap">Seal presented · compare № with Case №</figcaption></figure></div>' +
        '</div>' +
      '</div>';
    if (doc.note) {
      var n = el('div', 'pinned-note',
        '<div class="pin-from">' + esc(doc.note.from) + '</div><div class="pin-text">' + esc(doc.note.text) + '</div>');
      w.appendChild(n);
    }
    $('ref-btn').onclick = function () {
      var r = Game.consultIndex(doc.previousRef, state);
      var v = $('ref-verdict');
      if (r.where === 'ledger') {
        v.className = 'ref-verdict ok';
        v.textContent = 'Of record — "' + r.entry.title + '", ' + r.entry.dateLabel + '.';
      } else if (r.where === 'shadow') {
        v.className = 'ref-verdict shadowed';
        v.textContent = 'Not of record. It appears on the torn page: "' + r.entry.title + '", ' + r.entry.dateLabel + '.';
      } else {
        v.className = 'ref-verdict bad';
        v.textContent = 'The card index returns nothing. No file of record bears this number.';
      }
    };
  }

  /* ---- Stamps ------------------------------------------------------------------------*/
  function openGrounds() {
    var g = $('grounds');
    var list = $('grounds-list'); list.innerHTML = '';
    Game.activeRules(state.day).forEach(function (r) {
      var b = el('button', 'ground-btn', esc(r.ground));
      b.onclick = function () { g.classList.remove('open'); resolve('deny', r.id); };
      list.appendChild(b);
    });
    var c = el('button', 'ground-btn ground-cancel', 'Withdraw the stamp — resume examination');
    c.onclick = function () { g.classList.remove('open'); };
    list.appendChild(c);
    g.classList.add('open');
  }

  function stampDoc(action) {
    var d = $('gdoc');
    if (!d) return;
    var s = el('div', 'stamp gstamp ' + (action === 'approve' ? 'g-approve' : 'g-deny'),
      action === 'approve' ? 'APPROVED<small>ENTERED INTO RECORD</small>' : 'DENIED<small>WITH GROUNDS</small>');
    d.appendChild(s);
  }

  function resolve(action, groundId) {
    if (decided || !currentDoc) return;
    decided = true;
    $('btn-approve').disabled = true;
    $('btn-deny').disabled = true;

    var out = Game.decide(state, currentDoc, action, groundId);
    stampDoc(action);
    renderHud();

    var slip = $('slip');
    var cls = 'slip open ';
    var head, body = out.violations.length && action === 'approve'
      ? out.violations[0].detail
      : (out.violations.length ? out.violations[0].detail : '');

    if (out.commended && action === 'approve') {
      cls += 'slip-good'; head = 'IN GOOD ORDER — entered into the Record.'; body = '';
    } else if (out.commended) {
      cls += 'slip-good'; head = 'REFUSAL SUSTAINED.';
    } else if (out.covered) {
      cls += 'slip-cover'; head = 'NIGHT AUDIT · NO DISCREPANCY ON FILE.';
      body = 'The defect was real; the citation was drafted; by morning it cannot be found. A pin-hole in the corner of your blotter, and nothing else. — V.';
    } else if (out.citation && action === 'approve') {
      cls += 'slip-bad'; head = 'NOTICE OF CITATION № ' + state.citations + ' — a defective instrument was admitted to the Record.';
    } else if (out.citation) {
      cls += 'slip-bad'; head = 'NOTICE OF CITATION № ' + state.citations + ' — a matter in good order was refused.';
      body = 'The Night Audit finds no defect in the instrument. The defect, therefore, is filed under the Examiner.';
    } else {
      cls += 'slip-plain'; head = 'Refusal sustained; grounds amended by the Office.';
      body = 'The instrument was indeed defective — though not as stated. The amendment of your grounds has been noted. Amendments are always noted.';
    }

    slip.className = cls;
    var h = '<div class="slip-head">' + esc(head) + '</div>';
    if (body) h += '<div class="slip-body">' + esc(body) + '</div>';
    if (out.line) h += '<div class="slip-line">“' + esc(out.line) + '”</div>';
    h += '<button class="btn btn-mini" id="slip-next">' +
      (out.ending ? '⊛ …' : '⤷ Next in the queue') + '</button>';
    slip.innerHTML = h;
    $('slip-next').onclick = function () {
      if (out.ending) return renderEnding(out.ending);
      idx++; presentNext();
    };
    $('slip-next').focus();
  }

  /* ---- End of day -----------------------------------------------------------------------*/
  function endDay() {
    var d = built.day;
    var heard = built.queue.filter(function (q) { return q.type === 'doc'; }).length;
    $('sum-title').textContent = 'CLOSE OF BUSINESS · DAY ' + d.n;
    $('sum-date').textContent = d.date.label;
    $('sum-stats').innerHTML =
      '<div class="line"><span class="k">Matters heard</span><span class="v">' + heard + '</span></div>' +
      '<div class="line"><span class="k">Commendations today</span><span class="v">' + (state.commendations - dayStart.commendations) + '</span></div>' +
      '<div class="line"><span class="k">Citations today</span><span class="v num">' + (state.citations - dayStart.citations) + '</span></div>' +
      '<div class="line"><span class="k">Citations on file</span><span class="v num">' + state.citations + ' of ' + Story.MAX_CITATIONS + '</span></div>';
    var body = $('sum-body');
    fadeLines(body, d.close, 'tp-memo');
    show('scr-summary');
  }

  /* ---- Endings -----------------------------------------------------------------------------*/
  function renderEnding(key) {
    var e = Story.ENDINGS[key];
    $('end-no').textContent = e.no;
    $('end-title').textContent = e.title;
    var body = $('end-body'); body.innerHTML = '';
    e.lines.forEach(function (line, i) {
      var p = el('p', 'fade-line', esc(line));
      p.style.animationDelay = (0.2 + i * 0.5) + 's';
      body.appendChild(p);
    });
    var epi = Story.EPILOGUES.filter(function (x) { return state.flags[x.flag]; });
    var eb = $('end-epilogue'); eb.innerHTML = '';
    if (epi.length) {
      eb.appendChild(el('div', 'epi-head', 'ANNEX · PERSONS OF RECORD'));
      epi.forEach(function (x, i) {
        var p = el('p', 'fade-line', esc(x.text));
        p.style.animationDelay = (0.4 + e.lines.length * 0.5 + i * 0.4) + 's';
        eb.appendChild(p);
      });
    }
    Game.clearSave();
    show('scr-ending');
  }

  /* ---- Wiring ----------------------------------------------------------------------------------*/
  function newCareer() {
    state = Game.newState();
    startDay();
  }

  function init() {
    // Crest of the title page.
    $('title-crest').innerHTML = Bureau.makeSeal(Bureau.sha256('desk-seven'), { size: 240, uid: 'title' }).svg;

    $('btn-new').onclick = function () { Game.clearSave(); newCareer(); };
    $('btn-continue').onclick = function () {
      var s = Game.load();
      if (!s) return newCareer();
      state = s;
      startDay();
    };
    $('memo-go').onclick = function () { presentNext(); };
    $('btn-approve').onclick = function () { resolve('approve', null); };
    $('btn-deny').onclick = function () { if (!decided && currentDoc) openGrounds(); };
    $('sum-next').onclick = function () {
      state.day++;
      if (state.day > Story.DAYS.length) return renderEnding('dismissal'); // unreachable; finale ends day 7
      startDay();
    };
    $('end-again').onclick = function () { Game.clearSave(); renderTitle(); };
    $('end-relive').onclick = function () {
      state = clone(daySnapshot);
      startDay();
    };

    renderTitle();
  }

  document.addEventListener('DOMContentLoaded', init);
})(window.Bureau = window.Bureau || {});
