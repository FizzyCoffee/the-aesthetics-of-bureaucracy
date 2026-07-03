# THE PERMANENT RECORD
### Bureau of Immutable Affairs · Form PR-1 · Rev. ∞

> *Nihil sine formulario* — nothing without a form.

A working blockchain in the costume of a government records office. It is a
demonstration of *The Aesthetics of Bureaucracy*: the argument, made entirely
out of its own machinery, that **a blockchain is merely a bureaucracy that does
not trust you, and a bureaucracy is merely a blockchain operated by people who
do.** Both chain every document to the one before it so that nothing can ever
be quietly undone. Both call this *trust*. Both issue you a number and ask you
to wait.

The satire is not painted on top — it *is* the mechanism. Every primitive of a
real chain has been renamed to the bureaucratic act it has always secretly
been, and the rules are left genuinely intact so the joke actually runs:

| Blockchain primitive | …is filed here as | The joke it tells |
|---|---|---|
| Block | a **Form**, once entered into the Record | the unit of all human dealings with the State |
| `SHA-256` hash | the **Case Reference №** | bureaucracy's love of the unrepeatable number |
| `previousHash` | **"In Reference To: File №…"** | citing prior correspondence *is* a hash pointer |
| Proof-of-Work | **Proof of Diligence** | a clerk re-stamps until the number is "official" — meaningless labour, which is exactly what PoW is |
| Difficulty | **Required Officialness** | each leading zero is decreed official; the zeros confer nothing |
| Nonce | **Times Resubmitted** | how many stamps it took; you always resubmit |
| Mempool | **The In-Tray** | — |
| Genesis block | **The Founding Instrument** | an application to establish a department for processing applications |
| Chain validation | **The Audit** | it cannot prevent tampering; it makes tampering impossible to do *quietly* |
| The minted artifact | a unique **Official Seal** | the NFT/generative-art racket: a hash made precious by a registry that exists to make it precious |

Everything is real: real SHA-256 (hand-rolled, no dependencies), real
proof-of-work mining, real tamper-detection. **Edit any filed document's
*Particulars* and watch the Record discover the forgery — and itself — at
once.** Then press *Re-Process the Record* to rewrite history by brute force,
slowly and laboriously, exactly as a 51% attack (or a determined ministry)
would.

---

## The game: THE EXAMINATION DESK

Open **`game.html`** (or follow the *VACANCY* notice on the main page). A
Papers-Please-shaped puzzle game set inside the same machinery: you are
**Examiner-Probationary, Desk 7**, and for seven days the public brings you
documents. You approve what is in good order and deny the rest, *with grounds*.
Five citations concludes the appointment.

Every puzzle mechanic is a blockchain primitive wearing its own satire:

| You check… | …which is really | The regulation |
|---|---|---|
| the seal's № against the Case № | hash-derived signatures | a seal struck from another number is a forgery |
| "In Reference To" against the Desk Ledger | `previousHash` chain validation | a citation must refer to a file of record |
| leading noughts vs. clearance | proof-of-work difficulty | officialness must meet the stated clearance |
| the Roll, the Table of Proper Forms, the Second Chair | consensus rules | rules accrete daily; so does the queue |

The story turns on the one thing the main page demonstrates: the Record was
quietly **re-processed** on the 3rd of Meager, and a file titled *Schedule of
Removals (41 Names)* had never existed. Widows and pensioners keep arriving
with citations that resolve to nothing. A retired archivist slips you a torn
page of the superseded chain. Every kindness costs a citation. There are five
endings, depending on what you stamp.

---

## Running it

It is a static site with **no build step and no dependencies**.

**Simplest:** double-click `index.html`. (The crypto is hand-rolled precisely so
it runs from a `file://` path with nothing installed.)

**Or serve it** (nicer; required if your browser is strict about local files):

```bash
cd "The Aesthetics of Bureaucracy"
python3 -m http.server 4321
# then open http://localhost:4321
```

The Record persists in your browser's `localStorage`, in keeping with the
Bureau's policy that nothing is ever forgotten. *Purge (Forbidden)* erases it
and re-establishes the Founding Instrument.

Persistence is governed by **Form CK-1 · Notice of Retention** — the Bureau's
cookie system. Nothing is written to your machine until you consent to being
remembered; refuse, and your files are purged and the Bureau retains a single
cookie recording only that it is to remember nothing. (A refusal must itself
be retained, or the Office would be obliged to ask you again upon every visit.
This is the paradox at the bottom of every consent banner; the Bureau simply
files it.) Amend your answer at any time via *Cookies: Form CK-1* in the
classification banner.

## Deploying it later

Because it is plain static files, deployment is a copy operation:

- **GitHub Pages** — push the folder; set Pages to serve from the branch root.
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder, or point
  the project at the repo. No build command; publish directory is the root.
- **Any static host / S3 bucket** — upload `index.html`, `styles.css`, and
  `src/`.

No server-side code, no environment variables, no secrets.

## Structure

```
index.html        the form, the masthead, the Record
styles.css        the house style of a government that never throws anything away
src/sha256.js     the Case-Number engine (SHA-256, FIPS 180-4, dependency-free)
src/seal.js       the Office of Seals — generative guilloché art from each hash
src/forms.js      the Office of Nomenclature & Fine Print (all the copy)
src/blockchain.js The Permanent Record itself (chain, proof-of-work, the Audit)
src/app.js        the Front Desk (intake, mining theatre, rendering, tamper/audit)
src/retention.js  the Office of Retention (Form CK-1 — the cookie system)

game.html         THE EXAMINATION DESK (the game)
game.css          the wicket, the stamps, the grounds of refusal
src/game/story.js the seven days: regulations, memoranda, callers, endings
src/game/engine.js case numbers, the Desk Ledger, the torn page, adjudication
src/game/ui.js    screens, stamps, and the small theatre of the queue
```

## Things to try

1. **File a form.** Pick a *Nature of Request* (they are all self-defeating),
   choose a *Required Officialness*, and watch the clerk stamp until the case
   number earns its official zeros.
2. **Crank the Officialness to "Most Solemn" (5 zeros).** The Bureau warns this
   "requires considerable patience." It is not lying — that is proof-of-work.
3. **Forge the past.** Edit the *Particulars* of any filed document. The Audit
   voids it and everything filed after it, instantly.
4. **Rewrite history.** With the Record compromised, press *Re-Process* and
   watch the Bureau laboriously re-stamp the forged chain back into "good order."
   That this is possible at all is the quiet horror at the centre of the thing.

---

<sub>Sealed by the Office of the Registrar · Witnessed by no one · Filed in
perpetuity. This document is valid only in the presence of all other documents.</sub>
