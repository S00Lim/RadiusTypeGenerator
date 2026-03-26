let font;
let centers = [];
let canvas;

// =========================
// CANVAS / LAYOUT
// =========================
const DESIGN_W = 1920;
const DESIGN_H = 1080;

let uiScale = 1;
let offsetX = 0;
let offsetY = 0;

// =========================
// TEXT / TYPE
// =========================
let textContent = "A";
let textSizeVal = 800;
let trackingVal = 40;
let leadingVal = 80;

// generated form params
let radiusMin = 12;
let radiusMax = 90;
let step = 18;
let spacing = 70;
let strokeW = 1.5;
let rippleAlpha = 255;

// =========================
// CORE AXES
// =========================
let body = 53;
let acidity = 27;
let tannin = 55;

// derived
let dryness = 0;
let alcohol = 0;
let drynessInitialized = false;

// =========================
// STYLE
// =========================
let bgMode = "Brand"; // White / Black / Brand / Custom
let bgCustomColor = "#ffffff";

let typeColorMode = "Neon"; // White / Black / Neon / Custom
let typeCustomColor = "#ffffff";

let autoMotionOn = false;
let blendModeName = "Screen"; // Normal / Screen

// actual draw mode
let drawMode = "Stroke";

// =========================
// MOTION
// =========================
let breatheOn = false;
let breatheAmp = 0.08;
let breatheSpeed = 1.2;

let trailOn = false;
let trailAlpha = 18;

let fizzOn = false;
let fizzAmp = 1.4;
let fizzSpeed = 1.4;
let fizzThreshold = 0.72;

let waveOn = false;
let waveAmp = 0.12;
let waveScale = 0.02;
let waveSpeed = 1.6;

let driftOn = false;
let driftAmp = 6.0;
let driftSpeed = 0.95;

let wobbleOn = false;
let wobbleAmp = 6.0;
let wobbleSpeed = 1.05;

// =========================
// UI / DOM
// =========================
let textInput;
let typeColorPicker;
let bgColorPicker;

let draggingSliderKey = null;

// =========================
// MOBILE DETECTION
// =========================
function isMobileLayout() {
  const ua = navigator.userAgent || "";
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
}

// =========================
// PRELOAD
// =========================
function preload() {
  font = loadFont("Montserrat-VariableFont_wght.ttf");
}

// =========================
// SETUP
// =========================
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.style("display", "block");

  textInput = createInput(textContent);
  textInput.attribute("maxlength", "1");
  textInput.input(() => {
    let v = textInput.value().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!v.length) v = "A";
    textContent = v[0];
    textInput.value(textContent);
    buildAllText();
  });

  typeColorPicker = createColorPicker(typeCustomColor);
  typeColorPicker.input(() => {
    typeColorMode = "Custom";
    typeCustomColor = typeColorPicker.value();
  });
  typeColorPicker.elt.addEventListener("click", () => {
    typeColorMode = "Custom";
  });

  bgColorPicker = createColorPicker(bgCustomColor);
  bgColorPicker.input(() => {
    bgMode = "Custom";
    bgCustomColor = bgColorPicker.value();
  });
  bgColorPicker.elt.addEventListener("click", () => {
    bgMode = "Custom";
  });

  updateLayoutMetrics();
  applyAxesToParams();
  buildAllText();
}

// =========================
// DRAW
// =========================
function draw() {
  updateLayoutMetrics();

  const bgHex = getCurrentBgColor();
  const bgCol = color(bgHex);

  if (autoMotionOn && trailOn) {
    noStroke();
    fill(red(bgCol), green(bgCol), blue(bgCol), trailAlpha);
    rect(0, 0, width, height);
  } else {
    background(bgCol);
  }

  renderGeneratedType(bgCol);

  blendMode(BLEND);
  clearUIRegions(bgCol);
  drawUI();
  positionDOM();
}

// =========================
// LAYOUT HELPERS
// =========================
function updateLayoutMetrics() {
  uiScale = min(width / DESIGN_W, height / DESIGN_H);
  offsetX = (width - DESIGN_W * uiScale) * 0.5;
  offsetY = (height - DESIGN_H * uiScale) * 0.5;
}

function sx(x) {
  return offsetX + x * uiScale;
}

function sy(y) {
  return offsetY + y * uiScale;
}

function ss(v) {
  return v * uiScale;
}

// =========================
// MOBILE UI DATA
// =========================
function getMobileStackStartY() {
  return 150;
}

function getMobileTextPanelStartY() {
  return 430;
}

