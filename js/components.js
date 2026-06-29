/* ============================================================
   SHAPESENSE AR v3 — COMPONENTS.JS
   Componentes A-Frame customizados para interação gestual
   Interação 1: gesture-tap → animação de pulso
   Interação 2: mousedown/mouseup → escala (pressione e segure)
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════════════════════════
   COMPONENTE: gesture-detector
   Emite eventos customizados de tap e hold no document/scene
══════════════════════════════════════════════════════════════ */
AFRAME.registerComponent('gesture-detector', {
  schema: {
    element: { default: '' }
  },

  init: function () {
    this.targetElement = this.el;

    /* bind dos handlers */
    this.onTouchStart  = this.onTouchStart.bind(this);
    this.onTouchEnd    = this.onTouchEnd.bind(this);
    this.onMouseDown   = this.onMouseDown.bind(this);
    this.onMouseUp     = this.onMouseUp.bind(this);

    this.touchStart    = null;
    this.holdTimer     = null;
    this.isHolding     = false;
    this.TAP_LIMIT_MS  = 250;   /* toque < 250ms = tap rápido */
    this.HOLD_MS       = 500;   /* pressionar > 500ms = hold  */

    /* touch (mobile) */
    this.el.sceneEl.canvas.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.el.sceneEl.canvas.addEventListener('touchend',   this.onTouchEnd,   { passive: true });

    /* mouse (desktop) */
    this.el.sceneEl.canvas.addEventListener('mousedown', this.onMouseDown);
    this.el.sceneEl.canvas.addEventListener('mouseup',   this.onMouseUp);
  },

  onTouchStart: function (e) {
    this.touchStart = Date.now();
    this.isHolding  = false;
    this.holdTimer  = setTimeout(() => {
      this.isHolding = true;
      this.el.emit('gesture-hold-start', {}, true);
    }, this.HOLD_MS);
  },

  onTouchEnd: function (e) {
    clearTimeout(this.holdTimer);
    const dur = Date.now() - (this.touchStart || 0);

    if (this.isHolding) {
      this.el.emit('gesture-hold-end', {}, true);
    } else if (dur < this.TAP_LIMIT_MS) {
      this.el.emit('gesture-tap', {}, true);
    }
    this.isHolding = false;
  },

  onMouseDown: function (e) {
    this.touchStart = Date.now();
    this.isHolding  = false;
    this.holdTimer  = setTimeout(() => {
      this.isHolding = true;
      this.el.emit('gesture-hold-start', {}, true);
    }, this.HOLD_MS);
  },

  onMouseUp: function (e) {
    clearTimeout(this.holdTimer);
    const dur = Date.now() - (this.touchStart || 0);

    if (this.isHolding) {
      this.el.emit('gesture-hold-end', {}, true);
    } else if (dur < this.TAP_LIMIT_MS) {
      this.el.emit('gesture-tap', {}, true);
    }
    this.isHolding = false;
  },

  remove: function () {
    clearTimeout(this.holdTimer);
    this.el.sceneEl.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.el.sceneEl.canvas.removeEventListener('touchend',   this.onTouchEnd);
    this.el.sceneEl.canvas.removeEventListener('mousedown',  this.onMouseDown);
    this.el.sceneEl.canvas.removeEventListener('mouseup',    this.onMouseUp);
  }
});


/* ══════════════════════════════════════════════════════════════
   COMPONENTE: gesture-handler
   Aplicado ao modelo 3D para escutar os eventos da cena
   e executar as animações/transformações localmente
══════════════════════════════════════════════════════════════ */
AFRAME.registerComponent('gesture-handler', {
  schema: {
    minScale: { type: 'number', default: 0.3 },
    maxScale: { type: 'number', default: 4.0 }
  },

  init: function () {
    this.baseScale    = { x: 1, y: 1, z: 1 };
    this.targetScale  = 1.0;
    this.currentScale = 1.0;
    this.isHolding    = false;
    this.holdRaf      = null;
    this.pulseActive  = false;

    /* refs */
    this.scene = this.el.sceneEl;

    /* bind */
    this.onTap       = this.onTap.bind(this);
    this.onHoldStart = this.onHoldStart.bind(this);
    this.onHoldEnd   = this.onHoldEnd.bind(this);

    this.scene.addEventListener('gesture-tap',        this.onTap);
    this.scene.addEventListener('gesture-hold-start', this.onHoldStart);
    this.scene.addEventListener('gesture-hold-end',   this.onHoldEnd);
  },

  /* ── INTERAÇÃO 1: TAP → pulso visual ── */
  onTap: function () {
    if (this.pulseActive) return;
    this.pulseActive = true;

    /* emite evento A-Frame para iniciar animação de pulso no halo */
    const halo = document.getElementById('halo');
    if (halo) halo.emit('startPulse');

    /* escala rápida (bounce) no modelo */
    const el = this.el;
    const cs = this.currentScale;
    el.setAttribute('animation__tap', {
      property: 'scale',
      from:  `${cs} ${cs} ${cs}`,
      to:    `${cs * 1.22} ${cs * 1.22} ${cs * 1.22}`,
      dur:   200,
      easing: 'easeOutQuad',
      loop:  false
    });
    setTimeout(() => {
      el.setAttribute('animation__tap', {
        property: 'scale',
        from:  `${cs * 1.22} ${cs * 1.22} ${cs * 1.22}`,
        to:    `${cs} ${cs} ${cs}`,
        dur:   250,
        easing: 'easeInQuad',
        loop:  false
      });
      setTimeout(() => {
        this.pulseActive = false;
        const halo = document.getElementById('halo');
        if (halo) halo.emit('stopPulse');
      }, 260);
    }, 210);
  },

  /* ── INTERAÇÃO 2: HOLD → aumenta escala gradualmente ── */
  onHoldStart: function () {
    this.isHolding = true;
    const el       = this.el;
    const maxS     = this.data.maxScale;

    const grow = () => {
      if (!this.isHolding) return;
      this.currentScale = Math.min(this.currentScale + 0.018, maxS);
      const s = this.currentScale;
      el.setAttribute('scale', `${s} ${s} ${s}`);
      this.holdRaf = requestAnimationFrame(grow);
    };
    this.holdRaf = requestAnimationFrame(grow);
  },

  onHoldEnd: function () {
    this.isHolding = false;
    cancelAnimationFrame(this.holdRaf);
  },

  remove: function () {
    this.scene.removeEventListener('gesture-tap',        this.onTap);
    this.scene.removeEventListener('gesture-hold-start', this.onHoldStart);
    this.scene.removeEventListener('gesture-hold-end',   this.onHoldEnd);
    cancelAnimationFrame(this.holdRaf);
  }
});
