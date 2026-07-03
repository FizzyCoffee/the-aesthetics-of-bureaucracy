/* =============================================================================
 * sha256.js — THE OFFICIAL CASE-NUMBER ENGINE
 * -----------------------------------------------------------------------------
 * A complete, self-contained implementation of SHA-256 (FIPS 180-4), used by
 * the Bureau to derive each form's CASE REFERENCE NUMBER from its contents.
 *
 * No external library, no network, no Web Crypto dependency: the demo must run
 * identically whether opened from a file:// path or served from a host. The
 * function is synchronous so the "Proof of Diligence" loop can visibly count.
 *
 * (The Bureau notes, for the record, that it does not understand this file and
 *  accepts no responsibility for its contents. The file is, however, on file.)
 * ===========================================================================*/
(function (Bureau) {
  'use strict';

  // Round constants: the first 32 bits of the fractional parts of the cube
  // roots of the first 64 primes. Memorised by no one; consulted by everyone.
  var K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);

  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  function utf8Bytes(str) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
    var utf8 = unescape(encodeURIComponent(str));
    var bytes = new Uint8Array(utf8.length);
    for (var i = 0; i < utf8.length; i++) bytes[i] = utf8.charCodeAt(i);
    return bytes;
  }

  function sha256(message) {
    var msg = utf8Bytes(message);
    var l = msg.length;
    var bitLen = l * 8;

    // Pad: append 0x80, then zeros, then the 64-bit big-endian length.
    var withOne = l + 1;
    var k = (56 - (withOne % 64) + 64) % 64;
    var total = withOne + k + 8;
    var buf = new Uint8Array(total);
    buf.set(msg, 0);
    buf[l] = 0x80;

    var hi = Math.floor(bitLen / 0x100000000);
    var lo = bitLen >>> 0;
    buf[total - 8] = (hi >>> 24) & 0xff;
    buf[total - 7] = (hi >>> 16) & 0xff;
    buf[total - 6] = (hi >>> 8) & 0xff;
    buf[total - 5] = hi & 0xff;
    buf[total - 4] = (lo >>> 24) & 0xff;
    buf[total - 3] = (lo >>> 16) & 0xff;
    buf[total - 2] = (lo >>> 8) & 0xff;
    buf[total - 1] = lo & 0xff;

    var h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a,
        h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

    var w = new Uint32Array(64);

    for (var i = 0; i < total; i += 64) {
      for (var t = 0; t < 16; t++) {
        var j = i + t * 4;
        w[t] = (buf[j] << 24) | (buf[j + 1] << 16) | (buf[j + 2] << 8) | (buf[j + 3]);
      }
      for (t = 16; t < 64; t++) {
        var s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        var s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
      }

      var a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

      for (t = 0; t < 64; t++) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var temp1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var temp2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + temp1) >>> 0;
        d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
      }

      h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
    }

    function hex(x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }
    return hex(h0) + hex(h1) + hex(h2) + hex(h3) + hex(h4) + hex(h5) + hex(h6) + hex(h7);
  }

  Bureau.sha256 = sha256;
})(window.Bureau = window.Bureau || {});