function getMobileTopSliders() {
  const x = 40;
  const w = 260;
  const h = 12;
  const labelGap = 18;
  const rowGap = 72;

  return [
    {
      key: "body",
      label: "BODY",
      value: body,
      min: 0,
      max: 100,
      x,
      y: getMobileStackStartY() + 20,
      w,
      h,
      titleX: x,
      titleY: getMobileStackStartY(),
      leftLabel: "Light",
      rightLabel: "Bold",
      leftX: x,
      rightX: x + w + 16,
      subY: getMobileStackStartY() + labelGap,
      disabled: false
    },
    {
      key: "acidity",
      label: "ACIDITY",
      value: acidity,
      min: 0,
      max: 100,
      x,
      y: getMobileStackStartY() + rowGap + 20,
      w,
      h,
      titleX: x,
      titleY: getMobileStackStartY() + rowGap,
      leftLabel: "Soft",
      rightLabel: "Crisp",
      leftX: x,
      rightX: x + w + 16,
      subY: getMobileStackStartY() + rowGap + labelGap,
      disabled: false
    },
    {
      key: "tannin",
      label: "TANNIN",
      value: tannin,
      min: 0,
      max: 100,
      x,
      y: getMobileStackStartY() + rowGap * 2 + 20,
      w,
      h,
      titleX: x,
      titleY: getMobileStackStartY() + rowGap * 2,
      leftLabel: "Smooth",
      rightLabel: "Gritty",
      leftX: x,
      rightX: x + w + 16,
      subY: getMobileStackStartY() + rowGap * 2 + labelGap,
      disabled: false
    },
    {
      key: "dryness",
      label: "DRYNESS",
      value: dryness,
      min: 0,
      max: 100,
      x,
      y: getMobileStackStartY() + rowGap * 3 + 20,
      w,
      h,
      titleX: x,
      titleY: getMobileStackStartY() + rowGap * 3,
      leftLabel: "Juicy",
      rightLabel: "Tight",
      leftX: x,
      rightX: x + w + 16,
      subY: getMobileStackStartY() + rowGap * 3 + labelGap,
      disabled: true
    }
  ];
}

function getDesktopTopSliders() {
  return [
    {
      key: "body",
      label: "BODY",
      value: body,
      min: 0,
      max: 100,
      x: 81.7117,
      y: 56.303,
      w: 143.4212,
      h: 12.7641,
      titleX: 32.9917,
      titleY: 46.4554,
      leftLabel: "Light",
      rightLabel: "Bold",
      leftX: 32.9917,
      rightX: 234.9685,
      subY: 67.788,
      disabled: false
    },
    {
      key: "acidity",
      label: "ACIDITY",
      value: acidity,
      min: 0,
      max: 100,
      x: 370.9175,
      y: 56.303,
      w: 143.4212,
      h: 12.7641,
      titleX: 329.5955,
      titleY: 46.4554,
      leftLabel: "Soft",
      rightLabel: "Crisp",
      leftX: 329.5955,
      rightX: 523.1283,
      subY: 67.788,
      disabled: false
    },
    {
      key: "tannin",
      label: "TANNIN",
      value: tannin,
      min: 0,
      max: 100,
      x: 690.3051,
      y: 56.303,
      w: 143.4212,
      h: 12.7641,
      titleX: 621.317,
      titleY: 46.4554,
      leftLabel: "Smooth",
      rightLabel: "Gritty",
      leftX: 621.317,
      rightX: 842.1219,
      subY: 67.788,
      disabled: false
    },
    {
      key: "dryness",
      label: "DRYNESS",
      value: dryness,
      min: 0,
      max: 100,
      x: 997.1866,
      y: 56.303,
      w: 143.4212,
      h: 12.7641,
      titleX: 946.7922,
      titleY: 46.4554,
      leftLabel: "Juicy",
      rightLabel: "Tight",
      leftX: 948.2322,
      rightX: 1149.0034,
      subY: 67.788,
      disabled: true
    }
  ];
}

function getTopSliders() {
  return isMobileLayout() ? getMobileTopSliders() : getDesktopTopSliders();
}

function getDesktopColorItems(group) {
  return group === "type"
    ? [
        { x: 42.52, y: 670.7034, mode: "White" },
        { x: 64.398, y: 670.7034, mode: "Black" },
        { x: 86.276, y: 670.7034, mode: "Neon" },
        { x: 108.1539, y: 670.7034, mode: "Custom" }
      ]
    : [
        { x: 42.52, y: 730.5593, mode: "White" },
        { x: 64.398, y: 730.5593, mode: "Black" },
        { x: 86.276, y: 730.5593, mode: "Brand" },
        { x: 108.1539, y: 730.5593, mode: "Custom" }
      ];
}

function getMobileColorItems(group) {
  const y = group === "type" ? getMobileTextPanelStartY() + 142 : getMobileTextPanelStartY() + 202;
  return group === "type"
    ? [
        { x: 40, y, mode: "White" },
        { x: 68, y, mode: "Black" },
        { x: 96, y, mode: "Neon" },
        { x: 124, y, mode: "Custom" }
      ]
    : [
        { x: 40, y, mode: "White" },
        { x: 68, y, mode: "Black" },
        { x: 96, y, mode: "Brand" },
        { x: 124, y, mode: "Custom" }
      ];
}

function getColorItems(group) {
  return isMobileLayout() ? getMobileColorItems(group) : getDesktopColorItems(group);
}

// =========================
// COLOR HELPERS
// =========================
function getCurrentBgColor() {
  if (bgMode === "White") return "#ffffff";
  if (bgMode === "Black") return "#000000";
  if (bgMode === "Brand") return "#8b1512";
  return bgCustomColor;
}

function bgIsLight() {
  const c = color(getCurrentBgColor());
  const lum = (0.2126 * red(c) + 0.7152 * green(c) + 0.0722 * blue(c)) / 255;
  return lum > 0.8;
}

function getUITextColor() {
  return bgIsLight() ? color(20) : color(255);
}

function getSubTextColor() {
  return bgIsLight() ? color(70) : color(255);
}

function getBarBgColor() {
  return bgIsLight() ? color(224) : color(224);
}

function getBorderGray() {
  return bgIsLight() ? color(180) : color(201);
}

function getDisabledKnobColor() {
  return bgIsLight() ? color(110) : color(153);
}

