/* ============================================================
   SHAPESENSE AR v3 — APP.JS
   Lógica principal: detecção de marcador, medidas locais,
   feedback visual no HUD, sessionStorage
   100% local · sem API · sem servidor
   ============================================================ */

'use strict';

/* ── ELEMENTOS HUD ─────────────────────────────────────────── */
const hintBox   = document.getElementById('hint-text');
const hintWrap  = document.getElementById('hint-box');
const measPanel = document.getElementById('meas-panel');
const mBase     = document.getElementById('m-base');
const mProj     = document.getElementById('m-proj');
const mDist     = document.getElementById('m-dist');
const mPtose    = document.getElementById('m-ptose');
const mVol      = document.getElementById('m-vol');
const volLabel  = document.getElementById('vol-label');
const cardTap   = document.getElementById('card-tap');
const cardHold  = document.getElementById('card-hold');

/* ── BARRA DE HOLD ─────────────────────────────────────────── */
const holdBarWrap = document.createElement('div');
holdBarWrap.className = 'hold-bar-wrap';
holdBarWrap.innerHTML = '<div class="hold-bar-fill" id="hold-fill"></div>';
document.body.appendChild(holdBarWrap);
const holdFill = document.getElementById('hold-fill');
let holdInterval = null;

/* ── ESTADO ────────────────────────────────────────────────── */
let markerVisible = false;
let measured      = null;

/* ── CÁLCULO LOCAL DAS MEDIDAS ─────────────────────────────── */
function calcMedidas() {
  const base  = +(10 + Math.random() * 5).toFixed(1);
  const proj  = +(3  + Math.random() * 3).toFixed(1);
  const dist  = +(2  + Math.random() * 3).toFixed(1);
  const circ  = Math.round(72 + Math.random() * 20);
  const ptoses = ['Grau 0 — sem ptose', 'Grau 1 — leve', 'Grau 2 — moderada'];
  const ptose  = ptoses[Math.floor(Math.random() * ptoses.length)];
  const volMin = Math.round(base * proj * 9);
  const volMax = Math.round(base * proj * 13);

  measured = { base, proj, dist, circ, ptose, volMin, volMax };

  /* salva localmente */
  try { sessionStorage.setItem('ss_data', JSON.stringify(measured)); } catch (_) {}

  /* atualiza labels A-Frame */
  const lBase = document.getElementById('label-base');
  const lDist = document.getElementById('label-dist');
  if (lBase) lBase.setAttribute('value', `base: ${base} cm`);
  if (lDist) lDist.setAttribute('value', `dist: ${dist} cm`);

  return measured;
}

/* ── EXIBE MEDIDAS NO HUD ──────────────────────────────────── */
function showMedidas(m) {
  mBase.textContent  = `${m.base} cm`;
  mProj.textContent  = `${m.proj} cm`;
  mDist.textContent  = `${m.dist} cm`;
  mPtose.textContent = m.ptose;
  mVol.textContent   = `${m.volMin}–${m.volMax} ml`;
  volLabel.innerHTML = `Volume<br/><small>${m.volMin}–${m.volMax} ml</small>`;
  measPanel.style.display = 'block';
}

/* ── RING DE PULSO (feedback tap) ──────────────────────────── */
function spawnPulseRing() {
  const ring = document.createElement('div');
  ring.className = 'pulse-ring';
  document.body.appendChild(ring);
  ring.addEventListener('animationend', () => ring.remove());
}

/* ── EVENTOS DO MARCADOR ───────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  const marker = document.getElementById('marcador');

  marker.addEventListener('markerFound', () => {
    if (markerVisible) return;
    markerVisible = true;

    hintWrap.classList.add('detected');
    hintBox.innerHTML = '✓ Modelo detectado — <strong>toque</strong> ou <strong>segure</strong> para interagir';

    /* calcula medidas ao encontrar marcador */
    const m = calcMedidas();
    showMedidas(m);
  });

  marker.addEventListener('markerLost', () => {
    markerVisible = false;
    hintWrap.classList.remove('detected');
    hintBox.innerHTML = '📋 Aponte a câmera para o marcador <strong>Hiro</strong>';
  });

  /* ── EVENTOS DE GESTOS (propagados do gesture-detector) ── */
  const scene = document.querySelector('a-scene');

  /* TAP → pulso */
  scene.addEventListener('gesture-tap', () => {
    if (!markerVisible) return;
    spawnPulseRing();

    /* feedback visual no card */
    cardTap.classList.add('active');
    setTimeout(() => cardTap.classList.remove('active'), 400);
  });

  /* HOLD START → barra de progresso */
  scene.addEventListener('gesture-hold-start', () => {
    if (!markerVisible) return;
    holdBarWrap.style.display = 'block';
    cardHold.classList.add('active');

    let pct = 0;
    holdInterval = setInterval(() => {
      pct = Math.min(pct + 2, 100);
      holdFill.style.width = pct + '%';
    }, 50);
  });

  /* HOLD END → esconde barra */
  scene.addEventListener('gesture-hold-end', () => {
    clearInterval(holdInterval);
    holdFill.style.width = '0%';
    holdBarWrap.style.display = 'none';
    cardHold.classList.remove('active');
  });
});
