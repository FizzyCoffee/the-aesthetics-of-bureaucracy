/* =============================================================================
 * forms.js — THE OFFICE OF NOMENCLATURE & FINE PRINT
 * -----------------------------------------------------------------------------
 * All copy issued by the Bureau. Maintained by a sub-committee that meets to
 * decide when it will next meet. The sub-committee's findings are recorded on
 * a form, which is entered into the Record, which is the point of all this.
 * ===========================================================================*/
(function (Bureau) {
  'use strict';

  var Copy = {};

  // ---- Box 3: NATURE OF REQUEST --------------------------------------------
  // Each is a complete, self-defeating bureaucratic act. The recursion is the
  // joke; the joke is on file.
  Copy.requestTypes = [
    'Application for Authorisation to Submit Applications',
    'Petition for the Acknowledgement of a Prior Acknowledgement',
    'Request to Join the Waiting List for the Waiting List',
    'Notice of Intent to Issue a Forthcoming Notice',
    'Certificate of Authenticity (Self-Certifying)',
    'Declaration of the Absence of Anything to Declare',
    'Form 27-B/6 — Amendment to an Unspecified Form',
    'Requisition for a Replacement Requisition Form',
    'Application to Rescind a Successful Application',
    'Affidavit Affirming the Existence of This Affidavit',
    'Provisional Receipt for a Receipt Yet to Be Issued',
    'Motion to Table the Motion Currently Tabled',
    'Claim for Compensation Arising from the Claims Process',
    'Registration of an Unregistered Intention to Register',
    'Appeal Against the Outcome of This Very Appeal',
    'Disclosure of a Conflict of Interest in Disclosing It'
  ];

  // ---- Box 2: DEPARTMENT OF ORIGIN -----------------------------------------
  Copy.departments = [
    'Office of the Registrar (Provisional, est. in perpetuity)',
    'Directorate of Pending Matters',
    'Bureau of Redundant Bureaux',
    'Sub-Committee on Sub-Committees',
    'Department of Distributed Consensus (Vacant)',
    'Standing Commission on Seated Commissions',
    'Office for the Acknowledgement of Receipt',
    'Secretariat of the Permanent Backlog'
  ];

  // ---- Box 5: REQUIRED OFFICIALNESS (a.k.a. proof-of-work difficulty) -------
  // Each leading zero in the case number is, by regulation, "official".
  Copy.clearances = [
    { level: 2, label: 'Routine', blurb: 'A matter of no importance, processed accordingly.' },
    { level: 3, label: 'Confidential', blurb: 'Sufficiently official for most lawful purposes.' },
    { level: 4, label: 'Eyes Only', blurb: 'Maximally official. Requires considerable patience.' },
    { level: 5, label: 'Most Solemn', blurb: 'Reserved for matters the Bureau will not explain.' }
  ];

  // ---- Stamps the Auditor is licensed to apply ------------------------------
  Copy.stamps = {
    filed: 'ENTERED INTO RECORD',
    pending: 'AWAITING PROCESSING',
    processing: 'UNDER CONSIDERATION',
    void: 'VOID — RECORD COMPROMISED',
    genesis: 'FOUNDING INSTRUMENT'
  };

  // ---- Footnotes / running fine print (rotated through the footer) ----------
  Copy.fineprint = [
    'This document is valid only in the presence of all other documents.',
    'Retain this notice. Do not retain this notice. Strike whichever is inapplicable.',
    'The Bureau accepts no responsibility for the records the Bureau maintains.',
    'An unstamped form is not a form. A stamped form is not necessarily a form.',
    'Nothing herein may be deleted. This includes the present sentence.',
    'Your patience has been noted and entered into the Record as Exhibit P.',
    'Forms submitted in error are nonetheless permanent. Errors are forever.',
    'The right of appeal is reserved. The appeal will be filed and not heard.',
    'Consensus is achieved when no one remains able to object.',
    'Provenance is destiny. Destiny is a hash. Both are now public.',
    'This seal certifies only that a seal was applied.',
    'In the event of contradiction, both statements are held to be true and filed.'
  ];

  // ---- Now-Serving ticker (intake theatre) ----------------------------------
  Copy.nowServing = [
    'NOW PROCESSING TICKET № 0000 — PLEASE CONTINUE TO WAIT',
    'THE CLERK IS AT LUNCH. THE LUNCH IS ALSO ON FILE.',
    'WINDOW 4 IS CLOSED. WINDOW 4 HAS ALWAYS BEEN CLOSED.',
    'YOUR CALL IS IMPORTANT TO THE RECORD, IF NOT TO US.',
    'CONSENSUS PENDING. QUORUM PENDING. EVERYTHING PENDING.'
  ];

  // ---- Names, for the random-applicant convenience button -------------------
  Copy.applicants = [
    'A. Petitioner', 'The Undersigned', 'Claimant, Anonymous',
    'Mme. K. (file withheld)', 'Citizen № 7,401,228', 'A Concerned Party',
    'The Bearer of This Form', 'Applicant, As Above', 'One Who Waited',
    'The Estate of a Pending Matter', 'Dr. Provisional', 'A Friend of the Court'
  ];

  Copy.particularsPlaceholder =
    'State your matter in the space provided. Use of the space provided is ' +
    'mandatory. Statements exceeding the space provided will be sealed at the ' +
    'point of overflow and the remainder entered into the Record as implied.';

  // Founding instrument (the genesis block).
  Copy.genesis = {
    applicant: 'The Bureau Itself',
    department: 'Office of the Registrar (Provisional, est. in perpetuity)',
    requestType: 'Application for Permission to Establish a Department for the Processing of Applications',
    particulars:
      'Pursuant to no prior authority, the Bureau hereby authorises its own ' +
      'existence and undertakes to record — immutably, and without remedy — ' +
      'every form submitted hereafter. This instrument refers to no prior ' +
      'instrument, there being none. It is its own precedent. It is approved ' +
      'by the only body competent to approve it, namely itself.',
    clearance: 3
  };

  // ---- Helpers --------------------------------------------------------------
  Copy.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };

  // Deterministic pick from a string seed (so a given hash always footnotes alike).
  Copy.pickFrom = function (arr, seedStr) {
    var h = 0;
    for (var i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
    return arr[h % arr.length];
  };

  Bureau.Copy = Copy;
})(window.Bureau = window.Bureau || {});