function getOutlineColor() {
  return bgIsLight() ? color(20) : color(255);
}

function getPointerColor() {
  return color(0);
}

function getRadioFillColor() {
  return bgIsLight() ? color(0) : color(255);
}

function getTypeBaseColor() {
  if (typeColorMode === "White") return [255, 255, 255];
  if (typeColorMode === "Black") return [0, 0, 0];
  if (typeColorMode === "Custom") {
    const c = color(typeCustomColor);
    return [red(c), green(c), blue(c)];
  }
  return null;
}

// =========================
// UI REGION CLEAR
// =========================
function clearUIRegions(bgCol) {
  noStroke();
  fill(bgCol);

  if (isMobileLayout()) {
    rect(0, 0, sx(380), height);
    rect(0, height - ss(80), width, ss(80));
  } else {
    rect(0, 0, width, sy(96));
    rect(0, sy(500), sx(270), height - sy(500));
    rect(sx(600), sy(1006), ss(760), ss(52));
  }
}

// =========================
// DRAW UI
// =========================
function drawUI() {
  const uiText = getUITextColor();
  const subText = getSubTextColor();
  const barBg = getBarBgColor();
  const outline = getOutlineColor();

  drawTopAxisUI(uiText, subText, barBg);
  drawLeftPanel(uiText, subText, outline);
  drawSummary(uiText);
}

function drawTopAxisUI(uiText, subText, barBg) {
  const sliders = getTopSliders();

  textFont("Apple SD Gothic Neo");
  textAlign(LEFT, BASELINE);

  for (const s of sliders) {
    let titleText = s.label + ": ";
    if (s.key === "dryness") {
      titleText += drynessInitialized ? `${round(dryness)}` : "AUTO";
    } else {
      titleText += `${round(s.value)}`;
    }

    noStroke();
    fill(uiText);
    textStyle(BOLD);
    textSize(ss(16));
    text(titleText, sx(s.titleX), sy(s.titleY));

    fill(subText);
    textStyle(NORMAL);
    textSize(ss(16));
    text(s.leftLabel, sx(s.leftX), sy(s.subY));
    text(s.rightLabel, sx(s.rightX), sy(s.subY));

    noStroke();
    fill(barBg);
    rect(sx(s.x), sy(s.y), ss(s.w), ss(s.h), ss(6.3821));

    const knobR = ss(6.0002);
    const knobInset = 6.0002;
    const knobX = sx(s.x + map(s.value, s.min, s.max, knobInset, s.w - knobInset));
    const knobY = sy(s.y + s.h * 0.5);

    if (s.disabled) {
      fill(getDisabledKnobColor());
    } else {
      fill(getPointerColor());
    }
    circle(knobX, knobY, knobR * 2);
  }
}

function drawLeftPanel(uiText, subText, outline) {
  textFont("Apple SD Gothic Neo");

  if (isMobileLayout()) {
    const startY = getMobileTextPanelStartY();

    noStroke();
    fill(uiText);
    textAlign(LEFT, BASELINE);
    textStyle(BOLD);
    textSize(ss(16));
    text("TEXT", sx(40), sy(startY));

    stroke(outline);
    strokeWeight(ss(1.0537));
    line(sx(40), sy(startY + 26), sx(300), sy(startY + 26));

    noStroke();
    fill(uiText);
    textStyle(BOLD);
    textSize(ss(16));
    text("SIZE", sx(40), sy(startY + 70));

    fill(getBarBgColor());
    rect(sx(40), sy(startY + 82), ss(260), ss(12.7641), ss(6.3821));

    fill(getPointerColor());
    const sizeKnobInset = 6.0002;
    const sizeKnobX = sx(40 + map(textSizeVal, 60, 1200, sizeKnobInset, 260 - sizeKnobInset));
    circle(sizeKnobX, sy(startY + 88.382), ss(12.0004));

    noStroke();
    fill(uiText);
    textStyle(BOLD);
    textSize(ss(16));
    text("TYPE COLOR", sx(40), sy(startY + 130));
    drawColorOptions("type");

    noStroke();
    fill(uiText);
    textStyle(BOLD);
    textSize(ss(16));
    text("BACKGROUND", sx(40), sy(startY + 190));
    drawColorOptions("bg");

    noStroke();
    fill(uiText);
    textStyle(BOLD);
    textSize(ss(16));
    text("AUTO MOTION", sx(40), sy(startY + 250));
    drawRadio(42, startY + 266, autoMotionOn, "On", 60, startY + 271, uiText, subText);
    drawRadio(42, startY + 292, !autoMotionOn, "Off", 60, startY + 297, uiText, subText);

    noStroke();
    fill(uiText);
    textStyle(BOLD);
    textSize(ss(16));
    text("BLEND MODE", sx(40), sy(startY + 338));
    drawRadio(42, startY + 354, blendModeName === "Normal", "Normal", 60, startY + 359, uiText, subText);
    drawRadio(42, startY + 380, blendModeName === "Screen", "Screen", 60, startY + 385, uiText, subText);

    drawButton(40, startY + 430, 120, 34, "SAVE", uiText, false);
    drawButton(40, startY + 474, 120, 34, "ORDER", uiText, false);

    return;
  }

  noStroke();
  fill(uiText);
  textAlign(LEFT, BASELINE);
  textStyle(BOLD);
  textSize(ss(16));
  text("TEXT", sx(32.9916), sy(530.1594));

  stroke(outline);
  strokeWeight(ss(1.0537));
  line(sx(35.6415), sy(556.0397), sx(178.1843), sy(556.0397));

  noStroke();
  fill(uiText);
  textStyle(BOLD);
  textSize(ss(16));
  text("SIZE", sx(35.7025), sy(594.3201));

  fill(getBarBgColor());
  rect(sx(35.6415), sy(603.88), ss(143.4212), ss(12.7641), ss(6.3821));

  fill(getPointerColor());
  const sizeKnobInset = 6.0002;
  const sizeKnobX = sx(35.6415 + map(textSizeVal, 60, 1200, sizeKnobInset, 143.4212 - sizeKnobInset));
  circle(sizeKnobX, sy(610.2621), ss(12.0004));

  noStroke();
  fill(uiText);
  textStyle(BOLD);
  textSize(ss(16));
  text("TYPE COLOR", sx(35.7025), sy(654.9246));
  drawColorOptions("type");

  noStroke();
  fill(uiText);
  textStyle(BOLD);
  textSize(ss(16));
  text("BACKGROUND", sx(35.7025), sy(714.7829));
  drawColorOptions("bg");

  noStroke();
  fill(uiText);
  textStyle(BOLD);
  textSize(ss(16));
  text("AUTO MOTION", sx(35.7025), sy(774.5493));
  drawRadio(42.52, 790.1155, autoMotionOn, "On", 57.7498, 795.776, uiText, subText);
  drawRadio(42.52, 814.1689, !autoMotionOn, "Off", 57.7498, 819.8294, uiText, subText);

  noStroke();
  fill(uiText);
  textStyle(BOLD);
  textSize(ss(16));
  text("BLEND MODE", sx(35.7025), sy(858.1137));
  drawRadio(42.52, 874.8965, blendModeName === "Normal", "Normal", 57.7498, 880.5569, uiText, subText);
  drawRadio(42.52, 898.3548, blendModeName === "Screen", "Screen", 57.7498, 904.0153, uiText, subText);

  drawButton(35.702, 972.2339, 95.0218, 30.5844, "SAVE", uiText, false);
  drawButton(35.702, 1013.7338, 95.0218, 30.5844, "ORDER", uiText, false);
}

