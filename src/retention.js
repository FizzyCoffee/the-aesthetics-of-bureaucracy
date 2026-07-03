/* =============================================================================
 * retention.js — THE OFFICE OF RETENTION (FORM CK-1)
 * -----------------------------------------------------------------------------
 * The Bureau's cookie system. One genuine cookie is placed, and it governs
 * everything else the Bureau keeps: consent, and all local records persist;
 * refusal, and the Bureau purges its files on you and retains a single fact —
 * that it is to remember nothing. The refusal must itself be retained, or the
 * Office would be obliged to ask you again upon every visit. This is the
 * paradox at the bottom of every consent banner; the Bureau simply files it.
 * ===========================================================================*/
(function (Bureau) {
  'use strict';

  var COOKIE = 'bureau_ck1';
  var MAX_AGE = 60 * 60 * 24 * 400; // the maximum perpetuity browsers permit
  var LS_MIRROR = 'bureau.ck1';     // for jurisdictions (file://) without cookies

  // Every record the Bureau keeps upon your machine, listed for the purge.
  var HOLDINGS = ['bureau.permanent-record.v2', 'bureau-desk-v1'];

  var Retention = {};

  /* ---- the cookie itself ----------------------------------------------------*/
  function writeCookie(v) {
    try {
      document.cookie = COOKIE + '=' + v + '; max-age=' + MAX_AGE + '; path=/; SameSite=Lax';
    } catch (e) {}
    try { localStorage.setItem(LS_MIRROR, v); } catch (e) {}
  }
  function readCookie() {
    try {
      var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
      if (m) return m[1];
    } catch (e) {}
    try { return localStorage.getItem(LS_MIRROR); } catch (e) {}
    return null;
  }

  Retention.status = function () {
    var v = readCookie();
    return (v === 'consented' || v === 'refused') ? v : 'undecided';
  };
  Retention.allowed = function () { return Retention.status() === 'consented'; };

  Retention.purgeHoldings = function () {
    HOLDINGS.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
  };

  Retention.consent = function () {
    writeCookie('consented');
    // Anything already in progress may now, at last, be filed.
    try { document.dispatchEvent(new CustomEvent('bureau:consented')); } catch (e) {}
  };
  Retention.refuse = function () {
    writeCookie('refused');
    Retention.purgeHoldings();
  };

  /* ---- the notice (injected; both offices share one Office of Retention) ----*/
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  var COPY = {
    title: 'Consent to Being Remembered',
    body: 'This office wishes to place a <b>cookie</b> upon your machine — a small record, ' +
      'permanent in spirit, by which your dealings here (the forms you file; your progress ' +
      'at Desk 7) survive your departure. The Bureau employs no third parties. It does not ' +
      'share you, sell you, or study you. It merely declines to forget you.',
    fine: 'N.B. — A refusal must itself be retained, or the Office would be obliged to ask ' +
      'you again upon every visit. Should you refuse, the Bureau will therefore remember ' +
      'one thing only: that it is to remember nothing. Refusal also purges what is ' +
      'presently on file, including any progress at the Examination Desk.',
    consented: 'CONSENT FILED — you will be remembered in perpetuity. Destroy after: never.',
    refused: 'REFUSAL FILED — your files are purged. The Bureau retains only its instruction to forget you.'
  };

  function standingLine() {
    var s = Retention.status();
    if (s === 'consented') return 'Present standing: <b>REMEMBERED</b> — your records persist upon this machine.';
    if (s === 'refused') return 'Present standing: <b>FORGOTTEN</b> — nothing is kept, save the keeping of nothing.';
    return 'Present standing: <b>UNDECIDED</b> — nothing is retained while the Bureau awaits your answer.';
  }

  var host = null;

  function closeNotice(stampText) {
    if (!host) return;
    var card = host.querySelector('.ck-card');
    if (stampText) {
      card.innerHTML = '<div class="ck-stamped">' + stampText + '</div>';
      setTimeout(function () { host.classList.remove('show'); }, 2200);
    } else {
      host.classList.remove('show');
    }
  }

  function openNotice() {
    if (!host) {
      host = el('div', 'ck-notice');
      document.body.appendChild(host);
    }
    host.innerHTML = '';
    var card = el('div', 'ck-card');
    card.appendChild(el('div', 'ck-no', 'FORM CK-1 · NOTICE OF RETENTION · OFFICE OF RETENTION'));
    card.appendChild(el('div', 'ck-title', COPY.title));
    card.appendChild(el('p', 'ck-body', COPY.body));
    card.appendChild(el('p', 'ck-standing', standingLine()));

    var row = el('div', 'ck-actions');
    var yes = el('button', 'btn ck-btn ck-yes', '⊛ I CONSENT<small>remember me in perpetuity</small>');
    var no = el('button', 'btn ck-btn ck-no-btn', '✕ I REFUSE<small>I decline to be remembered</small>');
    yes.onclick = function () { Retention.consent(); closeNotice(COPY.consented); };
    no.onclick = function () { Retention.refuse(); closeNotice(COPY.refused); };
    row.appendChild(yes); row.appendChild(no);
    card.appendChild(row);

    card.appendChild(el('p', 'ck-fine', COPY.fine));

    if (Retention.status() !== 'undecided') {
      var dismiss = el('button', 'ck-dismiss', 'Return to the queue without amending your answer');
      dismiss.onclick = function () { closeNotice(null); };
      card.appendChild(dismiss);
    }

    host.appendChild(card);
    // reflow so the transition runs
    void host.offsetHeight;
    host.classList.add('show');
  }
  Retention.open = openNotice;

  /* ---- boot: ask once, and file a reopening link in the banner ---------------*/
  document.addEventListener('DOMContentLoaded', function () {
    var row = document.querySelector('.banner-row');
    if (row) {
      var link = el('span', null,
        '<button class="ck-link" type="button" title="Form CK-1 · Notice of Retention">Cookies: Form CK-1</button>');
      link.querySelector('button').onclick = openNotice;
      row.appendChild(link);
    }
    if (Retention.status() === 'undecided') openNotice();
  });

  Bureau.Retention = Retention;
})(window.Bureau = window.Bureau || {});
