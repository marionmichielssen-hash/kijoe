const PARTS = {
  ronding: "ronding",
  ear: "ear",
  catLeft: "kat-links",
  catRight: "kat-rechts",
  mouseLeft: "muis-links",
  mouseRight: "muis-rechts",
  backLeft: "rug-links",
  backRight: "rug-rechts",
  bagLeft: "zak-links",
  bagRight: "zak-rechts",
  empty: "empty",
};

const ASSETS = {
  [PARTS.ronding]: "assets/ronding.svg",
  [PARTS.ear]: "assets/oor.svg",
  [PARTS.catLeft]: "assets/kat-links.svg",
  [PARTS.catRight]: "assets/kat-rechts.svg",
  [PARTS.mouseLeft]: "assets/muis-links.svg",
  [PARTS.mouseRight]: "assets/muis-rechts.svg",
  [PARTS.backLeft]: "assets/rug-links.svg",
  [PARTS.backRight]: "assets/rug-rechts.svg",
  [PARTS.bagLeft]: "assets/zak-links.svg",
  [PARTS.bagRight]: "assets/zak-rechts.svg",
};

const PART_LAYOUT = {
  [PARTS.bagLeft]: { width: 14, height: 33.416, anchor: "br" },
  [PARTS.bagRight]: { width: 14, height: 33.416, anchor: "bl" },
  [PARTS.catLeft]: { width: 21.404, height: 34.287, anchor: "br" },
  [PARTS.catRight]: { width: 21.404, height: 34.287, anchor: "bl" },
  [PARTS.mouseLeft]: { width: 20.158, height: 16.25, anchor: "tr" },
  [PARTS.mouseRight]: { width: 20.158, height: 16.25, anchor: "tl" },
  [PARTS.backLeft]: { width: 14, height: 24, anchor: "br" },
  [PARTS.backRight]: { width: 14, height: 24, anchor: "bl" },
  [PARTS.ear]: { width: 17.65, height: 17.65, anchor: "bl" },
  [PARTS.ronding]: { width: 14, height: 14, anchor: "tr" },
};

const ALLOWED_CLOCKWISE = [
  [PARTS.backRight, PARTS.ronding, PARTS.ronding, PARTS.catLeft],
  [PARTS.catRight, PARTS.ronding, PARTS.ronding, PARTS.backLeft],
  [PARTS.ronding, PARTS.ronding, PARTS.mouseLeft, PARTS.ear],
  [PARTS.ear, PARTS.mouseRight, PARTS.ronding, PARTS.ronding],
  [PARTS.backRight, PARTS.ear, PARTS.ear, PARTS.bagLeft],
  [PARTS.bagRight, PARTS.ear, PARTS.ear, PARTS.backLeft],
];

const CANONICAL_MOTIFS = [
  { kind: "cat", parts: [PARTS.catLeft, PARTS.backRight, PARTS.ronding, PARTS.ronding] },
  { kind: "cat", parts: [PARTS.backLeft, PARTS.catRight, PARTS.ronding, PARTS.ronding] },
  { kind: "mouse", parts: [PARTS.ear, PARTS.ronding, PARTS.ronding, PARTS.mouseLeft] },
  { kind: "mouse", parts: [PARTS.ronding, PARTS.ear, PARTS.mouseRight, PARTS.ronding] },
  { kind: "bag", parts: [PARTS.bagLeft, PARTS.backRight, PARTS.ear, PARTS.ear] },
  { kind: "bag", parts: [PARTS.backLeft, PARTS.bagRight, PARTS.ear, PARTS.ear] },
];