function drawColorOptions(group) {
  const uiText = getUITextColor();
  const border = getBorderGray();
  const items = getColorItems(group);

  for (const item of items) {
    const cx = sx(item.x);
    const cy = sy(item.y);
    const r = ss(6.0002);

    if (item.mode === "White") {
      stroke(border);
      strokeWeight(ss(1));
      fill(255);
      circle(cx, cy, r * 2);
    } else if (item.mode === "Black") {
      noStroke();
      fill(0);
      circle(cx, cy, r * 2);
    } else if (item.mode === "Neon") {
      noStroke();
      drawNeonSwatch(cx, cy, r);
    } else if (item.mode === "Brand") {
      stroke(border);
      strokeWeight(ss(1));
      fill("#8b1512");
      circle(cx, cy, r * 2);
    } else if (item.mode === "Custom") {
      noStroke();
      drawRainbowSwatch(cx, cy, r);
    }

    const selected = group === "type"
      ? typeColorMode === item.mode
      : bgMode === item.mode;

    if (selected) {
      noFill();
      stroke(uiText);
      strokeWeight(ss(1.2));
      circle(cx, cy, r * 2 + ss(4));
    }
  }
}

function drawNeonSwatch(cx, cy, r) {
  noStroke();
  for (let i = 0; i < 24; i++) {
    const a0 = map(i, 0, 24, 0, TWO_PI);
    const a1 = map(i + 1, 0, 24, 0, TWO_PI);
    const tt = i / 23;
    const c = lerpColor(color("#50ffc8"), color("#f239b6"), tt);
    fill(c);
    arc(cx, cy, r * 2, r * 2, a0, a1, PIE);
  }
}

function drawRainbowSwatch(cx, cy, r) {
  noStroke();
  colorMode(HSB, 360, 100, 100, 1);
  for (let i = 0; i < 36; i++) {
    const a0 = map(i, 0, 36, 0, TWO_PI);
    const a1 = map(i + 1, 0, 36, 0, TWO_PI);
    fill(map(i, 0, 35, 0, 360), 80, 100);
    arc(cx, cy, r * 2, r * 2, a0, a1, PIE);
  }
  colorMode(RGB, 255, 255, 255, 255);
}

function drawRadio(cx, cy, checked, label, tx, ty, uiText, subText) {
  const fillCol = getRadioFillColor();

  stroke(bgIsLight() ? color(120) : color(255));
  strokeWeight(ss(1));
  if (checked) {
    fill(fillCol);
  } else {
    fill(0, 0);
  }
  circle(sx(cx), sy(cy), ss(12.0004));

  noStroke();
  fill(subText);
  textFont("Apple SD Gothic Neo");
  textStyle(NORMAL);
  textSize(ss(16));
  text(label, sx(tx), sy(ty));
}

function drawButton(x, y, w, h, label, uiText, disabled = false) {
  const strokeCol = bgIsLight() ? color(20) : color(255);
  const textCol = disabled ? lerpColor(strokeCol, color(getCurrentBgColor()), 0.35) : strokeCol;

  noFill();
  stroke(strokeCol);
  strokeWeight(ss(1));
  rect(sx(x), sy(y), ss(w), ss(h), ss(15));

  noStroke();
  fill(textCol);
  textAlign(CENTER, CENTER);
  textFont("Apple SD Gothic Neo");
  textStyle(BOLD);
  textSize(ss(16));
  text(label, sx(x + w * 0.5), sy(y + h * 0.5 + 0.5));
  textAlign(LEFT, BASELINE);
}

