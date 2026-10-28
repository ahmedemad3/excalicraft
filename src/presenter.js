/**
 * ExcaliCraft Presentation Stage Mode Controller
 * Provides a clean, distraction-free stage with automated Zoom-to-Fit framing and essential controls (Fit, Exit)
 */

import { calculateZoomToFit } from './math.js';

export class PresentationController {
  constructor({ getElements, getCamera, setCamera, requestRender }) {
    this.getElements = getElements;
    this.getCamera = getCamera;
    this.setCamera = setCamera;
    this.requestRender = requestRender;

    this.isActive = false;
    this.controlsEl = document.getElementById('presentationControls');

    this.init();
  }

  init() {
    const exitBtn = document.getElementById('btn-pres-exit');
    if (exitBtn) {
      exitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.exit();
      });
    }

    const fitBtn = document.getElementById('btn-pres-fit');
    if (fitBtn) {
      fitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.zoomToFit();
      });
    }
  }

  toggle() {
    if (this.isActive) {
      this.exit();
    } else {
      this.enter();
    }
  }

  enter() {
    this.isActive = true;
    document.body.classList.add('mode-presentation');

    if (this.controlsEl) {
      this.controlsEl.style.display = 'flex';
    }

    // Auto Zoom-to-Fit on enter with slight delay to ensure layout reflow
    setTimeout(() => this.zoomToFit(), 60);
  }

  exit() {
    this.isActive = false;
    document.body.classList.remove('mode-presentation');

    if (this.controlsEl) {
      this.controlsEl.style.display = 'none';
    }

    this.requestRender();
  }

  zoomToFit() {
    const elements = (this.getElements() || []).filter(el => !el.isDeleted);
    const camera = this.getCamera();
    const viewWidth = window.innerWidth || camera.viewWidth || 1200;
    const viewHeight = window.innerHeight || camera.viewHeight || 800;

    const fit = calculateZoomToFit(elements, viewWidth, viewHeight, 80);

    this.setCamera({
      zoom: fit.zoom,
      scrollX: fit.scrollX,
      scrollY: fit.scrollY
    });

    const zoomDisplay = document.getElementById('zoomDisplay');
    if (zoomDisplay) {
      zoomDisplay.textContent = `${Math.round(fit.zoom * 100)}%`;
    }

    this.requestRender();
  }
}
