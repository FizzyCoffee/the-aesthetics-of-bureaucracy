/* =============================================================================
 * seal.js — THE OFFICE OF SEALS & EMBOSSMENTS
 * -----------------------------------------------------------------------------
 * Every form admitted to the Permanent Record is issued a unique Official Seal,
 * generated deterministically from its Case Reference Number (its hash). The
 * same number always yields the same seal; no two numbers yield the same seal.
 *
 * This is, of course, the entire racket of generative art: a hash becomes a
 * "one-of-one", its scarcity manufactured by arithmetic and ratified by a
 * registry that exists to ratify it. The seal is both the security feature and
 * the artwork. We are aware. We have stamped a form acknowledging that we are
 * aware. The form has its own seal.
 *
 * Seals are drawn as engraved guilloché rosettes — the same family of curves
 * that decorate banknotes, share certificates, and other promises.
 * ===========================================================================*/
(function (Bureau) {
  'use strict';

  // ---- Deterministic pseudo-randomness, seeded by the case number ----------
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function fnv1a(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function gcd(a, b) { while (b) { var t = b; b = a % b; a = t; } return a; }

  // The inks the Bureau is authorised to requisition this fiscal era.
  var INKS = [
    { ink: '#7c1d24', tint: '#7c1d24', name: 'Vermilion Seal Ink' },
    { ink: '#15375f', tint: '#15375f', name: 'Ministry Blue' },
    { ink: '#2f4733', tint: '#2f4733', name: 'Registry Green' },
    { ink: '#3a3340', tint: '#3a3340', name: 'Hearing Slate' },
    { ink: '#6a4a1c', tint: '#6a4a1c', name: 'Archive Sepia' }
  ];

  var MOTTI = [
    'NIHIL · SINE · FORMULARIO',
    'ORDO · AB · CHARTA',
    'NIL · DELETUR',
    'PER · CHARTAM · AD · ASTRA',
    'NULLA · FORMA · SINE · FORMA',
    'SIGILLUM · OFFICIALE'
  ];

  // ---- Curve builders -------------------------------------------------------
  function rosettePath(cx, cy, R, r, d, scale) {
    var g = gcd(R, r) || 1;
    var turns = r / g;
    var steps = Math.min(3600, Math.max(720, Math.round(turns * 240)));
    var k = (R - r) / r;
    var out = '';
    for (var i = 0; i <= steps; i++) {
      var t = (i / steps) * turns * 2 * Math.PI;
      var x = (R - r) * Math.cos(t) + d * Math.cos(k * t);
      var y = (R - r) * Math.sin(t) - d * Math.sin(k * t);
      out += (i === 0 ? 'M' : 'L') + (cx + x * scale).toFixed(2) + ',' + (cy + y * scale).toFixed(2);
    }
    return out + 'Z';
  }

  function starPath(cx, cy, points, outer, inner, rot) {
    var s = '';
    for (var i = 0; i < points * 2; i++) {
      var rad = (i % 2 === 0) ? outer : inner;
      var a = rot + i * Math.PI / points;
      s += (i === 0 ? 'M' : 'L') + (cx + rad * Math.cos(a)).toFixed(2) + ',' + (cy + rad * Math.sin(a)).toFixed(2);
    }
    return s + 'Z';
  }

  function ringTextPath(cx, cy, r, sweep) {
    // A full circle (sweep=1) or lower arc, as a path for <textPath>.
    if (sweep === 'lower') {
      return 'M' + (cx - r) + ',' + cy + ' A' + r + ',' + r + ' 0 0 0 ' + (cx + r) + ',' + cy;
    }
    return 'M' + (cx - r) + ',' + cy +
      ' a' + r + ',' + r + ' 0 1 1 ' + (2 * r) + ',0' +
      ' a' + r + ',' + r + ' 0 1 1 ' + (-2 * r) + ',0';
  }

  /**
   * makeSeal(hash, opts) -> { svg, ink, inkName }
   * opts: { size=240, label='', uid='' }  uid keeps gradient/path ids unique.
   */
  function makeSeal(hash, opts) {
    opts = opts || {};
    var size = opts.size || 240;
    var uid = (opts.uid || hash.slice(0, 8));
    var rng = mulberry32(fnv1a(hash));

    var cx = size / 2, cy = size / 2;
    var outerR = size * 0.46;
    var innerR = size * 0.30;

    var palette = INKS[Math.floor(rng() * INKS.length)];
    var ink = palette.ink;

    // Rosette parameters derived from the number.
    var R = 5 + Math.floor(rng() * 7);          // 5..11
    var r = 2 + Math.floor(rng() * (R - 1));      // 2..R-1  (ensures petals)
    if (r >= R) r = R - 1;
    var d = (0.45 + rng() * 0.5) * r;
    var rosetteScale = innerR / ((R - r) + d + 0.0001);

    var R2 = 5 + Math.floor(rng() * 7);
    var r2 = 2 + Math.floor(rng() * (R2 - 1));
    if (r2 >= R2) r2 = R2 - 1;
    var d2 = (0.4 + rng() * 0.45) * r2;
    var rosetteScale2 = (innerR * 0.74) / ((R2 - r2) + d2 + 0.0001);

    var starPoints = 5 + Math.floor(rng() * 8);   // 5..12
    var starRot = rng() * Math.PI;
    var motto = MOTTI[Math.floor(rng() * MOTTI.length)];
    var code = hash.slice(0, 8).toUpperCase();

    var ringId = 'ring-' + uid;
    var arcId = 'arc-' + uid;
    var embId = 'emb-' + uid;

    // Repeat the motto enough to wrap the ring.
    var ringText = '';
    var reps = 3;
    for (var rp = 0; rp < reps; rp++) ringText += motto + ' · ';

    var svg = '';
    svg += '<svg class="seal" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Official seal ' + code + '">';
    svg += '<defs>';
    svg += '<path id="' + ringId + '" d="' + ringTextPath(cx, cy, outerR - size * 0.085) + '"/>';
    svg += '<path id="' + arcId + '" d="' + ringTextPath(cx, cy, innerR + size * 0.052, 'lower') + '"/>';
    svg += '<radialGradient id="' + embId + '" cx="50%" cy="42%" r="65%">'
        +  '<stop offset="0%" stop-color="' + ink + '" stop-opacity="0.16"/>'
        +  '<stop offset="70%" stop-color="' + ink + '" stop-opacity="0.04"/>'
        +  '<stop offset="100%" stop-color="' + ink + '" stop-opacity="0"/>'
        +  '</radialGradient>';
    svg += '</defs>';

    svg += '<g fill="none" stroke="' + ink + '">';

    // Faint emboss wash.
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + outerR + '" fill="url(#' + embId + ')" stroke="none"/>';

    // Outer double ring + a beaded ring of ticks.
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + outerR + '" stroke-width="' + (size * 0.012) + '" opacity="0.92"/>';
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (outerR - size * 0.028) + '" stroke-width="' + (size * 0.004) + '" opacity="0.7"/>';

    var ticks = 72, tr1 = outerR - size * 0.028, tr2 = outerR - size * 0.046;
    var tickPath = '';
    for (var ti = 0; ti < ticks; ti++) {
      var ta = (ti / ticks) * 2 * Math.PI;
      tickPath += 'M' + (cx + tr1 * Math.cos(ta)).toFixed(2) + ',' + (cy + tr1 * Math.sin(ta)).toFixed(2)
               +  'L' + (cx + tr2 * Math.cos(ta)).toFixed(2) + ',' + (cy + tr2 * Math.sin(ta)).toFixed(2);
    }
    svg += '<path d="' + tickPath + '" stroke-width="' + (size * 0.004) + '" opacity="0.5"/>';

    // Inner ring framing the rosette.
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + innerR + '" stroke-width="' + (size * 0.006) + '" opacity="0.85"/>';
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (innerR + size * 0.018) + '" stroke-width="' + (size * 0.003) + '" opacity="0.6"/>';

    // Guilloché rosettes (the engraving).
    svg += '<path d="' + rosettePath(cx, cy, R, r, d, rosetteScale) + '" stroke-width="' + (size * 0.0035) + '" opacity="0.62"/>';
    svg += '<path d="' + rosettePath(cx, cy, R2, r2, d2, rosetteScale2) + '" stroke-width="' + (size * 0.003) + '" opacity="0.5"/>';

    // Central medallion + star emblem.
    var medR = size * 0.115;
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + medR + '" stroke-width="' + (size * 0.004) + '" fill="' + ink + '" fill-opacity="0.06"/>';
    svg += '<path d="' + starPath(cx, cy, starPoints, medR * 0.92, medR * 0.4, starRot) + '" stroke-width="' + (size * 0.0035) + '" fill="' + ink + '" fill-opacity="0.10"/>';
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (size * 0.012) + '" fill="' + ink + '" stroke="none" opacity="0.9"/>';

    svg += '</g>';

    // Microtext ring (the motto) + lower arc (the code), in official mono.
    svg += '<g fill="' + ink + '" stroke="none" font-family="\'IBM Plex Mono\', monospace" font-weight="600">';
    svg += '<text font-size="' + (size * 0.052) + '" letter-spacing="' + (size * 0.004) + '" opacity="0.9">'
        +  '<textPath href="#' + ringId + '" startOffset="0">' + ringText + '</textPath></text>';
    svg += '<text font-size="' + (size * 0.05) + '" letter-spacing="' + (size * 0.018) + '" text-anchor="middle" opacity="0.85">'
        +  '<textPath href="#' + arcId + '" startOffset="50%">№ ' + code + '</textPath></text>';
    svg += '</g>';

    svg += '</svg>';

    return { svg: svg, ink: ink, inkName: palette.name };
  }

  Bureau.makeSeal = makeSeal;
})(window.Bureau = window.Bureau || {});