function drawSummary(uiText) {
  const line1 = `BODY ${round(body)}  ·  ACIDITY ${round(acidity)}  ·  TANNIN ${round(tannin)}  ·  DRYNESS ${drynessInitialized ? round(dryness) : "AUTO"}`;
  const motionText = autoMotionOn ? getActiveMotionNames().join(", ") : "OFF";
  const line2 = `MOTION: ${motionText}`;

  noStroke();
  fill(uiText);
  textAlign(CENTER, BASELINE);
  textFont("Apple SD Gothic Neo");
  textStyle(NORMAL);
  textSize(ss(12));

  if (isMobileLayout()) {
    text(line1, sx(195), sy(786));
    text(line2, sx(195), sy(802));
  } else {
    text(line1, sx(960), sy(1023.7974));
    text(line2, sx(960), sy(1038.1968));
  }

  textAlign(LEFT, BASELINE);
}

function getActiveMotionNames() {
  const arr = [];
  if (breatheOn) arr.push("BREATHE");
  if (trailOn) arr.push("TRAIL");
  if (fizzOn) arr.push("FIZZ");
  if (waveOn) arr.push("WAVE");
  if (driftOn) arr.push("DRIFT");
  if (wobbleOn) arr.push("WOBBLE");
  return arr.length ? arr : ["OFF"];
}

// =========================
// DOM POSITIONING
// =========================
function positionDOM() {
  if (isMobileLayout()) {
    textInput.position(sx(40), sy(getMobileTextPanelStartY() + 8));
    textInput.size(ss(240), ss(28));

    typeColorPicker.position(sx(118), sy(getMobileTextPanelStartY() + 134));
    bgColorPicker.position(sx(118), sy(getMobileTextPanelStartY() + 194));
  } else {
    textInput.position(sx(35.6415), sy(528));
    textInput.size(ss(142.5), ss(30));

    typeColorPicker.position(sx(99), sy(662));
    bgColorPicker.position(sx(99), sy(722));
  }

  textInput.style("font-size", `${max(12, ss(16))}px`);
  textInput.style("font-family", "Apple SD Gothic Neo, sans-serif");
  textInput.style("font-weight", "400");
  textInput.style("background", "transparent");
  textInput.style("color", bgIsLight() ? "#111111" : "#ffffff");
  textInput.style("caret-color", bgIsLight() ? "#111111" : "#ffffff");
  textInput.style("border", "none");
  textInput.style("outline", "none");
  textInput.style("padding", "0");
  textInput.style("margin", "0");
  textInput.style("line-height", "1");
  textInput.style("z-index", "20");
  textInput.style("pointer-events", "auto");
  textInput.style("text-align", "left");

  textInput.elt.style.position = "absolute";
  textInput.elt.style.backgroundColor = "transparent";
  textInput.elt.style.boxShadow = "none";
  textInput.elt.style.webkitAppearance = "none";
  textInput.elt.style.appearance = "none";

  typeColorPicker.show();
  typeColorPicker.size(ss(18), ss(18));
  typeColorPicker.style("opacity", "0");
  typeColorPicker.style("z-index", "40");
  typeColorPicker.style("pointer-events", "auto");
  typeColorPicker.style("border", "none");
  typeColorPicker.style("padding", "0");
  typeColorPicker.style("margin", "0");
  typeColorPicker.style("background", "transparent");
  typeColorPicker.style("box-shadow", "none");
  typeColorPicker.style("appearance", "none");
  typeColorPicker.style("-webkit-appearance", "none");

  bgColorPicker.show();
  bgColorPicker.size(ss(18), ss(18));
  bgColorPicker.style("opacity", "0");
  bgColorPicker.style("z-index", "40");
  bgColorPicker.style("pointer-events", "auto");
  bgColorPicker.style("border", "none");
  bgColorPicker.style("padding", "0");
  bgColorPicker.style("margin", "0");
  bgColorPicker.style("background", "transparent");
  bgColorPicker.style("box-shadow", "none");
  bgColorPicker.style("appearance", "none");
  bgColorPicker.style("-webkit-appearance", "none");
}

// =========================
// AXES TO PARAMS
// =========================
function applyAxesToParams() {
  dryness = constrain(0.55 * tannin + 0.45 * body, 0, 100);
  alcohol = constrain(0.68 * body + 0.32 * (100 - acidity), 0, 100);

  const bodyN = body / 100;
  const acidN = acidity / 100;
  const tanN = tannin / 100;
  const dryN = dryness / 100;

  strokeW = lerp(1.15, 2.8, bodyN);
  rippleAlpha = lerp(210, 255, bodyN);

  radiusMin = floor(lerp(10, 16, 1 - acidN));
  radiusMax = floor(lerp(55, 120, acidN));

  step = floor(lerp(28, 15, tanN));
  spacing = floor(lerp(92, 58, tanN));
  spacing = floor(spacing * lerp(1.12, 0.98, dryN));

  const s = textSizeVal / 800;
  strokeW *= s;
  radiusMin = max(2, round(radiusMin * s));
  radiusMax = max(radiusMin + 10, round(radiusMax * s));
  step = max(4, round(step * s));
  spacing = max(6, round(spacing * s));

  autoScaleByTextSize();

  if (autoMotionOn) {
    applyMotionFromAxes();
  } else {
    resetMotionStates();
  }

  drawMode = "Stroke";
  buildAllText();
}

