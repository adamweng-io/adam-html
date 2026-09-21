import { $ } from './modules/dom.js';
import { calculateMesh } from './modules/calculator-core.js';
import { formatNumber as fmt, escapeHtml, downloadText } from './modules/utils.js';
import { getHistory, saveHistory, MAX_HISTORY } from './modules/storage.js';

/* DOM Element Selectors */
const bar = $('bar'), rows = $('rows'), cols = $('cols'), unit = $('unit'), totalUnit = $('totalUnit');
const stretchType = $('stretchType'), stretchV = $('stretchV'), stretchH = $('stretchH');
const vStretchContainer = $('vStretchContainer'), hStretchContainer = $('hStretchContainer');
const pctV = $('pctV'), pctH = $('pctH'), stretchHelp = $('stretchHelp');
const impliedBarRow = $('impliedBarRow'), impliedBarValue = $('impliedBarValue');
const netColor = $('netColor'), textColor = $('textColor');
const measureType = $('measureType'), barLabel = $('barLabel');

const btnModeDim = $('btnModeDim'), btnModeHoles = $('btnModeHoles'), btnResetAll = $('btnResetAll');
const inputModeDim = $('inputModeDim'), inputModeHoles = $('inputModeHoles');
const outputTitle = $('outputTitle'), outputUnitWrapper = $('outputUnitWrapper');
const outVLabel = $('outVLabel'), outHLabel = $('outHLabel');
const targetV = $('targetV'), targetH = $('targetH');
const targetVUnit = $('targetVUnit'), targetHUnit = $('targetHUnit');
const netWeight = $('netWeight'), netWeightUnit = $('netWeightUnit');
const wplLengthUnit = $('wplLengthUnit'), wplWeightUnit = $('wplWeightUnit');
const weightPerLength = $('weightPerLength'), weightBasisNote = $('weightBasisNote');
const lengthQuery = $('lengthQuery'), lengthQueryUnit = $('lengthQueryUnit'), lengthQueryWeight = $('lengthQueryWeight');
const weightQuery = $('weightQuery'), weightQueryUnit = $('weightQueryUnit'), weightQueryLengthUnit = $('weightQueryLengthUnit'), weightQueryLength = $('weightQueryLength'), weightQueryNote = $('weightQueryNote');

const mobileVLabel = $('mobileVLabel'), mobileHLabel = $('mobileHLabel');
const mobileVertical = $('mobileVertical'), mobileHorizontal = $('mobileHorizontal');
const weightPerLengthEl = weightPerLength;
const lengthQueryWeightEl = lengthQueryWeight;
const weightQueryLengthEl = weightQueryLength;

const btnViewPattern = $('btnViewPattern'), btnViewSingle = $('btnViewSingle'), btnResetStretch = $('btnResetStretch');
const canvasHint = $('canvasHint'), legendV = $('legendV'), legendH = $('legendH');

/* Batch Drawer Selectors */
const actionDrawerOverlay = $('actionDrawerOverlay');
const btnOpenActionDrawer = $('btnOpenActionDrawer');
const btnActionDrawerClose = $('btnActionDrawerClose');
const btnDrawerDone = $('btnDrawerDone');
const btnDrawerSaveItem = $('btnDrawerSaveItem');
const btnDrawerSaveHistory = $('btnDrawerSaveHistory');
const btnDrawerOpenReport = $('btnDrawerOpenReport');
const batchCountBadge = $('batchCountBadge');
const drawerBatchBadge = $('drawerBatchBadge');
const drawerSnapshotMode = $('drawerSnapshotMode');
const drawerSnapshotV = $('drawerSnapshotV');
const drawerSnapshotH = $('drawerSnapshotH');

/* History Selectors */
const btnOpenHistory = $('btnOpenHistory');
const historyModalOverlay = $('historyModalOverlay');
const btnHistoryClose = $('btnHistoryClose');
const historyListContainer = $('historyListContainer');
const historyCountBadge = $('historyCountBadge');
const navHistoryBadge = $('navHistoryBadge');
const btnQuickSave = $('btnQuickSave');
const btnExportHistory = $('btnExportHistory');
const importHistoryInput = $('importHistoryInput');
const btnClearHistory = $('btnClearHistory');
const appToast = $('appToast');
const toastMsg = $('toastMsg');

/* Navigation Menu Dropdown Selectors */
const btnNavMenu = $('btnNavMenu');
const navMenuDropdown = $('navMenuDropdown');
const iconMenuBars = $('iconMenuBars');
const iconMenuClose = $('iconMenuClose');
const menuItemSample = $('menuItemSample');
const menuItemReset = $('menuItemReset');
const menuItemHistory = $('menuItemHistory');
const menuHistoryBadge = $('menuHistoryBadge');
const menuItemExportBackup = $('menuItemExportBackup');
const importHistoryInputMenu = $('importHistoryInputMenu');
const menuItemFormula = $('menuItemFormula');

let currentMode = 'dim';
let canvasView = 'pattern';

