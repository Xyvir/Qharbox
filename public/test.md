# Qharbox Test Suite

This file serves as a test suite for Qharbox interpreters. It includes a variety of SVG primitives and anchoring scenarios.

```qx-text
Rectangle anchored here:
--- X ---

Circle anchored here:
--- X ---

Ellipse anchored here:
--- X ---

Polygon anchored here:
--- X ---

Polyline anchored here:
--- X ---

Reusable arrow 1 anchored here:
--- X ---

Reusable arrow 2 anchored here:
--- X ---
```

```qx-markups
<svg xmlns="http://www.w3.org/2000/svg">
  <defs>
    <g id="reusable-arrow">
      <line x1="0" y1="0" x2="30" y2="0" stroke="currentColor" stroke-width="2"/>
      <path d="M 30 0 L 25 -5 L 25 5 Z" fill="currentColor"/>
    </g>
  </defs>
  
  <!-- Rectangle -->
  <g anchor-line="2" anchor-char="5">
    <rect x="0" y="0" width="120" height="20" fill="rgba(255, 165, 0, 0.3)" stroke="orange" stroke-width="1.5" />
  </g>
  
  <!-- Circle -->
  <g anchor-line="4" anchor-char="5">
      <circle cx="0" cy="0" r="15" fill="rgba(0, 255, 0, 0.3)" stroke="green" stroke-width="1.5" />
  </g>

  <!-- Ellipse -->
  <g anchor-line="6" anchor-char="5">
      <ellipse cx="0" cy="0" rx="20" ry="10" fill="rgba(0, 0, 255, 0.3)" stroke="blue" stroke-width="1.5" />
  </g>

  <!-- Polygon -->
  <g anchor-line="8" anchor-char="5">
      <polygon points="0,0 20,10 10,20" fill="rgba(255, 0, 255, 0.3)" stroke="magenta" stroke-width="1.5" />
  </g>

  <!-- Polyline -->
  <g anchor-line="10" anchor-char="5">
      <polyline points="0,0 10,10 20,0 30,10" fill="none" stroke="cyan" stroke-width="1.5" />
  </g>

  <!-- Reusable arrows (use, defs, path, line) -->
  <g anchor-line="12" anchor-char="5">
    <use href="#reusable-arrow" fill="dodgerblue" transform="rotate(-45)" />
  </g>
  <g anchor-line="14" anchor-char="5">
    <use href="#reusable-arrow" fill="crimson" />
  </g>

</svg>
```