const LEVELS = {
  "noedge-1-upright": { label: "Zonder randstukken: 1 figuur, rechtop", kindCount: 1, orientation: "upright", edgeImages: false, size: 3 },
  "noedge-1-all": { label: "Zonder randstukken: 1 figuur, alle richtingen", kindCount: 1, orientation: "all", edgeImages: false, size: 3 },
  "noedge-2-upright": { label: "Zonder randstukken: 2 figuren, rechtop", kindCount: 2, orientation: "upright", edgeImages: false, size: 3 },
  "noedge-2-all": { label: "Zonder randstukken: 2 figuren, alle richtingen", kindCount: 2, orientation: "all", edgeImages: false, size: 3 },
  "noedge-3-upright": { label: "Zonder randstukken: 3 figuren, rechtop", kindCount: 3, orientation: "upright", edgeImages: false, size: 3 },
  "noedge-3-all": { label: "Zonder randstukken: 3 figuren, alle richtingen", kindCount: 3, orientation: "all", edgeImages: false, size: 3 },
  "edge-1-upright": { label: "Met randstukken: 1 figuur, rechtop", kindCount: 1, orientation: "upright", edgeImages: true, size: 3 },
  "edge-1-all": { label: "Met randstukken: 1 figuur, alle richtingen", kindCount: 1, orientation: "all", edgeImages: true, size: 3 },
  "edge-2-upright": { label: "Met randstukken: 2 figuren, rechtop", kindCount: 2, orientation: "upright", edgeImages: true, size: 3 },
  "edge-2-all": { label: "Met randstukken: 2 figuren, alle richtingen", kindCount: 2, orientation: "all", edgeImages: true, size: 3 },
  "edge-3-upright": { label: "Met randstukken: 3 figuren, rechtop", kindCount: 3, orientation: "upright", edgeImages: true, size: 3 },
  "edge-3-all": { label: "Met randstukken: 3 figuren, alle richtingen", kindCount: 3, orientation: "all", edgeImages: true, size: 3 },
};

const ALL_KINDS = ["cat", "mouse", "bag"];

const els = {
  tray: document.querySelector("#tray"),
  board: document.querySelector("#board"),
  colHandles: document.querySelector("#colHandles"),
  rowHandles: document.querySelector("#rowHandles"),
  size: document.querySelector("#sizeSelect"),
  level: document.querySelector("#levelSelect"),
  freeControls: document.querySelector("#freeControls"),
  orientation: document.querySelector("#orientationSelect"),
  edge: document.querySelector("#edgeSelect"),
  newGame: document.querySelector("#newGame"),
  helpCount: document.querySelector("#helpCount"),
  moveMode: document.querySelector("#moveMode"),
  peek: document.querySelector("#peek"),
  status: document.querySelector("#status"),
  ghost: document.querySelector("#ghost"),
  celebration: document.querySelector("#celebration"),
};

let state = {
  n: 5,
  config: LEVELS["edge-3-all"],
  tiles: [],
  placed: new Map(),
  dragging: null,
  lineDrag: null,
  moveMode: false,
  showSolution: false,
  solved: false,
};

const cornerNames = ["tl", "tr", "br", "bl"];
const cornerToQuadrant = {
  tl: "se",
  tr: "sw",
  br: "nw",
  bl: "ne",
};

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return items
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function randomKinds(count, pool = ALL_KINDS) {
  return shuffle(pool).slice(0, Math.max(1, Math.min(count, pool.length)));
}

function rotateCorners(corners, turns) {
  let result = [...corners];
  for (let i = 0; i < turns; i += 1) {
    result = [result[3], result[0], result[1], result[2]];
  }
  return result;
}

function motifParts(config) {
  const choices = CANONICAL_MOTIFS.filter((motif) => config.kinds.includes(motif.kind));
  const motif = randomItem(choices).parts.map((type) => ({ type }));
  const turns = config.orientation === "all" ? Math.floor(Math.random() * 4) : 0;
  return rotateCorners(motif, turns);
}

function generateSolvedTiles(n, config) {
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const attemptConfig = normalizeAttemptConfig(config);
    const tiles = generateSolvedTilesAttempt(n, attemptConfig);
    if (tiles.every(tileHasAllowedSides)) return tiles;
  }
  throw new Error("Kon geen puzzel zonder overlappende kat- of zakzijden genereren.");
}

function normalizeAttemptConfig(config) {
  if (config.kinds?.length) return config;
  let kinds = randomKinds(config.kindCount || 3);
  if ((config.kindCount || 3) === 1 && !kinds.includes("mouse")) {
    kinds = ["mouse"];
  }
  return { ...config, kinds };
}

