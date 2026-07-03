/* =============================================================================
 * blockchain.js — THE PERMANENT RECORD (THE LEDGER ITSELF)
 * -----------------------------------------------------------------------------
 * A genuine, if small, blockchain. Every primitive is real; every primitive is
 * also renamed to the bureaucratic act it has always secretly been:
 *
 *     block .................. a FORM, once entered into the Record
 *     hash (SHA-256) ......... the CASE REFERENCE NUMBER
 *     previousHash ........... the "IN REFERENCE TO: FILE №…" citation
 *     nonce .................. TIMES RESUBMITTED (how many stamps it took)
 *     difficulty ............. REQUIRED OFFICIALNESS (count of leading zeros)
 *     proof-of-work .......... PROOF OF DILIGENCE (stamping until official)
 *     chain validation ....... THE AUDIT
 *     genesis block .......... THE FOUNDING INSTRUMENT
 *
 * The deep joke, entered here into the Record: a blockchain is merely a
 * bureaucracy that does not trust you, and a bureaucracy is merely a
 * blockchain operated by people who do. Both chain each document to the last
 * so that nothing may ever be quietly undone. Both call this "trust".
 * ===========================================================================*/
(function (Bureau) {
  'use strict';

  var GENESIS_PREV = '0'.repeat(64); // "THE VOID — NO PRIOR RECORD EXISTS"
  var sha256 = Bureau.sha256;

  // The canonical, stampable form of a record. Order is law.
  function canonical(b) {
    return [
      b.index,
      b.timestamp,
      b.applicant,
      b.department,
      b.requestType,
      b.particulars,
      b.clearance,
      b.previousHash,
      b.nonce
    ].join('␟'); // a separator no applicant could lawfully type
  }

  // The Case Reference Number of a form, as it currently stands.
  function computeHash(b) { return sha256(canonical(b)); }

  // A case number is "sufficiently official" if it opens with the required
  // number of zeros. (That this confers no benefit on anyone is precisely the
  // point, and is true of both proof-of-work and officialness generally.)
  function meetsTarget(hash, clearance) {
    return hash.slice(0, clearance) === '0'.repeat(clearance);
  }

  function Ledger() { this.blocks = []; }

  Ledger.prototype.tip = function () { return this.blocks[this.blocks.length - 1]; };

  Ledger.prototype.makeForm = function (data) {
    var prev = this.tip();
    return {
      index: this.blocks.length,
      timestamp: data.timestamp,
      applicant: data.applicant,
      department: data.department,
      requestType: data.requestType,
      particulars: data.particulars,
      clearance: data.clearance,
      previousHash: prev ? prev.hash : GENESIS_PREV,
      nonce: 0,
      hash: null // assigned once the Proof of Diligence is satisfied
    };
  };

  Ledger.prototype.commit = function (form) { this.blocks.push(form); };

  /**
   * THE AUDIT. Recomputes every case number live and inspects the citations
   * binding each form to the one before it. Returns a per-form verdict.
   *
   * Because each form's number is recomputed from its current contents, the
   * faintest unauthorised amendment to a past form changes its number, which
   * (a) is no longer sufficiently official and (b) no longer matches the
   * "In Reference To" citation of the form that follows — and so the discovery
   * cascades down the entire Record. This is the whole apparatus working
   * exactly as designed: it does not prevent tampering; it makes tampering
   * impossible to do quietly.
   */
  Ledger.prototype.audit = function () {
    var verdicts = [];
    var firstBreach = -1;
    var prevLive = GENESIS_PREV;

    for (var i = 0; i < this.blocks.length; i++) {
      var b = this.blocks[i];
      var live = computeHash(b);
      var officialOk = meetsTarget(live, b.clearance);
      var citationOk = (b.previousHash === prevLive);
      var ok = officialOk && citationOk;

      verdicts.push({
        index: i,
        liveHash: live,
        filedHash: b.hash,
        amended: live !== b.hash, // contents changed since it was filed
        officialOk: officialOk,
        citationOk: citationOk,
        ok: ok
      });

      if (!ok && firstBreach === -1) firstBreach = i;
      prevLive = live; // downstream citations are checked against the live tip
    }

    return {
      verdicts: verdicts,
      inGoodOrder: firstBreach === -1,
      firstBreach: firstBreach
    };
  };

  Ledger.prototype.serialize = function () {
    return JSON.stringify(this.blocks.map(function (b) {
      return {
        index: b.index, timestamp: b.timestamp, applicant: b.applicant,
        department: b.department, requestType: b.requestType,
        particulars: b.particulars, clearance: b.clearance,
        previousHash: b.previousHash, nonce: b.nonce, hash: b.hash
      };
    }));
  };

  Ledger.fromSerialized = function (json) {
    var L = new Ledger();
    try { L.blocks = JSON.parse(json) || []; } catch (e) { L.blocks = []; }
    return L;
  };

  Bureau.GENESIS_PREV = GENESIS_PREV;
  Bureau.computeHash = computeHash;
  Bureau.meetsTarget = meetsTarget;
  Bureau.Ledger = Ledger;
})(window.Bureau = window.Bureau || {});
