/**
 * ExcaliCraft Overview Radar / Canvas Minimap
 * Provides a floating, real-time spatial radar that synchronizes bidirectionally with the main camera
 */

import { getElementBounds } from './math.js';

export class CanvasMinimap {
  constructor({ container, canvas, getElements, getCamera, setCamera, requestRender }) {
    this.container = container;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.getElements = getElements;
    this.getCamera = getCamera;
    this.setCamera = setCamera;
    this.requestRender = requestRender;

    this.isVisible = true;
    this.isDragging = false;
    this.transform = { scale: 1, offsetX: 0, offsetY: 0 };

    this.init();
  }

  init() {
    this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', () => this.onPointerUp());

    const closeBtn = document.getElementById('btn-close-minimap');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggle(false));
    }
  }

  toggle(forceState) {
    if (typeof forceState === 'boolean') {
      this.isVisible = forceState;
    } else {
      this.isVisible = !this.isVisible;
    }

    if (this.isVisible) {
      this.container.classList.remove('hidden');
      this.update();
    } else {
      this.container.classList.add('hidden');
    }
  }

  update() {
    if (!this.isVisible) return;

    const { ctx, canvas } = this;
    const dpr = window.devicePixelRatio || 1;
    const w = 200;
    const h = 130;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }

    ctx.save();
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // Clear minimap background
    ctx.fillStyle = document.body.classList.contains('theme-dark') ? '#1e1e1e' : '#f1f3f5';
    ctx.fillRect(0, 0, w, h);

    const elements = this.getElements() || [];
    const camera = this.getCamera();
    const { scrollX, scrollY, zoom, viewWidth, viewHeight } = camera;

    // Viewport camera bounds in scene coordinates
    const camX1 = -scrollX / zoom;
    const camY1 = -scrollY / zoom;
    const camX2 = (viewWidth - scrollX) / zoom;
    const camY2 = (viewHeight - scrollY) / zoom;

    // Calculate scene bounding box including camera viewport
    let minX = camX1;
    let minY = camY1;
    let maxX = camX2;
    let maxY = camY2;

    for (const el of elements) {
      const b = getElementBounds(el);
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width);
      maxY = Math.max(maxY, b.y + b.height);
    }

    // Add margin around scene
    const margin = 120;
    minX -= margin;
    minY -= margin;
    maxX += margin;
    maxY += margin;

    const sceneW = Math.max(maxX - minX, 100);
    const sceneH = Math.max(maxY - minY, 100);

    const pad = 8;
    const scale = Math.min((w - pad * 2) / sceneW, (h - pad * 2) / sceneH);
    const offsetX = (w - sceneW * scale) / 2 - minX * scale;
    const offsetY = (h - sceneH * scale) / 2 - minY * scale;

    this.transform = { scale, offsetX, offsetY, minX, minY, maxX, maxY };

    // 1. Draw elements
    for (const el of elements) {
      this.drawElementThumbnail(ctx, el, scale, offsetX, offsetY);
    }

    // 2. Draw Camera Viewport indicator
    const vx = camX1 * scale + offsetX;
    const vy = camY1 * scale + offsetY;
    const vw = (camX2 - camX1) * scale;
    const vh = (camY2 - camY1) * scale;

    ctx.save();
    ctx.fillStyle = 'rgba(25, 113, 194, 0.16)';
    ctx.fillRect(vx, vy, vw, vh);

    ctx.strokeStyle = '#1971c2';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(vx, vy, vw, vh);

    // Corner accent brackets
    const cSize = Math.min(6, vw / 4, vh / 4);
    ctx.strokeStyle = '#1864ab';
    ctx.lineWidth = 2.5;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(vx, vy + cSize);
    ctx.lineTo(vx, vy);
    ctx.lineTo(vx + cSize, vy);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(vx + vw - cSize, vy);
    ctx.lineTo(vx + vw, vy);
    ctx.lineTo(vx + vw, vy + cSize);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(vx + vw, vy + vh - cSize);
    ctx.lineTo(vx + vw, vy + vh);
    ctx.lineTo(vx + vw - cSize, vy + vh);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(vx + cSize, vy + vh);
    ctx.lineTo(vx, vy + vh);
    ctx.lineTo(vx, vy + vh - cSize);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  drawElementThumbnail(ctx, el, scale, offsetX, offsetY) {
    ctx.save();
    const bounds = getElementBounds(el);
    const mx = bounds.x * scale + offsetX;
    const my = bounds.y * scale + offsetY;
    const mw = Math.max(bounds.width * scale, 2);
    const mh = Math.max(bounds.height * scale, 2);

    const isFilled = el.backgroundColor && el.backgroundColor !== 'transparent' && el.fillStyle !== 'none';
    ctx.fillStyle = isFilled ? el.backgroundColor : (el.strokeColor || '#868e96');
    ctx.strokeStyle = el.strokeColor || '#868e96';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.75;

    if (el.type === 'rectangle' || el.type === 'text') {
      if (isFilled) ctx.fillRect(mx, my, mw, mh);
      ctx.strokeRect(mx, my, mw, mh);
    } else if (el.type === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(mx + mw / 2, my + mh / 2, mw / 2, mh / 2, 0, 0, Math.PI * 2);
      if (isFilled) ctx.fill();
      ctx.stroke();
    } else if (el.type === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(mx + mw / 2, my);
      ctx.lineTo(mx + mw, my + mh / 2);
      ctx.lineTo(mx + mw / 2, my + mh);
      ctx.lineTo(mx, my + mh / 2);
      ctx.closePath();
      if (isFilled) ctx.fill();
      ctx.stroke();
    } else if (el.type === 'line' || el.type === 'arrow') {
      const x1 = el.x * scale + offsetX;
      const y1 = el.y * scale + offsetY;
      const x2 = (el.x + el.width) * scale + offsetX;
      const y2 = (el.y + el.height) * scale + offsetY;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    } else if (el.type === 'freedraw' && el.points && el.points.length > 1) {
      ctx.beginPath();
      const p0 = el.points[0];
      ctx.moveTo(p0[0] * scale + offsetX, p0[1] * scale + offsetY);
      for (let i = 1; i < el.points.length; i++) {
        const pt = el.points[i];
        ctx.lineTo(pt[0] * scale + offsetX, pt[1] * scale + offsetY);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  onPointerDown(e) {
    e.preventDefault();
    this.isDragging = true;
    this.panCameraToMinimapPoint(e.clientX, e.clientY);
  }

  onPointerMove(e) {
    if (!this.isDragging) return;
    this.panCameraToMinimapPoint(e.clientX, e.clientY);
  }

  onPointerUp() {
    this.isDragging = false;
  }

  panCameraToMinimapPoint(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    const { scale, offsetX, offsetY } = this.transform;
    if (!scale) return;

    // Convert minimap pixel to world scene coordinate
    const targetSceneX = (mx - offsetX) / scale;
    const targetSceneY = (my - offsetY) / scale;

    const camera = this.getCamera();
    const { zoom, viewWidth, viewHeight } = camera;

    // Center camera onto scene point
    const newScrollX = viewWidth / 2 - targetSceneX * zoom;
    const newScrollY = viewHeight / 2 - targetSceneY * zoom;

    this.setCamera({ scrollX: newScrollX, scrollY: newScrollY });
    this.requestRender();
  }
}
