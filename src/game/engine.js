/* =============================================================================
 * engine.js — THE EXAMINATION DESK · MACHINERY OF INTAKE & REFUSAL
 * -----------------------------------------------------------------------------
 * The moving parts under the wicket: case numbers minted with genuine SHA-256,
 * the Desk Ledger (official chain) and the torn page (superseded chain),
 * generated members of the public, and the adjudication of your stamps.
 *
 * A document is a small claim about the world. The engine's whole job is the
 * Bureau's whole job: to decide whether the claim agrees with the Record, and
 * never once to ask whether the Record agrees with the world.
 * ===========================================================================*/
(function (Bureau) {
  'use strict';

  var Story = Bureau.Story;
  var Game = {};

  /* ---- Case numbers ---------------------------------------------------------
   * Genuine SHA-256 of a seed, with the officialness (leading noughts) imposed
   * exactly — the character after the noughts is forced non-zero so that a
   * clearance's count is precise and countable at the desk. */
  function caseNo(seed, zeros) {
    var h = Bureau.sha256(String(seed));
    var next = '123456789abcdef'[parseInt(h[zeros] || 'a', 16) % 15];
    return '0'.repeat(zeros) + next + h.slice(zeros + 1);
  }
  Game.caseNo = caseNo;

  function entryFrom(seedSpec) {
    var m = Story.month(seedSpec.date[0], seedSpec.date[1]);
    return {
      key: seedSpec.key,
      hash: caseNo('entry:' + seedSpec.key, seedSpec.zeros),
      applicant: seedSpec.applicant,
      title: seedSpec.title,
      dateLabel: m.label
    };
  }

  /* ---- Fresh state ---------------------------------------------------------*/
  Game.newState = function () {
    return {
      day: 1,
      citations: 0,
      commendations: 0,
      flags: {},
      shadowUnlocked: false,
      ledger: Story.LEDGER_SEEDS.map(entryFrom).reverse(), // newest first
      shadow: Story.SHADOW_SEEDS.map(entryFrom),
      fillerSerial: 0
    };
  };

  /* ---- Active regulations for a given day -----------------------------------*/
  Game.activeRules = function (day) {
    return Story.RULES.filter(function (r) { return r.day <= day; });
  };

  /* ---- The Audit of a single document ---------------------------------------*/
  Game.validate = function (doc, state) {
    var ctx = { deskAbs: Story.DAYS[state.day - 1].date.abs, ledger: state.ledger };
    var out = [];
    Game.activeRules(state.day).forEach(function (r) {
      var v = r.check(doc, ctx);
      if (v) out.push({ ruleId: r.id, label: r.ground, detail: v });
    });
    return out;
  };

  /* ---- Resolving a citation spec against the two chains ----------------------*/
  function resolveCite(cite, state) {
    if (!cite) return caseNo('void:none', 0);
    var parts = cite.split(':');
    if (parts[0] === 'ledger') {
      var e = state.ledger.filter(function (x) { return x.key === parts[1]; })[0];
      return e ? e.hash : caseNo('missing:' + parts[1], 0);
    }
    if (parts[0] === 'shadow') {
      var s = state.shadow.filter(function (x) { return x.key === parts[1]; })[0];
      return s ? s.hash : caseNo('missing:' + parts[1], 0);
    }
    if (parts[0] === 'flag' && parts[1] === 'requisition') {
      return state.flags.requisitionCase || caseNo('missing:req', 0);
    }
    return caseNo('void:' + cite, 0);
  }

  /* Where does a citation point? (the desk's card index) -----------------------*/
  Game.consultIndex = function (hash, state) {
    var inLedger = state.ledger.filter(function (e) { return e.hash === hash; })[0];
    if (inLedger) return { where: 'ledger', entry: inLedger };
    if (state.shadowUnlocked) {
      var inShadow = state.shadow.filter(function (e) { return e.hash === hash; })[0];
      if (inShadow) return { where: 'shadow', entry: inShadow };
    }
    return { where: 'nowhere' };
  };

  /* ---- Members of the public, generated -------------------------------------*/
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  Game.makeFiller = function (state, violation) {
    var day = Story.DAYS[state.day - 1];
    var uid = 'filler:' + state.day + ':' + (state.fillerSerial++);
    var req = pick(Story.REQUESTS);
    var maxLevel = state.day >= 3 ? (state.day >= 6 ? 5 : 4) : 3;
    var clr = pick(Story.CLEARANCES.filter(function (c) { return c.level <= maxLevel; }));
    var dateDay = day.date.abs - 30 - (Math.random() < 0.5 ? 0 : 1); // today or yesterday, in Frugal
    var doc = {
      type: 'doc', id: uid, scripted: false,
      applicant: pick(Story.NAMES),
      district: pick(Story.DISTRICTS),
      kind: req.kind, title: req.title,
      formNo: Story.FORM_TABLE[req.kind],
      department: pick(Story.DEPARTMENT_ROLL),
      clearance: clr,
      dateLabel: Story.month('Frugal', dateDay).label,
      dateAbs: Story.month('Frugal', dateDay).abs,
      caseNo: caseNo(uid, clr.level),
      previousRef: pick(state.ledger).hash,
      particulars: pick(Story.PARTICULARS),
      dialogue: pick(Story.SMALL_TALK),
      countersign: clr.level >= 4 ? pick(Story.OFFICERS) : null,
      script: {}
    };
    doc.sealHash = doc.caseNo;

    switch (violation) {
      case 'seal':     doc.sealHash = Bureau.sha256(uid + ':forged'); break;
      case 'date':     var f = day.date.abs - 30 + 1 + Math.floor(Math.random() * 2);
                       doc.dateLabel = Story.month('Frugal', f).label;
                       doc.dateAbs = Story.month('Frugal', f).abs; break;
      case 'citation': doc.previousRef = Bureau.sha256(uid + ':phantom'); break;
      case 'zeros':    doc.clearance = pick(Story.CLEARANCES.filter(function (c) { return c.level >= 3 && c.level <= maxLevel; }));
                       doc.caseNo = caseNo(uid, doc.clearance.level - 1);
                       doc.sealHash = doc.caseNo;
                       if (doc.clearance.level >= 4) doc.countersign = pick(Story.OFFICERS); break;
      case 'dept':     doc.department = pick(Story.VACANT_DEPARTMENTS); break;
      case 'form':     var wrong = Object.keys(Story.FORM_TABLE).filter(function (k) { return k !== doc.kind; });
                       doc.formNo = Story.FORM_TABLE[pick(wrong)]; break;
      case 'sign':     doc.clearance = Story.CLEARANCES[2 + Math.floor(Math.random() * 2)]; // EYES ONLY / MOST SOLEMN
                       doc.caseNo = caseNo(uid, doc.clearance.level);
                       doc.sealHash = doc.caseNo;
                       doc.countersign = Math.random() < 0.5 ? pick(Story.FALSE_OFFICERS) : null; break;
      case 'meager':   doc.district = Story.MEAGER; break;
    }
    return doc;
  };

  /* ---- Scripted callers ------------------------------------------------------*/
  Game.makeScripted = function (id, state) {
    var s = id === 'finale'
      ? (state.flags.requisitionFiled ? Story.FINALES.copy : Story.FINALES.promotion)
      : Story.SCRIPTED[id];
    var m = Story.month(s.date[0], s.date[1]);
    var clr = Story.CLEARANCES.filter(function (c) { return c.level === s.clearance; })[0];
    var doc = {
      type: 'doc', id: id, scripted: true,
      applicant: s.applicant, district: s.district,
      kind: s.kind, title: s.title,
      formNo: Story.FORM_TABLE[s.kind],
      department: s.department, clearance: clr,
      dateLabel: m.label, dateAbs: m.abs,
      caseNo: caseNo('scripted:' + id, clr.level),
      previousRef: resolveCite(s.cite, state),
      particulars: s.particulars,
      dialogue: s.dialogue,
      countersign: s.countersign || null,
      note: s.note || null,
      script: {
        cover: !!s.cover,
        flagApprove: s.flagApprove || null,
        flagDeny: s.flagDeny || null,
        approveLine: s.approveLine || null,
        denyLine: s.denyLine || null,
        ending: s.ending || null
      }
    };
    doc.sealHash = s.forgeSeal ? Bureau.sha256('scripted:' + id + ':forged') : doc.caseNo;
    return doc;
  };

  /* ---- Building a day's queue ------------------------------------------------*/
  Game.buildDay = function (state) {
    var day = Story.DAYS[state.day - 1];

    // Overnight filings by the other desks.
    for (var i = 0; i < Story.OVERNIGHT_PER_DAY; i++) {
      var uid = 'overnight:' + state.day + ':' + i;
      var req = pick(Story.REQUESTS);
      var z = 2 + Math.floor(Math.random() * 2);
      state.ledger.unshift({
        key: uid, hash: caseNo(uid, z),
        applicant: pick(Story.NAMES), title: req.title,
        dateLabel: Story.month('Frugal', day.date.abs - 31).label
      });
    }

    var queue = day.queue.map(function (item) {
      if (item.s) return Game.makeScripted(item.s, state);
      if (item.note) {
        var n = Story.NOTES[item.note];
        var body = n.body.slice();
        (n.requiresFlagText || []).forEach(function (extra) {
          if (state.flags[extra.flag]) body.push(extra.text);
        });
        return { type: 'note', id: item.note, title: n.title, body: body, unlock: n.unlock || null };
      }
      var v = item.v === 'rand'
        ? pick(Game.activeRules(state.day).map(function (r) { return r.id; }))
        : item.v;
      return Game.makeFiller(state, v);
    });

    return { day: day, queue: queue };
  };

  /* ---- Adjudication -----------------------------------------------------------
   * Returns an outcome the UI narrates. Mutates state: citations, commendations,
   * flags, and — crucially — approved documents enter the Ledger, forever.     */
  Game.decide = function (state, doc, action, groundId) {
    var violations = Game.validate(doc, state);
    var invalid = violations.length > 0;
    var out = { action: action, violations: violations, citation: false, covered: false,
                commended: false, groundsCorrect: null, ending: null, line: null };

    if (action === 'approve') {
      state.ledger.unshift({
        key: 'filed:' + doc.id, hash: doc.caseNo,
        applicant: doc.applicant, title: doc.title,
        dateLabel: Story.DAYS[state.day - 1].date.label
      });
      if (!invalid) { state.commendations++; out.commended = true; }
      else if (doc.script.cover) { out.covered = true; }
      else { state.citations++; out.citation = true; }
      if (doc.script.flagApprove) state.flags[doc.script.flagApprove] = true;
      if (doc.id === 'vessel') state.flags.requisitionCase = doc.caseNo;
      out.line = doc.script.approveLine;
      if (doc.script.ending) out.ending = doc.script.ending.approve;
    } else {
      if (invalid) {
        out.groundsCorrect = violations.some(function (v) { return v.ruleId === groundId; });
        if (out.groundsCorrect) { state.commendations++; out.commended = true; }
      } else if (!doc.script.ending) {
        state.citations++; out.citation = true;
      }
      if (doc.script.flagDeny) state.flags[doc.script.flagDeny] = true;
      out.line = doc.script.denyLine;
      if (doc.script.ending) out.ending = doc.script.ending.deny;
    }

    if (!out.ending && state.citations >= Story.MAX_CITATIONS) out.ending = 'dismissal';
    return out;
  };

  /* ---- Persistence -------------------------------------------------------------*/
  var SAVE_KEY = 'bureau-desk-v1';
  // Nothing is written to your machine without your consent on Form CK-1.
  Game.save = function (state) {
    if (Bureau.Retention && !Bureau.Retention.allowed()) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
  };
  Game.load = function () {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      return (s && s.day >= 1 && s.day <= Story.DAYS.length) ? s : null;
    } catch (e) { return null; }
  };
  Game.clearSave = function () { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} };

  Bureau.Game = Game;
})(window.Bureau = window.Bureau || {});