function generateSolvedTilesAttempt(n, config) {
  const tiles = Array.from({ length: n * n }, (_, index) => ({
    id: `tile-${index}`,
    base: Array.from({ length: 4 }, () => ({ type: PARTS.empty })),
    rotation: 0,
    solutionRotation: 0,
    solutionCell: index,
  }));

  for (let vr = 0; vr <= n; vr += 1) {
    for (let vc = 0; vc <= n; vc += 1) {
      const isBorder = vr === 0 || vr === n || vc === 0 || vc === n;
      if (isBorder && !config.edgeImages) continue;
      const motif = motifParts(config);
      const positions = [
        { r: vr - 1, c: vc - 1, corner: "br", part: motif[0] },
        { r: vr - 1, c: vc, corner: "bl", part: motif[1] },
        { r: vr, c: vc, corner: "tl", part: motif[2] },
        { r: vr, c: vc - 1, corner: "tr", part: motif[3] },
      ];

      for (const pos of positions) {
        if (pos.r < 0 || pos.r >= n || pos.c < 0 || pos.c >= n) continue;
        tiles[pos.r * n + pos.c].base[cornerNames.indexOf(pos.corner)] = pos.part;
      }
    }
  }

  return tiles.map((tile) => ({
    ...tile,
    rotation: Math.floor(Math.random() * 4),
  }));
}

function tileHasAllowedSides(tile) {
  const sides = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
  ];
  return sides.every(([a, b]) => !isForbiddenSidePair(tile.base[a], tile.base[b]));
}

function isForbiddenSidePair(a, b) {
  const first = partFamily(a);
  const second = partFamily(b);
  const bulkyParts = new Set(["cat", "back", "bag"]);
  return bulkyParts.has(first) && bulkyParts.has(second);
}

function partFamily(part) {
  if (!part?.type) return "empty";
  if (part.type === PARTS.catLeft || part.type === PARTS.catRight) return "cat";
  if (part.type === PARTS.bagLeft || part.type === PARTS.bagRight) return "bag";
  if (part.type === PARTS.backLeft || part.type === PARTS.backRight) return "back";
  return part.type;
}

function partSignature(part) {
  return part?.type || PARTS.empty;
}

function getTileAtCell(index) {
  const tileId = state.placed.get(index);
  return state.tiles.find((tile) => tile.id === tileId);
}

function getSolutionTileAtCell(index) {
  return state.tiles.find((tile) => tile.solutionCell === index);
}

function visibleCorners(tile) {
  return rotateCorners(tile.base, tile.rotation);
}

function solutionCorners(tile) {
  return rotateCorners(tile.base, tile.solutionRotation);
}

function tileSvg(tile, solution = false) {
  const corners = tile.base;
  const texture = `<filter id="paperNoise-${tile.id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="${tile.id.replace(/\D/g, "") || 1}" result="noise"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="table" tableValues="0 0.11"/></feComponentTransfer>
    <feBlend in="SourceGraphic" in2="noise" mode="multiply"/>
  </filter>`;
  return `<svg viewBox="0 0 50 50" aria-hidden="true">
    <defs>${texture}</defs>
    <rect x="0" y="0" width="50" height="50" fill="var(--paper)" filter="url(#paperNoise-${tile.id})"/>
    <rect x="0.25" y="0.25" width="49.5" height="49.5" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="0.5"/>
    ${corners.map((part, index) => drawPart(part, cornerNames[index])).join("")}
  </svg>`;
}

function drawPart(part, corner) {
  if (!part?.type || part.type === PARTS.empty) return "";
  const href = ASSETS[part.type];
  const layout = PART_LAYOUT[part.type];
  if (!href || !layout) return "";
  const target = cornerPoint(corner, 50, 50);
  const anchor = cornerPoint(layout.anchor, layout.width, layout.height);
  const angle = rotationBetweenAnchors(layout.anchor, corner);
  return `<g transform="translate(${target.x} ${target.y}) rotate(${angle}) translate(${-anchor.x} ${-anchor.y})">
    <image href="${href}" x="0" y="0" width="${layout.width}" height="${layout.height}" preserveAspectRatio="none"/>
  </g>`;
}

