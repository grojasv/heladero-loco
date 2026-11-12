/* El Heladero Loco: the mascot, a mad-scientist ice cream maker drawn as inline SVG.
 * Browser: <script src="mascot.js"></script> then Heladero.svg('mix').
 * Node:    const Heladero = require('./mascot.js').
 * No external assets and no text. The app animates <g class="hl-mouth"> while he speaks. */
(function (root) {
  'use strict';

  const C = {
    ink: '#2b2140',
    skin: '#f6c39a',
    skinDark: '#dd9c70',
    hair: '#ffffff',
    hairShade: '#d5e3ec',
    coat: '#ffffff',
    coatShade: '#dfe9f0',
    mint: '#8fe0c4',
    mintDark: '#4fbf9b',
    pink: '#ff8fb1',
    pinkDark: '#e85f8a',
    vanilla: '#ffe9a8',
    cone: '#eab266',
    coneDark: '#b97a35',
    lens: '#c9f4ff',
    lensCold: '#9fd0ff',
    mouth: '#6b1f3a',
    tongue: '#ff8fa3',
    trousers: '#5b4b8a',
    white: '#ffffff',
  };
  const SW = 3; // outline width
  const POSES = ['idle', 'mix', 'freeze', 'cheer'];
  const f = (n) => Number(n.toFixed(1));

  // A zigzag of hair spikes around (0,0), from angle a0 to a1 (degrees, 0 = right, 270 = up).
  function spikes(rIn, rOut, a0, a1, n) {
    const p = [];
    for (let i = 0; i <= n * 2; i++) {
      const a = ((a0 + ((a1 - a0) * i) / (n * 2)) * Math.PI) / 180;
      const r = i % 2 ? rOut + (i % 4 === 1 ? 4 : -3) : rIn;
      p.push(`${f(r * Math.cos(a))},${f(r * Math.sin(a))}`);
    }
    return p.join(' ');
  }

  function mouth(pose) {
    if (pose === 'freeze') {
      // chattering teeth
      return `<g class="hl-mouth"><rect x="-14" y="17" width="28" height="11" rx="4" fill="${C.white}" stroke="${C.ink}" stroke-width="${SW}"/>
        <path d="M-14,22.5 L-9,20 L-4,25 L1,20 L6,25 L11,20 L14,22.5" fill="none" stroke="${C.ink}" stroke-width="2"/></g>`;
    }
    const big = pose === 'cheer' || pose === 'mix';
    const d = big ? 'M-18,14 Q0,44 18,14 Q0,20 -18,14 Z' : 'M-16,15 Q0,36 16,15 Q0,20 -16,15 Z';
    return `<g class="hl-mouth"><path d="${d}" fill="${C.mouth}" stroke="${C.ink}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="${big ? 'M-13,17 Q0,22 13,17 L11,21 Q0,25 -11,21 Z' : 'M-12,17.5 Q0,22 12,17.5 L10,20.5 Q0,24 -10,20.5 Z'}" fill="${C.white}"/>
      <ellipse cx="0" cy="${big ? 31 : 27}" rx="${big ? 7 : 5}" ry="${big ? 4.5 : 3}" fill="${C.tongue}"/></g>`;
  }

  // The head, centred on (0,0).
  function headGroup(pose) {
    const cold = pose === 'freeze';
    const lens = cold ? C.lensCold : C.lens;
    return `<g class="hl-head">
      <polygon points="${spikes(30, 56, 150, 390, 9)}" fill="${C.hair}" stroke="${C.ink}" stroke-width="${SW}" stroke-linejoin="round"/>
      <circle cx="-39" cy="4" r="7" fill="${C.skin}" stroke="${C.ink}" stroke-width="${SW}"/>
      <circle cx="39" cy="4" r="7" fill="${C.skin}" stroke="${C.ink}" stroke-width="${SW}"/>
      <ellipse cx="0" cy="2" rx="38" ry="40" fill="${C.skin}" stroke="${C.ink}" stroke-width="${SW}"/>
      <path d="M-24,-30 Q0,-40 24,-30" fill="none" stroke="${C.skinDark}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M-38,-8 L38,-8" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>
      <path d="M-38,-8 L38,-8" stroke="${C.pinkDark}" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="-16" cy="-8" r="15" fill="${C.mint}" stroke="${C.ink}" stroke-width="${SW}"/>
      <circle cx="16" cy="-8" r="15" fill="${C.mint}" stroke="${C.ink}" stroke-width="${SW}"/>
      <circle cx="-16" cy="-8" r="10.5" fill="${lens}" stroke="${C.ink}" stroke-width="2"/>
      <circle cx="16" cy="-8" r="10.5" fill="${lens}" stroke="${C.ink}" stroke-width="2"/>
      <rect x="-3" y="-11" width="6" height="6" fill="${C.mintDark}" stroke="${C.ink}" stroke-width="2"/>
      <circle cx="-15" cy="-7" r="${cold ? 3 : 4.5}" fill="${C.ink}"/>
      <circle cx="18" cy="-9" r="${cold ? 3 : 2.6}" fill="${C.ink}"/>
      <circle cx="-19" cy="-12" r="2.2" fill="${C.white}"/>
      <circle cx="13" cy="-12" r="2.2" fill="${C.white}"/>
      <ellipse cx="0" cy="9" rx="5" ry="4" fill="${cold ? '#9fb7ff' : C.skinDark}" stroke="${C.ink}" stroke-width="2"/>
      ${mouth(pose)}
    </g>`;
  }

  // An ice cream cone held like a test tube. (x, y) is the top centre of the wafer; the tip is 30 below.
  function cone(x, y, bubbles) {
    return `<g class="hl-cone" transform="translate(${x},${y})">
      <polygon points="-10,0 10,0 0,30" fill="${C.cone}" stroke="${C.ink}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M-6,4 L3,20 M6,4 L-3,20 M-1,2 L6,12 M1,2 L-6,12" stroke="${C.coneDark}" stroke-width="1.5" fill="none"/>
      <circle cx="0" cy="-7" r="13" fill="${C.pink}" stroke="${C.ink}" stroke-width="${SW}"/>
      <path d="M-13,-5 Q-9,4 -5,-1 Q-1,6 4,-1 Q9,5 13,-5" fill="${C.pink}" stroke="${C.ink}" stroke-width="${SW}" stroke-linejoin="round"/>
      <circle cx="0" cy="-21" r="8" fill="${C.mint}" stroke="${C.ink}" stroke-width="${SW}"/>
      <circle cx="-5" cy="-11" r="2.5" fill="${C.white}" opacity="0.8"/>
      ${bubbles ? `<g class="hl-bubbles" fill="${C.vanilla}" stroke="${C.ink}" stroke-width="2">
        <circle cx="-8" cy="-36" r="3.5"/><circle cx="6" cy="-42" r="2.5"/><circle cx="-2" cy="-50" r="2"/></g>` : ''}
    </g>`;
  }

  // A coat sleeve along the points, ending in a hand.
  function arm(points) {
    const d = 'M' + points.map(([x, y]) => `${x},${y}`).join(' L');
    const [hx, hy] = points[points.length - 1];
    return `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="${C.coat}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${hx}" cy="${hy}" r="8" fill="${C.skin}" stroke="${C.ink}" stroke-width="${SW}"/>`;
  }

  function star(cx, cy, r, fill) {
    const p = [];
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4, rr = i % 2 ? r * 0.38 : r;
      p.push(`${f(cx + rr * Math.cos(a))},${f(cy + rr * Math.sin(a))}`);
    }
    return `<polygon points="${p.join(' ')}" fill="${fill}" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round"/>`;
  }
  const flake = (cx, cy, r) => `<g stroke="${C.lensCold}" stroke-width="2.5" stroke-linecap="round">
    <path d="M${cx - r},${cy} L${cx + r},${cy} M${cx},${cy - r} L${cx},${cy + r} M${f(cx - r * 0.7)},${f(cy - r * 0.7)} L${f(cx + r * 0.7)},${f(cy + r * 0.7)} M${f(cx - r * 0.7)},${f(cy + r * 0.7)} L${f(cx + r * 0.7)},${f(cy - r * 0.7)}"/></g>`;

  function body() {
    return `<g class="hl-body">
      <rect x="80" y="192" width="16" height="24" fill="${C.trousers}" stroke="${C.ink}" stroke-width="${SW}"/>
      <rect x="104" y="192" width="16" height="24" fill="${C.trousers}" stroke="${C.ink}" stroke-width="${SW}"/>
      <ellipse cx="85" cy="218" rx="13" ry="6" fill="${C.ink}"/>
      <ellipse cx="115" cy="218" rx="13" ry="6" fill="${C.ink}"/>
      <path d="M62,130 Q100,116 138,130 L150,202 L50,202 Z" fill="${C.coat}" stroke="${C.ink}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M138,130 L150,202 L128,202 Z" fill="${C.coatShade}"/>
      <polygon points="86,122 114,122 100,150" fill="${C.pink}" stroke="${C.ink}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M100,150 L100,202" stroke="${C.ink}" stroke-width="2.5"/>
      <path d="M86,122 L78,140 L100,150 M114,122 L122,140 L100,150" fill="none" stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="107" cy="164" r="3" fill="${C.mint}" stroke="${C.ink}" stroke-width="2"/>
      <circle cx="107" cy="180" r="3" fill="${C.mint}" stroke="${C.ink}" stroke-width="2"/>
      <rect x="66" y="170" width="20" height="17" rx="2" fill="${C.coat}" stroke="${C.ink}" stroke-width="2"/>
      <path d="M72,170 L72,160 M79,170 L79,163" stroke="${C.pinkDark}" stroke-width="3.5" stroke-linecap="round"/>
    </g>`;
  }

  function limbs(pose) {
    if (pose === 'mix') {
      return cone(168, 50, true) + arm([[136, 136], [160, 120], [168, 86]]) + arm([[64, 136], [40, 126], [30, 102]]) +
        `<path d="M30,96 L30,84" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/><path d="M30,96 L30,85" stroke="${C.skin}" stroke-width="4" stroke-linecap="round"/>`;
    }
    if (pose === 'freeze') {
      return arm([[64, 136], [58, 162], [98, 168]]) + arm([[136, 136], [142, 160], [104, 174]]) +
        flake(26, 60, 9) + flake(176, 40, 7) + flake(170, 110, 6) + flake(34, 150, 6);
    }
    if (pose === 'cheer') {
      return cone(168, 44, false) + arm([[136, 134], [160, 112], [168, 80]]) + arm([[64, 134], [40, 112], [32, 82]]) +
        star(24, 46, 10, C.vanilla) + star(182, 118, 8, C.mint) + star(30, 150, 7, C.pink);
    }
    return cone(162, 108, false) + arm([[136, 136], [156, 158], [162, 142]]) + arm([[64, 136], [46, 158], [62, 176]]);
  }

  const sizeAttrs = (size, ratio) => (size ? ` width="${size}" height="${Math.round(size * ratio)}"` : '');
  const check = (pose) => (POSES.includes(pose) ? pose : 'idle');

  const Heladero = {
    POSES,
    COLORS: C,
    /** The whole mascot. */
    svg(pose = 'idle', { size } = {}) {
      pose = check(pose);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 228"${sizeAttrs(size, 228 / 200)} class="heladero pose-${pose}" role="img" aria-label="El Heladero Loco">` +
        `<ellipse cx="100" cy="221" rx="56" ry="6" fill="${C.ink}" opacity="0.14"/>` +
        body() + `<g transform="translate(100,78)">${headGroup(pose)}</g>` + limbs(pose) + '</svg>';
    },
    /** Just the head on a square viewBox (for the app icon and small toasts). */
    head(pose = 'idle', { size } = {}) {
      pose = check(pose);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-64 -66 128 128"${sizeAttrs(size, 1)} class="heladero-head" role="img" aria-label="El Heladero Loco">` +
        headGroup(pose) + '</svg>';
    },
  };

  if (typeof module === 'object' && module.exports) module.exports = Heladero;
  else root.Heladero = Heladero;
})(typeof self !== 'undefined' ? self : this);