function autoScaleByTextSize() {
  const s = textSizeVal / 800;
  trackingVal = round(40 * s);
  leadingVal = round(80 * s);
}

function resetMotionStates() {
  breatheOn = false;
  trailOn = false;
  fizzOn = false;
  waveOn = false;
  driftOn = false;
  wobbleOn = false;
}

function applyMotionFromAxes() {
  const b = constrain(body / 100, 0, 1);
  const a = constrain(acidity / 100, 0, 1);
  const t = constrain(tannin / 100, 0, 1);
  const alc = constrain(alcohol / 100, 0, 1);

  resetMotionStates();

  breatheOn = true;
  trailOn = true;

  breatheAmp = lerp(0.05, 0.12, b);
  breatheSpeed = lerp(1.7, 0.95, b);
  trailAlpha = round(lerp(20, 10, b));

  if (acidity > 68) {
    fizzOn = true;
    fizzAmp = lerp(1.0, 2.8, a);
    fizzSpeed = lerp(1.1, 2.6, a);
    fizzThreshold = lerp(0.82, 0.62, a);
  }

  if (acidity > 52) {
    waveOn = true;
    waveAmp = lerp(0.10, 0.22, a);
    waveScale = lerp(0.014, 0.032, a);
    waveSpeed = lerp(1.1, 2.2, a);
  }

  if (tannin > 65) {
    driftOn = true;
    driftAmp = lerp(5.0, 9.8, t);
    driftSpeed = lerp(1.05, 0.9, t);
  }

  if (alcohol > 58) {
    wobbleOn = true;
    wobbleAmp = lerp(5.0, 9.8, alc);
    wobbleSpeed = lerp(1.0, 1.2, alc);
  }
}

// =========================
// TYPE GENERATION
// =========================
function buildAllText() {
  centers = [];
  buildBlockText();
  centerAlignCenters();
}

function buildBlockText() {
  const fontSize = textSizeVal;
  const lines = textContent.toUpperCase().split("\n");
  const allCenters = [];
  let glyphCounter = 0;

  textFont(font);
  textSize(fontSize);

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    let cursorX = 0;
    let cursorY = li * (fontSize + leadingVal);

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if (ch === " ") {
        cursorX += textWidth(" ") + trackingVal;
        glyphCounter++;
        continue;
      }

      const info = getGlyphPoints(ch, fontSize);
      if (!info) {
        glyphCounter++;
        continue;
      }

      const originX = cursorX;
      const originY = cursorY;

      let snappedPts = [];
      let minLX = Infinity;
      let maxLX = -Infinity;

      for (const p of info.pts) {
        const sxp = round(p.x / spacing) * spacing;
        const syp = round(p.y / spacing) * spacing;
        snappedPts.push({ x: sxp, y: syp });
        minLX = min(minLX, sxp);
        maxLX = max(maxLX, sxp);
      }

      if (!snappedPts.length) {
        glyphCounter++;
        continue;
      }

      const shiftX = -minLX;

      for (const sp of snappedPts) {
        const gx = originX + sp.x + shiftX;
        const gy = originY + sp.y;
        addSnappedPointWorld(allCenters, gx, gy, glyphCounter);
      }

      const snappedW = maxLX > minLX ? (maxLX - minLX) : 0;
      const adv = max(textWidth(ch), snappedW);

      cursorX += adv + trackingVal;
      glyphCounter++;
    }
  }

  centers = allCenters;
}

function addSnappedPointWorld(allCenters, sxp, syp, gIndex) {
  for (const q of allCenters) {
    if (q.gIndex === gIndex && dist(sxp, syp, q.x, q.y) < spacing * 0.4) return;
  }
  const v = createVector(sxp, syp);
  v.gIndex = gIndex;
  allCenters.push(v);
}

function getGlyphPoints(ch, fontSize) {
  const bounds = font.textBounds(ch, 0, 0, fontSize);
  if (!bounds) return null;

  const x0 = -bounds.w * 0.5 - bounds.x;
  const y0 = bounds.h * 0.5 - bounds.y;

  const pts = font.textToPoints(ch, x0, y0, fontSize, { sampleFactor: 0.55 });
  return { pts, width: bounds.w };
}

function centerAlignCenters() {
  if (!centers.length) return;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const c of centers) {
    minX = min(minX, c.x);
    minY = min(minY, c.y);
    maxX = max(maxX, c.x);
    maxY = max(maxY, c.y);
  }

  const targetCenterX = DESIGN_W * 0.5;
  const targetCenterY = isMobileLayout() ? 500 : 540;
  const dx = targetCenterX - (minX + maxX) * 0.5;
  const dy = targetCenterY - (minY + maxY) * 0.5;

  for (const c of centers) {
    c.x += dx;
    c.y += dy;
  }
}

// =========================
// RENDER GENERATED TYPE
// =========================
function renderGeneratedType(bgCol) {
  push();

  let modeConst = BLEND;
  if (blendModeName === "Screen") modeConst = SCREEN;
  blendMode(modeConst);

  const progress = 1;
  for (const c of centers) {
    drawRipple(c, progress);
  }

  pop();
}