function cornerPoint(corner, width, height) {
  return {
    tl: { x: 0, y: 0 },
    tr: { x: width, y: 0 },
    br: { x: width, y: height },
    bl: { x: 0, y: height },
  }[corner];
}

function cornerInterior(corner) {
  return {
    tl: { x: 1, y: 1 },
    tr: { x: -1, y: 1 },
    br: { x: -1, y: -1 },
    bl: { x: 1, y: -1 },
  }[corner];
}

function rotateVector(vector, angle) {
  const turns = ((angle / 90) % 4 + 4) % 4;
  return [
    vector,
    { x: -vector.y, y: vector.x },
    { x: -vector.x, y: -vector.y },
    { x: vector.y, y: -vector.x },
  ][turns];
}

function rotationBetweenAnchors(source, target) {
  const from = cornerInterior(source);
  const to = cornerInterior(target);
  for (const angle of [0, 90, 180, 270]) {
    const rotated = rotateVector(from, angle);
    if (rotated.x === to.x && rotated.y === to.y) return angle;
  }
  return 0;
}

function renderTile(tile, mode = "tray") {
  const el = document.createElement("div");
  el.className = `tile${state.showSolution && mode === "cell" ? " solution" : ""}`;
  el.dataset.tileId = tile.id;
  el.style.setProperty("--rot", state.showSolution && mode === "cell" ? tile.solutionRotation : tile.rotation);
  el.innerHTML = tileSvg(tile, state.showSolution && mode === "cell");
  el.addEventListener("pointerdown", onTilePointerDown);
  return el;
}

function render() {
  state.solved = isSolved();
  document.body.classList.toggle("is-solved", state.solved && !state.showSolution);
  document.body.classList.toggle("is-move-mode", state.moveMode);
  const n = state.n;
  const boardTile = Math.max(44, Math.min(108, Math.floor((Math.min(window.innerWidth - 32, window.innerHeight - 230)) / n) - 7));
  const trayTile = Math.max(72, Math.min(96, Math.floor(window.innerWidth / 7)));
  document.documentElement.style.setProperty("--board-tile", `${boardTile}px`);
  document.documentElement.style.setProperty("--tile-size", `${trayTile}px`);
  els.board.style.setProperty("--n", n);
  renderLineHandles();

  els.tray.replaceChildren();
  state.tiles
    .filter((tile) => ![...state.placed.values()].includes(tile.id))
    .forEach((tile) => els.tray.appendChild(renderTile(tile, "tray")));

  els.board.replaceChildren();
  for (let i = 0; i < n * n; i += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.cell = i;
    const tile = state.showSolution ? getSolutionTileAtCell(i) : getTileAtCell(i);
    if (tile) cell.appendChild(renderTile(tile, "cell"));
    els.board.appendChild(cell);
  }
  markBoard();
  updateStatus();
  renderCelebration();
}

function renderLineHandles() {
  els.colHandles.style.setProperty("--n", state.n);
  els.rowHandles.style.setProperty("--n", state.n);
  els.colHandles.replaceChildren();
  els.rowHandles.replaceChildren();

  for (let col = 0; col < state.n; col += 1) {
    const handle = document.createElement("button");
    handle.className = "lineHandle colHandle";
    handle.type = "button";
    handle.textContent = "⋮⋮";
    handle.ariaLabel = `Kolom ${col + 1} verplaatsen`;
    handle.dataset.kind = "col";
    handle.dataset.index = col;
    handle.addEventListener("pointerdown", onLineHandlePointerDown);
    els.colHandles.appendChild(handle);
  }

  for (let row = 0; row < state.n; row += 1) {
    const handle = document.createElement("button");
    handle.className = "lineHandle rowHandle";
    handle.type = "button";
    handle.textContent = "⋯";
    handle.ariaLabel = `Rij ${row + 1} verplaatsen`;
    handle.dataset.kind = "row";
    handle.dataset.index = row;
    handle.addEventListener("pointerdown", onLineHandlePointerDown);
    els.rowHandles.appendChild(handle);
  }
}

