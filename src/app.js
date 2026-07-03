/* =============================================================================
 * app.js — THE FRONT DESK
 * -----------------------------------------------------------------------------
 * Receives the public, applies the necessary theatre, and commits each form to
 * the Permanent Record. Wires the intake form to a genuine proof-of-work loop,
 * renders the ledger as a stack of sealed documents, and — on the slightest
 * unauthorised amendment — conducts an Audit that finds the forgery at once.
 * ===========================================================================*/
(function (Bureau) {
  'use strict';

  var Copy = Bureau.Copy;
  var $ = function (id) { return document.getElementById(id); };
  var STORE_KEY = 'bureau.permanent-record.v2';

  var ledger = null;
  var busy = false;

  // ---- small utilities ------------------------------------------------------
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function nowStamp() {
    var d = new Date();
    var mon = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()];
    return pad2(d.getDate()) + ' ' + mon + ' ' + d.getFullYear() + ' · ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function hashHtml(h, max) {
    max = max || 30;
    var lead = h.match(/^0*/)[0];
    var shown = h.slice(0, max);
    if (lead.length >= shown.length) return '<span class="ok-z">' + shown + '</span>…';
    return '<span class="ok-z">' + lead + '</span>' + shown.slice(lead.length) + (h.length > max ? '…' : '');
  }

  // ---- populate the form ----------------------------------------------------
  function fillSelect(sel, items, textFn, valFn) {
    sel.innerHTML = items.map(function (it, i) {
      return '<option value="' + esc(valFn ? valFn(it, i) : i) + '">' + esc(textFn(it, i)) + '</option>';
    }).join('');
  }

  function initForm() {
    fillSelect($('f-dept'), Copy.departments, function (d) { return d; }, function (d) { return d; });
    fillSelect($('f-request'), Copy.requestTypes, function (r) { return r; }, function (r) { return r; });
    fillSelect($('f-clearance'), Copy.clearances,
      function (c) { return c.label + ' — ' + c.level + ' official zeros'; },
      function (c) { return c.level; });
    $('f-clearance').value = '3';
    $('f-particulars').placeholder = Copy.particularsPlaceholder;
    updateClearanceNote();

    $('f-clearance').addEventListener('change', updateClearanceNote);
    $('submit-btn').addEventListener('click', onSubmit);
    $('random-btn').addEventListener('click', fabricate);
    $('audit-btn').addEventListener('click', onAuditClick);
    $('reprocess-btn').addEventListener('click', onReprocess);
    $('purge-btn').addEventListener('click', onPurge);
  }

  function updateClearanceNote() {
    var lvl = parseInt($('f-clearance').value, 10);
    var c = Copy.clearances.filter(function (x) { return x.level === lvl; })[0];
    $('clearance-note').textContent = c ? c.blurb : '';
  }

  function fabricate() {
    $('f-applicant').value = Copy.pick(Copy.applicants);
    var dept = Copy.pick(Copy.departments), req = Copy.pick(Copy.requestTypes);
    $('f-dept').value = dept; $('f-request').value = req;
    var frag = [
      'The applicant respectfully submits the above-named matter for entry.',
      'Reference is made to a prior matter, the particulars of which are withheld.',
      'No remedy is sought; the applicant wishes only to be on record.',
      'Kindly acknowledge receipt of this request for acknowledgement.',
      'The undersigned has waited and is prepared to wait further.'
    ];
    $('f-particulars').value = Copy.pick(frag) + ' ' + Copy.pick(frag);
    $('f-clearance').value = String(Copy.pick(Copy.clearances).level);
    updateClearanceNote();
  }

  // ---- the ledger -----------------------------------------------------------
  function save() { try { localStorage.setItem(STORE_KEY, ledger.serialize()); } catch (e) {} }

  function freshGenesis(done) {
    ledger = new Bureau.Ledger();
    var g = Copy.genesis;
    var form = ledger.makeForm({
      timestamp: 'DAY ZERO · BEFORE ALL RECORDS',
      applicant: g.applicant, department: g.department,
      requestType: g.requestType, particulars: g.particulars, clearance: g.clearance
    });
    mineForm(form, {
      title: 'Establishing the Founding Instrument',
      sub: 'The Bureau authorises its own existence…'
    }, function () {
      ledger.commit(form); save(); renderAll(); if (done) done();
    });
  }

  function loadLedger() {
    var raw = null;
    try { raw = localStorage.getItem(STORE_KEY); } catch (e) {}
    if (raw) {
      ledger = Bureau.Ledger.fromSerialized(raw);
      if (ledger.blocks.length) { renderAll(); return; }
    }
    freshGenesis();
  }

  // ---- PROOF OF DILIGENCE (the mining loop) ---------------------------------
  var PROC_CAPTIONS = [
    'The clerk consults the regulations…',
    'Locating a sufficiently official number…',
    'Affixing provisional stamps…',
    'Cross-referencing the cross-references…',
    'Resubmitting, as is customary…',
    'Awaiting the awaited…',
    'Verifying the verification…'
  ];

  function showOverlay(labels, formNo) {
    var card = $('process-card');
    card.classList.remove('done');
    $('proc-formno').textContent = formNo;
    $('proc-title').textContent = labels.title;
    $('proc-sub').textContent = labels.sub;
    $('proc-mark').textContent = 'STAMP';
    $('proc-nonce').textContent = '0';
    $('proc-hash').textContent = '—';
    $('overlay').classList.add('show');
  }
  function hideOverlay() { $('overlay').classList.remove('show'); }

  /** Genuine proof-of-work: stamp (increment nonce) until the case number opens
   *  with the required number of official zeros. Runs in yielding batches so
   *  the counter visibly spins. */
  function mineForm(form, labels, onDone) {
    busy = true; $('submit-btn').disabled = true;
    var target = new Array(form.clearance + 1).join('0');
    var formNo = 'Form № ' + ('000' + form.index).slice(-4);
    showOverlay(labels, formNo);
    $('proc-target').textContent = target + '…  (' + form.clearance + ' zeros)';

    var nonce = 0;
    var batch = form.clearance >= 5 ? 4000 : 1800;
    var cap = 0, ticks = 0;

    function tick() {
      var lastH = '';
      for (var i = 0; i < batch; i++) {
        form.nonce = nonce;
        lastH = Bureau.computeHash(form);
        if (lastH.slice(0, form.clearance) === target) {
          form.hash = lastH;
          return finish(lastH, nonce);
        }
        nonce++;
      }
      $('proc-nonce').textContent = nonce.toLocaleString();
      $('proc-hash').innerHTML = hashHtml(lastH, 30);
      if (++ticks % 3 === 0) { $('proc-sub').textContent = PROC_CAPTIONS[cap++ % PROC_CAPTIONS.length]; }
      setTimeout(tick, 0);
    }

    function finish(h, n) {
      $('proc-nonce').textContent = n.toLocaleString();
      $('proc-hash').innerHTML = hashHtml(h, 30);
      var card = $('process-card');
      card.classList.add('done');
      $('proc-mark').textContent = '✓ FILED';
      $('proc-title').textContent = 'Entered into the Record';
      $('proc-sub').textContent = 'Case № ' + h.slice(0, 10).toUpperCase() + ' — sealed in perpetuity.';
      setTimeout(function () {
        hideOverlay();
        busy = false; $('submit-btn').disabled = false;
        onDone();
      }, 850);
    }

    setTimeout(tick, 120);
  }

  // ---- intake ---------------------------------------------------------------
  function onSubmit() {
    if (busy) return;
    if (!$('f-affirm').checked) {
      var a = document.querySelector('.affirm');
      a.style.color = 'var(--seal-red)';
      setTimeout(function () { a.style.color = ''; }, 900);
      return;
    }
    var form = ledger.makeForm({
      timestamp: nowStamp(),
      applicant: $('f-applicant').value.trim() || 'The Undersigned (illegible)',
      department: $('f-dept').value,
      requestType: $('f-request').value,
      particulars: $('f-particulars').value.trim() || '(No particulars supplied. The absence is itself recorded.)',
      clearance: parseInt($('f-clearance').value, 10)
    });
    mineForm(form, {
      title: 'Applying Proof of Diligence',
      sub: PROC_CAPTIONS[0]
    }, function () {
      ledger.commit(form); save(); renderAll();
      $('f-applicant').value = ''; $('f-particulars').value = '';
      var docs = $('docs');
      if (docs.firstChild) docs.firstChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // ---- rendering ------------------------------------------------------------
  function docMarkup(b) {
    var isGen = b.index === 0;
    var clr = Copy.clearances.filter(function (c) { return c.level === b.clearance; })[0] || { label: 'Routine' };
    return '' +
      '<article class="document' + (isGen ? ' genesis' : '') + '" data-index="' + b.index + '">' +
        '<div class="stamp-host"></div>' +
        '<div class="doc-top">' +
          '<div class="doc-id">№ ' + ('000' + b.index).slice(-4) + '<small>' + (isGen ? 'Founding Instrument' : 'Form PR-1') + '</small></div>' +
        '</div>' +
        '<div class="doc-body">' +
          '<div class="doc-fields">' +
            '<div class="field"><span class="lab">Applicant / Party of Record</span><span class="val">' + esc(b.applicant) + '</span></div>' +
            '<div class="field"><span class="lab">Department of Origin</span><span class="val">' + esc(b.department) + '</span></div>' +
            '<div class="field"><span class="lab">Nature of Request</span><span class="val req">' + esc(b.requestType) + '</span></div>' +
            '<div class="field"><span class="lab">Particulars of the Matter <em>(editable — try it)</em></span>' +
              '<div class="particulars" contenteditable="true" spellcheck="false" data-index="' + b.index + '">' + esc(b.particulars) + '</div>' +
              '<div class="amend-hint">✎ Unauthorised amendment will be detected by the Audit</div>' +
            '</div>' +
          '</div>' +
          '<div class="doc-seal">' +
            '<figure class="seal-fig record"><div class="seal-host"></div><figcaption class="seal-cap"></figcaption></figure>' +
            '<div class="seal-mismatch">≠ Seal does not match document</div>' +
            '<figure class="seal-fig presented"><div class="seal-host-live"></div><figcaption class="seal-cap"></figcaption></figure>' +
          '</div>' +
        '</div>' +
        '<div class="doc-foot">' +
          '<div><span class="k">In Reference To · File №</span><br><span class="hash ref refline">—</span></div>' +
          '<div><span class="k">Case Reference №</span><br><span class="hash caseline">—</span></div>' +
          '<div><span class="k">Times Resubmitted (nonce)</span><br><span class="hash">' + (b.nonce).toLocaleString() + '</span></div>' +
          '<div><span class="k">Required Officialness</span><br><span class="hash">' + esc(clr.label) + ' · ' + b.clearance + ' zeros</span></div>' +
          '<div><span class="k">Filed</span><br><span class="hash">' + esc(b.timestamp) + '</span></div>' +
        '</div>' +
      '</article>';
  }

  function renderAll() {
    var host = $('docs');
    var blocks = ledger.blocks.slice().reverse(); // newest at top
    host.innerHTML = blocks.map(docMarkup).join('');

    // attach edit listeners
    Array.prototype.forEach.call(host.querySelectorAll('.particulars'), function (el) {
      var idx = parseInt(el.getAttribute('data-index'), 10);
      var t;
      el.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(function () {
          ledger.blocks[idx].particulars = el.textContent;
          save();
          doAudit(); // re-validate the whole Record; the breach cascades
        }, 160);
      });
    });

    doAudit();
  }

  // ---- THE AUDIT (validation + all visual state) ----------------------------
  function doAudit() {
    var res = ledger.audit();
    var host = $('docs');

    res.verdicts.forEach(function (v) {
      var b = ledger.blocks[v.index];
      var doc = host.querySelector('.document[data-index="' + v.index + '"]');
      if (!doc) return;
      var isGen = v.index === 0;

      doc.classList.toggle('void', !v.ok);

      // SEAL OF RECORD — minted from the hash sealed at filing; immutable.
      var sealEl = doc.querySelector('.doc-seal');
      var sealRecord = Bureau.makeSeal(b.hash, { uid: 'sf' + v.index, size: 200 });
      doc.querySelector('.seal-fig.record .seal-host').innerHTML = sealRecord.svg;
      var recCap = doc.querySelector('.seal-fig.record .seal-cap');

      if (v.amended) {
        // the contents changed → mint the SEAL PRESENTED from what the document
        // now hashes to, and set it beside the genuine one for comparison.
        var sealLive = Bureau.makeSeal(v.liveHash, { uid: 'sl' + v.index, size: 200 });
        doc.querySelector('.seal-fig.presented .seal-host-live').innerHTML = sealLive.svg;
        recCap.innerHTML = 'Seal of Record<br>№ ' + b.hash.slice(0, 6).toUpperCase() + ' · as filed';
        doc.querySelector('.seal-fig.presented .seal-cap').innerHTML =
          'Seal Presented<br>№ ' + v.liveHash.slice(0, 6).toUpperCase() + ' · as amended';
        sealEl.classList.add('mismatch');
      } else {
        recCap.textContent = isGen ? sealRecord.inkName + ' · founding seal' : sealRecord.inkName + ' · one of one';
        doc.querySelector('.seal-fig.presented .seal-host-live').innerHTML = '';
        sealEl.classList.remove('mismatch');
      }

      // stamp
      var host2 = doc.querySelector('.stamp-host');
      if (!v.ok) {
        host2.innerHTML = '<div class="stamp void">' + Copy.stamps.void + '<small>Audit ' + nowStamp().split('·')[0].trim() + '</small></div>';
      } else if (isGen) {
        host2.innerHTML = '<div class="stamp genesis">' + Copy.stamps.genesis + '<small>Est. in perpetuity</small></div>';
      } else {
        host2.innerHTML = '<div class="stamp filed">' + Copy.stamps.filed + '<small>' + esc(b.timestamp.split('·')[0].trim()) + '</small></div>';
      }

      // foot — references + case number, with official zeros highlighted
      var refEl = doc.querySelector('.refline');
      var caseEl = doc.querySelector('.caseline');
      if (isGen) {
        refEl.innerHTML = 'THE VOID — no prior record';
        refEl.className = 'hash ref refline';
      } else {
        refEl.innerHTML = hashHtml(b.previousHash, 22);
        refEl.className = 'hash ref refline' + (v.citationOk ? '' : ' bad');
      }
      caseEl.innerHTML = hashHtml(v.liveHash, 22) + (v.amended ? ' &nbsp;⚠ amended' : '');
      caseEl.className = 'hash caseline' + (v.officialOk ? '' : ' bad');
    });

    // verdict chip + dossier
    var chip = $('verdict'), txt = $('verdict-text');
    if (res.inGoodOrder) {
      chip.className = 'verdict good';
      txt.textContent = 'The Record is in Good Order';
      $('d-status').textContent = 'In good order';
      $('reprocess-btn').disabled = true;
    } else {
      chip.className = 'verdict bad';
      txt.textContent = 'Record Compromised at № ' + ('000' + res.firstBreach).slice(-4);
      $('d-status').textContent = 'COMPROMISED';
      $('reprocess-btn').disabled = false;
    }
    var n = ledger.blocks.length;
    $('count').textContent = n + (n === 1 ? ' form on file' : ' forms on file');
    $('d-height').textContent = n + (n === 1 ? ' form' : ' forms');
  }

  function onAuditClick() {
    doAudit();
    var txt = $('verdict-text'), chip = $('verdict');
    var prev = txt.textContent;
    chip.style.transform = 'scale(1.06)';
    txt.textContent = 'Audit conducted — ' + prev;
    setTimeout(function () { chip.style.transform = ''; txt.textContent = prev; }, 1100);
  }

  // ---- RE-PROCESS (the 51% confession) --------------------------------------
  function onReprocess() {
    if (busy) return;
    var res = ledger.audit();
    if (res.inGoodOrder) return;
    var ok = window.confirm(
      'RE-PROCESS THE RECORD\n\n' +
      'The Bureau will re-stamp every form from № ' + ('000' + res.firstBreach).slice(-4) +
      ' onward until the forged Record once again passes the Audit.\n\n' +
      'This is slow, laborious, and — regrettably — entirely possible given ' +
      'sufficient diligence. It is how history is quietly rewritten. Proceed?'
    );
    if (!ok) return;

    var i = res.firstBreach;
    busy = true;
    function next() {
      if (i >= ledger.blocks.length) {
        busy = false; save(); renderAll();
        return;
      }
      var b = ledger.blocks[i];
      b.previousHash = (i === 0) ? Bureau.GENESIS_PREV : ledger.blocks[i - 1].hash;
      mineForm(b, {
        title: 'Re-Processing the Record',
        sub: 'Rewriting Form № ' + ('000' + b.index).slice(-4) + ' of ' + ('000' + (ledger.blocks.length - 1)).slice(-4) + '…'
      }, function () { i++; next(); });
    }
    next();
  }

  // ---- PURGE (forbidden) ----------------------------------------------------
  function onPurge() {
    if (busy) return;
    var ok = window.confirm(
      'PURGE THE PERMANENT RECORD\n\n' +
      'You are about to destroy that which was filed in perpetuity. The Bureau ' +
      'reminds you that nothing can be deleted — except, it concedes, everything.\n\n' +
      'Erase all records and re-establish the Founding Instrument?'
    );
    if (!ok) return;
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    freshGenesis();
  }

  // ---- chrome (ticker, fineprint, crest) ------------------------------------
  function initChrome() {
    var crest = Bureau.makeSeal('BUREAU·OF·IMMUTABLE·AFFAIRS·SIGILLUM·OFFICIALE', { uid: 'crest', size: 232 });
    $('crest').innerHTML = crest.svg;

    var t = $('ticker'), items = Copy.nowServing.concat(Copy.nowServing);
    t.innerHTML = items.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('');

    var fp = $('fineprint');
    function rotateFp() { fp.textContent = '“ ' + Copy.pick(Copy.fineprint) + ' ”'; }
    rotateFp(); setInterval(rotateFp, 9000);
  }

  // ---- boot -----------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    initChrome();
    initForm();
    loadLedger();
  });
})(window.Bureau = window.Bureau || {});