function drawRipple(pt, progress) {
  let cx = pt.x;
  let cy = pt.y;
  const gIndex = pt.gIndex || 0;

  const time = millis() * 0.001;
  let p = progress;

  if (autoMotionOn && waveOn) {
    const w = sin((pt.x + pt.y) * waveScale + time * waveSpeed) * waveAmp;
    p = constrain(p + w, 0, 1);
  }

  if (autoMotionOn && wobbleOn) {
    const ox = (noise(cx * 0.01, cy * 0.01, time * wobbleSpeed) - 0.5) * 2 * wobbleAmp;
    const oy = (noise(cx * 0.01 + 99, cy * 0.01 + 99, time * wobbleSpeed) - 0.5) * 2 * wobbleAmp;
    cx += ox;
    cy += oy;
  }

  for (let r = radiusMin; r <= radiusMax; r += step) {
    const t = (r - radiusMin) / max(1, (radiusMax - radiusMin));
    const visible = t <= p;
    if (!visible) continue;

    const col = getRippleColor(t);
    let alpha = rippleAlpha;
    let rr = r;
    let dx = 0;
    let dy = 0;

    if (autoMotionOn && breatheOn) {
      const bb = 1 + sin(time * breatheSpeed + gIndex * 0.3) * breatheAmp;
      rr = r * bb;
    }

    if (autoMotionOn && fizzOn) {
      const ringIndex = floor((r - radiusMin) / max(1, step));
      const n = noise(gIndex * 0.21, ringIndex * 0.23, time * fizzSpeed);
      const pulse = n > fizzThreshold ? (n - fizzThreshold) / max(0.0001, (1 - fizzThreshold)) : 0;
      rr += pulse * fizzAmp * step;
    }

    if (autoMotionOn && driftOn) {
      const ringIndex = floor((r - radiusMin) / max(1, step));
      const drift = sin(time * driftSpeed + ringIndex * 0.6 + gIndex * 0.2) * driftAmp;
      dx = drift;
      dy = -drift * 0.6;
    }

    if (drawMode === "Fill") {
      noStroke();
      fill(col[0], col[1], col[2], alpha * 0.9);
    } else {
      noFill();
      stroke(col[0], col[1], col[2], alpha);
      strokeWeight(strokeW * uiScale * 0.92);
    }

    ellipse(sx(cx + dx), sy(cy + dy), ss(rr * 2), ss(rr * 2));
  }
}

function getRippleColor(t) {
  if (typeColorMode !== "Neon") return getTypeBaseColor();

  const c1 = color("#50ffc8");
  const c2 = color("#f239b6");
  const c = lerpColor(c1, c2, constrain(t, 0, 1));

  return [red(c), green(c), blue(c)];
}

// =========================
// MOUSE
// =========================
function mousePressed() {
  if (isMobileLayout()) {
    if (pointInRect(mouseX, mouseY, sx(40), sy(getMobileTextPanelStartY()), ss(260), ss(40))) {
      textInput.elt.focus();
      return;
    }
  } else {
    if (pointInRect(mouseX, mouseY, sx(35.6415), sy(528), ss(142.5), ss(30))) {
      textInput.elt.focus();
      return;
    }
  }

  const sliders = getTopSliders();

  for (const s of sliders) {
    if (s.disabled) continue;
    if (pointInRect(mouseX, mouseY, sx(s.x) - ss(8), sy(s.y) - ss(10), ss(s.w) + ss(16), ss(s.h) + ss(20))) {
      draggingSliderKey = s.key;
      updateSliderByMouse(s.key, mouseX);
      drynessInitialized = true;
      return;
    }
  }

  if (isMobileLayout()) {
    if (pointInRect(mouseX, mouseY, sx(40) - ss(8), sy(getMobileTextPanelStartY() + 82) - ss(10), ss(260) + ss(16), ss(12.7641) + ss(20))) {
      draggingSliderKey = "size";
      updateSliderByMouse("size", mouseX);
      return;
    }
  } else {
    if (pointInRect(mouseX, mouseY, sx(35.6415) - ss(8), sy(603.88) - ss(10), ss(143.4212) + ss(16), ss(12.7641) + ss(20))) {
      draggingSliderKey = "size";
      updateSliderByMouse("size", mouseX);
      return;
    }
  }

  if (handleColorClick("type")) return;
  if (handleColorClick("bg")) return;

  if (isMobileLayout()) {
    const startY = getMobileTextPanelStartY();

    if (pointInCircle(mouseX, mouseY, sx(42), sy(startY + 266), ss(10))) {
      autoMotionOn = true;
      applyAxesToParams();
      return;
    }
    if (pointInCircle(mouseX, mouseY, sx(42), sy(startY + 292), ss(10))) {
      autoMotionOn = false;
      applyAxesToParams();
      return;
    }

    if (pointInRect(mouseX, mouseY, sx(60), sy(startY + 256), ss(50), ss(22))) {
      autoMotionOn = true;
      applyAxesToParams();
      return;
    }
    if (pointInRect(mouseX, mouseY, sx(60), sy(startY + 282), ss(50), ss(22))) {
      autoMotionOn = false;
      applyAxesToParams();
      return;
    }

    if (pointInCircle(mouseX, mouseY, sx(42), sy(startY + 354), ss(10))) {
      blendModeName = "Normal";
      return;
    }
    if (pointInCircle(mouseX, mouseY, sx(42), sy(startY + 380), ss(10))) {
      blendModeName = "Screen";
      return;
    }

    if (pointInRect(mouseX, mouseY, sx(60), sy(startY + 344), ss(70), ss(22))) {
      blendModeName = "Normal";
      return;
    }
    if (pointInRect(mouseX, mouseY, sx(60), sy(startY + 370), ss(70), ss(22))) {
      blendModeName = "Screen";
      return;
    }

    if (pointInRect(mouseX, mouseY, sx(40), sy(startY + 430), ss(120), ss(34))) {
      exportSVG();
      return;
    }
  } else {
    if (pointInCircle(mouseX, mouseY, sx(42.52), sy(790.1155), ss(10))) {
      autoMotionOn = true;
      applyAxesToParams();
      return;
    }
    if (pointInCircle(mouseX, mouseY, sx(42.52), sy(814.1689), ss(10))) {
      autoMotionOn = false;
      applyAxesToParams();
      return;
    }

    if (pointInRect(mouseX, mouseY, sx(57.7498), sy(782), ss(36), ss(18))) {
      autoMotionOn = true;
      applyAxesToParams();
      return;
    }
    if (pointInRect(mouseX, mouseY, sx(57.7498), sy(806), ss(40), ss(18))) {
      autoMotionOn = false;
      applyAxesToParams();
      return;
    }

    if (pointInCircle(mouseX, mouseY, sx(42.52), sy(874.8965), ss(10))) {
      blendModeName = "Normal";
      return;
    }
    if (pointInCircle(mouseX, mouseY, sx(42.52), sy(898.3548), ss(10))) {
      blendModeName = "Screen";
      return;
    }

    if (pointInRect(mouseX, mouseY, sx(57.7498), sy(866), ss(56), ss(18))) {
      blendModeName = "Normal";
      return;
    }
    if (pointInRect(mouseX, mouseY, sx(57.7498), sy(890), ss(60), ss(18))) {
      blendModeName = "Screen";
      return;
    }

    if (pointInRect(mouseX, mouseY, sx(35.702), sy(972.2339), ss(95.0218), ss(30.5844))) {
      exportSVG();
      return;
    }
  }
}