function updateStatus() {
  if (state.showSolution) {
    els.status.textContent = "Oplossing getoond. Zet de knop weer uit om verder te puzzelen.";
    return;
  }
  if (state.moveMode) {
    els.status.textContent = "Verplaatsmodus: sleep een tab bovenaan of links om een kolom of rij te verplaatsen.";
    return;
  }
  const placed = state.placed.size;
  const total = state.n * state.n;
  const invalid = countInvalidVertices();
  if (state.solved) {
    els.status.textContent = "Helemaal juist. Alle figuren zijn volledig en correct aangesloten.";
  } else if (invalid > 0) {
    els.status.textContent = `${placed}/${total} kaartjes geplaatst. Er klopt nog iets niet rond ${invalid} kruising${invalid === 1 ? "" : "en"}.`;
  } else {
    els.status.textContent = `${state.config.label}: ${placed}/${total} kaartjes geplaatst. Tik bovenaan om te draaien; sleep of swipe omhoog om terug te nemen.`;
  }
}

function isSolved() {
  return state.placed.size === state.n * state.n && countInvalidVertices() === 0;
}

function renderCelebration() {
  const active = state.solved && !state.showSolution;
  if (!active) {
    els.celebration.replaceChildren();
    return;
  }
  if (els.celebration.children.length) return;
  for (let i = 0; i < 72; i += 1) {
    const star = document.createElement("span");
    star.className = "star";
    star.textContent = i % 5 === 0 ? "✦" : "✶";
    star.style.setProperty("--x", `${Math.random() * 100}vw`);
    star.style.setProperty("--delay", `${Math.random() * 1.4}s`);
    star.style.setProperty("--dur", `${2.5 + Math.random() * 2.3}s`);
    star.style.setProperty("--size", `${14 + Math.random() * 18}px`);
    star.style.setProperty("--spin", `${Math.random() > 0.5 ? 1 : -1}`);
    els.celebration.appendChild(star);
  }
}

function vertexParts(vr, vc, useSolution = false) {
  const positions = [
    { r: vr - 1, c: vc - 1, corner: "br" },
    { r: vr - 1, c: vc, corner: "bl" },
    { r: vr, c: vc, corner: "tl" },
    { r: vr, c: vc - 1, corner: "tr" },
  ];
  return positions.map((pos) => {
    if (pos.r < 0 || pos.r >= state.n || pos.c < 0 || pos.c >= state.n) return { type: PARTS.empty };
    const tile = useSolution ? state.tiles[pos.r * state.n + pos.c] : getTileAtCell(pos.r * state.n + pos.c);
    if (!tile) return { type: PARTS.empty };
    const corners = useSolution ? solutionCorners(tile) : visibleCorners(tile);
    return corners[cornerNames.indexOf(pos.corner)];
  });
}

function isCompleteSet(parts) {
  const sequence = parts.map(partSignature);
  if (sequence.every((name) => name === PARTS.empty)) return true;
  const complete = sequence.every((name) => name !== PARTS.empty);
  const possible = ALLOWED_CLOCKWISE.some((set) => {
    for (let turns = 0; turns < 4; turns += 1) {
      const rotated = rotateCorners(set, turns);
      const matches = sequence.every((name, index) => name === PARTS.empty || name === rotated[index]);
      if (matches) return true;
    }
    return false;
  });
  if (!possible) return false;
  return complete ? true : null;
}

function countInvalidVertices() {
  let invalid = 0;
  for (let vr = 0; vr <= state.n; vr += 1) {
    for (let vc = 0; vc <= state.n; vc += 1) {
      const ok = isCompleteSet(vertexParts(vr, vc));
      if (ok === false) invalid += 1;
    }
  }
  return invalid;
}

function markBoard() {
  const cells = [...els.board.children];
  cells.forEach((cell) => cell.classList.remove("ok", "bad"));
  if (state.showSolution) {
    cells.forEach((cell) => cell.classList.add("ok"));
    return;
  }
  for (let vr = 0; vr <= state.n; vr += 1) {
    for (let vc = 0; vc <= state.n; vc += 1) {
      const ok = isCompleteSet(vertexParts(vr, vc));
      if (ok === null) continue;
      const around = vertexCellIndexes(vr, vc);
      around.forEach((index) => {
        if (!getTileAtCell(index)) return;
        cells[index]?.classList.add(ok ? "ok" : "bad");
      });
    }
  }
}

