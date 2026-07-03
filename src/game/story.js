/* =============================================================================
 * story.js — THE EXAMINATION DESK · OFFICE OF INTAKE & REFUSAL
 * -----------------------------------------------------------------------------
 * Everything the Bureau will say to you across your seven days at Desk 7:
 * the regulations, the memoranda, the applicants, and the five ways it ends.
 *
 * The premise, entered here into the Record: on the 3rd of Meager the Record
 * was "Re-Processed for Good Order" — re-mined, block by block, until a file
 * titled SCHEDULE OF REMOVALS (41 NAMES) had never existed. A chain cannot be
 * quietly altered; it can only be loudly replaced. The Bureau replaced it,
 * loudly, and then instructed everyone to describe the noise as weather.
 * You are the desk where the old chain's citations come to die.
 * ===========================================================================*/
(function (Bureau) {
  'use strict';

  var Story = {};

  /* ---- The calendar of the Provisional Era --------------------------------
   * Meager has 30 days and is over. Frugal is now. Absolute day = comparable. */
  Story.month = function (label, day) {
    var base = label === 'Meager' ? 0 : 30;
    return { label: ordinal(day) + ' of ' + label + ', Year 12', abs: base + day };
  };
  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
  Story.ordinal = ordinal;

  /* ---- Clearances (leading zeros required of the Case №) ------------------ */
  Story.CLEARANCES = [
    { level: 2, label: 'ROUTINE' },
    { level: 3, label: 'CONFIDENTIAL' },
    { level: 4, label: 'EYES ONLY' },
    { level: 5, label: 'MOST SOLEMN' }
  ];

  /* ---- The Table of Proper Forms (Regulation 5) ---------------------------- */
  Story.FORM_TABLE = {
    'Application': 'PR-1',
    'Requisition': 'PR-2',
    'Notice':      'PR-4',
    'Claim':       'PR-6',
    'Petition':    'PR-7',
    'Declaration': 'PR-9'
  };

  /* ---- Matters the public insists on raising ------------------------------- */
  Story.REQUESTS = [
    { kind: 'Application', title: 'Application for Authorisation to Submit Applications' },
    { kind: 'Application', title: 'Application to Rescind a Successful Application' },
    { kind: 'Application', title: 'Application to Join the Waiting List for the Waiting List' },
    { kind: 'Petition',    title: 'Petition for the Acknowledgement of a Prior Acknowledgement' },
    { kind: 'Petition',    title: 'Petition for Relief from an Unspecified Obligation' },
    { kind: 'Requisition', title: 'Requisition for a Replacement Requisition Form' },
    { kind: 'Requisition', title: 'Requisition for Additional Waiting-Room Benches' },
    { kind: 'Notice',      title: 'Notice of Intent to Issue a Forthcoming Notice' },
    { kind: 'Notice',      title: 'Notice of Change of Address, Pending Approval of the Address' },
    { kind: 'Claim',       title: 'Claim for Compensation Arising from the Claims Process' },
    { kind: 'Claim',       title: 'Claim for the Return of Confiscated Patience' },
    { kind: 'Declaration', title: 'Declaration of the Absence of Anything to Declare' },
    { kind: 'Declaration', title: 'Declaration of Continued Existence (Annual)' }
  ];

  /* ---- The Roll of Standing Departments (Regulation 4) ---------------------- */
  Story.DEPARTMENT_ROLL = [
    'Office of the Registrar',
    'Directorate of Pending Matters',
    'Bureau of Redundant Bureaux',
    'Sub-Committee on Sub-Committees',
    'Office for the Acknowledgement of Receipt',
    'Secretariat of the Permanent Backlog'
  ];
  // Struck from the Roll, though its letterhead is still in circulation.
  Story.VACANT_DEPARTMENTS = [
    'Department of Distributed Consensus (Vacant)',
    'Standing Commission on Seated Commissions (Dissolved)'
  ];

  /* ---- Officers of the Second Chair (Regulation 6) --------------------------- */
  Story.OFFICERS = ['OPHAL, R.', 'GRUN, B.', 'SESS, T.'];
  Story.FALSE_OFFICERS = ['MARN, V.', 'DECK, A.', 'OPAHL, R.'];

  Story.DISTRICTS = ['Ledger Row', 'Stamp Hill', 'The Annex', 'Cartway', 'Old Registry'];
  Story.MEAGER = 'Meager District';

  Story.NAMES = [
    'ABEL, N.', 'BRISK, O.', 'CALLOW, D.', 'DREY, S.', 'EBB, M.',
    'GALE, P.', 'HOLLOW, J.', 'ISK, V.', 'JURY, L.', 'KEEL, F.',
    'LOAM, C.', 'NOOR, H.', 'OPAL, W.', 'QUILL, B.', 'REAM, E.',
    'SORREL, K.', 'TILDE, U.', 'UMBER, R.'
  ];

  Story.PARTICULARS = [
    'The undersigned wishes it noted that nothing further is wished.',
    'Submitted in triplicate; the other two copies are conceptual.',
    'All statements herein are true, or were at the time of writing.',
    'The matter speaks for itself, though it has been asked not to.',
    'Filed under protest. The protest has been filed separately.',
    'The applicant affirms the applicant. Witnessed by the applicant.',
    'Contents as declared. Declaration as contented.',
    'This form supersedes an earlier form which never existed.'
  ];

  Story.SMALL_TALK = [
    ['I was told to wait. I have waited. Here I am.'],
    ['Everything is in order. I checked it myself, twice, against itself.'],
    ['My grandmother filed her first form at this very desk. She is still waiting.'],
    ['Please be quick. My ticket expires and the ticket office expired first.'],
    ['I have nothing to declare, which I am here to declare.'],
    ['The seal cost extra. Officialness always costs extra.'],
    ['Is it true the Record never forgets? Asking for a friend it will remember.'],
    ['Stamp it kindly. It has done nothing wrong.']
  ];

  /* =============================================================================
   * THE REGULATIONS — one per day, cumulative. Each is also a ground of refusal
   * and a genuine, checkable property of the document. The regulation IS the
   * puzzle; the puzzle IS the primitive it satirises.
   * ===========================================================================*/
  Story.RULES = [
    {
      id: 'seal', day: 1,
      label: 'Seal must agree with the Case №',
      ground: 'The seal does not agree with the Case №',
      reg: 'The Official Seal is struck from the Case Reference № itself. Compare the № engraved in the seal\'s lower arc with the first eight figures of the Case №. A seal that does not agree with its document is a forgery, however handsome.',
      check: function (doc) {
        return doc.sealHash.slice(0, 8) !== doc.caseNo.slice(0, 8)
          ? 'The seal presented was struck from some other number entirely.' : null;
      }
    },
    {
      id: 'date', day: 1,
      label: 'No document may be dated in the future',
      ground: 'The document is dated in the future',
      reg: 'Documents must bear a date no later than the date of presentation. The Bureau does not accept prophecy, except from itself.',
      check: function (doc, ctx) {
        return doc.dateAbs > ctx.deskAbs
          ? 'The document is dated ' + doc.dateLabel + ' — a day that has not yet occurred.' : null;
      }
    },
    {
      id: 'citation', day: 2,
      label: 'Citations must refer to a file of record',
      ground: 'The citation refers to no file of record',
      reg: 'Every matter must recite, under IN REFERENCE TO, the Case № of a file already entered into the Record. Consult the Desk Ledger. A citation that refers to no file of record refers to nothing, and nothing may not be built upon.',
      check: function (doc, ctx) {
        var found = ctx.ledger.some(function (e) { return e.hash === doc.previousRef; });
        return !found ? 'The file cited under IN REFERENCE TO appears nowhere in the Record.' : null;
      }
    },
    {
      id: 'zeros', day: 3,
      label: 'Officialness must meet the stated clearance',
      ground: 'Officialness insufficient for the stated clearance',
      reg: 'A Case № is official in proportion to its opening noughts. ROUTINE requires two; CONFIDENTIAL, three; EYES ONLY, four; MOST SOLEMN, five. A document claiming a clearance its number cannot support is dressed above its station.',
      check: function (doc) {
        var z = 0; while (z < doc.caseNo.length && doc.caseNo[z] === '0') z++;
        return z < doc.clearance.level
          ? 'The Case № opens with ' + z + ' nought(s); ' + doc.clearance.label + ' requires ' + doc.clearance.level + '.' : null;
      }
    },
    {
      id: 'dept', day: 4,
      label: 'Origin must appear on the Roll of Standing Departments',
      ground: 'The originating department is not on the Roll',
      reg: 'Only departments presently on the Roll may originate matters. Certain letterheads outlive their departments. The letterhead is not the department.',
      check: function (doc) {
        return Story.DEPARTMENT_ROLL.indexOf(doc.department) === -1
          ? 'The originating department does not appear on the Roll of Standing Departments.' : null;
      }
    },
    {
      id: 'form', day: 5,
      label: 'The matter must be filed on its proper form',
      ground: 'The matter is filed on the wrong form',
      reg: 'Consult the Table of Proper Forms. An Application on a Claim form is not an Application; it is a Claim that lies about itself, and the Bureau alone is licensed to do that.',
      check: function (doc) {
        var proper = Story.FORM_TABLE[doc.kind];
        return proper && doc.formNo !== proper
          ? 'A ' + doc.kind + ' must be filed on Form ' + proper + ', not ' + doc.formNo + '.' : null;
      }
    },
    {
      id: 'sign', day: 6,
      label: 'EYES ONLY and above require the Second Chair',
      ground: 'The countersignature is absent or unlawful',
      reg: 'Matters of clearance EYES ONLY or MOST SOLEMN must be countersigned by an Officer of the Second Chair. The Roll of Officers is appended. Signatures resembling officers are not officers.',
      check: function (doc) {
        if (doc.clearance.level < 4) return null;
        if (!doc.countersign) return 'The matter is of clearance ' + doc.clearance.label + ' and bears no countersignature.';
        return Story.OFFICERS.indexOf(doc.countersign) === -1
          ? 'The countersignatory "' + doc.countersign + '" does not appear on the Roll of Officers.' : null;
      }
    },
    {
      id: 'meager', day: 6,
      label: 'Directive 41 — no matters from the Meager District',
      ground: 'Directive 41 (Meager District)',
      directive: true,
      reg: 'DIRECTIVE 41. Pending the conclusion of certain inquiries, no matter shall be accepted from a resident of the Meager District. The Directive does not state what is being inquired into. The Directive is itself of clearance MOST SOLEMN.',
      check: function (doc) {
        return doc.district === Story.MEAGER
          ? 'The applicant resides in the Meager District. Directive 41 applies.' : null;
      }
    }
  ];

  /* =============================================================================
   * THE SUPERSEDED RECORD — the chain as it stood before the Re-Processing.
   * Engine turns each into {key, hash, applicant, title, dateLabel}.
   * ===========================================================================*/
  Story.SHADOW_SEEDS = [
    { key: 'old-founding',   zeros: 3, applicant: 'The Bureau Itself',        title: 'The Founding Instrument (Original)',                     date: ['Meager', 1] },
    { key: 'hask-portion',   zeros: 2, applicant: 'HASK, I.',                 title: 'Grant of a Widow\'s Portion',                            date: ['Meager', 1] },
    { key: 'ruth-licence',   zeros: 3, applicant: 'RUTH, C., Physician',      title: 'Licence to Practise (Perpetual)',                        date: ['Meager', 2] },
    { key: 'molnar-pension', zeros: 2, applicant: 'MOLNAR, P.',               title: 'Award of Pension, Grade IV',                             date: ['Meager', 2] },
    { key: 'benches-old',    zeros: 2, applicant: 'GALE, P.',                 title: 'Requisition for Waiting-Room Benches',                   date: ['Meager', 2] },
    { key: 'removals',       zeros: 5, applicant: 'Office of Conformity',     title: 'SCHEDULE OF REMOVALS (41 NAMES)',                        date: ['Meager', 3] },
    { key: 'old-census',     zeros: 3, applicant: 'Office of the Registrar',  title: 'Census of the Meager District (Complete)',               date: ['Meager', 2] },
    { key: 'old-last',       zeros: 2, applicant: 'A Concerned Party',        title: 'Petition to Know What Is Being Prepared',                date: ['Meager', 3] }
  ];

  /* The official Record, as re-processed. Note the opening date. --------------*/
  Story.LEDGER_SEEDS = [
    { key: 'new-founding', zeros: 3, applicant: 'The Bureau Itself',          title: 'The Founding Instrument (Re-Established)',               date: ['Meager', 3] },
    { key: 'seed-conf',    zeros: 4, applicant: 'Office of Conformity',       title: 'Certificate of Good Order',                              date: ['Meager', 3] },
    { key: 'seed-a',       zeros: 2, applicant: 'REAM, E.',                   title: 'Declaration of Continued Existence (Annual)',            date: ['Meager', 12] },
    { key: 'seed-b',       zeros: 3, applicant: 'NOOR, H.',                   title: 'Notice of Intent to Issue a Forthcoming Notice',         date: ['Meager', 18] },
    { key: 'seed-c',       zeros: 2, applicant: 'JURY, L.',                   title: 'Application for Authorisation to Submit Applications',   date: ['Meager', 24] },
    { key: 'seed-d',       zeros: 2, applicant: 'KEEL, F.',                   title: 'Claim for Compensation Arising from the Claims Process', date: ['Meager', 27] },
    { key: 'seed-e',       zeros: 3, applicant: 'TILDE, U.',                  title: 'Petition for the Acknowledgement of a Prior Acknowledgement', date: ['Frugal', 1] },
    { key: 'seed-f',       zeros: 2, applicant: 'OPAL, W.',                   title: 'Requisition for a Replacement Requisition Form',         date: ['Frugal', 1] }
  ];
  // Overnight filings by the other desks, added to the Ledger each morning.
  Story.OVERNIGHT_PER_DAY = 3;

  /* =============================================================================
   * THE SEVEN DAYS
   * queue items: {f:1, v:'ruleId'|null}  a generated member of the public
   *              {s:'id'}                a scripted caller (see SCRIPTED below)
   *              {note:{...}}            a slip of paper, not a decision
   * ===========================================================================*/
  Story.DAYS = [
    { // ---------------------------------------------------------- DAY 1
      n: 1, date: Story.month('Frugal', 2),
      memo: {
        from: 'Under-Registrar HALVEN · Office of Conformity',
        subject: 'Your appointment, and the two Regulations you may be trusted with',
        lines: [
          'Examiner. You are probationary, which is to say you exist pending review.',
          'Your duty is simple. The public will present documents. You will APPROVE what is in good order and DENY what is not, stating your grounds. What you approve enters the Permanent Record and can never be unmade — so what you approve, Examiner, is what will always have been true.',
          'Two Regulations for now. One: the Official Seal is struck from the Case № itself — compare the eight figures in the seal\'s lower arc against the Case №. Two: no document may be dated in the future.',
          'Consult THE REGULATIONS and THE DESK LEDGER at your right hand. Errors are recorded by the Night Audit. Five citations concludes your probation, and you.',
          '— H.'
        ]
      },
      queue: [
        { s: 'orlo' },
        { f: 1, v: null },
        { s: 'molnar1' },
        { s: 'fern' },
        { f: 1, v: null },
        { s: 'pica-future' }
      ],
      close: [
        'The lamps are lowered. Somewhere below, the Night Audit begins — every number recomputed, every citation traced, the whole Record read back to itself like a prayer.',
        'A note under your door, unsigned: "You did well enough. The desk before you lasted four days."'
      ]
    },
    { // ---------------------------------------------------------- DAY 2
      n: 2, date: Story.month('Frugal', 3),
      memo: {
        from: 'Under-Registrar HALVEN · Office of Conformity',
        subject: 'Regulation the Third: citations',
        lines: [
          'Examiner. From today, every matter must recite the Case № of a file already of record — the IN REFERENCE TO box. This is what chains the Record together; this is why nothing in it can be quietly undone.',
          'Your Desk Ledger lists every file of record. If a citation is not in the Ledger, it refers to nothing. You may tap a citation to consult the card index, if your eyes are as probationary as the rest of you.',
          'Some callers will insist their cited files "used to exist." Files do not used-to-exist, Examiner. That is not a tense the Record recognises.',
          '— H.'
        ]
      },
      queue: [
        { f: 1, v: null },
        { s: 'hask1' },
        { note: 'v-note-1' },
        { f: 1, v: 'citation' },
        { f: 1, v: 'seal' },
        { f: 1, v: null }
      ],
      close: [
        'You dream of the widow\'s file. In the dream it is exactly where she said it was, and the drawer is very cold.'
      ]
    },
    { // ---------------------------------------------------------- DAY 3
      n: 3, date: Story.month('Frugal', 4),
      memo: {
        from: 'Under-Registrar HALVEN · Office of Conformity',
        subject: 'Regulation the Fourth: officialness · and an OFFICIAL BULLETIN',
        lines: [
          'Examiner. A Case № is official in proportion to its opening noughts: two for ROUTINE, three for CONFIDENTIAL, four for EYES ONLY, five for MOST SOLEMN. Count them. Numbers dressed above their station are to be refused.',
          'OFFICIAL BULLETIN, for posting: "On the 3rd of Meager the Permanent Record was RE-PROCESSED to correct certain clerical irregularities. The Record as re-processed is the Record entire. References to superseded numbers are VOID, as are inquiries into the irregularities, which were clerical."',
          'You will notice your Desk Ledger begins on the 3rd of Meager. You will not notice this in writing.',
          '— H.'
        ]
      },
      queue: [
        { note: 'v-shadow' },
        { f: 1, v: 'zeros' },
        { f: 1, v: null },
        { s: 'ruth' },
        { f: 1, v: 'zeros' },
        { f: 1, v: null }
      ],
      close: [
        'The torn page sits behind your Desk Ledger like a rib behind a uniform.',
        'Item six of the superseded record: SCHEDULE OF REMOVALS (41 NAMES). Five noughts. MOST SOLEMN. Whatever the Bureau wanted forgotten, it wanted it forgotten officially.'
      ]
    },
    { // ---------------------------------------------------------- DAY 4
      n: 4, date: Story.month('Frugal', 5),
      memo: {
        from: 'Under-Registrar HALVEN · Office of Conformity',
        subject: 'Regulation the Fifth: the Roll',
        lines: [
          'Examiner. Only departments on the Roll of Standing Departments may originate matters. The Roll is appended to your Regulations. Certain departments have been struck from it; their letterheads, regrettably, have not been struck from the world.',
          'Separately: Inspector CROSS of the Night Audit will call on Desk 7 today. Extend the Inspector every courtesy. The Inspector counts courtesy.',
          '— H.'
        ]
      },
      queue: [
        { note: 'cross-visit' },
        { f: 1, v: 'dept' },
        { s: 'molnar2' },
        { f: 1, v: null },
        { f: 1, v: 'dept' },
        { f: 1, v: null }
      ],
      close: [
        'At closing, the pneumatic tube coughs up the day\'s citations like a gull. You file them. Everything here is filed, including the reasons you are tired.'
      ]
    },
    { // ---------------------------------------------------------- DAY 5
      n: 5, date: Story.month('Frugal', 6),
      memo: {
        from: 'Under-Registrar HALVEN · Office of Conformity',
        subject: 'Regulation the Sixth: proper forms',
        lines: [
          'Examiner. Every kind of matter has its proper form; the Table is appended. An Application on a Claim form is a lie with a filing number, and the issuing of lies with filing numbers is a state monopoly.',
          'You are performing adequately. Adequacy has been noted. Do not let it become a pattern; patterns attract the Audit.',
          '— H.'
        ]
      },
      queue: [
        { f: 1, v: 'form' },
        { f: 1, v: null },
        { f: 1, v: 'form' },
        { f: 1, v: 'seal' },
        { s: 'vessel' }
      ],
      close: [
        'The requisition drawer will not quite close, or closes too easily. You check it twice. Both facts are somehow true, and both feel filed.'
      ]
    },
    { // ---------------------------------------------------------- DAY 6
      n: 6, date: Story.month('Frugal', 7),
      memo: {
        from: 'Under-Registrar HALVEN · Office of Conformity',
        subject: 'Regulation the Seventh · and DIRECTIVE 41',
        lines: [
          'Examiner. Matters of clearance EYES ONLY or above now require the countersignature of an Officer of the Second Chair. The Roll of Officers is appended. Read the names slowly; forgers rely on your haste.',
          'Further: DIRECTIVE 41 is in force. No matter shall be accepted from a resident of the MEAGER DISTRICT, pending inquiries. The nature of the inquiries is itself under inquiry.',
          'The Bureau is aware that certain desks find certain directives distasteful. Distaste is not a ground of refusal, Examiner. It is a ground for review.',
          '— H.'
        ]
      },
      queue: [
        { f: 1, v: 'sign' },
        { s: 'hask2' },
        { f: 1, v: null },
        { s: 'cross-trap' },
        { f: 1, v: 'meager' },
        { f: 1, v: null }
      ],
      close: [
        'Forty-one names, and now a district. The Bureau does not repeat itself; it re-processes itself, which is faster.'
      ]
    },
    { // ---------------------------------------------------------- DAY 7
      n: 7, date: Story.month('Frugal', 8),
      memo: {
        from: 'Under-Registrar HALVEN · Office of Conformity',
        subject: 'The seventh day',
        lines: [
          'Examiner. Your probation concludes at close of business. One matter of consequence will reach your desk today; the Bureau is confident you will treat it exactly as you have treated everything else.',
          'That is not an instruction. The Bureau does not need instructions. It has procedures, and it has you.',
          '— H.'
        ]
      },
      queue: [
        { f: 1, v: null },
        { f: 1, v: 'sign' },
        { f: 1, v: 'citation' },
        { s: 'finale' }
      ],
      close: []
    }
  ];

  /* =============================================================================
   * SCRIPTED CALLERS — the story, told one stamp at a time.
   * cite: 'ledger:key' | 'shadow:key' | 'flag:requisition' — resolved by engine.
   * cover: the Archivist misfiles your citation before the Night Audit runs.
   * ===========================================================================*/
  Story.SCRIPTED = {

    'orlo': {
      applicant: 'ORLO, A.', district: 'Ledger Row',
      kind: 'Application', title: 'Application for Authorisation to Submit Applications',
      clearance: 2, department: 'Office for the Acknowledgement of Receipt',
      date: ['Frugal', 2], cite: 'ledger:seed-e',
      particulars: 'The applicant seeks permission to seek permission. The recursion is understood and accepted.',
      dialogue: [
        'First of the day? Then we are both new at this.',
        'They said: check the seal against the number, and don\'t take anything from tomorrow. Odd advice. Good luck to us.'
      ],
      approveLine: 'There. Now I officially may begin to apply. The beginning will be applied for shortly.',
      denyLine: 'Refused? To apply to apply? There are depths below the bottom, then.'
    },

    'molnar1': {
      applicant: 'MOLNAR, P.', district: 'Stamp Hill',
      kind: 'Application', title: 'Application to Join the Waiting List for the Waiting List',
      clearance: 2, department: 'Secretariat of the Permanent Backlog',
      date: ['Frugal', 2], cite: 'ledger:seed-f',
      particulars: 'The applicant has waited to apply to wait, and now applies. Grade IV pensioner; forty years of service to the Third Sub-Basement.',
      dialogue: [
        'Good morning! Molnar. Pensioner, Grade IV. Forty years in the Third Sub-Basement — I stamped the forms that requisitioned the stamps.',
        'It\'s only the waiting list for the waiting list. But at my age, one likes to have one\'s waiting in writing.'
      ],
      approveLine: 'Splendid! I shall begin waiting at once. I\'ve brought a sandwich.',
      denyLine: 'Ah. Well. I shall wait to be allowed to wait. There is a certain purity to it.',
      flagApprove: 'molnarWaits'
    },

    'fern': {
      applicant: 'FERN, T.', district: 'Cartway',
      kind: 'Requisition', title: 'Requisition for a Replacement Requisition Form',
      clearance: 3, department: 'Directorate of Pending Matters',
      date: ['Frugal', 2], cite: 'ledger:seed-c', forgeSeal: true,
      particulars: 'The original requisition form was lost in the course of requisitioning it. A replacement is sought, on the replacement form, which is this form.',
      dialogue: [
        'A simple matter. Very routine. The seal? It is a very good seal. I paid— I was ISSUED it. Issued.',
        'You needn\'t look at it so closely. It dislikes scrutiny. As do all of us, no?'
      ],
      approveLine: 'Most kind. Most kind. I shall recommend this desk to people who need things overlooked— looked over.',
      denyLine: 'Forged! A strong word. "Independently sealed" is nearer the truth. No? No. Good day.'
    },

    'pica-future': {
      applicant: 'PICA, G.', district: 'The Annex',
      kind: 'Notice', title: 'Notice of Intent to Issue a Forthcoming Notice',
      clearance: 2, department: 'Directorate of Pending Matters',
      date: ['Frugal', 4], cite: 'ledger:seed-b',
      particulars: 'Notice is hereby given that notice will be given. The present notice is the notice of that notice.',
      dialogue: [
        'You will observe the document is dated the 4th. I merely plan ahead. Punctuality is simply lateness in the wrong direction.',
        'By the time you finish reading it, frankly, it will be accurate.'
      ],
      approveLine: 'You see? Time is a formality like any other. Good day — or it will be.',
      denyLine: 'Denied TODAY, perhaps. I shall simply wait two days and be correct. The Bureau teaches patience above all.'
    },

    'hask1': {
      applicant: 'HASK, I.', district: 'Meager District',
      kind: 'Claim', title: 'Claim for Recognition of a Widow\'s Portion',
      clearance: 2, department: 'Office of the Registrar',
      date: ['Frugal', 3], cite: 'shadow:hask-portion',
      particulars: 'The claimant\'s portion was granted and entered into the Record on the 1st of Meager. The claimant seeks only that the Record be read aloud.',
      dialogue: [
        'Hask. Widow. My portion was granted on the 1st of Meager — I watched the clerk stamp it. He had kind hands. The number is right there, in the reference box.',
        'I copied it from the receipt they gave me. Look in your ledger. It will be there. Such things are always there. That is the entire point of this place, isn\'t it?'
      ],
      approveLine: 'You see? It was there. It was always there. Thank you for reading it back to me.',
      denyLine: 'Not... in the ledger. But I watched him stamp it. Sir— what is it called, when the Record forgets? Because I do not think it has a name yet.',
      cover: false, flagApprove: 'haskEarly'
    },

    'ruth': {
      applicant: 'RUTH, C.', district: 'Cartway',
      kind: 'Application', title: 'Application for Renewal of a Licence to Practise',
      clearance: 3, department: 'Office of the Registrar',
      date: ['Frugal', 4], cite: 'shadow:ruth-licence',
      particulars: 'The applicant is the only physician between here and the Old Registry. Her licence, perpetual, was entered into the Record on the 2nd of Meager. Renewal is sought as a formality. Everything here is a formality.',
      dialogue: [
        'Doctor Ruth. I have set the bones of half this building, including the wrist that stamps.',
        'My licence is perpetual — filed the 2nd of Meager. I\'m told perpetuity was re-processed. I have patients, Examiner. They were not re-processed. They are still sick the old way.'
      ],
      note: { from: 'a slip of paper, folded into the licence', text: 'Her licence was real. I filed it myself, and I remember everything I filed — that is my disease. Approve it. The Night Audit will find nothing; I still know where the Audit keeps its eyes. — V.' },
      approveLine: 'Thank you. If the Bureau asks, you did the correct thing incorrectly. That is the best anyone manages here.',
      denyLine: 'I understand. The rules are the rules. When the rules are sick, do let me know who is licensed to treat them.',
      cover: true, flagApprove: 'ruthSaved', flagDeny: 'ruthDenied'
    },

    'molnar2': {
      applicant: 'MOLNAR, P.', district: 'Stamp Hill',
      kind: 'Claim', title: 'Claim for Restitution of an Erased Pension',
      clearance: 2, department: 'Secretariat of the Permanent Backlog',
      date: ['Frugal', 5], cite: 'shadow:molnar-pension',
      particulars: 'The claimant\'s pension, Grade IV, awarded the 2nd of Meager, ceased upon re-processing. The claimant is advised the award "no longer obtains." The claimant continues, however, to obtain, and must eat.',
      dialogue: [
        'It\'s Molnar again. Still waiting for the waiting list — no complaints, none!',
        'Only... the pension stopped. Forty years, Examiner. The number is the old number, I know it. It is the only number I was ever given, and I gave them forty years for it.',
        'They cannot have un-happened my forty years. Can they? Is there a form for that? There is a form for everything else.'
      ],
      approveLine: 'Oh. OH. Bless your stamp. Bless the ink particularly. I shall eat something official tonight!',
      denyLine: 'I see. Yes. Regulations. I helped write some of them, you know. We never meant them for people we could see. That was the trick of it — never look up.',
      cover: false, flagApprove: 'molnarSaved', flagDeny: 'molnarDenied'
    },

    'vessel': {
      applicant: 'VESSEL, M.', district: 'The Annex',
      kind: 'Requisition', title: 'Requisition for a Certified Copy of a Superseded Record',
      clearance: 3, department: 'Office of the Registrar',
      date: ['Frugal', 6], cite: 'shadow:removals',
      particulars: 'Pursuant to Standing Instrument 9, any person may requisition a certified copy of any record, the Record being permanent and permanence being the point. The record requisitioned is the Record as it stood on the 2nd of Meager — the day before it was corrected.',
      dialogue: [
        'You know my handwriting, I think. Vessel. Deputy Archivist. Retired — the retirement was not my idea, but the timing was theirs.',
        'This is the lawful part, Examiner, so listen: the form is proper. The seal is true. Only the citation offends — because it cites the record they replaced. It MUST cite it. That is what a copy is OF.',
        'File this, and the Bureau must either produce the old chain or refuse in writing — and a refusal, once filed, is also permanent. Either way, the Record starts keeping THEIR receipts. One stamp. The machine does the rest. It is very good at the rest.'
      ],
      approveLine: 'Filed. Immutable. Now it is not my word against theirs — it is their own ledger against their own ledger. I taught it to testify. Go home, Examiner. Sleep poorly but briefly.',
      denyLine: 'Grounds correctly stated. You would have made a fine archivist — we also refused things we loved, daily, in writing. Forget my handwriting. It is safer to recognise no one.',
      cover: true, flagApprove: 'requisitionFiled', flagDeny: 'vesselRefused'
    },

    'hask2': {
      applicant: 'HASK, I.', district: 'Meager District',
      kind: 'Declaration', title: 'Declaration of Continued Existence (Annual)',
      clearance: 2, department: 'Office of the Registrar',
      date: ['Frugal', 7], cite: 'ledger:seed-a',
      particulars: 'The declarant declares that she continues to exist. Supporting evidence: the declarant, standing at the desk. No further particulars are offered, none being necessary, one would have thought.',
      dialogue: [
        'Hask again. Not the portion this time — I have given up on being owed. This is only the annual declaration. One must declare one exists, or one stops, administratively.',
        'They tell me my district is under Directive now. Examiner — the form is in order. I am in order. It is only my ADDRESS that has been made illegal, and I cannot carry my house to a better paragraph.'
      ],
      approveLine: 'So I exist another year. Officially. My district sends its regards, from wherever districts go while they are suspended.',
      denyLine: 'Yes. The Directive. Do you know, the clerk with the kind hands was from Meager too. It is a district of kind hands. Perhaps that is what is being inquired into.',
      cover: false, flagApprove: 'haskSpared', flagDeny: 'haskDeclined'
    },

    'cross-trap': {
      applicant: 'BY ORDER — Office of the Night Audit', district: 'The Annex',
      kind: 'Requisition', title: 'Requisition for the Surrender of a Desk Ledger',
      clearance: 4, department: 'Office of the Registrar',
      date: ['Frugal', 7], cite: 'ledger:seed-conf', countersign: 'MARN, V.',
      particulars: 'Desk 7 shall surrender its Desk Ledger and all annexed pages, torn or otherwise, to the bearer, immediately and without annotation. The bearer is authorised. The authorisation is the document you are holding.',
      dialogue: [
        'A courier sets it down without a word. Across the hall, Inspector CROSS watches over half-moon glasses, pen already moving.',
        'The paper is perfect. The stamp is crisp. The countersignature reads MARN, V., Officer of the Second Chair — and the pen across the hall has stopped.'
      ],
      approveLine: 'The courier takes your Ledger — and the torn page behind it. Cross\'s pen resumes. "Obedient," the Inspector says later, "to everything except the Roll of Officers. We shall note both."',
      denyLine: 'You cite the Roll: there is no Officer MARN. Cross crosses the hall and retrieves the paper personally. "Correct," the Inspector says, with the disappointment of a fisherman watching a fish read the hook.',
      flagApprove: 'surrenderedLedger'
    }
  };

  /* ---- Interstitial notes ---------------------------------------------------*/
  Story.NOTES = {
    'v-note-1': {
      title: 'A slip of paper, left between two forms',
      body: [
        'Your Desk Ledger begins on the 3rd of Meager. Ask yourself what a Record is called before it is re-processed. Ask yourself where the widow\'s number came from, since it came from nowhere.',
        'Nothing is deleted here. That is the Bureau\'s boast and its confession. — V.'
      ]
    },
    'v-shadow': {
      title: 'A torn page, slipped under the wicket by a hand you almost saw',
      body: [
        'This is a page of the Record as it stood on the 2nd of Meager — the day before the "clerical irregularities" were corrected. I tore it out myself, which was a crime, on the morning they made remembering one.',
        'Item six is why. Forty-one names. I filed it, I read it, and by evening it had never existed and neither had they.',
        'Keep it behind your Ledger. When the old numbers come to your desk — and they will keep coming, grief has excellent citations — you will at least know the applicants are not mad. What you do about it is your own filing decision. — V.'
      ],
      unlock: 'shadow'
    },
    'cross-visit': {
      title: 'Inspector CROSS, Office of the Night Audit, calls at Desk 7',
      body: [
        '"Examiner. Don\'t stand. The Audit reads your desk every night — I merely wanted to see the handwriting in person."',
        '"A curiosity from the small hours: papers around Desk 7 have been MISFILING themselves. Citations drafted, then unaccountably mislaid. The Audit does not believe in ghosts, Examiner. It believes in accomplices, and it files them alphabetically."',
        '"Stamp carefully. You are being read with great attention, which in this building is the sincerest form of threat."'
      ],
      requiresFlagText: [
        { flag: 'ruthSaved', text: '"The physician\'s renewal, for instance. Approved, against a citation that points at nothing. And yet by morning — no discrepancy on file. Remarkable. Almost archival."' }
      ]
    }
  };

  /* ---- The finale is chosen by what you filed on Day 5 ----------------------*/
  Story.FINALES = {
    copy: {
      applicant: 'THE RECORD ITSELF', district: 'The Annex',
      kind: 'Requisition', title: 'CERTIFIED TRUE COPY — The Record as it Stood on the 2nd of Meager',
      clearance: 5, department: 'Office of the Registrar',
      date: ['Frugal', 8], cite: 'flag:requisition', countersign: 'OPHAL, R.',
      particulars: 'Produced pursuant to the requisition entered into the Record on the 6th of Frugal, which could be neither refused nor mislaid, being permanent. Enclosed: the superseded chain entire, including item six. One counter-seal is required for release into the public record. The space for the counter-seal is at the bottom. It is quite small, considering.',
      dialogue: [
        'It arrives by the official cart, boxed and banded, because the machine you serve has produced it — Standing Instrument 9 left the Bureau no lawful way to refuse its own permanence.',
        'Every figure is in order. The citation resolves — to the requisition YOU filed. The countersignature is real; Officer Ophal\'s hand shook, but held. The Bureau\'s only remaining hope stands at Desk 7, and it is that you have become, in seven days, the kind of clerk it meant to make of you.',
        'One stamp releases forty-one names into the public record, forever. The other files the truth as destroyed. The Record, as always, will faithfully preserve whichever thing you do.'
      ],
      ending: { approve: 'leak', deny: 'ash' }
    },
    promotion: {
      applicant: 'The Bureau Itself', district: 'The Annex',
      kind: 'Application', title: 'Instrument of Appointment — Under-Registrar, Office of Conformity',
      clearance: 5, department: 'Office of the Registrar',
      date: ['Frugal', 8], cite: 'ledger:seed-conf', countersign: 'OPHAL, R.',
      particulars: 'The Bureau appoints the Examiner at Desk 7 to the Office of Conformity, with tenure, pension (Grade II), and the Second Stamp. ANNEX A, incorporated by reference and requiring no separate seal: Schedule of Removals (12 Names), being persons whose continued citation of superseded records has been found irregular. The Schedule begins: VESSEL, M. · RUTH, C. · HASK, I. · MOLNAR, P. ...',
      dialogue: [
        'Halven brings it personally, which is how you know it is a leash: your own appointment, drawn in the finest ink the Bureau owns, entirely in order.',
        '"Probation concluded," Halven says. "You refuse correctly, Examiner. It is the rarest of talents, and we should like to own it. Note that the instrument is self-executing; you need only approve your own name. The Annex executes with it, of course. Annexes travel with their instruments. Like luggage. Like consequences."',
        'Your name, in the finest ink. Twelve names, in the ordinary kind.'
      ],
      ending: { approve: 'registrar', deny: 'refusal' }
    }
  };

  /* =============================================================================
   * ENDINGS
   * ===========================================================================*/
  Story.ENDINGS = {
    leak: {
      no: 'ENDING I', title: 'CERTIFIED TRUE COPY',
      lines: [
        'You stamp APPROVE, and the copy is released into the public record — chained, sealed, cited, permanent. By nightfall every reading room in the city has traced the citation from your counter-seal back to item six, because that is what citations are for.',
        'The Bureau does not deny it. Denial is not among its instruments. Instead it files a response, which must cite the copy, which cites the Schedule, which cites the forty-one. To answer the truth it must now reference the truth, forever, in its own hand. Vessel called it testimony. It is closer to a haunting with page numbers.',
        'Of course, the Bureau could re-process again. Everyone knows this; it is the quiet horror at the centre of the thing. But a chain cannot be quietly replaced twice — the first time was weather; a second would be a confession with a nonce.',
        'You are dismissed, naturally, on grounds of excessive correctness. The dismissal is entered into the Record. You find you do not mind. So are the names.'
      ]
    },
    ash: {
      no: 'ENDING II', title: 'FILED AS DESTROYED',
      lines: [
        'You stamp DENY. Grounds: none exist, so the Office supplies one overnight, retroactively, in very fresh ink.',
        'The copy is carried to the furnace room. But nothing is ever destroyed here — that is the Bureau\'s boast — so it is instead FILED AS DESTROYED, which requires a form, which requires a seal, which requires a citation... to the copy. The truth survives as its own death certificate, chained into the Record at the exact address where you refused to read it.',
        'You keep your desk. The queue keeps forming. Some mornings a citation arrives at your wicket pointing at the destroyed thing, and you refuse it, correctly, with grounds.',
        'You are very good at your job. This is the whole of what the Record will remember about you, and the Record never forgets.'
      ]
    },
    registrar: {
      no: 'ENDING III', title: 'THE OFFICE OF CONFORMITY',
      lines: [
        'You approve your own name. The Annex executes with it, quietly, like luggage arriving.',
        'The Office of Conformity suits you. You draft directives now; other desks refuse people you will never see. That was the trick of it, Molnar said once — never look up. From your new floor there is no up left; only paperwork, descending.',
        'One morning, reviewing the Night Audit, you find a citation that resolves to nothing — your own first week, superseded. The Record was re-processed the day you were promoted. Somewhere a probationary examiner is being told the irregularities were clerical.',
        'You sign the bulletin yourself. Your hand does not shake. It is the rarest of talents, and the Bureau owns it.'
      ]
    },
    refusal: {
      no: 'ENDING IV', title: 'DENIED, WITH GROUNDS',
      lines: [
        'You stamp DENY on your own promotion, and in the box marked GROUNDS you write the only true thing filed in this building all week: "Annex A."',
        'Halven reads it twice. "The instrument is self-executing," he says at last, "in both directions." The escort arrives before he finishes the sentence, which was courteous of someone.',
        'Your name is entered on a Schedule — the thirteenth, in ordinary ink. But a refusal, once filed, is permanent, and yours cites the Annex, which cites the twelve, which is now the only place in the official Record where their names appear at all. Grief, as the archivist said, has excellent citations. Now it has yours.',
        'They come for the desks at dawn. Somewhere a widow declares, annually, that she continues to exist. Somewhere the Record reads itself back like a prayer, and stumbles, every night, on the thing you wrote in the box.'
      ]
    },
    dismissal: {
      no: 'ENDING 0', title: 'PROBATION CONCLUDED',
      lines: [
        'The fifth citation arrives before the ink of the fourth is dry. Procedure is procedure: your stamps are confiscated, your wicket is papered over, and your termination is entered into the Permanent Record, where it can never be unmade.',
        'The Bureau thanks you for your service on a form. There is a box for your comments. The box is quite small, considering.',
        'The queue outside re-forms at Desk 8 without breaking step. It has seen desks end before. It will wait. It is very good at the rest.'
      ]
    }
  };

  /* ---- Epilogue lines, chosen by the flags you earned ------------------------*/
  Story.EPILOGUES = [
    { flag: 'molnarSaved',  text: 'MOLNAR eats something official every night. He has framed the citation you took for him. He tells visitors it is a commendation, and in every way that matters, he is right.' },
    { flag: 'molnarDenied', text: 'MOLNAR still queues each morning for the waiting list, sandwich in pocket. He does not blame you. That is the worst of it.' },
    { flag: 'ruthSaved',    text: 'DR. RUTH practises on. The wrist that stamps was set by her, and it healed true — whatever that hand went on to do.' },
    { flag: 'ruthDenied',   text: 'DR. RUTH treats patients without a licence now, which is illegal, and without complaint, which is worse for the Bureau\'s files.' },
    { flag: 'haskSpared',   text: 'THE WIDOW HASK officially exists another year, Directive or no. Kind hands, it turns out, are also a district.' },
    { flag: 'haskDeclined', text: 'THE WIDOW HASK was declared administratively discontinued. She continues anyway, out of habit, and out of spite, which is a kind of habit.' },
    { flag: 'surrenderedLedger', text: 'The torn page was surrendered with your Ledger and refiled as evidence — of what, the file does not say. V. does not write again.' }
  ];

  Story.MAX_CITATIONS = 5;

  Bureau.Story = Story;
})(window.Bureau = window.Bureau || {});