function mouseDragged() {
  if (draggingSliderKey) {
    updateSliderByMouse(draggingSliderKey, mouseX);
  }
}

function mouseReleased() {
  draggingSliderKey = null;
}

function handleColorClick(group) {
  const items = getColorItems(group);

  for (const item of items) {
    if (pointInCircle(mouseX, mouseY, sx(item.x), sy(item.y), ss(9))) {
      if (group === "type") {
        typeColorMode = item.mode;
      } else {
        bgMode = item.mode;
      }
      return true;
    }
  }

  return false;
}

function updateSliderByMouse(key, mx) {
  if (key === "size") {
    if (isMobileLayout()) {
      let v = map(mx, sx(40), sx(40 + 260), 60, 1200);
      textSizeVal = constrain(v, 60, 1200);
    } else {
      let v = map(mx, sx(35.6415), sx(35.6415 + 143.4212), 60, 1200);
      textSizeVal = constrain(v, 60, 1200);
    }
    applyAxesToParams();
    buildAllText();
    return;
  }

  const s = getTopSliders().find(item => item.key === key);
  if (!s) return;

  let v = map(mx, sx(s.x), sx(s.x + s.w), s.min, s.max);
  v = constrain(v, s.min, s.max);

  if (key === "body") body = v;
  if (key === "acidity") acidity = v;
  if (key === "tannin") tannin = v;

  drynessInitialized = true;
  applyAxesToParams();
}

function pointInRect(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

function pointInCircle(px, py, cx, cy, r) {
  return dist(px, py, cx, cy) <= r;
}

// =========================
// SVG SAVE
// =========================
function exportSVG() {
  const svgText = buildSVGString();
  downloadTextAsFile(svgText, "radius_generator_output.svg", "image/svg+xml;charset=utf-8");
}

function buildSVGString() {
  const w = DESIGN_W;
  const h = DESIGN_H;
  const bg = getCurrentBgColor();

  let parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`);
  parts.push(`<rect x="0" y="0" width="${w}" height="${h}" fill="${bg}" />`);

  for (const c of centers) {
    parts.push(...rippleToSVGElements(c, 1));
  }

  parts.push(`</svg>`);
  return parts.join("");
}

function rippleToSVGElements(pt, progress) {
  const cx = pt.x;
  const cy = pt.y;
  let els = [];

  for (let r = radiusMin; r <= radiusMax; r += step) {
    const t = (r - radiusMin) / max(1, (radiusMax - radiusMin));
    if (t > progress) continue;

    const col = getRippleColor(t);
    const hex = rgbToHex(col[0], col[1], col[2]);
    const a = constrain(rippleAlpha, 0, 255) / 255;

    if (drawMode === "Fill") {
      els.push(
        `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="${hex}" fill-opacity="${a.toFixed(3)}" stroke="none" />`
      );
    } else {
      els.push(
        `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="none" stroke="${hex}" stroke-opacity="${a.toFixed(3)}" stroke-width="${strokeW.toFixed(2)}" vector-effect="non-scaling-stroke" />`
      );
    }
  }

  return els;
}

function downloadTextAsFile(text, filename, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

function rgbToHex(r, g, b) {
  const rr = clamp255(round(r));
  const gg = clamp255(round(g));
  const bb = clamp255(round(b));
  return "#" + [rr, gg, bb].map(v => v.toString(16).padStart(2, "0")).join("");
}

function clamp255(v) {
  return max(0, min(255, v));
}

// =========================
// RESIZE
// =========================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateLayoutMetrics();
  buildAllText();
}