function vertexCellIndexes(vr, vc) {
  return [
    { r: vr - 1, c: vc - 1 },
    { r: vr - 1, c: vc },
    { r: vr, c: vc },
    { r: vr, c: vc - 1 },
  ]
    .filter((pos) => pos.r >= 0 && pos.r < state.n && pos.c >= 0 && pos.c < state.n)
    .map((pos) => pos.r * state.n + pos.c);
}

function onTilePointerDown(event) {
  const tileEl = event.currentTarget;
  const tile = state.tiles.find((item) => item.id === tileEl.dataset.tileId);
  const sourceCell = tileEl.closest(".cell")?.dataset.cell;
  const pointerId = event.pointerId;
  const start = { x: event.clientX, y: event.clientY };
  let moved = false;

  tileEl.setPointerCapture(pointerId);
  state.dragging = { tile, sourceCell: sourceCell === undefined ? null : Number(sourceCell) };

  const move = (moveEvent) => {
    const dx = moveEvent.clientX - start.x;
    const dy = moveEvent.clientY - start.y;
    if (!moved && Math.hypot(dx, dy) > 8) {
      moved = true;
      els.ghost.hidden = false;
      els.ghost.innerHTML = "";
      els.ghost.appendChild(renderTile(tile, "ghost"));
      tileEl.style.opacity = "0.35";
    }
    if (moved) {
      els.ghost.style.left = `${moveEvent.clientX}px`;
      els.ghost.style.top = `${moveEvent.clientY}px`;
    }
  };

  const up = (upEvent) => {
    tileEl.releasePointerCapture(pointerId);
    tileEl.removeEventListener("pointermove", move);
    tileEl.removeEventListener("pointerup", up);
    tileEl.style.opacity = "";
    els.ghost.hidden = true;
    els.ghost.innerHTML = "";

    if (!moved) {
      tile.rotation = (tile.rotation + 1) % 4;
      render();
      return;
    }

    const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY)?.closest(".cell");
    const returnedToTray = document.elementFromPoint(upEvent.clientX, upEvent.clientY)?.closest(".tray");
    if (target) {
      placeTile(tile.id, Number(target.dataset.cell), state.dragging.sourceCell);
    } else if (shouldReturnToTray(upEvent, start, returnedToTray)) {
      returnTileToTray(state.dragging.sourceCell);
    }
    render();
  };

  tileEl.addEventListener("pointermove", move);
  tileEl.addEventListener("pointerup", up);
}

function onLineHandlePointerDown(event) {
  const handle = event.currentTarget;
  const pointerId = event.pointerId;
  const kind = handle.dataset.kind;
  const from = Number(handle.dataset.index);
  let moved = false;

  handle.setPointerCapture(pointerId);
  state.lineDrag = { kind, from };
  handle.classList.add("dragging");

  const move = () => {
    moved = true;
  };

  const up = (upEvent) => {
    handle.releasePointerCapture(pointerId);
    handle.removeEventListener("pointermove", move);
    handle.removeEventListener("pointerup", up);
    handle.classList.remove("dragging");

    const target = document
      .elementFromPoint(upEvent.clientX, upEvent.clientY)
      ?.closest(`.lineHandle[data-kind="${kind}"]`);
    const to = target ? Number(target.dataset.index) : from;

    if (moved && Number.isInteger(to) && to !== from) {
      moveLine(kind, from, to);
      render();
    }
    state.lineDrag = null;
  };

  handle.addEventListener("pointermove", move);
  handle.addEventListener("pointerup", up);
}

function moveLine(kind, from, to) {
  const next = new Map();
  for (const [cellIndex, tileId] of state.placed.entries()) {
    const row = Math.floor(cellIndex / state.n);
    const col = cellIndex % state.n;
    const nextRow = kind === "row" ? movedIndex(row, from, to) : row;
    const nextCol = kind === "col" ? movedIndex(col, from, to) : col;
    next.set(nextRow * state.n + nextCol, tileId);
  }
  state.placed = next;
}

