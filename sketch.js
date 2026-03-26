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
// DEVICE
// =========================
let FORCE_MOBILE = false;

function isMobileLayout() {
  if (FORCE_MOBILE) return true;
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
textInput.attribute("autocomplete", "off");
textInput.attribute("autocapitalize", "characters");
textInput.attribute("spellcheck", "false");

textInput.input(() => {
  let raw = textInput.value().toUpperCase().replace(/[^A-Z0-9]/g, "");

  // 아무것도 없으면 일단 빈칸 유지
  if (raw.length === 0) {
    textContent = "";
    buildAllText();
    return;
  }

  // 1글자만 유지
  textContent = raw[0];
  if (textInput.value() !== textContent) {
    textInput.value(textContent);
  }
  buildAllText();
});

// 포커스 잃을 때 비어 있으면 기본값 복구
textInput.elt.addEventListener("blur", () => {
  if (!textInput.value().trim()) {
    textContent = "A";
    textInput.value("A");
    buildAllText();
  }
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
  if (isMobileLayout()) {
    uiScale = 1;
    offsetX = 0;
    offsetY = 0;
  } else {
    uiScale = min(width / DESIGN_W, height / DESIGN_H);
    offsetX = (width - DESIGN_W * uiScale) * 0.5;
    offsetY = (height - DESIGN_H * uiScale) * 0.5;
  }
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
// MOBILE / DESKTOP LAYOUT MAP
// =========================
function getTopSliders() {
  if (isMobileLayout()) {
    const x = 20;
    const w = 108;
    const h = 10;
    const labelGap = 58;
    const leftLabelX = 20;
    const rightLabelX = 132;

    return [
      {
        key: "body",
        label: "BODY",
        value: body,
        min: 0,
        max: 100,
        x,
        y: 610,
        w,
        h,
        titleX: x,
        titleY: 597,
        leftLabel: "Light",
        rightLabel: "Bold",
        leftX: leftLabelX,
        rightX: rightLabelX,
        subY: 624,
        disabled: false
      },
      {
        key: "acidity",
        label: "ACIDITY",
        value: acidity,
        min: 0,
        max: 100,
        x,
        y: 653,
        w,
        h,
        titleX: x,
        titleY: 640,
        leftLabel: "Soft",
        rightLabel: "Crisp",
        leftX: leftLabelX,
        rightX: rightLabelX,
        subY: 667,
        disabled: false
      },
      {
        key: "tannin",
        label: "TANNIN",
        value: tannin,
        min: 0,
        max: 100,
        x,
        y: 696,
        w,
        h,
        titleX: x,
        titleY: 683,
        leftLabel: "Smooth",
        rightLabel: "Gritty",
        leftX: leftLabelX,
        rightX: rightLabelX,
        subY: 710,
        disabled: false
      },
      {
        key: "dryness",
        label: "DRYNESS",
        value: dryness,
        min: 0,
        max: 100,
        x,
        y: 739,
        w,
        h,
        titleX: x,
        titleY: 726,
        leftLabel: "Juicy",
        rightLabel: "Tight",
        leftX: leftLabelX,
        rightX: rightLabelX,
        subY: 753,
        disabled: true
      }
    ];
  }

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

function getPanelLayout() {
  if (isMobileLayout()) {
    return {
      textLabelX: 20,
      textLabelY: 785,
      textInputX: 20,
      textInputY: 800,
      textInputW: 108,
      textInputH: 28,
      textLineX1: 20,
      textLineX2: 148,
      textLineY: 826,

      sizeLabelX: 20,
      sizeLabelY: 855,
      sizeSliderX: 20,
      sizeSliderY: 868,
      sizeSliderW: 108,
      sizeSliderH: 10,

      typeLabelX: 20,
      typeLabelY: 908,
      typeBaseY: 918,

      bgLabelX: 20,
      bgLabelY: 948,
      bgBaseY: 958,

      autoLabelX: 20,
      autoLabelY: 988,
      autoOnCx: 20,
      autoOnCy: 1002,
      autoOnTx: 36,
      autoOnTy: 1007,
      autoOffCx: 20,
      autoOffCy: 1022,
      autoOffTx: 36,
      autoOffTy: 1027,

      blendLabelX: 20,
      blendLabelY: 1052,
      blendNormalCx: 20,
      blendNormalCy: 1066,
      blendNormalTx: 36,
      blendNormalTy: 1071,
      blendScreenCx: 20,
      blendScreenCy: 1086,
      blendScreenTx: 36,
      blendScreenTy: 1091,

      saveX: 20,
      saveY: 1130,
      saveW: 70,
      saveH: 24,

      orderX: 20,
      orderY: 1160,
      orderW: 70,
      orderH: 24
    };
  }

  return {
    textLabelX: 32.9916,
    textLabelY: 530.1594,
    textInputX: 35.6415,
    textInputY: 528,
    textInputW: 142.5,
    textInputH: 30,
    textLineX1: 35.6415,
    textLineX2: 178.1843,
    textLineY: 556.0397,

    sizeLabelX: 35.7025,
    sizeLabelY: 594.3201,
    sizeSliderX: 35.6415,
    sizeSliderY: 603.88,
    sizeSliderW: 143.4212,
    sizeSliderH: 12.7641,

    typeLabelX: 35.7025,
    typeLabelY: 654.9246,
    typeBaseY: 665.0,

    bgLabelX: 35.7025,
    bgLabelY: 714.7829,
    bgBaseY: 725.0,

    autoLabelX: 35.7025,
    autoLabelY: 774.5493,
    autoOnCx: 42.52,
    autoOnCy: 790.1155,
    autoOnTx: 57.7498,
    autoOnTy: 795.776,
    autoOffCx: 42.52,
    autoOffCy: 814.1689,
    autoOffTx: 57.7498,
    autoOffTy: 819.8294,

    blendLabelX: 35.7025,
    blendLabelY: 858.1137,
    blendNormalCx: 42.52,
    blendNormalCy: 874.8965,
    blendNormalTx: 57.7498,
    blendNormalTy: 880.5569,
    blendScreenCx: 42.52,
    blendScreenCy: 898.3548,
    blendScreenTx: 57.7498,
    blendScreenTy: 904.0153,

    saveX: 35.702,
    saveY: 972.2339,
    saveW: 95.0218,
    saveH: 30.5844,

    orderX: 35.702,
    orderY: 1013.7338,
    orderW: 95.0218,
    orderH: 30.5844
  };
}

function getColorItems(group) {
  const panel = getPanelLayout();

  if (isMobileLayout()) {
    return group === "type"
      ? [
          { x: 20, y: panel.typeBaseY + 5, mode: "White" },
          { x: 40, y: panel.typeBaseY + 5, mode: "Black" },
          { x: 60, y: panel.typeBaseY + 5, mode: "Neon" },
          { x: 80, y: panel.typeBaseY + 5, mode: "Custom" }
        ]
      : [
          { x: 20, y: panel.bgBaseY + 5, mode: "White" },
          { x: 40, y: panel.bgBaseY + 5, mode: "Black" },
          { x: 60, y: panel.bgBaseY + 5, mode: "Brand" },
          { x: 80, y: panel.bgBaseY + 5, mode: "Custom" }
        ];
  }

  return group === "type"
    ? [
        { x: 42.52, y: panel.typeBaseY + 5.7034, mode: "White" },
        { x: 64.398, y: panel.typeBaseY + 5.7034, mode: "Black" },
        { x: 86.276, y: panel.typeBaseY + 5.7034, mode: "Neon" },
        { x: 108.1539, y: panel.typeBaseY + 5.7034, mode: "Custom" }
      ]
    : [
        { x: 42.52, y: panel.bgBaseY + 5.7034, mode: "White" },
        { x: 64.398, y: panel.bgBaseY + 5.7034, mode: "Black" },
        { x: 86.276, y: panel.bgBaseY + 5.7034, mode: "Brand" },
        { x: 108.1539, y: panel.bgBaseY + 5.7034, mode: "Custom" }
      ];
}

// =========================
// CLEAR UI REGIONS
// =========================
function clearUIRegions(bgCol) {
  noStroke();
  fill(bgCol);

  if (isMobileLayout()) {
    rect(0, 580, 170, 650);
    rect(0, height - 70, width, 70);
  } else {
    rect(0, 0, width, sy(96));
    rect(0, sy(500), sx(270), height - sy(500));
    rect(sx(600), sy(1006), ss(760), ss(52));
  }
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
  return color(224);
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
    textSize(isMobileLayout() ? 10 : ss(16));
    text(titleText, sx(s.titleX), sy(s.titleY));

    fill(subText);
    textStyle(NORMAL);
    textSize(isMobileLayout() ? 10 : ss(16));
    text(s.leftLabel, sx(s.leftX), sy(s.subY));
    text(s.rightLabel, sx(s.rightX), sy(s.subY));

    noStroke();
    fill(barBg);
    rect(sx(s.x), sy(s.y), ss(s.w), ss(s.h), ss(6));

    const knobInset = isMobileLayout() ? 5 : 6.0002;
    const knobR = isMobileLayout() ? 5 : ss(6.0002);
    const knobX = sx(s.x + map(s.value, s.min, s.max, knobInset, s.w - knobInset));
    const knobY = sy(s.y + s.h * 0.5);

    if (s.disabled) {
      fill(getDisabledKnobColor());
    } else {
      fill(getPointerColor());
    }
    circle(knobX, knobY, isMobileLayout() ? knobR * 2 : knobR * 2);
  }
}

function drawLeftPanel(uiText, subText, outline) {
  const p = getPanelLayout();

  textFont("Apple SD Gothic Neo");
  textAlign(LEFT, BASELINE);

  noStroke();
  fill(uiText);
  textStyle(BOLD);
  textSize(isMobileLayout() ? 10 : ss(16));
  text("TEXT", sx(p.textLabelX), sy(p.textLabelY));

  stroke(outline);
  strokeWeight(isMobileLayout() ? 1 : ss(1.0537));
  line(sx(p.textLineX1), sy(p.textLineY), sx(p.textLineX2), sy(p.textLineY));

  noStroke();
  fill(uiText);
  textStyle(BOLD);
  textSize(isMobileLayout() ? 10 : ss(16));
  text("SIZE", sx(p.sizeLabelX), sy(p.sizeLabelY));

  fill(getBarBgColor());
  rect(sx(p.sizeSliderX), sy(p.sizeSliderY), ss(p.sizeSliderW), ss(p.sizeSliderH), ss(6));

  fill(getPointerColor());
  const sizeKnobInset = isMobileLayout() ? 5 : 6.0002;
  const sizeKnobX = sx(p.sizeSliderX + map(textSizeVal, 60, 1200, sizeKnobInset, p.sizeSliderW - sizeKnobInset));
  circle(sizeKnobX, sy(p.sizeSliderY + p.sizeSliderH * 0.5), isMobileLayout() ? 10 : ss(12.0004));

  noStroke();
  fill(uiText);
  textStyle(BOLD);
  textSize(isMobileLayout() ? 10 : ss(16));
  text("TYPE COLOR", sx(p.typeLabelX), sy(p.typeLabelY));
  drawColorOptions(typeColorMode, "type");

  noStroke();
  fill(uiText);
  textStyle(BOLD);
  textSize(isMobileLayout() ? 10 : ss(16));
  text("BACKGROUND", sx(p.bgLabelX), sy(p.bgLabelY));
  drawColorOptions(bgMode, "bg");

  noStroke();
  fill(uiText);
  textStyle(BOLD);
  textSize(isMobileLayout() ? 10 : ss(16));
  text("AUTO MOTION", sx(p.autoLabelX), sy(p.autoLabelY));
  drawRadio(p.autoOnCx, p.autoOnCy, autoMotionOn, "On", p.autoOnTx, p.autoOnTy, uiText, subText);
  drawRadio(p.autoOffCx, p.autoOffCy, !autoMotionOn, "Off", p.autoOffTx, p.autoOffTy, uiText, subText);

  noStroke();
  fill(uiText);
  textStyle(BOLD);
  textSize(isMobileLayout() ? 10 : ss(16));
  text("BLEND MODE", sx(p.blendLabelX), sy(p.blendLabelY));
  drawRadio(p.blendNormalCx, p.blendNormalCy, blendModeName === "Normal", "Normal", p.blendNormalTx, p.blendNormalTy, uiText, subText);
  drawRadio(p.blendScreenCx, p.blendScreenCy, blendModeName === "Screen", "Screen", p.blendScreenTx, p.blendScreenTy, uiText, subText);

  drawButton(p.saveX, p.saveY, p.saveW, p.saveH, "SAVE", uiText, false);
  drawButton(p.orderX, p.orderY, p.orderW, p.orderH, "ORDER", uiText, false);
}

function drawColorOptions(selectedMode, group) {
  const uiText = getUITextColor();
  const border = getBorderGray();
  const items = getColorItems(group);
  const r = isMobileLayout() ? 4 : ss(6.0002);

  for (const item of items) {
    const cx = sx(item.x);
    const cy = sy(item.y);

    if (item.mode === "White") {
      stroke(border);
      strokeWeight(1);
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
      strokeWeight(1);
      fill("#8b1512");
      circle(cx, cy, r * 2);
    } else if (item.mode === "Custom") {
      noStroke();
      drawRainbowSwatch(cx, cy, r);
    }

    if (selectedMode === item.mode) {
      noFill();
      stroke(uiText);
      strokeWeight(1.2);
      circle(cx, cy, r * 2 + (isMobileLayout() ? 5 : ss(4)));
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
  const d = isMobileLayout() ? 10 : ss(12.0004);

  stroke(bgIsLight() ? color(120) : color(255));
  strokeWeight(1);
  if (checked) fill(fillCol);
  else fill(0, 0);
  circle(sx(cx), sy(cy), d);

  noStroke();
  fill(subText);
  textFont("Apple SD Gothic Neo");
  textStyle(NORMAL);
  textSize(isMobileLayout() ? 10 : ss(16));
  text(label, sx(tx), sy(ty));
}

function drawButton(x, y, w, h, label, uiText, disabled = false) {
  const strokeCol = bgIsLight() ? color(20) : color(255);
  const textCol = disabled ? lerpColor(strokeCol, color(getCurrentBgColor()), 0.35) : strokeCol;

  noFill();
  stroke(strokeCol);
  strokeWeight(1);
  rect(sx(x), sy(y), ss(w), ss(h), ss(15));

  noStroke();
  fill(textCol);
  textAlign(CENTER, CENTER);
  textFont("Apple SD Gothic Neo");
  textStyle(BOLD);
  textSize(isMobileLayout() ? 10 : ss(16));
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
  textSize(isMobileLayout() ? 8 : ss(12));
  text(line1, width * 0.5, isMobileLayout() ? height - 48 : sy(1023.7974));
  text(line2, width * 0.5, isMobileLayout() ? height - 34 : sy(1038.1968));
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
  const p = getPanelLayout();
  const typeItems = getColorItems("type");
  const bgItems = getColorItems("bg");
  const typeCustom = typeItems.find(i => i.mode === "Custom");
  const bgCustom = bgItems.find(i => i.mode === "Custom");

  textInput.position(sx(p.textInputX), sy(p.textInputY));
  textInput.size(isMobileLayout() ? p.textInputW : ss(p.textInputW), isMobileLayout() ? p.textInputH : ss(p.textInputH));

  textInput.style("font-size", isMobileLayout() ? "18px" : `${max(12, ss(16))}px`);
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
  textInput.style("user-select", "text");
textInput.style("-webkit-user-select", "text");

  textInput.elt.style.position = "absolute";
  textInput.elt.style.backgroundColor = "transparent";
  textInput.elt.style.boxShadow = "none";
  textInput.elt.style.webkitAppearance = "none";
  textInput.elt.style.appearance = "none";

  typeColorPicker.show();
  typeColorPicker.position(sx(typeCustom.x - 8), sy(typeCustom.y - 8));
  typeColorPicker.size(18, 18);
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
  bgColorPicker.position(sx(bgCustom.x - 8), sy(bgCustom.y - 8));
  bgColorPicker.size(18, 18);
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

  let targetCenterX;
  let targetCenterY;

  if (isMobileLayout()) {
    targetCenterX = width * 0.5;
    targetCenterY = 820;
  } else {
    targetCenterX = DESIGN_W * 0.5;
    targetCenterY = 540;
  }

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
    if (t > p) continue;

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
      strokeWeight(isMobileLayout() ? strokeW : strokeW * uiScale * 0.92);
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
// MOUSE / TOUCH
// =========================
function mousePressed() {
  const p = getPanelLayout();
  const sliders = getTopSliders();

  if (pointInRect(mouseX, mouseY, sx(p.textInputX), sy(p.textInputY), isMobileLayout() ? p.textInputW : ss(p.textInputW), isMobileLayout() ? p.textInputH : ss(p.textInputH))) {
    textInput.elt.focus();
    return;
  }

  for (const s of sliders) {
    if (s.disabled) continue;
    if (pointInRect(mouseX, mouseY, sx(s.x) - 10, sy(s.y) - 10, ss(s.w) + 20, ss(s.h) + 20)) {
      draggingSliderKey = s.key;
      updateSliderByMouse(s.key, mouseX);
      drynessInitialized = true;
      return;
    }
  }

  if (pointInRect(mouseX, mouseY, sx(p.sizeSliderX) - 10, sy(p.sizeSliderY) - 10, ss(p.sizeSliderW) + 20, ss(p.sizeSliderH) + 20)) {
    draggingSliderKey = "size";
    updateSliderByMouse("size", mouseX);
    return;
  }

  if (handleColorClick("type")) return;
  if (handleColorClick("bg")) return;

  if (pointInCircle(mouseX, mouseY, sx(p.autoOnCx), sy(p.autoOnCy), 12) ||
      pointInRect(mouseX, mouseY, sx(p.autoOnTx), sy(p.autoOnTy - 12), 70, 20)) {
    autoMotionOn = true;
    applyAxesToParams();
    return;
  }

  if (pointInCircle(mouseX, mouseY, sx(p.autoOffCx), sy(p.autoOffCy), 12) ||
      pointInRect(mouseX, mouseY, sx(p.autoOffTx), sy(p.autoOffTy - 12), 70, 20)) {
    autoMotionOn = false;
    applyAxesToParams();
    return;
  }

  if (pointInCircle(mouseX, mouseY, sx(p.blendNormalCx), sy(p.blendNormalCy), 12) ||
      pointInRect(mouseX, mouseY, sx(p.blendNormalTx), sy(p.blendNormalTy - 12), 90, 20)) {
    blendModeName = "Normal";
    return;
  }

  if (pointInCircle(mouseX, mouseY, sx(p.blendScreenCx), sy(p.blendScreenCy), 12) ||
      pointInRect(mouseX, mouseY, sx(p.blendScreenTx), sy(p.blendScreenTy - 12), 90, 20)) {
    blendModeName = "Screen";
    return;
  }

  if (pointInRect(mouseX, mouseY, sx(p.saveX), sy(p.saveY), ss(p.saveW), ss(p.saveH))) {
    exportSVG();
    return;
  }
}

function mouseDragged() {
  if (draggingSliderKey) updateSliderByMouse(draggingSliderKey, mouseX);
}

function mouseReleased() {
  draggingSliderKey = null;
}

function handleColorClick(group) {
  const items = getColorItems(group);
  const hitR = isMobileLayout() ? 10 : 9;

  for (const item of items) {
    if (pointInCircle(mouseX, mouseY, sx(item.x), sy(item.y), hitR)) {
      if (group === "type") typeColorMode = item.mode;
      else bgMode = item.mode;
      return true;
    }
  }
  return false;
}

function updateSliderByMouse(key, mx) {
  const p = getPanelLayout();

  if (key === "size") {
    let v = map(mx, sx(p.sizeSliderX), sx(p.sizeSliderX + p.sizeSliderW), 60, 1200);
    textSizeVal = constrain(v, 60, 1200);
    applyAxesToParams();
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
  const w = isMobileLayout() ? width : DESIGN_W;
  const h = isMobileLayout() ? height : DESIGN_H;
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