function showToast(text) {
  toastMsg.textContent = text;
  appToast.classList.remove('translate-y-16', 'opacity-0');
  setTimeout(() => {
    appToast.classList.add('translate-y-16', 'opacity-0');
  }, 2400);
}

/* Nav Menu Open / Close */
function toggleNavMenu() {
  const isHidden = navMenuDropdown.classList.contains('hidden');
  if (isHidden) {
    openNavMenu();
  } else {
    closeNavMenu();
  }
}

function openNavMenu() {
  navMenuDropdown.classList.remove('hidden');
  iconMenuBars.classList.add('hidden');
  iconMenuClose.classList.remove('hidden');
  btnNavMenu.setAttribute('aria-expanded', 'true');
  const count = getHistory().length;
  menuHistoryBadge.textContent = count;
}

function closeNavMenu() {
  navMenuDropdown.classList.add('hidden');
  iconMenuBars.classList.remove('hidden');
  iconMenuClose.classList.add('hidden');
  btnNavMenu.setAttribute('aria-expanded', 'false');
}

btnNavMenu.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleNavMenu();
});

document.addEventListener('click', (e) => {
  if (!navMenuDropdown.classList.contains('hidden') && !btnNavMenu.contains(e.target) && !navMenuDropdown.contains(e.target)) {
    closeNavMenu();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeNavMenu();
    closeHistoryModal();
    closeActionDrawer();
    closeReport();
  }
});

menuItemSample.addEventListener('click', () => {
  closeNavMenu();
  loadSampleNet();
});

menuItemReset.addEventListener('click', () => {
  closeNavMenu();
  fullReset();
});

menuItemHistory.addEventListener('click', () => {
  closeNavMenu();
  openHistoryModal();
});

menuItemExportBackup.addEventListener('click', () => {
  closeNavMenu();
  btnExportHistory.click();
});

menuItemFormula.addEventListener('click', () => {
  closeNavMenu();
  const section = $('mathCardSection');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
    section.classList.add('ring-2', 'ring-teal-500');
    setTimeout(() => section.classList.remove('ring-2', 'ring-teal-500'), 1500);
  }
});

function setMode(newMode) {
  currentMode = newMode;
  const modeHint = $('modeHint');
  if (currentMode === 'dim') {
    btnModeDim.className = "min-h-[44px] py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-white dark:bg-stone-900 shadow-sm text-teal-600 dark:text-teal-400 transition-all flex items-center justify-center gap-1.5 px-1";
    btnModeHoles.className = "min-h-[44px] py-2.5 text-xs sm:text-sm font-medium rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all flex items-center justify-center gap-1.5 px-1";

    inputModeDim.classList.remove('hidden');
    inputModeHoles.classList.add('hidden');

    outputTitle.textContent = 'Total Net Dimensions';
    outputUnitWrapper.classList.remove('hidden');
    outputUnitWrapper.classList.add('flex');

    outVLabel.textContent = 'Vertical Dimension';
    outHLabel.textContent = 'Horizontal Dimension';
    if (modeHint) modeHint.textContent = 'You know the number of holes → get the finished net size.';
  } else {
    btnModeHoles.className = "min-h-[44px] py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-white dark:bg-stone-900 shadow-sm text-teal-600 dark:text-teal-400 transition-all flex items-center justify-center gap-1.5 px-1";
    btnModeDim.className = "min-h-[44px] py-2.5 text-xs sm:text-sm font-medium rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all flex items-center justify-center gap-1.5 px-1";

    inputModeHoles.classList.remove('hidden');
    inputModeDim.classList.add('hidden');

    outputTitle.textContent = 'Required Whole Holes';
    outputUnitWrapper.classList.add('hidden');
    outputUnitWrapper.classList.remove('flex');

    outVLabel.textContent = 'Vertical Holes Needed';
    outHLabel.textContent = 'Horizontal Holes Needed';
    if (modeHint) modeHint.textContent = 'You know the target size → find how many whole holes you need.';
  }
  calc();
}

btnModeDim.addEventListener('click', () => setMode('dim'));
btnModeHoles.addEventListener('click', () => setMode('holes'));

function setCanvasView(v) {
  canvasView = v;
  if (v === 'pattern') {
    btnViewPattern.className = "min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-white dark:bg-stone-900 shadow-sm text-teal-600 dark:text-teal-400 transition-all flex items-center justify-center gap-1.5";
    btnViewSingle.className = "min-h-[40px] px-4 py-2 text-xs sm:text-sm font-medium rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all flex items-center justify-center gap-1.5";
    canvasHint.textContent = 'Auto Scale: Fit';
  } else {
    btnViewSingle.className = "min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-white dark:bg-stone-900 shadow-sm text-teal-600 dark:text-teal-400 transition-all flex items-center justify-center gap-1.5";
    btnViewPattern.className = "min-h-[40px] px-4 py-2 text-xs sm:text-sm font-medium rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all flex items-center justify-center gap-1.5";
    canvasHint.textContent = 'Drag the handles to stretch';
  }
  calc();
}
btnViewPattern.addEventListener('click', () => setCanvasView('pattern'));
btnViewSingle.addEventListener('click', () => setCanvasView('single'));