function movedIndex(index, from, to) {
  if (index === from) return to;
  if (from < to && index > from && index <= to) return index - 1;
  if (from > to && index >= to && index < from) return index + 1;
  return index;
}

function placeTile(tileId, cellIndex, sourceCell) {
  const existing = state.placed.get(cellIndex);
  if (sourceCell !== null) state.placed.delete(sourceCell);
  state.placed.set(cellIndex, tileId);
  if (existing) {
    if (sourceCell !== null) state.placed.set(sourceCell, existing);
    else state.placed.delete(cellIndex);
  }
}

function shouldReturnToTray(event, start, trayTarget) {
  if (state.dragging.sourceCell === null) return false;
  const dy = event.clientY - start.y;
  return Boolean(trayTarget) || dy < -36;
}

function returnTileToTray(sourceCell) {
  if (sourceCell === null) return;
  state.placed.delete(sourceCell);
}

function currentConfig() {
  if (els.level.value !== "free") return LEVELS[els.level.value];
  const kinds = [...document.querySelectorAll('input[name="kind"]:checked')].map((input) => input.value);
  return {
    label: "Vrij spel",
    kinds: kinds.length ? kinds : ["cat"],
    orientation: els.orientation.value,
    edgeImages: els.edge.value === "filled",
  };
}

function syncLevelControls(applyRecommendedSize = false) {
  const isFree = els.level.value === "free";
  els.freeControls.hidden = !isFree;
  if (applyRecommendedSize) {
    els.size.value = isFree ? "3" : String(LEVELS[els.level.value].size);
  }
}

function startGame() {
  syncLevelControls();
  state.config = currentConfig();
  state.n = Number(els.size.value);
  state.tiles = shuffle(generateSolvedTiles(state.n, state.config));
  state.tiles.forEach((tile, order) => {
    tile.id = `tile-${order}`;
  });
  state.placed = new Map();
  state.showSolution = false;
  state.solved = false;
  els.peek.setAttribute("aria-pressed", "false");
  els.helpCount.value = "0";
  render();
}

function applyHelp() {
  const count = Math.min(Number(els.helpCount.value), state.tiles.length);
  if (count === 0) {
    state.placed = new Map();
    state.showSolution = false;
    state.moveMode = false;
    state.solved = false;
    els.peek.setAttribute("aria-pressed", "false");
    els.moveMode.setAttribute("aria-pressed", "false");
    render();
    return;
  }

  state.placed = new Map();
  state.showSolution = false;
  state.moveMode = false;
  state.solved = false;
  els.peek.setAttribute("aria-pressed", "false");
  els.moveMode.setAttribute("aria-pressed", "false");

  state.tiles.forEach((tile) => {
    tile.rotation = Math.floor(Math.random() * 4);
  });

  shuffle([...state.tiles]).slice(0, count).forEach((tile) => {
    tile.rotation = tile.solutionRotation;
    state.placed.set(tile.solutionCell, tile.id);
  });

  render();
}

els.newGame.addEventListener("click", startGame);
els.helpCount.addEventListener("change", applyHelp);
els.size.addEventListener("change", startGame);
els.level.addEventListener("change", () => {
  syncLevelControls(true);
  startGame();
});
els.orientation.addEventListener("change", startGame);
els.edge.addEventListener("change", startGame);
document.querySelectorAll('input[name="kind"]').forEach((input) => {
  input.addEventListener("change", () => {
    if (!document.querySelectorAll('input[name="kind"]:checked').length) input.checked = true;
    startGame();
  });
});
els.peek.addEventListener("click", () => {
  state.showSolution = !state.showSolution;
  els.peek.setAttribute("aria-pressed", String(state.showSolution));
  render();
});
els.moveMode.addEventListener("click", () => {
  state.moveMode = !state.moveMode;
  els.moveMode.setAttribute("aria-pressed", String(state.moveMode));
  render();
});
window.addEventListener("resize", render);

syncLevelControls(true);
startGame();