btnResetStretch.addEventListener('click', () => {
  stretchV.value = 70;
  stretchH.value = 70;
  calc();
});

function calc() {
  const result = calculateMesh({
    inputValue: bar.value,
    unit: unit.value,
    measureType: measureType.value,
    stretchType: stretchType.value,
    stretchV: stretchV.value,
    stretchH: stretchH.value,
    rows: rows.value,
    cols: cols.value,
    targetV: targetV.value,
    targetH: targetH.value,
    targetVUnit: targetVUnit.value,
    targetHUnit: targetHUnit.value,
    totalUnit: totalUnit.value,
    netWeight: netWeight.value,
    netWeightUnit: netWeightUnit.value,
    wplLengthUnit: wplLengthUnit.value,
    wplWeightUnit: wplWeightUnit.value,
    lengthQuery: lengthQuery.value,
    lengthQueryUnit: lengthQueryUnit.value,
    weightQuery: weightQuery.value,
    weightQueryUnit: weightQueryUnit.value,
    weightQueryLengthUnit: weightQueryLengthUnit.value
  });

  const { inputVal, unit: u, sv, vf, hf, cv, ch, barLength: b,
    rows: r, cols: c, verticalResult, horizontalResult,
    impliedBar, impliedRatio, weightPerLength, weightBasis,
    ratePerBaseUnitInGrams, lengthQueryWeight, weightQueryLength } = result;

  const pct = value => (value * 100).toFixed(1).replace(/\.0$/, '') + '%';
  pctV.textContent = pct(vf);
  pctH.textContent = pct(hf);
  legendV.textContent = pctV.textContent;
  legendH.textContent = pctH.textContent;

  if (inputVal > 0) {
    $('cellV').textContent = `${fmt(cv)} ${u}`;
    $('cellH').textContent = `${fmt(ch)} ${u}`;
  } else {
    $('cellV').textContent = '—';
    $('cellH').textContent = '—';
  }

  if (stretchType.value === 'both' && impliedBar !== null) {
    const offBy = Math.abs(impliedRatio - 1) > 0.01;
    impliedBarValue.textContent = `${fmt(impliedBar)} ${u} (${impliedRatio.toFixed(2)}× stated)`;
    impliedBarValue.className = 'font-mono font-bold ' +
      (offBy ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400');
  } else if (stretchType.value === 'both') {
    impliedBarValue.textContent = '—';
  }

  $('vertical').textContent = verticalResult;
  $('horizontal').textContent = horizontalResult;
  mobileVertical.textContent = verticalResult;
  mobileHorizontal.textContent = horizontalResult;
  mobileVLabel.textContent = outVLabel.textContent;
  mobileHLabel.textContent = outHLabel.textContent;

  if (weightPerLength !== null) {
    weightPerLengthEl.textContent = `${fmt(weightPerLength)} ${wplWeightUnit.value}/${wplLengthUnit.value}`;
    weightBasisNote.textContent = `Based on ${fmt(Number(netWeight.value))} ${netWeightUnit.value} over total horizontal length of ${fmt(result.totalHorizontalBase)} ${unit.value}.`;
  } else {
    weightPerLengthEl.textContent = `0.00 ${wplWeightUnit.value}/${wplLengthUnit.value}`;
    weightBasisNote.textContent = Number(netWeight.value) > 0 ? 'Horizontal length is zero.' : 'Enter net weight above to calculate.';
  }

  if (ratePerBaseUnitInGrams !== null && Number(lengthQuery.value) > 0) {
    lengthQueryWeightEl.textContent = `${fmt(lengthQueryWeight)} ${netWeightUnit.value}`;
  } else {
    lengthQueryWeightEl.textContent = `0.00 ${netWeightUnit.value}`;
  }

  if (ratePerBaseUnitInGrams !== null && ratePerBaseUnitInGrams > 0 && Number(weightQuery.value) > 0) {
    weightQueryLengthEl.textContent = `${fmt(weightQueryLength)} ${weightQueryLengthUnit.value}`;
    weightQueryNote.textContent = `Based on the weight-per-length rate above (${weightPerLengthEl.textContent}).`;
  } else {
    weightQueryLengthEl.textContent = `0.00 ${weightQueryLengthUnit.value}`;
    weightQueryNote.textContent = ratePerBaseUnitInGrams === null
      ? 'Uses the weight-per-length rate above — enter a net weight first.'
      : 'Enter a weight above to estimate its length.';
  }

  let dirTxt, vFmt, hFmt;
  if (stretchType.value === 'v') { dirTxt = 'vertical'; vFmt = 's'; hFmt = '√(1 − s²)'; }
  else if (stretchType.value === 'h') { dirTxt = 'horizontal'; vFmt = '√(1 − s²)'; hFmt = 's'; }
  else { dirTxt = 'independent'; vFmt = 's_v'; hFmt = 's_h'; }

  const isStretch = measureType.value === 'stretch';
  const holeFormula = isStretch
    ? `<ul class="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400">
         <li><span class="text-stone-900 dark:text-white font-semibold">Hole height</span> = Mesh size × ${vFmt}</li>
         <li><span class="text-stone-900 dark:text-white font-semibold">Hole width</span> = Mesh size × ${hFmt}</li>
       </ul>`
    : `<ul class="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400">
         <li><span class="text-stone-900 dark:text-white font-semibold">Hole height</span> = 2 × bar × ${vFmt}</li>
         <li><span class="text-stone-900 dark:text-white font-semibold">Hole width</span> = 2 × bar × ${hFmt}</li>
       </ul>`;

  $('mathText').innerHTML = `<div class="space-y-3">
    <p class="text-stone-700 dark:text-stone-300 font-medium">How one hole is calculated</p>
    <p>You entered the <span class="text-teal-600 dark:text-teal-400 font-semibold">${isStretch ? 'mesh reference size' : 'bar length'}</span>
    ${isStretch ? '(the full opening size before directional reshaping).' : '(knot to knot).'}
    Direction factor <span class="font-mono text-teal-600 dark:text-teal-400">s</span> = ${dirTxt} ratio (0–1).</p>
    ${holeFormula}
    <p class="pt-1 border-t border-stone-200 dark:border-stone-700">Whole net (R rows × C columns of holes):</p>
    <ul class="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400">
      <li><span class="text-emerald-600 dark:text-emerald-400 font-semibold">Net height</span> = R × hole height</li>
      <li><span class="text-emerald-600 dark:text-emerald-400 font-semibold">Net width</span> = C × hole width</li>
    </ul>
  </div>`;

  lastDrawArgs = [b, r, c, sv, cv, ch, u];
  draw(...lastDrawArgs);
}
let lastDrawArgs = null;
function redraw() { if (lastDrawArgs) draw(...lastDrawArgs); }

function draw(b, r, c, s, cv, ch, u) {
  const canvas = $('mesh');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentNode.getBoundingClientRect();
  
  if (rect.width <= 0 || rect.height <= 0) return;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  const dotGap = 24;
  for(let x = 0; x < W; x += dotGap) {
    for(let y = 0; y < H; y += dotGap) {
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  if (canvasView === 'single') {
    drawSingleCell(ctx, W, H, cv, ch, u, b);
    return;
  }

  handleV.active = false;
  handleH.active = false;

  if (r <= 0 || c <= 0 || cv <= 0 || ch <= 0) {
    ctx.fillStyle = textColor.value || "#64748b";
    ctx.font = '500 15px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("No net yet", W / 2, H / 2 - 18);
    ctx.font = '400 13px "Space Grotesk", sans-serif';
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Enter a mesh size and hole counts,", W / 2, H / 2 + 6);
    ctx.fillText("or click Sample to try an example", W / 2, H / 2 + 24);
    return;
  }

  const showR = Math.min(r || 1, 10);
  const showC = Math.min(c || 1, 14);
  const isCropped = (showR < r) || (showC < c);
  const small = W < 450;

  const marginTop = small ? 28 : 34;
  const marginBottom = small ? (isCropped ? 58 : 46) : (isCropped ? 68 : 54);
  const marginLeft = small ? 12 : 16;
  const marginRight = small ? 28 : 36;

  const meshAreaW = Math.max(40, W - marginLeft - marginRight);
  const meshAreaH = Math.max(40, H - marginTop - marginBottom);

  const scale = Math.min(meshAreaW / (showC * ch || 1), meshAreaH / (showR * cv || 1));

  const totalDrawnW = showC * (ch * scale);
  const totalDrawnH = showR * (cv * scale);

  const ox = marginLeft + (meshAreaW - totalDrawnW) / 2;
  const oy = marginTop + (meshAreaH - totalDrawnH) / 2;

  const cellW = ch * scale;
  const cellH = cv * scale;
  const halfW = cellW / 2;
  const halfH = cellH / 2;

  ctx.save();
  ctx.translate(ox, oy);

  ctx.lineWidth = 1.6;
  ctx.strokeStyle = netColor.value;
  ctx.lineJoin = 'round';
  ctx.shadowColor = netColor.value;
  ctx.shadowBlur = 6;
  ctx.globalAlpha = 0.9;

  for(let j = 0; j < showC; j++) {
    for(let i = 0; i < showR; i++) {
      const x = j * cellW;
      const y = i * cellH;
      ctx.beginPath();
      ctx.moveTo(x + halfW, y);
      ctx.lineTo(x + cellW, y + halfH);
      ctx.lineTo(x + halfW, y + cellH);
      ctx.lineTo(x, y + halfH);
      ctx.closePath();
      ctx.stroke();
    }
  }

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  ctx.strokeStyle = textColor.value;
  ctx.lineWidth = 1.2;

  const arrowY = totalDrawnH + 10;
  ctx.beginPath();
  ctx.moveTo(0, arrowY);
  ctx.lineTo(totalDrawnW, arrowY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, arrowY);
  ctx.lineTo(6, arrowY - 3.5);
  ctx.moveTo(0, arrowY);
  ctx.lineTo(6, arrowY + 3.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(totalDrawnW, arrowY);
  ctx.lineTo(totalDrawnW - 6, arrowY - 3.5);
  ctx.moveTo(totalDrawnW, arrowY);
  ctx.lineTo(totalDrawnW - 6, arrowY + 3.5);
  ctx.stroke();

  const arrowX = totalDrawnW + 10;
  ctx.beginPath();
  ctx.moveTo(arrowX, 0);
  ctx.lineTo(arrowX, totalDrawnH);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(arrowX, 0);
  ctx.lineTo(arrowX - 3.5, 6);
  ctx.moveTo(arrowX, 0);
  ctx.lineTo(arrowX + 3.5, 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(arrowX, totalDrawnH);
  ctx.lineTo(arrowX - 3.5, totalDrawnH - 6);
  ctx.moveTo(arrowX, totalDrawnH);
  ctx.lineTo(arrowX + 3.5, totalDrawnH - 6);
  ctx.stroke();

  ctx.restore();

  const labelFont = small ? '600 10px "Space Grotesk", monospace' : '600 11px "Space Grotesk", monospace';
  const bodyFont = small ? '500 11px "Space Grotesk", sans-serif' : '500 12px "Space Grotesk", sans-serif';
  const boldFont = '600 ' + (small ? '11px' : '12px') + ' "Space Grotesk", sans-serif';

  ctx.fillStyle = textColor.value;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.font = labelFont;
  const titleX = small ? marginLeft + 150 : marginLeft + 160;
  ctx.fillText(
    isCropped
      ? `PATCH PREVIEW: ${showC} OF ${c} COLS × ${showR} OF ${r} ROWS`
      : `PATCH: ${showC} COLUMNS × ${showR} ROWS`,
    titleX,
    marginTop - 10
  );

  const bottomBaseY = oy + totalDrawnH + 24;
  ctx.font = bodyFont;
  ctx.fillText(`Hole Width = ${fmt(ch)} ${u}`, marginLeft, bottomBaseY);

  if (currentMode === 'dim') {
    const tU = totalUnit.value;
    const previewH = convert(showC * ch, u, tU);
    const totalH = convert(c * ch, u, tU);
    ctx.font = boldFont;
    if (isCropped) {
      ctx.fillText(`Preview Width = ${fmt(previewH)} ${tU}`, marginLeft, bottomBaseY + 15);
      ctx.font = bodyFont;
      ctx.fillText(`Full Net Width = ${fmt(totalH)} ${tU}`, marginLeft, bottomBaseY + 30);
    } else {
      ctx.fillText(`Net Total Width = ${fmt(totalH)} ${tU}`, marginLeft, bottomBaseY + 15);
    }
  } else {
    ctx.font = boldFont;
    ctx.fillText(
      isCropped ? `Preview Holes = ${showC}  (need ${c})` : `Total Whole Holes = ${c}`,
      marginLeft,
      bottomBaseY + 15
    );
  }

  const rightLabelX = ox + totalDrawnW + 22;
  const rightMidY = oy + totalDrawnH / 2;

  ctx.save();
  ctx.translate(rightLabelX, rightMidY);
  ctx.rotate(Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.font = bodyFont;
  ctx.fillText(`Hole Height = ${fmt(cv)} ${u}`, 0, 0);

  if (currentMode === 'dim') {
    const tU = totalUnit.value;
    const previewV = convert(showR * cv, u, tU);
    const totalV = convert(r * cv, u, tU);
    ctx.font = boldFont;
    if (isCropped) {
      ctx.fillText(`Preview Height = ${fmt(previewV)} ${tU}`, 0, 14);
      ctx.font = bodyFont;
      ctx.fillText(`Full Net Height = ${fmt(totalV)} ${tU}`, 0, 28);
    } else {
      ctx.fillText(`Net Total Height = ${fmt(totalV)} ${tU}`, 0, 14);
    }
  } else {
    ctx.font = boldFont;
    ctx.fillText(isCropped ? `Preview = ${showR}  (need ${r})` : `Total Holes = ${r}`, 0, 14);
  }
  ctx.restore();
}

/* Single-Hole interactive view */
const handleV = { x: 0, y: 0, active: false, hover: false };
const handleH = { x: 0, y: 0, active: false, hover: false };
let dragging = null;

function drawHandle(ctx, x, y, color, active) {
  ctx.beginPath();
  ctx.arc(x, y, active ? 9 : 7, 0, Math.PI * 2);
  ctx.globalAlpha = active ? 1 : 0.88;
  ctx.shadowColor = color;
  ctx.shadowBlur = active ? 10 : 4;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
}

function drawSingleCell(ctx, W, H, cv, ch, u, b) {
  handleV.active = false;
  handleH.active = false;

  if (b <= 0) {
    ctx.fillStyle = textColor.value || "#64748b";
    ctx.font = '500 15px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("No hole yet", W / 2, H / 2 - 12);
    ctx.font = '400 13px "Space Grotesk", sans-serif';
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Enter a mesh size above to see the shape", W / 2, H / 2 + 12);
    return;
  }

  const sT = stretchType.value;
  const small = W < 450;
  const isDragging = dragging !== null;
  const annotAlpha = isDragging ? 0.18 : 1;
  const neutralSize = b * Math.SQRT2;

  const maxW = Math.max(ch, neutralSize);
  const maxH = Math.max(cv, neutralSize);
  const pad = small ? 72 : 110;
  const scale = Math.min((W - pad) / (maxW || 1), (H - pad) / (maxH || 1));

  const cx = W / 2;
  const cy = H / 2 + (small ? 4 : 8);

  const gHalf = (neutralSize * scale) / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = isDragging ? 0.25 : 1;
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
  ctx.beginPath();
  ctx.moveTo(0, -gHalf);
  ctx.lineTo(gHalf, 0);
  ctx.lineTo(0, gHalf);
  ctx.lineTo(-gHalf, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  const MIN_HALF_PX = small ? 4 : 5;
  const halfW = Math.max((ch * scale) / 2, MIN_HALF_PX);
  const halfH = Math.max((cv * scale) / 2, MIN_HALF_PX);

  ctx.save();
  ctx.translate(cx, cy);

  ctx.beginPath();
  ctx.moveTo(0, -halfH);
  ctx.lineTo(halfW, 0);
  ctx.lineTo(0, halfH);
  ctx.lineTo(-halfW, 0);
  ctx.closePath();
  ctx.fillStyle = netColor.value;
  ctx.globalAlpha = 0.14;
  ctx.fill();

  ctx.globalAlpha = 0.95;
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = netColor.value;
  ctx.shadowColor = netColor.value;
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  ctx.globalAlpha = annotAlpha;
  ctx.setLineDash([3, 4]);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.55)';
  ctx.beginPath();
  ctx.moveTo(0, -halfH - 16);
  ctx.lineTo(0, halfH + 16);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(99, 102, 241, 0.55)';
  ctx.beginPath();
  ctx.moveTo(-halfW - 16, 0);
  ctx.lineTo(halfW + 16, 0);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  ctx.restore();

  handleV.x = cx; handleV.y = cy - halfH;
  handleH.x = cx + halfW; handleH.y = cy;
  handleV.active = (sT === 'v' || sT === 'both');
  handleH.active = (sT === 'h' || sT === 'both');

  const labelSize = small ? 11 : 12;
  const valueSize = small ? 12 : 13;
  const edgePad = small ? 14 : 18;

  function blueprintPill(text, x, y, opts = {}) {
    ctx.save();
    ctx.globalAlpha = (opts.alpha != null ? opts.alpha : annotAlpha);
    ctx.font = `700 ${valueSize}px "Space Grotesk", sans-serif`;
    ctx.textAlign = opts.align || 'center';
    ctx.textBaseline = 'middle';
    const metrics = ctx.measureText(text);
    const px = small ? 8 : 10;
    const py = small ? 5 : 6;
    const w = metrics.width + px * 2;
    const h = valueSize + py * 2;
    let left = x - w / 2;
    if ((opts.align || 'center') === 'left') left = x;
    if ((opts.align || 'center') === 'right') left = x - w;
    left = Math.max(edgePad, Math.min(left, W - edgePad - w));
    let top = y - h / 2;
    top = Math.max(edgePad, Math.min(top, H - edgePad - h));
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = opts.border || 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const r = 7;
    ctx.roundRect(left, top, w, h, r);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = opts.color || '#f8fafc';
    const tx = (opts.align || 'center') === 'left' ? left + px
      : (opts.align === 'right' ? left + w - px : left + w / 2);
    ctx.fillText(text, tx, top + h / 2 + 0.5);
    ctx.restore();
  }

  if (handleV.active) {
    drawHandle(ctx, handleV.x, handleV.y, '#14b8a6', handleV.hover || dragging === 'v');
    let pillY = handleV.y - (small ? 25 : 28);
    let titleY = handleV.y - (small ? 42 : 47);
    if (titleY < edgePad + 4) {
      pillY = handleV.y + (small ? 22 : 26);
      titleY = handleV.y + (small ? 40 : 46);
    }
    blueprintPill(`${pctV.textContent}`, handleV.x, pillY, { color:'#5eead4', border:'rgba(20,184,166,.65)' });
    ctx.save();
    ctx.globalAlpha = annotAlpha;
    ctx.font = `600 ${labelSize}px "Space Grotesk", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#99f6e4';
    ctx.fillText('VERTICAL', handleV.x, Math.max(edgePad + 8, Math.min(titleY, H - edgePad)));
    ctx.restore();
  }
  if (handleH.active) {
    drawHandle(ctx, handleH.x, handleH.y, '#8b5cf6', handleH.hover || dragging === 'h');
    let pillX = handleH.x + (small ? 20 : 24);
    let pillY = handleH.y - (small ? 25 : 28);
    let titleX = handleH.x + (small ? 8 : 10);
    let titleY = handleH.y + (small ? 42 : 47);
    if (titleY > H - (small ? 48 : 56)) {
      titleY = handleH.y - (small ? 28 : 32);
      pillY = handleH.y - (small ? 46 : 52);
    }
    if (titleX > W - 90) {
      titleX = handleH.x - (small ? 8 : 10);
      pillX = handleH.x - (small ? 20 : 24);
      blueprintPill(`${pctH.textContent}`, pillX, pillY, { align:'right', color:'#c4b5fd', border:'rgba(139,92,246,.65)' });
      ctx.save();
      ctx.globalAlpha = annotAlpha;
      ctx.font = `600 ${labelSize}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ddd6fe';
      ctx.fillText('HORIZONTAL', titleX, Math.max(edgePad + 8, Math.min(titleY, H - edgePad)));
      ctx.restore();
    } else {
      blueprintPill(`${pctH.textContent}`, pillX, pillY, { align:'left', color:'#c4b5fd', border:'rgba(139,92,246,.65)' });
      ctx.save();
      ctx.globalAlpha = annotAlpha;
      ctx.font = `600 ${labelSize}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ddd6fe';
      ctx.fillText('HORIZONTAL', titleX, Math.max(edgePad + 8, Math.min(titleY, H - edgePad)));
      ctx.restore();
    }
  }

  if (!isDragging) {
    const tipBottom = cy + halfH;
    const legendY = H - (small ? 30 : 34);
    const clearOfTip = tipBottom + (small ? 16 : 20);
    const infoY = Math.min(legendY, Math.max(clearOfTip, H * 0.55));
    const subY = infoY + (small ? 14 : 16);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${labelSize}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = textColor.value || '#cbd5e1';
    const info = `Hole ${fmt(cv)} × ${fmt(ch)} ${u}`;
    const hint = 'Dashed = reference';
    ctx.fillText(info, cx, Math.min(infoY, H - edgePad - 12));
    ctx.font = `500 ${small ? 10 : 11}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = '#94a3b8';
    if (subY < H - 6) ctx.fillText(hint, cx, Math.min(subY, H - edgePad));
    ctx.restore();
  } else {
    const live = `${pctV.textContent} × ${pctH.textContent}`;
    blueprintPill(live, W - edgePad - 4, edgePad + 14, {
      align: 'right',
      color: '#e2e8f0',
      border: 'rgba(148,163,184,.45)',
      alpha: 0.92
    });
  }
}

const meshCanvas = $('mesh');
const HANDLE_HIT_RADIUS = 32;
const DRAG_SENSITIVITY = 0.6;

function canvasPos(e) {
  const rect = meshCanvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}
function dist(x1, y1, x2, y2) { return Math.hypot(x1 - x2, y1 - y2); }

meshCanvas.addEventListener('pointerdown', (e) => {
  if (canvasView !== 'single') return;
  const pos = canvasPos(e);
  let hit = null;
  if (handleV.active && dist(pos.x, pos.y, handleV.x, handleV.y) <= HANDLE_HIT_RADIUS) hit = 'v';
  else if (handleH.active && dist(pos.x, pos.y, handleH.x, handleH.y) <= HANDLE_HIT_RADIUS) hit = 'h';
  if (!hit) return;
  dragging = hit;
  
  meshCanvas._lastX = pos.x;
  meshCanvas._lastY = pos.y;
  
  meshCanvas.setPointerCapture(e.pointerId);
  meshCanvas.style.cursor = 'grabbing';
  if (canvasHint) canvasHint.style.opacity = '0';
  e.preventDefault();
});

meshCanvas.addEventListener('pointermove', (e) => {
  const pos = canvasPos(e);
  if (dragging) {
    const dy = meshCanvas._lastY - pos.y;
    const dx = pos.x - meshCanvas._lastX;
    meshCanvas._lastX = pos.x;
    meshCanvas._lastY = pos.y;

    if (dragging === 'v') {
      stretchV.value = Math.min(100, Math.max(0, Number(stretchV.value) + dy * DRAG_SENSITIVITY)).toFixed(1);
    } else {
      stretchH.value = Math.min(100, Math.max(0, Number(stretchH.value) + dx * DRAG_SENSITIVITY)).toFixed(1);
    }
    calc();
    e.preventDefault();
    return;
  }
  if (canvasView !== 'single') return;
  const nearV = handleV.active && dist(pos.x, pos.y, handleV.x, handleV.y) <= HANDLE_HIT_RADIUS;
  const nearH = handleH.active && dist(pos.x, pos.y, handleH.x, handleH.y) <= HANDLE_HIT_RADIUS;
  if (nearV !== handleV.hover || nearH !== handleH.hover) {
    handleV.hover = nearV;
    handleH.hover = nearH;
    meshCanvas.style.cursor = (nearV || nearH) ? 'grab' : 'default';
    redraw();
  }
});

function endDrag(e) {
  if (!dragging) return;
  dragging = null;
  meshCanvas.style.cursor = 'default';
  try { meshCanvas.releasePointerCapture(e.pointerId); } catch (err) { }
  if (canvasHint) canvasHint.style.opacity = '';
  redraw();
}
meshCanvas.addEventListener('pointerup', endDrag);
meshCanvas.addEventListener('pointercancel', endDrag);
meshCanvas.addEventListener('pointerleave', () => {
  if (!dragging) { handleV.hover = false; handleH.hover = false; meshCanvas.style.cursor = 'default'; redraw(); }
});

[bar, rows, cols, stretchV, stretchH, netColor, textColor, unit, totalUnit, targetV, targetH, targetVUnit, targetHUnit, netWeight, netWeightUnit, wplLengthUnit, wplWeightUnit, lengthQuery, lengthQueryUnit, weightQuery, weightQueryUnit, weightQueryLengthUnit].forEach(e => {
  if (e) {
    e.addEventListener('input', calc);
    e.addEventListener('change', calc);
  }
});

stretchType.addEventListener('change', () => {
  const sT = stretchType.value;
  vStretchContainer.classList.toggle('hidden', sT === 'h');
  hStretchContainer.classList.toggle('hidden', sT === 'v');

  if (sT === 'v') {
    stretchHelp.textContent = 'Most nets are stretched more vertically. Horizontal size is calculated automatically from the fixed bar length.';
  } else if (sT === 'h') {
    stretchHelp.textContent = 'Mesh is stretched more horizontally. Vertical size is calculated automatically from the fixed bar length.';
  } else {
    stretchHelp.textContent = 'Both directions are free. This can produce sizes that would not occur with a real fixed-bar mesh — check the implied bar length below.';
  }
  impliedBarRow.classList.toggle('hidden', sT !== 'both');

  calc();
});

measureType.addEventListener('change', () => {
  const isStretch = measureType.value === 'stretch';
  barLabel.textContent = isStretch ? 'Mesh Size' : 'Bar Length';
  const barHelp = $('barHelp');
  if (barHelp) {
    barHelp.textContent = isStretch
      ? 'Reference size of one mesh opening before directional reshaping.'
      : 'Length of one bar between two adjacent knots.';
  }
  calc();
});

function fullReset() {
  setMode('dim');
  bar.value = "";
  rows.value = "";
  cols.value = "";
  targetV.value = "";
  targetH.value = "";
  netWeight.value = "";
  lengthQuery.value = "";
  weightQuery.value = "";

  unit.value = 'inch';
  totalUnit.value = 'ft';
  targetVUnit.value = 'ft';
  targetHUnit.value = 'ft';
  netWeightUnit.value = 'kg';
  wplLengthUnit.value = 'ft';
  wplWeightUnit.value = 'kg';
  lengthQueryUnit.value = 'ft';
  weightQueryUnit.value = 'kg';
  weightQueryLengthUnit.value = 'ft';
  netColor.value = '#14b8a6';
  textColor.value = '#94a3b8';

  stretchV.value = 70;
  stretchH.value = 70;
  stretchType.value = 'v';
  measureType.value = 'stretch';

  stretchType.dispatchEvent(new Event('change'));
  measureType.dispatchEvent(new Event('change'));

  calc();

  savedNets = [];
  nextNetNum = 1;
  updateBatchBadges();
  closeActionDrawer();
  closeReport();
  showToast('Reset all parameters');
}

btnResetAll.addEventListener('click', fullReset);

function loadSampleNet() {
  setMode('dim');
  measureType.value = 'stretch';
  bar.value = '4';
  unit.value = 'inch';
  rows.value = '12';
  cols.value = '20';
  targetV.value = '';
  targetH.value = '';
  stretchType.value = 'v';
  stretchV.value = 70;
  stretchH.value = 70;
  totalUnit.value = 'ft';
  netWeight.value = '';
  lengthQuery.value = '';
  weightQuery.value = '';
  measureType.dispatchEvent(new Event('change'));
  stretchType.dispatchEvent(new Event('change'));
  calc();
  showToast('Loaded sample net');
}

const btnLoadSample = $('btnLoadSample');
if (btnLoadSample) {
  btnLoadSample.addEventListener('click', loadSampleNet);
}

window.addEventListener('resize', calc);

const themeToggle = $('themeToggle');
themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark');
  try { localStorage.setItem('netcalc-theme', isDark ? 'dark' : 'light'); } catch (e) { }
  calc();
});

barLabel.textContent = measureType.value === 'stretch' ? 'Mesh Size' : 'Bar Length';
stretchType.dispatchEvent(new Event('change'));

/* ========================================================
   HISTORY & SNAPSHOT MANAGEMENT SUBSYSTEM
   ======================================================== */
function updateHistoryBadge() {
  const list = getHistory();
  const count = list.length;
  if (count > 0) {
    navHistoryBadge.textContent = count;
    navHistoryBadge.classList.remove('hidden');
    historyCountBadge.textContent = count;
    menuHistoryBadge.textContent = count;
  } else {
    navHistoryBadge.classList.add('hidden');
    historyCountBadge.textContent = '0';
    menuHistoryBadge.textContent = '0';
  }
}

function captureSnapshot(label = '') {
  const inputVal = bar.value || '0';
  const u = unit.value;
  const isDim = currentMode === 'dim';

  let configDesc = '';
  if (isDim) {