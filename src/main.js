/**
 * ExcaliCraft Main Controller
 * Orchestrates canvas interaction, tool state machines, inspector binding, and live telemetry
 */

import { createIcons, icons } from 'lucide';
import rough from 'roughjs';
import {
  generateId,
  generateSeed,
  screenToScene,
  sceneToScreen,
  normalizeElement,
  hitTest,
  getElementBounds,
  getResizeHandles,
  hitTestHandle,
  calculateZoomToFit,
  getOrthogonalArrowPoints,
  getOrthogonalWaypointHandles
} from './math.js';
import { SceneRenderer } from './renderer.js';
import { HistoryManager } from './history.js';
import { exportToPng, exportToSvg, exportToPdf, exportToGif, exportToJson, importFromJson } from './export.js';
import { getTemplateElements } from './templates.js';
import { CanvasMinimap } from './minimap.js';
import { PresentationController } from './presenter.js';
import { ARCHITECTURE_ICONS, getLucideSvg } from './icons.js';
import { ArchitectureGraph } from './graph.js';
import { generateSqlDdl, generateTableDdl, downloadSqlFile, copySqlToClipboard } from './codegen.js';
import { exportToMermaid, importFromMermaid } from './mermaid.js';

// ==========================================================================
// Palettes & Presets
// ==========================================================================
const STROKE_COLORS = [
  '#1e1e1e', '#e03131', '#2f9e44', '#1971c2', '#f08c00',
  '#9c36b5', '#495057', '#0ca678', '#f76707', '#000000'
];

const BG_COLORS = [
  'transparent', '#ffc9c9', '#b2f2bb', '#a5d8ff', '#ffec99',
  '#eebefa', '#dee2e6', '#c3fae8', '#ffd8a8', '#ffffff'
];

// Local state persistence key (ISSUE-12)
const AUTOSAVE_STORAGE_KEY = 'excalidraw_craft_autosave_v1';

// Default sample diagram
function createWelcomeElements() {
  return [
    {
      id: generateId(),
      type: 'rectangle',
      x: 120,
      y: 140,
      width: 220,
      height: 120,
      angle: 0,
      strokeColor: '#1971c2',
      backgroundColor: '#a5d8ff',
      fillStyle: 'hachure',
      strokeWidth: 2.5,
      strokeStyle: 'solid',
      roughness: 1.2,
      opacity: 100,
      seed: 84920412
    },
    {
      id: generateId(),
      type: 'text',
      x: 145,
      y: 180,
      text: "ExcaliCraft\nInteractive Engine",
      fontSize: 26,
      strokeColor: '#1864ab',
      roughness: 1.2,
      opacity: 100,
      seed: 129481
    },
    {
      id: generateId(),
      type: 'arrow',
      x: 340,
      y: 200,
      width: 130,
      height: 0,
      angle: 0,
      strokeColor: '#495057',
      backgroundColor: 'transparent',
      fillStyle: 'none',
      strokeWidth: 2.5,
      strokeStyle: 'solid',
      roughness: 1.2,
      opacity: 100,
      seed: 9481230
    },
    {
      id: generateId(),
      type: 'ellipse',
      x: 470,
      y: 135,
      width: 210,
      height: 130,
      angle: 0,
      strokeColor: '#2f9e44',
      backgroundColor: '#b2f2bb',
      fillStyle: 'cross-hatch',
      strokeWidth: 2.5,
      strokeStyle: 'solid',
      roughness: 1.2,
      opacity: 100,
      seed: 3948102
    },
    {
      id: generateId(),
      type: 'text',
      x: 505,
      y: 180,
      text: "Rough.js\nSketch Geometry",
      fontSize: 26,
      strokeColor: '#2b8a3e',
      roughness: 1.2,
      opacity: 100,
      seed: 492019
    },
    {
      id: generateId(),
      type: 'arrow',
      x: 680,
      y: 200,
      width: 120,
      height: 0,
      angle: 0,
      strokeColor: '#495057',
      backgroundColor: 'transparent',
      fillStyle: 'none',
      strokeWidth: 2.5,
      strokeStyle: 'solid',
      roughness: 1.2,
      opacity: 100,
      seed: 7123984
    },
    {
      id: generateId(),
      type: 'diamond',
      x: 800,
      y: 130,
      width: 170,
      height: 140,
      angle: 0,
      strokeColor: '#e03131',
      backgroundColor: '#ffc9c9',
      fillStyle: 'hachure',
      strokeWidth: 2.5,
      strokeStyle: 'solid',
      roughness: 1.2,
      opacity: 100,
      seed: 5829103
    },
    {
      id: generateId(),
      type: 'text',
      x: 825,
      y: 185,
      text: "60 FPS\nCanvas",
      fontSize: 26,
      strokeColor: '#c92a2a',
      roughness: 1.2,
      opacity: 100,
      seed: 692819
    },
    {
      id: generateId(),
      type: 'text',
      x: 130,
      y: 320,
      text: "⚡ Click any element to inspect its exact Excalidraw JSON schema and Rough.js seed!",
      fontSize: 24,
      strokeColor: '#868e96',
      roughness: 1,
      opacity: 100,
      seed: 391024
    }
  ];
}

class App {
  constructor() {
    this.canvas = document.getElementById('drawingCanvas');
    this.renderer = new SceneRenderer(this.canvas);

    // Auto-save session restore check (ISSUE-12)
    const saved = this.loadAutoSave();
    let initialElements = null;
    this._restoredFromAutosave = false;

    if (saved && Array.isArray(saved.elements) && saved.elements.length > 0) {
      initialElements = saved.elements;
      this.scrollX = Number.isFinite(saved.scrollX) ? saved.scrollX : 40;
      this.scrollY = Number.isFinite(saved.scrollY) ? saved.scrollY : 40;
      this.zoom = Number.isFinite(saved.zoom) ? saved.zoom : 1.0;
      this.theme = (saved.theme === 'dark' || saved.theme === 'light') ? saved.theme : 'light';
      this.canvasBackground = saved.canvasBackground || '#ffffff';
      this._restoredFromAutosave = true;
    } else {
      initialElements = createWelcomeElements();
      this.scrollX = 40;
      this.scrollY = 40;
      this.zoom = 1.0;
      this.theme = 'light';
      this.canvasBackground = '#ffffff';
    }

    this.history = new HistoryManager(initialElements);

    this.showGrid = true;

    // Application state
    this.currentTool = 'select';
    this.isToolLocked = false;
    this.elements = this.history.undoStack[0];
    this.selectedElementIds = new Set();
    this.previewElement = null;
    this.selectionBox = null;
    this.clipboard = [];

    // Default style presets for new shapes
    this.activeStyles = {
      strokeColor: '#1e1e1e',
      backgroundColor: '#a5d8ff',
      fillStyle: 'none',
      strokeWidth: 2.5,
      roughness: 1.2,
      strokeStyle: 'solid',
      opacity: 100
    };

    // Interaction state flags
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.isDraggingElement = false;
    this.dragOffsets = new Map();
    this.isResizing = false;
    this.activeHandle = null;
    this.resizeOrigin = null;
    this.isRotating = false;
    this.rotationCenter = null;
    this.isDrawing = false;
    this.drawStart = { x: 0, y: 0 };
    this.spacePressed = false;

    // Quantitative Modeling & System Reliability Graph Engine (Sprint 3)
    this.showMetricsOverlay = false;
    this.graphDirty = true;
    this.cachedGraph = null;
    this.cachedSpofNodeIds = new Set();
    this.cachedCapacityMetrics = new Map();

    this.init();
  }

  toggleMetricsOverlay() {
    this.showMetricsOverlay = !this.showMetricsOverlay;
    const btn = document.getElementById('btn-metrics-toggle');
    if (btn) {
      btn.classList.toggle('active', this.showMetricsOverlay);
    }
    this.graphDirty = true;
    this.render();
  }

  init() {
    this.initIcons();
    this.bindEvents();
    this.initPalettes();
    this.initDemoPlayground();
    this.initMinimap();
    this.initPresenter();
    this.initTemplates();
    this.initOnboarding();
    this.initConfirmModal();
    this.initShortcutsModal();
    this.startAnimationLoop();
    if (this.canvas) {
      this.canvas.style.backgroundColor = this.canvasBackground;
    }
    this.updateInspectorUI();
    this.handleResize();
    this.render();
    this.updateEmptyState();

    if (this._restoredFromAutosave) {
      setTimeout(() => {
        this.showToast('Restored previous diagram session', 'info', 2800);
      }, 400);
    }

    // Subscribe to history changes for undo/redo button states & auto-save (ISSUE-12)
    this.history.subscribe(({ canUndo, canRedo }) => {
      const btnUndo = document.getElementById('btn-undo');
      const btnRedo = document.getElementById('btn-redo');
      if (btnUndo) btnUndo.disabled = !canUndo;
      if (btnRedo) btnRedo.disabled = !canRedo;
      this.scheduleAutoSave();
      this.updateEmptyState();
    });
  }

  startAnimationLoop() {
    const loop = () => {
      const hasAnimated = this.elements && this.elements.some(el =>
        (el.type === 'arrow' || el.type === 'line' || el.type === 'elbow-arrow') && el.isAnimated === true
      );
      if (hasAnimated) {
        this.render();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // ==========================================================================
  // Toast Notification System (ISSUE-15)
  // ==========================================================================
  showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const pill = document.createElement('div');
    pill.className = `toast-pill toast-${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle-2';
    if (type === 'error') iconName = 'alert-triangle';

    pill.innerHTML = `
      <span class="toast-icon"><i data-lucide="${iconName}"></i></span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(pill);
    createIcons({ icons });

    setTimeout(() => {
      pill.style.opacity = '0';
      pill.style.transform = 'translateY(12px) scale(0.95)';
      setTimeout(() => pill.remove(), 260);
    }, duration);
  }

  // ==========================================================================
  // Local State Persistence & Auto-Save (ISSUE-12)
  // ==========================================================================
  scheduleAutoSave() {
    if (this._autoSaveTimer) clearTimeout(this._autoSaveTimer);
    this._autoSaveTimer = setTimeout(() => {
      this.saveToLocalStorage();
    }, 400);
  }

  saveToLocalStorage() {
    try {
      const cleanElements = this.elements.map(el => {
        const copy = { ...el };
        delete copy._drawable;
        delete copy._cacheKey;
        return copy;
      });
      const payload = {
        version: '1.0',
        timestamp: Date.now(),
        elements: cleanElements,
        scrollX: this.scrollX,
        scrollY: this.scrollY,
        zoom: this.zoom,
        theme: this.theme,
        canvasBackground: this.canvasBackground
      };
      localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('[AutoSave] Could not persist to localStorage:', err);
    }
  }

  loadAutoSave() {
    try {
      const raw = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.elements)) {
        return data;
      }
    } catch (err) {
      console.warn('[AutoSave] Failed to read auto-save:', err);
    }
    return null;
  }

  // ==========================================================================
  // Confirmation Modal Dialog (ISSUE-13)
  // ==========================================================================
  initConfirmModal() {
    const modal = document.getElementById('confirmModal');
    const btnClose = document.getElementById('btn-close-confirm-modal');
    const btnCancel = document.getElementById('btn-cancel-confirm');
    if (btnClose && modal) {
      btnClose.addEventListener('click', () => { modal.style.display = 'none'; });
    }
    if (btnCancel && modal) {
      btnCancel.addEventListener('click', () => { modal.style.display = 'none'; });
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    }
  }

  showConfirmDialog({ title, message, actionLabel = 'Confirm', onConfirm }) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmModalTitle');
    const msgEl = document.getElementById('confirmModalMessage');
    const labelEl = document.getElementById('confirmActionLabel');
    const btnAction = document.getElementById('btn-action-confirm');
    const btnCancel = document.getElementById('btn-cancel-confirm');
    const btnClose = document.getElementById('btn-close-confirm-modal');

    if (!modal) return;

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.innerHTML = message;
    if (labelEl) labelEl.textContent = actionLabel;

    modal.style.display = 'flex';
    createIcons({ icons });

    const closeDialog = () => {
      modal.style.display = 'none';
      btnAction.onclick = null;
      btnCancel.onclick = null;
      btnClose.onclick = null;
    };

    btnCancel.onclick = closeDialog;
    btnClose.onclick = closeDialog;
    modal.onclick = (e) => { if (e.target === modal) closeDialog(); };

    btnAction.onclick = () => {
      closeDialog();
      if (typeof onConfirm === 'function') onConfirm();
    };
  }

  // ==========================================================================
  // First-Time User Onboarding & Empty State (ISSUE-14)
  // ==========================================================================
  updateEmptyState() {
    const card = document.getElementById('welcomeOnboarding');
    if (!card) return;
    if (this.elements.length === 0) {
      card.style.display = 'block';
      createIcons({ icons });
    } else {
      card.style.display = 'none';
    }
  }

  initOnboarding() {
    document.querySelectorAll('#welcomeOnboarding [data-onboarding-template]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tplKey = btn.dataset.onboardingTemplate;
        const newElements = getTemplateElements(tplKey);
        if (newElements && newElements.length > 0) {
          this.elements = newElements;
          this.selectedElementIds.clear();
          this.history.record(this.elements);
          this.scheduleAutoSave();

          const fit = calculateZoomToFit(this.elements, this.canvas.clientWidth, this.canvas.clientHeight, 60);
          this.zoom = fit.zoom;
          this.scrollX = fit.scrollX;
          this.scrollY = fit.scrollY;
          document.getElementById('zoomDisplay').textContent = `${Math.round(this.zoom * 100)}%`;

          this.updateEmptyState();
          this.updateInspectorUI();
          this.render();
          const tplTitle = btn.querySelector('strong')?.textContent || tplKey;
          this.showToast(`Loaded "${tplTitle}" template`, 'success');
        }
      });
    });

    document.getElementById('btn-onboarding-blank')?.addEventListener('click', () => {
      const card = document.getElementById('welcomeOnboarding');
      if (card) card.style.display = 'none';
      this.showToast('Started blank canvas. Select a tool to begin sketching!', 'info', 2500);
    });
  }

  // ==========================================================================
  // Keyboard Shortcuts Cheat Sheet Modal (ISSUE-16)
  // ==========================================================================
  initShortcutsModal() {
    const modal = document.getElementById('shortcutsModal');
    const btnHelp = document.getElementById('btn-shortcuts-help');
    const btnClose = document.getElementById('btn-close-shortcuts-modal');

    if (btnHelp && modal) {
      btnHelp.addEventListener('click', () => {
        modal.style.display = 'flex';
        createIcons({ icons });
      });
    }

    if (btnClose && modal) {
      btnClose.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    }
  }

  initIcons() {
    createIcons({ icons });
  }

  initMinimap() {
    const container = document.getElementById('minimapContainer');
    const canvas = document.getElementById('minimapCanvas');
    if (!container || !canvas) return;

    this.minimap = new CanvasMinimap({
      container,
      canvas,
      getElements: () => this.elements,
      getCamera: () => ({
        scrollX: this.scrollX,
        scrollY: this.scrollY,
        zoom: this.zoom,
        viewWidth: this.canvas.clientWidth,
        viewHeight: this.canvas.clientHeight
      }),
      setCamera: ({ scrollX, scrollY }) => {
        if (scrollX !== undefined) this.scrollX = scrollX;
        if (scrollY !== undefined) this.scrollY = scrollY;
      },
      requestRender: () => this.render()
    });
  }

  initPresenter() {
    this.presenter = new PresentationController({
      getElements: () => this.elements,
      getCamera: () => ({
        scrollX: this.scrollX,
        scrollY: this.scrollY,
        zoom: this.zoom,
        viewWidth: this.canvas.clientWidth,
        viewHeight: this.canvas.clientHeight
      }),
      setCamera: ({ scrollX, scrollY, zoom }) => {
        if (scrollX !== undefined) this.scrollX = scrollX;
        if (scrollY !== undefined) this.scrollY = scrollY;
        if (zoom !== undefined) this.zoom = zoom;
      },
      requestRender: () => this.render()
    });

    const presentBtn = document.getElementById('btn-present');
    if (presentBtn) {
      presentBtn.addEventListener('click', () => this.presenter.toggle());
    }
  }

  initTemplates() {
    const menuBtn = document.getElementById('btn-templates-menu');
    const wrapper = document.getElementById('templatesDropdownWrapper');
    const menu = document.getElementById('templatesDropdownMenu');
    if (!menuBtn || !wrapper || !menu) return;

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.toggle('open');
      menu.style.display = isOpen ? 'flex' : 'none';
    });

    window.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
        menu.style.display = 'none';
      }
    });

    document.querySelectorAll('.dropdown-item[data-template]').forEach(item => {
      item.addEventListener('click', () => {
        const tplKey = item.dataset.template;
        const newElements = getTemplateElements(tplKey);
        if (newElements && newElements.length > 0) {
          this.elements = newElements;
          this.selectedElementIds.clear();
          this.history.record(this.elements);

          // Auto Zoom to fit newly generated template
          const fit = calculateZoomToFit(this.elements, this.canvas.clientWidth, this.canvas.clientHeight, 60);
          this.zoom = fit.zoom;
          this.scrollX = fit.scrollX;
          this.scrollY = fit.scrollY;
          document.getElementById('zoomDisplay').textContent = `${Math.round(this.zoom * 100)}%`;

          wrapper.classList.remove('open');
          menu.style.display = 'none';
          this.updateInspectorUI();
          this.render();
        }
      });
    });
  }

  render() {
    if (this.graphDirty || !this.cachedGraph) {
      this.cachedGraph = new ArchitectureGraph(this.elements);
      this.cachedSpofNodeIds = this.cachedGraph.detectSpofs();
      this.cachedCapacityMetrics = this.cachedGraph.analyzeCapacity();
      this.graphDirty = false;
    }

    const selectedElements = this.elements.filter(el => this.selectedElementIds.has(el.id));
    this.renderer.render({
      elements: this.elements,
      selectedElements,
      scrollX: this.scrollX,
      scrollY: this.scrollY,
      zoom: this.zoom,
      showGrid: this.showGrid,
      theme: this.theme,
      canvasBackground: this.canvasBackground,
      selectionBox: this.selectionBox,
      previewElement: this.previewElement,
      metricsOverlay: this.showMetricsOverlay,
      spofNodeIds: this.cachedSpofNodeIds,
      capacityMetrics: this.cachedCapacityMetrics
    });
    this.updateTelemetryBox();
    this.minimap?.update();
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.resize(width, height);
    this.render();
  }

  // ==========================================================================
  // Inspector & Color Swatches Setup
  // ==========================================================================
  initPalettes() {
    const strokeContainer = document.getElementById('strokeColorPalette');
    const bgContainer = document.getElementById('bgColorPalette');

    // Stroke swatches (5 primary quick colors matching Excalidraw UI)
    strokeContainer.innerHTML = '';
    STROKE_COLORS.slice(0, 5).forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = `color-swatch ${color === this.activeStyles.strokeColor ? 'active' : ''}`;
      swatch.style.backgroundColor = color;
      swatch.dataset.color = color;
      swatch.title = color;
      swatch.addEventListener('click', () => this.setStrokeColor(color));
      strokeContainer.appendChild(swatch);
    });

    // Background swatches (5 primary quick colors matching Excalidraw UI)
    bgContainer.innerHTML = '';
    BG_COLORS.slice(0, 5).forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = `color-swatch ${color === 'transparent' ? 'transparent-swatch' : ''} ${color === this.activeStyles.backgroundColor ? 'active' : ''}`;
      if (color !== 'transparent') swatch.style.backgroundColor = color;
      swatch.dataset.color = color;
      swatch.title = color === 'transparent' ? 'Transparent' : color;
      swatch.addEventListener('click', () => this.setBackgroundColor(color));
      bgContainer.appendChild(swatch);
    });

    // Canvas background swatches (First element in properties - Excalidraw standard)
    const canvasBgContainer = document.getElementById('canvasBgColorPalette');
    if (canvasBgContainer) {
      canvasBgContainer.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
          this.setCanvasBackground(swatch.dataset.color);
        });
      });
    }
    const customCanvasBgInput = document.getElementById('customCanvasBgColor');
    if (customCanvasBgInput) {
      customCanvasBgInput.addEventListener('input', (e) => {
        this.setCanvasBackground(e.target.value);
      });
    }

    // Architecture Icon Picker Grid with Provider Filter
    this.renderIconPicker('all');
    document.querySelectorAll('#iconProviderFilter .arch-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#iconProviderFilter .arch-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderIconPicker(btn.dataset.provider);
      });
    });

    // Architecture Accent Swatches (Nodes, C4 Primitives, ERD Tables, States, Swimlanes, Diamonds, Actions)
    ['nodeAccentPalette', 'c4AccentPalette', 'erdTableAccentPalette', 'stateAccentPalette', 'swimlaneAccentPalette', 'diamondAccentPalette', 'actionAccentPalette'].forEach(palId => {
      const container = document.getElementById(palId);
      if (container) {
        const accents = palId === 'c4AccentPalette'
          ? ['#08427b', '#1168bd', '#438dd5', '#85bbf0', '#6c757d', '#495057', '#2b8a3e', '#e03131']
          : ['#1971c2', '#4263eb', '#0ca678', '#f08c00', '#e03131', '#9c36b5', '#0c8599', '#343a40'];
        container.innerHTML = '';
        accents.forEach(color => {
          const swatch = document.createElement('div');
          swatch.className = 'arch-color-swatch';
          swatch.style.backgroundColor = color;
          swatch.dataset.color = color;
          swatch.addEventListener('click', () => {
            this.applyStyleToSelection('themeColor', color);
            this.applyStyleToSelection('strokeColor', color);
            this.applyStyleToSelection('color', color);
            this.updateInspectorUI();
            this.render();
          });
          container.appendChild(swatch);
        });
      }
    });

    this.initIcons();
  }

  renderIconPicker(provider = 'all') {
    const iconGrid = document.getElementById('nodeIconPickerGrid');
    if (!iconGrid) return;
    iconGrid.innerHTML = '';
    const filtered = provider === 'all' 
      ? ARCHITECTURE_ICONS 
      : ARCHITECTURE_ICONS.filter(item => item.provider === provider);

    const selectedElements = this.elements.filter(el => this.selectedElementIds.has(el.id));
    const activeIcon = selectedElements.length === 1 && selectedElements[0].type === 'node' 
      ? selectedElements[0].icon 
      : 'Server';

    filtered.forEach(item => {
      const btn = document.createElement('button');
      btn.className = `arch-icon-btn ${item.name === activeIcon ? 'active' : ''}`;
      btn.dataset.icon = item.name;
      btn.dataset.provider = item.provider;
      btn.title = `${item.label} (${item.provider.toUpperCase()})`;
      const svgIcon = getLucideSvg(item.name, 'currentColor', 16);
      btn.innerHTML = `${svgIcon}<span>${item.name}</span>`;
      btn.addEventListener('click', () => {
        this.applyStyleToSelection('icon', item.name);
        if (item.color) {
          this.applyStyleToSelection('themeColor', item.color);
        }
        this.updateInspectorUI();
        this.render();
      });
      iconGrid.appendChild(btn);
    });
    this.initIcons();
  }

  setStrokeColor(color) {
    this.activeStyles.strokeColor = color;
    const customInput = document.getElementById('customStrokeColor');
    if (customInput) customInput.value = color.startsWith('#') && color.length === 7 ? color : '#1e1e1e';
    const hex = document.getElementById('strokeColorHex');
    if (hex) hex.textContent = color;
    this.applyStyleToSelection('strokeColor', color);
    this.updateInspectorUI();
    this.render();
  }

  setBackgroundColor(color) {
    this.activeStyles.backgroundColor = color;
    const customInput = document.getElementById('customBgColor');
    const hex = document.getElementById('bgColorHex');
    if (color !== 'transparent') {
      if (customInput) customInput.value = color.startsWith('#') && color.length === 7 ? color : '#a5d8ff';
      if (hex) hex.textContent = color;
      if (this.activeStyles.fillStyle === 'none') {
        this.activeStyles.fillStyle = 'solid';
      }
      for (const el of this.elements) {
        if (this.selectedElementIds.has(el.id)) {
          if (!el.fillStyle || el.fillStyle === 'none') {
            el.fillStyle = 'solid';
          }
        }
      }
    } else {
      if (hex) hex.textContent = 'None';
    }
    this.applyStyleToSelection('backgroundColor', color);
    this.updateInspectorUI();
    this.render();
  }

  setCanvasBackground(color) {
    if (!color) return;
    this.canvasBackground = color;
    if (this.canvas) {
      this.canvas.style.backgroundColor = color;
    }
    this.scheduleAutoSave();
    this.updateInspectorUI();
    this.render();
  }

  saveAutoSave() {
    this.scheduleAutoSave();
  }

  applyStyleToSelection(key, value) {
    if (this.selectedElementIds.size === 0) return;
    let modified = false;
    for (const el of this.elements) {
      if (this.selectedElementIds.has(el.id)) {
        if (value === undefined) {
          delete el[key];
        } else {
          el[key] = value;
        }
        el._cacheKey = null; // Invalidate cache
        modified = true;
      }
    }
    if (modified) {
      this.graphDirty = true;
      this.history.record(this.elements);
    }
  }

  updateInspectorUI() {
    const selectedElements = this.elements.filter(el => this.selectedElementIds.has(el.id));
    const badge = document.getElementById('selectionCountBadge');
    const openBtn = document.getElementById('btn-open-properties');

    if (openBtn) {
      const span = openBtn.querySelector('span');
      if (span) {
        span.textContent = selectedElements.length > 0 
          ? `Properties (${selectedElements.length})` 
          : 'Properties';
      }
    }

    // Dynamic Context Sections
    const nodeSec = document.getElementById('nodeInspectorSection');
    const c4Sec = document.getElementById('c4InspectorSection');
    const connSec = document.getElementById('connectorInspectorSection');
    const groupSec = document.getElementById('groupInspectorSection');
    const erdSec = document.getElementById('erdTableInspectorSection');
    const stateSec = document.getElementById('stateNodeInspectorSection');
    const swimlaneSec = document.getElementById('swimlaneInspectorSection');
    const actBoxSec = document.getElementById('activationBoxInspectorSection');
    const diamondSec = document.getElementById('diamondInspectorSection');
    const actionSec = document.getElementById('actionNodeInspectorSection');
    const quickAddSec = document.getElementById('canvasQuickAddSection');
    const standardSec = document.getElementById('standardShapeSection');

    if (nodeSec) nodeSec.style.display = 'none';
    if (c4Sec) c4Sec.style.display = 'none';
    if (connSec) connSec.style.display = 'none';
    if (groupSec) groupSec.style.display = 'none';
    if (erdSec) erdSec.style.display = 'none';
    if (stateSec) stateSec.style.display = 'none';
    if (swimlaneSec) swimlaneSec.style.display = 'none';
    if (actBoxSec) actBoxSec.style.display = 'none';
    if (diamondSec) diamondSec.style.display = 'none';
    if (actionSec) actionSec.style.display = 'none';
    if (quickAddSec) quickAddSec.style.display = 'none';
    if (standardSec) standardSec.style.display = 'none';

    // Update Canvas Background palette active swatch
    const canvasBgSwatches = document.querySelectorAll('#canvasBgColorPalette .color-swatch');
    canvasBgSwatches.forEach(swatch => {
      const match = swatch.dataset.color.toLowerCase() === (this.canvasBackground || '#ffffff').toLowerCase();
      swatch.classList.toggle('active', match);
    });
    const customCanvasBg = document.getElementById('customCanvasBgColor');
    if (customCanvasBg && this.canvasBackground && this.canvasBackground.startsWith('#')) {
      customCanvasBg.value = this.canvasBackground;
    }

    if (selectedElements.length === 0) {
      badge.textContent = 'Architecture';
      badge.style.background = 'var(--bg-hover)';
      badge.style.color = 'var(--text-muted)';
      if (quickAddSec) quickAddSec.style.display = 'flex';
      if (standardSec) standardSec.style.display = 'block';
    } else if (selectedElements.length === 1) {
      const el = selectedElements[0];
      badge.textContent = el.type.toUpperCase();
      badge.style.background = 'var(--primary-light)';
      badge.style.color = 'var(--primary)';
      if (standardSec) standardSec.style.display = 'block';

      if (el.type === 'erd-table') {
        if (erdSec) erdSec.style.display = 'flex';
        const nameInput = document.getElementById('propErdTableName');
        const typeInput = document.getElementById('propErdTableType');
        if (nameInput) nameInput.value = el.tableName || el.title || '';
        if (typeInput) typeInput.value = el.tableType || el.badge || 'BASE TABLE';

        document.querySelectorAll('#erdTableAccentPalette .arch-color-swatch').forEach(s => {
          s.classList.toggle('active', s.dataset.color === (el.themeColor || '#1971c2'));
        });

        this.renderErdColumnsInspector(el);
      } else if (el.type === 'state-node') {
        if (stateSec) stateSec.style.display = 'flex';
        const titleInput = document.getElementById('propStateTitle');
        const actionsField = document.getElementById('stateActionsField');
        const actionsInput = document.getElementById('propStateActions');

        if (titleInput) titleInput.value = el.title || '';
        const st = el.stateType || 'normal';
        document.querySelectorAll('#stateTypeControl .segment-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.stateType === st);
        });

        if (actionsField) {
          actionsField.style.display = (st === 'initial' || st === 'final') ? 'none' : 'block';
        }
        if (actionsInput) {
          actionsInput.value = Array.isArray(el.actions) ? el.actions.join('\n') : (el.actions || '');
        }

        document.querySelectorAll('#stateAccentPalette .arch-color-swatch').forEach(s => {
          s.classList.toggle('active', s.dataset.color === (el.color || '#f76707'));
        });
      } else if (el.type === 'swimlane') {
        if (swimlaneSec) swimlaneSec.style.display = 'flex';
        const titleInput = document.getElementById('propSwimlaneTitle');
        if (titleInput) titleInput.value = el.title || '';

        document.querySelectorAll('#swimlaneAccentPalette .arch-color-swatch').forEach(s => {
          s.classList.toggle('active', s.dataset.color === (el.color || '#2f9e44'));
        });
      } else if (el.type === 'activation-box') {
        if (actBoxSec) actBoxSec.style.display = 'flex';
        const heightInput = document.getElementById('propActivationHeight');
        if (heightInput) heightInput.value = el.height || 80;
      } else if (el.type === 'node') {
        if (nodeSec) nodeSec.style.display = 'flex';
        const titleInput = document.getElementById('propNodeTitle');
        const subInput = document.getElementById('propNodeSubtitle');
        const badgeInput = document.getElementById('propNodeBadge');
        if (titleInput) titleInput.value = el.title || '';
        if (subInput) subInput.value = el.subtitle || '';
        if (badgeInput) badgeInput.value = el.badge || '';

        document.querySelectorAll('#nodeIconPickerGrid .arch-icon-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.icon === (el.icon || 'Server'));
        });
        document.querySelectorAll('#nodeAccentPalette .arch-color-swatch').forEach(s => {
          s.classList.toggle('active', s.dataset.color === (el.themeColor || el.strokeColor || '#1971c2'));
        });
        document.querySelectorAll('#nodeCardStyleControl .segment-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.cardStyle === (el.cardStyle || 'modern'));
        });

        // C4 Model Hierarchy Level
        const c4Level = el.c4Level || '';
        document.querySelectorAll('#nodeC4LevelControl .segment-btn').forEach(b => {
          b.classList.toggle('active', (b.dataset.c4Level || '') === c4Level);
        });

        // Node Processing Latency & Capacity Limits & SPOF
        const nodeLatInput = document.getElementById('propNodeLatency');
        const nodeCapInput = document.getElementById('propNodeCapacity');
        const nodeSpofInput = document.getElementById('propNodeIsSpof');
        if (nodeLatInput) nodeLatInput.value = el.latencyMs !== undefined ? el.latencyMs : '';
        if (nodeCapInput) nodeCapInput.value = el.maxCapacityQps !== undefined ? el.maxCapacityQps : '';
        if (nodeSpofInput) nodeSpofInput.checked = !!(el.isSpof || el.spof);
      } else if (el.type === 'arrow' || el.type === 'line' || el.type === 'elbow-arrow') {
        if (connSec) connSec.style.display = 'flex';
        if (standardSec) standardSec.style.display = 'block';

        const labelInput = document.getElementById('propArrowLabel');
        const animatedCheckbox = document.getElementById('propArrowAnimated');
        if (labelInput) labelInput.value = el.label || '';
        if (animatedCheckbox) animatedCheckbox.checked = !!el.isAnimated;

        const qpsInput = document.getElementById('propConnectorQps');
        const connLatInput = document.getElementById('propConnectorLatency');
        if (qpsInput) qpsInput.value = el.qps !== undefined ? el.qps : '';
        if (connLatInput) connLatInput.value = el.latencyMs !== undefined ? el.latencyMs : '';

        const routing = el.routing || (el.type === 'elbow-arrow' ? 'orthogonal' : 'straight');
        document.querySelectorAll('#arrowRoutingControl .segment-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.arrowRouting === routing);
        });

        document.querySelectorAll('#arrowDirectionControl .segment-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.arrowDirection === (el.direction || 'forward'));
        });
      } else if (el.type === 'group-boundary') {
        if (groupSec) groupSec.style.display = 'flex';
        if (standardSec) standardSec.style.display = 'block';

        const groupTitleInput = document.getElementById('propGroupTitle');
        if (groupTitleInput) groupTitleInput.value = el.title || '';

        const groupCidrInput = document.getElementById('propGroupCidr');
        if (groupCidrInput) groupCidrInput.value = el.cidr || '';

        const bType = el.boundaryType || (el.c4BoundaryType === 'Enterprise_Boundary' || (el.c4BoundaryTag || '').includes('ENTERPRISE') ? 'enterprise' : (el.c4BoundaryType === 'System_Boundary' || (el.c4BoundaryTag || '').includes('SYSTEM') ? 'system' : (el.subtype || 'standard')));
        document.querySelectorAll('#groupArchetypeControl .segment-btn').forEach(b => {
          b.classList.toggle('active', (b.dataset.boundaryType || 'standard') === bType);
        });

        document.querySelectorAll('#groupBorderStyleControl .segment-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.groupBorder === (el.strokeStyle || 'dashed'));
        });
      } else if (el.type === 'c4-element' || (el.type === 'node' && (el.c4Shape || el.c4Type))) {
        if (c4Sec) c4Sec.style.display = 'flex';
        if (standardSec) standardSec.style.display = 'block';

        const c4Shape = el.c4Shape || (el.c4Type?.startsWith('Person') || el.badge === 'PERSON' ? 'person' : (el.c4Type?.includes('Db') ? 'database' : (el.c4Type?.includes('Queue') ? 'queue' : 'system')));
        badge.textContent = `C4: ${c4Shape.toUpperCase()}`;

        const c4Badge = document.getElementById('c4InspectorBadge');
        if (c4Badge) {
          c4Badge.innerHTML = `<i data-lucide="layers"></i> C4: ${c4Shape.toUpperCase()}`;
        }

        const titleInput = document.getElementById('propC4Title');
        if (titleInput) titleInput.value = el.title || el.label || '';

        const subInput = document.getElementById('propC4Subtitle');
        if (subInput) subInput.value = el.subtitle || '';

        const tagInput = document.getElementById('propC4Tag');
        if (tagInput) tagInput.value = el.c4Tag || (c4Shape === 'person' ? '[Person]' : (c4Shape === 'database' ? '[Container: Database]' : (c4Shape === 'queue' ? '[Message Queue]' : '[Software System]')));

        const isExtCheckbox = document.getElementById('propC4IsExt');
        const isExt = !!(el.c4Type?.endsWith('_Ext') || el.isExt === true || (el.badge && el.badge.includes('EXT')));
        if (isExtCheckbox) isExtCheckbox.checked = isExt;

        document.querySelectorAll('#c4ShapeControl .segment-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.c4Shape === c4Shape);
        });

        document.querySelectorAll('#c4AccentPalette .arch-color-swatch').forEach(s => {
          const defaultTheme = isExt ? '#6c757d' : (c4Shape === 'person' ? '#08427b' : '#1168bd');
          s.classList.toggle('active', s.dataset.color.toLowerCase() === (el.themeColor || defaultTheme).toLowerCase());
        });
      } else if (el.type === 'diamond') {
        if (diamondSec) diamondSec.style.display = 'flex';
        if (standardSec) standardSec.style.display = 'block';

        const diamondTextInput = document.getElementById('propDiamondText');
        if (diamondTextInput) diamondTextInput.value = el.text || el.label || '';

        document.querySelectorAll('#diamondAccentPalette .arch-color-swatch').forEach(s => {
          s.classList.toggle('active', s.dataset.color === (el.strokeColor || '#f59f00'));
        });
      } else if (el.type === 'activity-action') {
        if (actionSec) actionSec.style.display = 'flex';
        const titleInput = document.getElementById('propActionTitle');
        if (titleInput) titleInput.value = el.title || el.label || '';

        document.querySelectorAll('#actionAccentPalette .arch-color-swatch').forEach(s => {
          s.classList.toggle('active', s.dataset.color === (el.themeColor || '#2f9e44'));
        });
      } else {
        if (standardSec) standardSec.style.display = 'block';
      }
    } else {
      badge.textContent = `${selectedElements.length} Selected`;
      badge.style.background = 'var(--primary-light)';
      badge.style.color = 'var(--primary)';
      if (standardSec) standardSec.style.display = 'block';
    }

    // Standard Styles & Sub-section visibility based on selected element type
    const styleSource = selectedElements.length === 1 ? selectedElements[0] : this.activeStyles;
    const isSingle = selectedElements.length === 1;
    const singleEl = isSingle ? selectedElements[0] : null;
    const isText = singleEl && singleEl.type === 'text';
    const isShape = singleEl && (singleEl.type === 'rectangle' || singleEl.type === 'ellipse' || singleEl.type === 'diamond');
    const isConnector = singleEl && (singleEl.type === 'arrow' || singleEl.type === 'line' || singleEl.type === 'elbow-arrow');
    const isFreedraw = singleEl && singleEl.type === 'freedraw';
    const isImage = singleEl && singleEl.type === 'image';
    const isArchElement = singleEl && ['node', 'erd-table', 'swimlane', 'state-node', 'activation-box', 'activity-action', 'fork-node', 'join-node', 'flow-final'].includes(singleEl.type);
    const isGroup = singleEl && singleEl.type === 'group-boundary';

    const secStroke = document.getElementById('sec-stroke');
    const secBg = document.getElementById('sec-bg');
    const secFill = document.getElementById('sec-fill');
    const secStrokeWidth = document.getElementById('sec-stroke-width');
    const secStrokeStyle = document.getElementById('sec-stroke-style');
    const secRoughness = document.getElementById('sec-roughness');
    const secEdges = document.getElementById('sec-edges');
    const secFontFamily = document.getElementById('sec-font-family');
    const secFontSize = document.getElementById('sec-font-size');
    const secTextAlign = document.getElementById('sec-text-align');
    const secOpacity = document.getElementById('sec-opacity');
    const secLayers = document.getElementById('sec-layers');

    if (isArchElement) {
      // Architecture Node / System element selected: Hide irrelevant drawing tools
      if (secStroke) secStroke.style.display = 'none';
      if (secBg) secBg.style.display = 'none';
      if (secFill) secFill.style.display = 'none';
      if (secStrokeWidth) secStrokeWidth.style.display = 'none';
      if (secStrokeStyle) secStrokeStyle.style.display = 'none';
      if (secRoughness) secRoughness.style.display = 'none';
      if (secEdges) secEdges.style.display = 'none';
      if (secFontFamily) secFontFamily.style.display = 'none';
      if (secFontSize) secFontSize.style.display = 'none';
      if (secTextAlign) secTextAlign.style.display = 'none';
      if (secOpacity) secOpacity.style.display = 'block';
      if (secLayers) secLayers.style.display = 'block';
    } else if (isImage) {
      // Inserted Image: Hide stroke/fill/text tools, show opacity and layers
      if (secStroke) secStroke.style.display = 'none';
      if (secBg) secBg.style.display = 'none';
      if (secFill) secFill.style.display = 'none';
      if (secStrokeWidth) secStrokeWidth.style.display = 'none';
      if (secStrokeStyle) secStrokeStyle.style.display = 'none';
      if (secRoughness) secRoughness.style.display = 'none';
      if (secEdges) secEdges.style.display = 'none';
      if (secFontFamily) secFontFamily.style.display = 'none';
      if (secFontSize) secFontSize.style.display = 'none';
      if (secTextAlign) secTextAlign.style.display = 'none';
      if (secOpacity) secOpacity.style.display = 'block';
      if (secLayers) secLayers.style.display = 'block';
    } else if (isGroup) {
      if (secStroke) secStroke.style.display = 'none';
      if (secBg) secBg.style.display = 'none';
      if (secFill) secFill.style.display = 'none';
      if (secStrokeWidth) secStrokeWidth.style.display = 'block';
      if (secStrokeStyle) secStrokeStyle.style.display = 'none';
      if (secRoughness) secRoughness.style.display = 'none';
      if (secEdges) secEdges.style.display = 'none';
      if (secFontFamily) secFontFamily.style.display = 'none';
      if (secFontSize) secFontSize.style.display = 'none';
      if (secTextAlign) secTextAlign.style.display = 'none';
      if (secOpacity) secOpacity.style.display = 'block';
      if (secLayers) secLayers.style.display = 'block';
    } else {
      // Standard drawing shapes or multiple selection
      if (secStroke) secStroke.style.display = 'block';
      if (secBg) secBg.style.display = isText ? 'none' : 'block';
      if (secFill) secFill.style.display = (isText || isConnector || isFreedraw) ? 'none' : 'block';
      if (secStrokeWidth) secStrokeWidth.style.display = isText ? 'none' : 'block';
      if (secStrokeStyle) secStrokeStyle.style.display = (isText || isFreedraw) ? 'none' : 'block';
      if (secRoughness) secRoughness.style.display = isText ? 'none' : 'block';
      if (secEdges) secEdges.style.display = (isText || (singleEl && singleEl.type === 'ellipse') || isConnector || isFreedraw) ? 'none' : 'block';
      if (secFontFamily) secFontFamily.style.display = (isConnector && !singleEl?.label) || isFreedraw ? 'none' : 'block';
      if (secFontSize) secFontSize.style.display = (isConnector && !singleEl?.label) || isFreedraw ? 'none' : 'block';
      if (secTextAlign) secTextAlign.style.display = (isConnector && !singleEl?.label) || isFreedraw ? 'none' : 'block';
      if (secOpacity) secOpacity.style.display = 'block';
      if (secLayers) secLayers.style.display = selectedElements.length > 0 ? 'block' : 'none';
    }

    // Active state highlighting
    document.querySelectorAll('#strokeColorPalette .color-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.color === styleSource.strokeColor);
    });
    document.querySelectorAll('#bgColorPalette .color-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.color === styleSource.backgroundColor);
    });
    document.querySelectorAll('#fillStyleControl .segment-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.fillStyle === styleSource.fillStyle);
    });
    document.querySelectorAll('#strokeWidthControl .segment-btn').forEach(b => {
      b.classList.toggle('active', parseFloat(b.dataset.width) === styleSource.strokeWidth);
    });
    document.querySelectorAll('#roughnessControl .segment-btn').forEach(b => {
      b.classList.toggle('active', parseFloat(b.dataset.roughness) === styleSource.roughness);
    });
    document.querySelectorAll('#strokeStyleControl .segment-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.strokeStyle === styleSource.strokeStyle);
    });
    document.querySelectorAll('#edgesControl .segment-btn').forEach(b => {
      const edge = styleSource.edges || (styleSource.roundness ? 'round' : 'sharp');
      b.classList.toggle('active', b.dataset.edges === edge);
    });
    document.querySelectorAll('#fontFamilyControl .segment-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.fontFamily, 10) === (Number(styleSource.fontFamily) || 1));
    });
    document.querySelectorAll('#fontSizeControl .segment-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.fontSize, 10) === (Number(styleSource.fontSize) || 20));
    });
    document.querySelectorAll('#textAlignControl .segment-btn').forEach(b => {
      const defAlign = isText ? 'left' : 'center';
      b.classList.toggle('active', b.dataset.textAlign === (styleSource.textAlign || defAlign));
    });
    document.querySelectorAll('#verticalAlignControl .segment-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.verticalAlign === (styleSource.verticalAlign || 'middle'));
    });

    const opSlider = document.getElementById('opacitySlider');
    const opVal = document.getElementById('opacityValue');
    if (opSlider && opVal) {
      opSlider.value = styleSource.opacity !== undefined ? styleSource.opacity : 100;
      opVal.textContent = `${styleSource.opacity !== undefined ? styleSource.opacity : 100}%`;
    }
  }

  renderErdColumnsInspector(el) {
    const list = document.getElementById('erdColumnsList');
    if (!list) return;
    list.innerHTML = '';
    if (!el.columns) el.columns = [];

    el.columns.forEach((col, idx) => {
      const row = document.createElement('div');
      row.className = 'erd-col-row';

      // Key selector: None, PK, FK
      const keySelect = document.createElement('select');
      keySelect.className = `erd-col-key-select ${col.key ? col.key.toLowerCase() : ''}`;
      keySelect.innerHTML = `
        <option value="" ${!col.key ? 'selected' : ''}>-</option>
        <option value="PK" ${col.key === 'PK' ? 'selected' : ''}>PK</option>
        <option value="FK" ${col.key === 'FK' ? 'selected' : ''}>FK</option>
      `;
      keySelect.addEventListener('change', (e) => {
        col.key = e.target.value;
        col.isPk = col.key === 'PK';
        col.isFk = col.key === 'FK';
        keySelect.className = `erd-col-key-select ${col.key ? col.key.toLowerCase() : ''}`;
        el._cacheKey = null;
        this.history.record(this.elements);
        this.render();
      });

      // Column name input
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'erd-col-name-input';
      nameInput.value = col.name || '';
      nameInput.placeholder = 'column_name';
      nameInput.addEventListener('input', (e) => {
        col.name = e.target.value;
        el._cacheKey = null;
        this.history.record(this.elements);
        this.render();
      });

      // Column type input (Supports dropdown suggestions from datalist + freeform custom text)
      const typeInput = document.createElement('input');
      typeInput.type = 'text';
      typeInput.className = 'erd-col-type-input';
      typeInput.setAttribute('list', 'commonSqlTypes');
      typeInput.value = col.type || '';
      typeInput.placeholder = 'TYPE';
      typeInput.addEventListener('input', (e) => {
        col.type = e.target.value;
        el._cacheKey = null;
        this.history.record(this.elements);
        this.render();
      });

      // Delete column button
      const delBtn = document.createElement('button');
      delBtn.className = 'erd-col-del-btn';
      delBtn.title = 'Remove column';
      delBtn.innerHTML = '<i data-lucide="x"></i>';
      delBtn.addEventListener('click', () => {
        el.columns.splice(idx, 1);
        el.height = Math.max(70, 36 + 16 + el.columns.length * 24);
        el._cacheKey = null;
        this.renderErdColumnsInspector(el);
        this.history.record(this.elements);
        this.render();
      });

      row.appendChild(keySelect);
      row.appendChild(nameInput);
      row.appendChild(typeInput);
      row.appendChild(delBtn);
      list.appendChild(row);
    });

    createIcons({ icons });
  }

  updateTelemetryBox() {
    const preview = document.getElementById('elementJsonPreview');
    const selected = this.elements.filter(el => this.selectedElementIds.has(el.id));
    if (selected.length === 0) {
      preview.innerHTML = `<span>Select an element to see its raw JSON schema and Rough.js seed.</span>`;
    } else if (selected.length === 1) {
      const clean = { ...selected[0] };
      delete clean._drawable;
      delete clean._cacheKey;
      preview.textContent = JSON.stringify(clean, null, 2);
    } else {
      preview.textContent = `// ${selected.length} elements selected\n` + JSON.stringify(
        selected.map(e => ({ id: e.id, type: e.type, x: Math.round(e.x), y: Math.round(e.y), seed: e.seed })),
        null,
        2
      );
    }
  }

  // ==========================================================================
  // Event Bindings
  // ==========================================================================
  bindEvents() {
    window.addEventListener('resize', () => this.handleResize());

    // Tools Palette Click
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.tool === 'image') {
          this.triggerImageUpload();
        } else {
          this.setTool(btn.dataset.tool);
        }
      });
    });

    // Image File Input Trigger
    const imageInput = document.getElementById('imageFileInput');
    if (imageInput) {
      imageInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.insertImageFromFile(e.target.files[0]);
        }
      });
    }

    // Viewport Drag-and-Drop Ingestion (Images & Diagrams)
    const viewport = document.getElementById('viewport');
    if (viewport) {
      viewport.addEventListener('dragover', (e) => {
        if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }
      });
      viewport.addEventListener('drop', (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          const isSvg = file.name.endsWith('.svg') || file.type === 'image/svg+xml';
          const isBitmapImg = (file.type && file.type.startsWith('image/') && !isSvg) ||
                              /\.(png|jpe?g|webp|gif|bmp|ico)$/i.test(file.name);
          if (isBitmapImg) {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const pos = screenToScene(e.clientX - rect.left, e.clientY - rect.top, this.scrollX, this.scrollY, this.zoom);
            this.insertImageFromFile(file, pos);
          } else if (isSvg || file.name.endsWith('.json') || file.name.endsWith('.excalidraw')) {
            e.preventDefault();
            importFromJson(file, (elements, appState) => {
              this.elements = elements;
              if (appState && appState.viewBackgroundColor) {
                this.setCanvasBackground(appState.viewBackgroundColor);
              }
              this.selectedElementIds.clear();
              this.history.record(this.elements);
              if (this.elements.length > 0) {
                const fit = calculateZoomToFit(this.elements, this.canvas.clientWidth, this.canvas.clientHeight, 60);
                this.zoom = fit.zoom;
                this.scrollX = fit.scrollX;
                this.scrollY = fit.scrollY;
                document.getElementById('zoomDisplay').textContent = `${Math.round(this.zoom * 100)}%`;
              } else {
                this.resetZoom();
              }
              this.updateEmptyState();
              this.render();
              this.showToast(`Imported ${elements.length} elements from ${file.name}`, 'success');
            });
          }
        }
      });
    }

    // Prevent default window drops from navigating away from the app
    window.addEventListener('dragover', (e) => e.preventDefault(), false);
    window.addEventListener('drop', (e) => {
      // If dropped outside viewport, prevent browser from loading file as new page
      if (!e.defaultPrevented) e.preventDefault();
    }, false);

    // Tool Lock
    const lockBtn = document.getElementById('btn-lock');
    lockBtn.addEventListener('click', () => {
      this.isToolLocked = !this.isToolLocked;
      lockBtn.dataset.active = this.isToolLocked ? 'true' : 'false';
    });

    // Canvas Pointer Events
    this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', (e) => this.onPointerUp(e));
    this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));

    // Mouse Wheel (Pan & Zoom)
    this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));

    // Inspector Events
    this.bindInspectorEvents();
    this.bindArchInspectorEvents();

    // Zoom and Action Controls
    document.getElementById('btn-zoom-in').addEventListener('click', () => this.changeZoom(1.2));
    document.getElementById('btn-zoom-out').addEventListener('click', () => this.changeZoom(0.8));
    document.getElementById('zoomDisplay').addEventListener('click', () => this.resetZoom());
    document.getElementById('btn-toggle-grid').addEventListener('click', () => {
      this.showGrid = !this.showGrid;
      this.render();
    });
    document.getElementById('btn-clear-canvas').addEventListener('click', () => {
      if (this.elements.length === 0) return;
      this.showConfirmDialog({
        title: 'Clear Canvas?',
        message: 'Are you sure you want to clear the entire canvas? All current elements will be removed. You can press <kbd style="background: var(--bg-hover); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; border: 1px solid var(--border-subtle);">Ctrl+Z</kbd> to undo if needed.',
        actionLabel: 'Clear Canvas',
        onConfirm: () => {
          this.history.record(this.elements); // Save snapshot for immediate Ctrl+Z recovery
          this.elements = [];
          this.selectedElementIds.clear();
          this.history.record(this.elements);
          this.scheduleAutoSave();
          this.updateInspectorUI();
          this.updateEmptyState();
          this.render();
          this.showToast('Canvas cleared. Press Ctrl+Z to undo.', 'info', 3500);
        }
      });
    });

    // Undo / Redo
    document.getElementById('btn-undo').addEventListener('click', () => this.undo());
    document.getElementById('btn-redo').addEventListener('click', () => this.redo());

    // Theme Toggle
    document.getElementById('btn-theme-toggle').addEventListener('click', () => this.toggleTheme());

    // Telemetry Overlays Toggle
    const btnMetrics = document.getElementById('btn-metrics-toggle');
    if (btnMetrics) {
      btnMetrics.addEventListener('click', () => this.toggleMetricsOverlay());
    }

    // Modals
    this.bindModals();
  }

  setTool(tool) {
    if (tool === 'image') {
      this.triggerImageUpload();
      return;
    }
    this.currentTool = tool;
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
    this.canvas.style.cursor = tool === 'select' ? 'default' : tool === 'hand' ? 'grab' : tool === 'text' ? 'text' : tool === 'eraser' ? 'crosshair' : 'crosshair';
  }

  triggerImageUpload() {
    const input = document.getElementById('imageFileInput');
    if (input) {
      input.value = '';
      input.click();
    }
  }

  insertImageFromFile(file, scenePos = null) {
    const isImg = (file && file.type && file.type.startsWith('image/')) ||
                  (file && file.name && /\.(png|jpe?g|svg|webp|gif|bmp|ico)$/i.test(file.name));
    if (!file || !isImg) {
      this.showToast('Please select a valid image file (PNG, JPG, SVG, WebP, GIF)', 'warning');
      return;
    }

    // Security: Check max size (15MB limit to prevent memory exhaustion / DoS)
    if (file.size > 15 * 1024 * 1024) {
      this.showToast('Image file too large (max 15MB allowed)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target.result;
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth || 300;
        let h = img.naturalHeight || 200;
        const maxDim = 520;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        let pos = scenePos;
        if (!pos) {
          const rect = this.canvas.getBoundingClientRect();
          pos = screenToScene(rect.width / 2, rect.height / 2, this.scrollX, this.scrollY, this.zoom);
        }

        const newElement = {
          id: generateId(),
          type: 'image',
          x: Math.round(pos.x - w / 2),
          y: Math.round(pos.y - h / 2),
          width: w,
          height: h,
          dataURL: dataURL,
          opacity: 100,
          isDeleted: false,
          strokeColor: '#000000',
          backgroundColor: 'transparent'
        };

        this.elements.push(newElement);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(newElement.id);
        this.history.record(this.elements);
        this.scheduleAutoSave();
        this.updateInspectorUI();
        this.updateEmptyState();
        this.render();
        this.showToast('Image inserted successfully', 'success');
      };
      img.src = dataURL;
    };
    reader.readAsDataURL(file);
  }

  bindArchInspectorEvents() {
    // 1. Node Title & Subtitle & Badge Inputs
    const nodeTitle = document.getElementById('propNodeTitle');
    if (nodeTitle) {
      nodeTitle.addEventListener('input', (e) => {
        this.applyStyleToSelection('title', e.target.value);
        this.render();
      });
    }

    const nodeSubtitle = document.getElementById('propNodeSubtitle');
    if (nodeSubtitle) {
      nodeSubtitle.addEventListener('input', (e) => {
        this.applyStyleToSelection('subtitle', e.target.value);
        this.render();
      });
    }

    const nodeBadge = document.getElementById('propNodeBadge');
    if (nodeBadge) {
      nodeBadge.addEventListener('input', (e) => {
        this.applyStyleToSelection('badge', e.target.value.toUpperCase());
        this.render();
      });
    }

    // Badge presets chips
    document.querySelectorAll('#nodeBadgePresets .badge-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.badge;
        this.applyStyleToSelection('badge', val);
        if (nodeBadge) nodeBadge.value = val;
        this.render();
      });
    });

    // C4 Architecture Level Control
    document.querySelectorAll('#nodeC4LevelControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lvl = btn.dataset.c4Level;
        this.applyStyleToSelection('c4Level', lvl || undefined);
        this.updateInspectorUI();
        this.render();
      });
    });

    // Node Processing Latency & Max Capacity QPS
    const propNodeLatency = document.getElementById('propNodeLatency');
    if (propNodeLatency) {
      propNodeLatency.addEventListener('input', (e) => {
        const val = e.target.value === '' ? undefined : (Math.max(0, parseFloat(e.target.value)) || 0);
        this.applyStyleToSelection('latencyMs', val);
        this.graphDirty = true;
        this.render();
      });
    }

    const propNodeCapacity = document.getElementById('propNodeCapacity');
    if (propNodeCapacity) {
      propNodeCapacity.addEventListener('input', (e) => {
        const val = e.target.value === '' ? undefined : (Math.max(0, parseFloat(e.target.value)) || 0);
        this.applyStyleToSelection('maxCapacityQps', val);
        this.graphDirty = true;
        this.render();
      });
    }

    const propNodeIsSpof = document.getElementById('propNodeIsSpof');
    if (propNodeIsSpof) {
      propNodeIsSpof.addEventListener('change', (e) => {
        this.applyStyleToSelection('isSpof', e.target.checked);
        this.graphDirty = true;
        this.render();
      });
    }

    // Card style (modern vs sketch)
    document.querySelectorAll('#nodeCardStyleControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const style = btn.dataset.cardStyle;
        this.applyStyleToSelection('cardStyle', style);
        this.updateInspectorUI();
        this.render();
      });
    });

    // 2. Connector / Flow Inputs
    const arrowLabel = document.getElementById('propArrowLabel');
    if (arrowLabel) {
      arrowLabel.addEventListener('input', (e) => {
        this.applyStyleToSelection('label', e.target.value);
        this.render();
      });
    }

    const propConnectorQps = document.getElementById('propConnectorQps');
    if (propConnectorQps) {
      propConnectorQps.addEventListener('input', (e) => {
        const val = e.target.value === '' ? undefined : (Math.max(0, parseFloat(e.target.value)) || 0);
        this.applyStyleToSelection('qps', val);
        this.graphDirty = true;
        this.render();
      });
    }

    const propConnectorLatency = document.getElementById('propConnectorLatency');
    if (propConnectorLatency) {
      propConnectorLatency.addEventListener('input', (e) => {
        const val = e.target.value === '' ? undefined : (Math.max(0, parseFloat(e.target.value)) || 0);
        this.applyStyleToSelection('latencyMs', val);
        this.graphDirty = true;
        this.render();
      });
    }

    document.querySelectorAll('#arrowRoutingControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const routing = btn.dataset.arrowRouting;
        this.applyStyleToSelection('routing', routing);
        this.updateInspectorUI();
        this.render();
      });
    });

    document.querySelectorAll('#arrowDirectionControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = btn.dataset.arrowDirection;
        this.applyStyleToSelection('direction', dir);
        this.updateInspectorUI();
        this.render();
      });
    });

    const arrowAnimated = document.getElementById('propArrowAnimated');
    if (arrowAnimated) {
      arrowAnimated.addEventListener('change', (e) => {
        this.applyStyleToSelection('isAnimated', e.target.checked);
        this.render();
      });
    }

    // 3. Group Boundary Inputs
    const groupTitle = document.getElementById('propGroupTitle');
    if (groupTitle) {
      groupTitle.addEventListener('input', (e) => {
        this.applyStyleToSelection('title', e.target.value);
        this.render();
      });
    }

    const propGroupCidr = document.getElementById('propGroupCidr');
    if (propGroupCidr) {
      propGroupCidr.addEventListener('input', (e) => {
        this.applyStyleToSelection('cidr', e.target.value);
        this.render();
      });
    }

    document.querySelectorAll('#groupArchetypeControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const bType = btn.dataset.boundaryType;
        this.applyStyleToSelection('boundaryType', bType);
        this.applyStyleToSelection('subtype', bType);
        if (bType === 'enterprise') {
          this.applyStyleToSelection('strokeColor', '#868e96');
          this.applyStyleToSelection('backgroundColor', 'rgba(255, 255, 255, 0.02)');
          this.applyStyleToSelection('c4BoundaryType', 'Enterprise_Boundary');
          this.applyStyleToSelection('c4BoundaryTag', '[ENTERPRISE]');
        } else if (bType === 'system') {
          this.applyStyleToSelection('strokeColor', '#868e96');
          this.applyStyleToSelection('backgroundColor', 'rgba(255, 255, 255, 0.02)');
          this.applyStyleToSelection('c4BoundaryType', 'System_Boundary');
          this.applyStyleToSelection('c4BoundaryTag', '[SYSTEM]');
        } else if (bType === 'vpc') {
          this.applyStyleToSelection('c4BoundaryType', undefined);
          this.applyStyleToSelection('c4BoundaryTag', undefined);
          this.applyStyleToSelection('strokeColor', '#1971c2');
          this.applyStyleToSelection('backgroundColor', 'rgba(231, 245, 255, 0.45)');
        } else if (bType === 'public-subnet') {
          this.applyStyleToSelection('c4BoundaryType', undefined);
          this.applyStyleToSelection('c4BoundaryTag', undefined);
          this.applyStyleToSelection('strokeColor', '#2b8a3e');
          this.applyStyleToSelection('backgroundColor', 'rgba(235, 251, 238, 0.45)');
        } else if (bType === 'private-subnet') {
          this.applyStyleToSelection('c4BoundaryType', undefined);
          this.applyStyleToSelection('c4BoundaryTag', undefined);
          this.applyStyleToSelection('strokeColor', '#4c6ef5');
          this.applyStyleToSelection('backgroundColor', 'rgba(237, 242, 255, 0.45)');
        } else if (bType === 'k8s-cluster') {
          this.applyStyleToSelection('c4BoundaryType', undefined);
          this.applyStyleToSelection('c4BoundaryTag', undefined);
          this.applyStyleToSelection('strokeColor', '#326ce5');
          this.applyStyleToSelection('backgroundColor', 'rgba(50, 108, 229, 0.08)');
        } else {
          this.applyStyleToSelection('c4BoundaryType', undefined);
          this.applyStyleToSelection('c4BoundaryTag', undefined);
        }
        this.updateInspectorUI();
        this.render();
      });
    });

    document.querySelectorAll('#groupBorderStyleControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const borderStyle = btn.dataset.groupBorder;
        this.applyStyleToSelection('strokeStyle', borderStyle);
        this.updateInspectorUI();
        this.render();
      });
    });

    // 3.5 C4 Architecture Primitives Inputs
    const propC4Title = document.getElementById('propC4Title');
    if (propC4Title) {
      propC4Title.addEventListener('input', (e) => {
        this.applyStyleToSelection('title', e.target.value);
        this.applyStyleToSelection('label', e.target.value);
        this.render();
      });
    }

    const propC4Subtitle = document.getElementById('propC4Subtitle');
    if (propC4Subtitle) {
      propC4Subtitle.addEventListener('input', (e) => {
        this.applyStyleToSelection('subtitle', e.target.value);
        this.render();
      });
    }

    const propC4Tag = document.getElementById('propC4Tag');
    if (propC4Tag) {
      propC4Tag.addEventListener('input', (e) => {
        this.applyStyleToSelection('c4Tag', e.target.value);
        this.render();
      });
    }

    const propC4IsExt = document.getElementById('propC4IsExt');
    if (propC4IsExt) {
      propC4IsExt.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        this.applyStyleToSelection('isExt', isChecked);
        this.selectedElementIds.forEach(id => {
          const el = this.elements.find(item => item.id === id);
          if (el) {
            let baseType = (el.c4Type || 'System').replace(/_Ext$/, '');
            el.c4Type = isChecked ? `${baseType}_Ext` : baseType;
            if (isChecked) {
              el.themeColor = '#6c757d';
            } else {
              el.themeColor = el.c4Shape === 'person' ? '#08427b' : '#1168bd';
            }
          }
        });
        this.updateInspectorUI();
        this.render();
      });
    }

    document.querySelectorAll('#c4ShapeControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const shape = btn.dataset.c4Shape;
        this.applyStyleToSelection('c4Shape', shape);
        this.selectedElementIds.forEach(id => {
          const el = this.elements.find(item => item.id === id);
          if (el) {
            const isExt = !!(el.c4Type?.endsWith('_Ext') || el.isExt);
            if (shape === 'person') {
              el.c4Tag = '[Person]';
              el.c4Type = isExt ? 'Person_Ext' : 'Person';
              el.width = 170;
              el.height = 110;
              if (!isExt) el.themeColor = '#08427b';
            } else if (shape === 'database') {
              el.c4Tag = '[Container: Database]';
              el.c4Type = isExt ? 'SystemDb_Ext' : 'ContainerDb';
              el.width = 180;
              el.height = 120;
              if (!isExt) el.themeColor = '#1168bd';
            } else if (shape === 'queue') {
              el.c4Tag = '[Message Queue]';
              el.c4Type = isExt ? 'SystemQueue_Ext' : 'SystemQueue';
              el.width = 180;
              el.height = 90;
              if (!isExt) el.themeColor = '#1168bd';
            } else {
              el.c4Tag = '[Software System]';
              el.c4Type = isExt ? 'System_Ext' : 'System';
              el.width = 200;
              el.height = 110;
              if (!isExt) el.themeColor = '#1168bd';
            }
          }
        });
        this.updateInspectorUI();
        this.render();
      });
    });

    // 4. ERD Table Inputs
    const propErdTableName = document.getElementById('propErdTableName');
    if (propErdTableName) {
      propErdTableName.addEventListener('input', (e) => {
        this.applyStyleToSelection('tableName', e.target.value);
        this.applyStyleToSelection('title', e.target.value);
        this.render();
      });
    }

    const propErdTableType = document.getElementById('propErdTableType');
    if (propErdTableType) {
      propErdTableType.addEventListener('input', (e) => {
        this.applyStyleToSelection('tableType', e.target.value);
        this.applyStyleToSelection('badge', e.target.value);
        this.render();
      });
    }

    const btnAddCol = document.getElementById('btn-erd-add-col');
    if (btnAddCol) {
      btnAddCol.addEventListener('click', () => {
        const selected = this.elements.find(el => this.selectedElementIds.has(el.id));
        if (selected && selected.type === 'erd-table') {
          if (!selected.columns) selected.columns = [];
          selected.columns.push({
            name: 'col_' + (selected.columns.length + 1),
            type: 'VARCHAR(255)',
            key: '',
            isPk: false,
            isFk: false
          });
          selected.height = Math.max(70, 36 + 16 + selected.columns.length * 24);
          selected._cacheKey = null;
          this.renderErdColumnsInspector(selected);
          this.history.record(this.elements);
          this.render();
        }
      });
    }

    // ERD SQL DDL Inspector Actions
    const btnCopyTableSqlDdl = document.getElementById('btnCopyTableSqlDdl');
    if (btnCopyTableSqlDdl) {
      btnCopyTableSqlDdl.addEventListener('click', async () => {
        const selected = this.elements.find(el => this.selectedElementIds.has(el.id));
        if (selected && selected.type === 'erd-table') {
          const sql = generateTableDdl(selected, { dialect: this.activeSqlDialect || 'postgres' });
          await copySqlToClipboard(sql);
          this.showToast(`Copied table "${selected.tableName || 'table'}" SQL DDL to clipboard`, 'success');
          const origText = btnCopyTableSqlDdl.innerHTML;
          btnCopyTableSqlDdl.innerHTML = `<i data-lucide="check"></i> Copied SQL DDL!`;
          btnCopyTableSqlDdl.style.background = '#2b8a3e';
          createIcons({ icons });
          setTimeout(() => {
            btnCopyTableSqlDdl.innerHTML = origText;
            btnCopyTableSqlDdl.style.background = '#1971c2';
            createIcons({ icons });
          }, 1500);
        }
      });
    }

    const btnPreviewTableSqlDdl = document.getElementById('btnPreviewTableSqlDdl');
    if (btnPreviewTableSqlDdl) {
      btnPreviewTableSqlDdl.addEventListener('click', () => {
        const selected = this.elements.find(el => this.selectedElementIds.has(el.id));
        this.openSqlPreviewModal(selected && selected.type === 'erd-table' ? selected : null);
      });
    }

    const btnDownloadTableSqlFile = document.getElementById('btnDownloadTableSqlFile');
    if (btnDownloadTableSqlFile) {
      btnDownloadTableSqlFile.addEventListener('click', () => {
        const selected = this.elements.find(el => this.selectedElementIds.has(el.id));
        if (selected && selected.type === 'erd-table') {
          const sql = generateTableDdl(selected, { dialect: this.activeSqlDialect || 'postgres' });
          const fname = `${(selected.tableName || 'table').toLowerCase().replace(/[^a-z0-9_]/g, '_')}.sql`;
          downloadSqlFile(fname, sql);
          this.showToast(`Downloaded ${fname}`, 'success');
        } else {
          const sql = generateSqlDdl(this.elements, { dialect: this.activeSqlDialect || 'postgres' });
          const fname = `schema-${Date.now()}.sql`;
          downloadSqlFile(fname, sql);
          this.showToast(`Downloaded ${fname}`, 'success');
        }
      });
    }

    // 5. UML State Machine Inputs
    const propStateTitle = document.getElementById('propStateTitle');
    if (propStateTitle) {
      propStateTitle.addEventListener('input', (e) => {
        this.applyStyleToSelection('title', e.target.value);
        this.render();
      });
    }

    document.querySelectorAll('#stateTypeControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const st = btn.dataset.stateType;
        this.applyStyleToSelection('stateType', st);
        if (st === 'initial') {
          this.applyStyleToSelection('width', 26);
          this.applyStyleToSelection('height', 26);
        } else if (st === 'final') {
          this.applyStyleToSelection('width', 28);
          this.applyStyleToSelection('height', 28);
        } else {
          this.applyStyleToSelection('width', 180);
          this.applyStyleToSelection('height', 95);
        }
        this.updateInspectorUI();
        this.render();
      });
    });

    const propStateActions = document.getElementById('propStateActions');
    if (propStateActions) {
      propStateActions.addEventListener('input', (e) => {
        const lines = e.target.value.split('\n');
        this.applyStyleToSelection('actions', lines);
        this.render();
      });
    }

    // 6. Process Swimlane Inputs
    const propSwimlaneTitle = document.getElementById('propSwimlaneTitle');
    if (propSwimlaneTitle) {
      propSwimlaneTitle.addEventListener('input', (e) => {
        this.applyStyleToSelection('title', e.target.value);
        this.render();
      });
    }

    // 7. Activation Box Inputs
    const propActivationHeight = document.getElementById('propActivationHeight');
    if (propActivationHeight) {
      propActivationHeight.addEventListener('input', (e) => {
        const val = Math.max(20, parseFloat(e.target.value) || 80);
        this.applyStyleToSelection('height', val);
        this.render();
      });
    }

    // 8. Decision Diamond Inputs
    const propDiamondText = document.getElementById('propDiamondText');
    if (propDiamondText) {
      propDiamondText.addEventListener('input', (e) => {
        this.applyStyleToSelection('text', e.target.value);
        this.applyStyleToSelection('label', e.target.value);
        this.applyStyleToSelection('condition', e.target.value);
        this.render();
      });
    }

    // 9. Activity Action Step Inputs
    const propActionTitle = document.getElementById('propActionTitle');
    if (propActionTitle) {
      propActionTitle.addEventListener('input', (e) => {
        this.applyStyleToSelection('title', e.target.value);
        this.applyStyleToSelection('label', e.target.value);
        this.render();
      });
    }

    // 8. Component Library & Quick Architecture Add Buttons
    const getCenter = () => ({
      cx: (-this.scrollX + window.innerWidth / 2) / this.zoom,
      cy: (-this.scrollY + window.innerHeight / 2) / this.zoom
    });

    // 8.1 Database & Storage Components
    const btnAddErdTable = document.getElementById('btn-add-erd-table');
    if (btnAddErdTable) {
      btnAddErdTable.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const initialCols = [
          { name: 'id', type: 'UUID', key: 'PK', isPk: true, isFk: false },
          { name: 'account_id', type: 'BIGINT', key: 'FK', isPk: false, isFk: true },
          { name: 'balance', type: 'DECIMAL(12,2)', key: '', isPk: false, isFk: false },
          { name: 'status', type: 'VARCHAR(32)', key: '', isPk: false, isFk: false },
          { name: 'created_at', type: 'TIMESTAMP', key: '', isPk: false, isFk: false }
        ];
        const newTable = {
          id: generateId(),
          type: 'erd-table',
          x: cx - 120,
          y: cy - 90,
          width: 250,
          height: 36 + 16 + initialCols.length * 24,
          tableName: 'accounts',
          title: 'accounts',
          tableType: 'BASE TABLE',
          themeColor: '#1971c2',
          columns: initialCols,
          seed: generateSeed()
        };
        this.elements.push(newTable);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(newTable.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
        if (propErdTableName) {
          propErdTableName.focus();
          propErdTableName.select();
        }
      });
    }

    const btnAddPostgres = document.getElementById('btn-add-postgres-node');
    if (btnAddPostgres) {
      btnAddPostgres.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const newPg = {
          id: generateId(),
          type: 'node',
          x: cx - 110,
          y: cy - 42,
          width: 220,
          height: 85,
          title: 'PostgreSQL DB',
          subtitle: 'Port 5432 · Primary OLTP',
          badge: 'DATABASE',
          icon: 'Database',
          themeColor: '#339af0',
          backgroundColor: '#ffffff',
          cardStyle: 'modern',
          strokeWidth: 1.5,
          seed: generateSeed()
        };
        this.elements.push(newPg);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(newPg.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddRedis = document.getElementById('btn-add-redis-node');
    if (btnAddRedis) {
      btnAddRedis.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const newRedis = {
          id: generateId(),
          type: 'node',
          x: cx - 110,
          y: cy - 42,
          width: 220,
          height: 85,
          title: 'Redis Cache Cluster',
          subtitle: 'Port 6379 · In-Memory LRU',
          badge: 'CACHE',
          icon: 'Zap',
          themeColor: '#e03131',
          backgroundColor: '#ffffff',
          cardStyle: 'modern',
          strokeWidth: 1.5,
          seed: generateSeed()
        };
        this.elements.push(newRedis);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(newRedis.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddKafka = document.getElementById('btn-add-kafka-node');
    if (btnAddKafka) {
      btnAddKafka.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const newKafka = {
          id: generateId(),
          type: 'node',
          x: cx - 110,
          y: cy - 42,
          width: 220,
          height: 85,
          title: 'Kafka Event Broker',
          subtitle: 'Port 9092 · Event Stream',
          badge: 'QUEUE',
          icon: 'Radio',
          themeColor: '#f08c00',
          backgroundColor: '#ffffff',
          cardStyle: 'modern',
          strokeWidth: 1.5,
          seed: generateSeed()
        };
        this.elements.push(newKafka);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(newKafka.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    // 8.2 UML & Flowchart Components
    const btnAddLifeline = document.getElementById('btn-add-lifeline');
    if (btnAddLifeline) {
      btnAddLifeline.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const participant = {
          id: generateId(),
          type: 'node',
          x: cx - 80,
          y: cy - 130,
          width: 160,
          height: 52,
          title: 'Auth Service',
          subtitle: 'Identity Provider',
          badge: 'SERVICE',
          icon: 'Shield',
          themeColor: '#1971c2',
          cardStyle: 'modern',
          seed: generateSeed()
        };
        const line = {
          id: generateId(),
          type: 'line',
          x: cx,
          y: cy - 78,
          width: 0,
          height: 250,
          strokeColor: '#adb5bd',
          strokeStyle: 'dashed',
          strokeWidth: 1.5,
          seed: generateSeed()
        };
        const box = {
          id: generateId(),
          type: 'activation-box',
          x: cx - 8,
          y: cy - 20,
          width: 16,
          height: 90,
          color: '#1971c2',
          seed: generateSeed()
        };
        this.elements.push(participant, line, box);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(participant.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddActBox = document.getElementById('btn-add-activation-box');
    if (btnAddActBox) {
      btnAddActBox.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const box = {
          id: generateId(),
          type: 'activation-box',
          x: cx - 8,
          y: cy - 40,
          width: 16,
          height: 80,
          color: '#1971c2',
          seed: generateSeed()
        };
        this.elements.push(box);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(box.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddSwimlane = document.getElementById('btn-add-swimlane');
    if (btnAddSwimlane) {
      btnAddSwimlane.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const lane = {
          id: generateId(),
          type: 'swimlane',
          x: cx - 310,
          y: cy - 65,
          width: 620,
          height: 130,
          title: 'Operations Lane',
          color: '#2f9e44',
          backgroundColor: 'rgba(47, 158, 68, 0.05)',
          seed: generateSeed()
        };
        this.elements.unshift(lane);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(lane.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddStateNode = document.getElementById('btn-add-state-node');
    if (btnAddStateNode) {
      btnAddStateNode.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const state = {
          id: generateId(),
          type: 'state-node',
          x: cx - 90,
          y: cy - 45,
          width: 180,
          height: 90,
          title: 'Processing Order',
          stateType: 'normal',
          actions: ['entry / reserveStock()', 'do / verifyPayment()', 'exit / emitEvent()'],
          color: '#f76707',
          seed: generateSeed()
        };
        this.elements.push(state);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(state.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddActivityAction = document.getElementById('btn-add-activity-action');
    if (btnAddActivityAction) {
      btnAddActivityAction.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const action = {
          id: generateId(),
          type: 'activity-action',
          x: cx - 90,
          y: cy - 25,
          width: 180,
          height: 50,
          title: 'Process Payment',
          label: 'Process Payment',
          themeColor: '#2f9e44',
          backgroundColor: 'rgba(47, 158, 68, 0.08)',
          strokeWidth: 2,
          seed: generateSeed()
        };
        this.elements.push(action);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(action.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddDecisionDiamond = document.getElementById('btn-add-decision-diamond');
    if (btnAddDecisionDiamond) {
      btnAddDecisionDiamond.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const diamond = {
          id: generateId(),
          type: 'diamond',
          x: cx - 70,
          y: cy - 40,
          width: 140,
          height: 80,
          text: 'Is Valid?',
          label: 'Is Valid?',
          condition: 'Is Valid?',
          strokeColor: '#f59f00',
          backgroundColor: 'rgba(255, 243, 191, 0.4)',
          fillStyle: 'solid',
          strokeWidth: 2,
          seed: generateSeed()
        };
        this.elements.push(diamond);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(diamond.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddForkBar = document.getElementById('btn-add-fork-bar');
    if (btnAddForkBar) {
      btnAddForkBar.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const fork = {
          id: generateId(),
          type: 'fork-node',
          x: cx - 90,
          y: cy - 5,
          width: 180,
          height: 10,
          themeColor: '#1e1e1e',
          seed: generateSeed()
        };
        this.elements.push(fork);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(fork.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddJoinBar = document.getElementById('btn-add-join-bar');
    if (btnAddJoinBar) {
      btnAddJoinBar.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const join = {
          id: generateId(),
          type: 'join-node',
          x: cx - 90,
          y: cy - 5,
          width: 180,
          height: 10,
          themeColor: '#1e1e1e',
          seed: generateSeed()
        };
        this.elements.push(join);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(join.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddFlowFinal = document.getElementById('btn-add-flow-final');
    if (btnAddFlowFinal) {
      btnAddFlowFinal.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const flowFinal = {
          id: generateId(),
          type: 'flow-final',
          x: cx - 14,
          y: cy - 14,
          width: 28,
          height: 28,
          themeColor: '#e03131',
          seed: generateSeed()
        };
        this.elements.push(flowFinal);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(flowFinal.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddInitialState = document.getElementById('btn-add-initial-state');
    if (btnAddInitialState) {
      btnAddInitialState.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const init = {
          id: generateId(),
          type: 'state-node',
          x: cx - 13,
          y: cy - 13,
          width: 26,
          height: 26,
          stateType: 'initial',
          seed: generateSeed()
        };
        this.elements.push(init);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(init.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddFinalState = document.getElementById('btn-add-final-state');
    if (btnAddFinalState) {
      btnAddFinalState.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const fin = {
          id: generateId(),
          type: 'state-node',
          x: cx - 14,
          y: cy - 14,
          width: 28,
          height: 28,
          stateType: 'final',
          seed: generateSeed()
        };
        this.elements.push(fin);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(fin.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    // 8.3 System Architecture Components
    const btnAddNode = document.getElementById('btn-quick-add-node');
    if (btnAddNode) {
      btnAddNode.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const newNode = {
          id: generateId(),
          type: 'node',
          x: cx - 110,
          y: cy - 42,
          width: 220,
          height: 85,
          title: 'Service Node',
          subtitle: 'Go · gRPC · Port 50051',
          badge: 'SERVICE',
          icon: 'Server',
          themeColor: '#1971c2',
          backgroundColor: '#ffffff',
          cardStyle: 'modern',
          strokeWidth: 1.5,
          seed: generateSeed()
        };
        this.elements.push(newNode);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(newNode.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
        if (nodeTitle) nodeTitle.focus();
      });
    }

    const btnAddGateway = document.getElementById('btn-add-gateway-node');
    if (btnAddGateway) {
      btnAddGateway.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const newGw = {
          id: generateId(),
          type: 'node',
          x: cx - 110,
          y: cy - 42,
          width: 220,
          height: 85,
          title: 'Kong / Envoy Gateway',
          subtitle: 'TLS Termination · Rate Limit',
          badge: 'EDGE',
          icon: 'Shield',
          themeColor: '#0ca678',
          backgroundColor: '#ffffff',
          cardStyle: 'modern',
          strokeWidth: 1.5,
          seed: generateSeed()
        };
        this.elements.push(newGw);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(newGw.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddGroup = document.getElementById('btn-quick-add-group');
    if (btnAddGroup) {
      btnAddGroup.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const newGroup = {
          id: generateId(),
          type: 'group-boundary',
          boundaryType: 'vpc',
          subtype: 'vpc',
          x: cx - 250,
          y: cy - 180,
          width: 500,
          height: 360,
          title: 'Cloud VPC Network',
          cidr: '10.0.0.0/16',
          strokeColor: '#1971c2',
          backgroundColor: 'rgba(231, 245, 255, 0.45)',
          strokeStyle: 'solid',
          strokeWidth: 2,
          seed: generateSeed()
        };
        this.elements.unshift(newGroup);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(newGroup.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddPublicSubnet = document.getElementById('btn-add-public-subnet');
    if (btnAddPublicSubnet) {
      btnAddPublicSubnet.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const subnet = {
          id: generateId(),
          type: 'group-boundary',
          boundaryType: 'public-subnet',
          subtype: 'public-subnet',
          x: cx - 180,
          y: cy - 100,
          width: 360,
          height: 200,
          title: 'Public DMZ Subnet',
          cidr: '10.0.1.0/24',
          strokeColor: '#2b8a3e',
          backgroundColor: 'rgba(235, 251, 238, 0.45)',
          strokeStyle: 'dashed',
          seed: generateSeed()
        };
        this.elements.unshift(subnet);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(subnet.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddPrivateSubnet = document.getElementById('btn-add-private-subnet');
    if (btnAddPrivateSubnet) {
      btnAddPrivateSubnet.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const subnet = {
          id: generateId(),
          type: 'group-boundary',
          boundaryType: 'private-subnet',
          subtype: 'private-subnet',
          x: cx - 180,
          y: cy - 100,
          width: 360,
          height: 200,
          title: 'Private App Subnet',
          cidr: '10.0.2.0/24',
          strokeColor: '#4c6ef5',
          backgroundColor: 'rgba(237, 242, 255, 0.45)',
          strokeStyle: 'solid',
          seed: generateSeed()
        };
        this.elements.unshift(subnet);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(subnet.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddK8sCluster = document.getElementById('btn-add-k8s-cluster');
    if (btnAddK8sCluster) {
      btnAddK8sCluster.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const cluster = {
          id: generateId(),
          type: 'group-boundary',
          boundaryType: 'k8s-cluster',
          subtype: 'k8s-cluster',
          x: cx - 200,
          y: cy - 110,
          width: 400,
          height: 220,
          title: 'Production K8s Cluster',
          namespace: 'production-core',
          cidr: '10.244.0.0/16',
          strokeColor: '#326ce5',
          backgroundColor: 'rgba(50, 108, 229, 0.08)',
          strokeStyle: 'solid',
          seed: generateSeed()
        };
        this.elements.unshift(cluster);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(cluster.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    const btnAddArrow = document.getElementById('btn-quick-add-arrow');
    if (btnAddArrow) {
      btnAddArrow.addEventListener('click', () => {
        const { cx, cy } = getCenter();
        const newArrow = {
          id: generateId(),
          type: 'arrow',
          x: cx - 100,
          y: cy,
          width: 200,
          height: 0,
          label: 'HTTPS / JSON',
          direction: 'forward',
          strokeColor: '#1971c2',
          strokeWidth: 2,
          strokeStyle: 'solid',
          isAnimated: false,
          seed: generateSeed()
        };
        this.elements.push(newArrow);
        this.selectedElementIds.clear();
        this.selectedElementIds.add(newArrow.id);
        this.history.record(this.elements);
        this.updateInspectorUI();
        this.render();
      });
    }

    // 8.4 C4 Architecture Model Primitives
    const c4Primitives = [
      { id: 'btn-add-c4-person', type: 'c4-element', c4Type: 'Person', c4Shape: 'person', c4Tag: '[Person]', title: 'Banking Customer', subtitle: 'Personal banking customer with accounts', themeColor: '#08427b', width: 170, height: 110 },
      { id: 'btn-add-c4-person-ext', type: 'c4-element', c4Type: 'Person_Ext', c4Shape: 'person', c4Tag: '[Person]', isExt: true, title: 'External Customer', subtitle: 'Customer of an external affiliate bank', themeColor: '#6c757d', width: 170, height: 110 },
      { id: 'btn-add-c4-system', type: 'c4-element', c4Type: 'System', c4Shape: 'system', c4Tag: '[Software System]', title: 'Internet Banking System', subtitle: 'Allows customers to view accounts and make payments', themeColor: '#1168bd', width: 200, height: 110 },
      { id: 'btn-add-c4-system-ext', type: 'c4-element', c4Type: 'System_Ext', c4Shape: 'system', c4Tag: '[Software System]', isExt: true, title: 'Mainframe Banking System', subtitle: 'Stores core accounts and transaction ledger', themeColor: '#6c757d', width: 200, height: 110 },
      { id: 'btn-add-c4-container', type: 'c4-element', c4Type: 'Container', c4Shape: 'system', c4Tag: '[Container: Java / Spring Boot]', title: 'API Application', subtitle: 'Provides banking API functionality via JSON/HTTPS', themeColor: '#438dd5', width: 210, height: 110 },
      { id: 'btn-add-c4-component', type: 'c4-element', c4Type: 'Component', c4Shape: 'system', c4Tag: '[Component: Spring REST]', title: 'Accounts Summary Controller', subtitle: 'Provides customer with overview of accounts', themeColor: '#85bbf0', width: 210, height: 110 },
      { id: 'btn-add-c4-db', type: 'c4-element', c4Type: 'ContainerDb', c4Shape: 'database', c4Tag: '[Container: Database]', title: 'Relational Database', subtitle: 'Stores user accounts, credentials, and audit logs', themeColor: '#1168bd', width: 180, height: 120 },
      { id: 'btn-add-c4-db-ext', type: 'c4-element', c4Type: 'SystemDb_Ext', c4Shape: 'database', c4Tag: '[Database: External]', isExt: true, title: 'Credit Score Database', subtitle: 'Third-party credit bureau reference store', themeColor: '#6c757d', width: 180, height: 120 },
      { id: 'btn-add-c4-queue', type: 'c4-element', c4Type: 'SystemQueue', c4Shape: 'queue', c4Tag: '[Message Queue]', title: 'Kafka Event Bus', subtitle: 'Async transaction events & notifications', themeColor: '#1168bd', width: 190, height: 90 },
      { id: 'btn-add-c4-enterprise-boundary', type: 'group-boundary', boundaryType: 'enterprise', c4BoundaryType: 'Enterprise_Boundary', c4BoundaryTag: '[ENTERPRISE]', title: 'Enterprise Boundary', strokeColor: '#868e96', strokeStyle: 'dashed', strokeWidth: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.02)', width: 500, height: 350 },
      { id: 'btn-add-c4-system-boundary', type: 'group-boundary', boundaryType: 'system', c4BoundaryType: 'System_Boundary', c4BoundaryTag: '[SYSTEM]', title: 'Internet Banking System Boundary', strokeColor: '#868e96', strokeStyle: 'dashed', strokeWidth: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.02)', width: 440, height: 300 }
    ];

    c4Primitives.forEach(prim => {
      const btn = document.getElementById(prim.id);
      if (btn) {
        btn.addEventListener('click', () => {
          const { cx, cy } = getCenter();
          let element;
          if (prim.type === 'group-boundary') {
            element = {
              id: generateId(),
              type: 'group-boundary',
              boundaryType: prim.boundaryType,
              c4BoundaryType: prim.c4BoundaryType,
              c4BoundaryTag: prim.c4BoundaryTag,
              x: cx - prim.width / 2,
              y: cy - prim.height / 2,
              width: prim.width,
              height: prim.height,
              title: prim.title,
              strokeColor: prim.strokeColor,
              strokeStyle: prim.strokeStyle,
              strokeWidth: prim.strokeWidth,
              backgroundColor: prim.backgroundColor,
              seed: generateSeed()
            };
            this.elements.unshift(element);
          } else {
            element = {
              id: generateId(),
              type: 'c4-element',
              c4Type: prim.c4Type,
              c4Shape: prim.c4Shape,
              c4Tag: prim.c4Tag,
              isExt: !!prim.isExt,
              x: cx - prim.width / 2,
              y: cy - prim.height / 2,
              width: prim.width,
              height: prim.height,
              title: prim.title,
              subtitle: prim.subtitle,
              themeColor: prim.themeColor,
              seed: generateSeed()
            };
            this.elements.push(element);
          }
          this.selectedElementIds.clear();
          this.selectedElementIds.add(element.id);
          this.history.record(this.elements);
          this.updateInspectorUI();
          this.render();
        });
      }
    });

    // Quick Template Links in Property Panel
    document.querySelectorAll('.quick-tpl-pill[data-quick-template]').forEach(pill => {
      pill.addEventListener('click', () => {
        const tplKey = pill.dataset.quickTemplate;
        const newElements = getTemplateElements(tplKey);
        if (newElements && newElements.length > 0) {
          this.elements = newElements;
          this.selectedElementIds.clear();
          this.history.record(this.elements);
          const fit = calculateZoomToFit(this.elements, this.canvas.clientWidth, this.canvas.clientHeight, 60);
          this.zoom = fit.zoom;
          this.scrollX = fit.scrollX;
          this.scrollY = fit.scrollY;
          document.getElementById('zoomDisplay').textContent = `${Math.round(this.zoom * 100)}%`;
          this.updateInspectorUI();
          this.render();
        }
      });
    });
  }

  showNodeQuickEditModal(el, screenX, screenY) {
    const modal = document.getElementById('nodeQuickEditModal');
    const titleInput = document.getElementById('quickEditTitle');
    const subInput = document.getElementById('quickEditSubtitle');
    const badgeInput = document.getElementById('quickEditBadge');
    if (!modal || !titleInput) return;

    this.selectedElementIds.clear();
    this.selectedElementIds.add(el.id);
    this.updateInspectorUI();

    modal.style.display = 'flex';
    const modalW = 260;
    const left = Math.min(window.innerWidth - modalW - 20, Math.max(20, screenX + (el.width * this.zoom) / 2 - modalW / 2));
    const top = Math.min(window.innerHeight - 260, Math.max(70, screenY + (el.height * this.zoom) + 10));
    modal.style.left = `${left}px`;
    modal.style.top = `${top}px`;

    titleInput.value = el.title || '';
    subInput.value = el.subtitle || '';
    badgeInput.value = el.badge || '';
    titleInput.focus();

    const saveChanges = () => {
      el.title = titleInput.value.trim() || 'Service Node';
      el.subtitle = subInput.value.trim();
      el.badge = badgeInput.value.trim().toUpperCase();
      el._cacheKey = null;
      this.history.record(this.elements);
      this.updateInspectorUI();
      this.render();
      modal.style.display = 'none';
    };

    const applyBtn = document.getElementById('btn-apply-quick-edit');
    const closeBtn = document.getElementById('btn-close-quick-edit');

    applyBtn.onclick = (e) => {
      e.stopPropagation();
      saveChanges();
    };
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      modal.style.display = 'none';
    };
    modal.onkeydown = (e) => {
      if (e.key === 'Enter') {
        saveChanges();
      } else if (e.key === 'Escape') {
        modal.style.display = 'none';
      }
    };
  }

  bindInspectorEvents() {
    // Fill style
    document.querySelectorAll('#fillStyleControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const style = btn.dataset.fillStyle;
        this.activeStyles.fillStyle = style;
        this.applyStyleToSelection('fillStyle', style);
        this.updateInspectorUI();
        this.render();
      });
    });

    // Stroke width
    document.querySelectorAll('#strokeWidthControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const w = parseFloat(btn.dataset.width);
        this.activeStyles.strokeWidth = w;
        this.applyStyleToSelection('strokeWidth', w);
        this.updateInspectorUI();
        this.render();
      });
    });

    // Sloppiness / Roughness
    document.querySelectorAll('#roughnessControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = parseFloat(btn.dataset.roughness);
        this.activeStyles.roughness = r;
        this.applyStyleToSelection('roughness', r);
        this.updateInspectorUI();
        this.render();
      });
    });

    // Stroke style (solid, dashed, dotted)
    document.querySelectorAll('#strokeStyleControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = btn.dataset.strokeStyle;
        this.activeStyles.strokeStyle = s;
        this.applyStyleToSelection('strokeStyle', s);
        this.updateInspectorUI();
        this.render();
      });
    });

    // Opacity
    const opacitySlider = document.getElementById('opacitySlider');
    opacitySlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      document.getElementById('opacityValue').textContent = `${val}%`;
      this.activeStyles.opacity = val;
      this.applyStyleToSelection('opacity', val);
      this.render();
    });

    // Custom color pickers
    document.getElementById('customStrokeColor').addEventListener('input', (e) => {
      this.setStrokeColor(e.target.value);
    });
    document.getElementById('customBgColor').addEventListener('input', (e) => {
      this.setBackgroundColor(e.target.value);
    });

    // Edges (Sharp / Round)
    document.querySelectorAll('#edgesControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const edges = btn.dataset.edges || 'sharp';
        this.activeStyles.edges = edges;
        this.applyStyleToSelection('edges', edges);
        this.applyStyleToSelection('roundness', edges === 'round' ? { type: 3 } : null);
        this.updateInspectorUI();
        this.render();
      });
    });

    // Font Family (1: Virgil, 2: Sans-Serif, 3: Monospace, 4: Comic/Serif)
    document.querySelectorAll('#fontFamilyControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const family = parseInt(btn.dataset.fontFamily, 10) || 1;
        this.activeStyles.fontFamily = family;
        this.applyStyleToSelection('fontFamily', family);
        this.updateInspectorUI();
        this.render();
      });
    });

    // Font Size (16, 20, 28, 36)
    document.querySelectorAll('#fontSizeControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = parseInt(btn.dataset.fontSize, 10) || 20;
        this.activeStyles.fontSize = size;
        this.applyStyleToSelection('fontSize', size);
        this.updateInspectorUI();
        this.render();
      });
    });

    // Text Align (Horizontal: left, center, right)
    document.querySelectorAll('#textAlignControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const align = btn.dataset.textAlign || 'left';
        this.activeStyles.textAlign = align;
        this.applyStyleToSelection('textAlign', align);
        this.updateInspectorUI();
        this.render();
      });
    });

    // Vertical Align (top, middle, bottom)
    document.querySelectorAll('#verticalAlignControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const valig = btn.dataset.verticalAlign || 'middle';
        this.activeStyles.verticalAlign = valig;
        this.applyStyleToSelection('verticalAlign', valig);
        this.updateInspectorUI();
        this.render();
      });
    });

    // Layer Controls (Send to back, Send backward, Bring forward, Bring to front)
    document.getElementById('btn-layer-to-back')?.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.sendToBack();
    });
    document.getElementById('btn-layer-backward')?.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.sendBackward();
    });
    document.getElementById('btn-layer-forward')?.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.bringForward();
    });
    document.getElementById('btn-layer-to-front')?.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.bringToFront();
    });

    // Legacy / Backward compatible layer button IDs
    document.getElementById('btn-bring-front')?.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.bringToFront();
    });
    document.getElementById('btn-send-back')?.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.sendToBack();
    });

    // Actions
    document.getElementById('btn-duplicate')?.addEventListener('click', () => this.duplicateSelected());
    document.getElementById('btn-delete')?.addEventListener('click', () => this.deleteSelected());

    // Open & Close Inspector panel
    const inspector = document.getElementById('propertyInspector');
    const openBtn = document.getElementById('btn-open-properties');
    const closeBtn = document.getElementById('btn-close-properties');

    if (closeBtn && openBtn && inspector) {
      closeBtn.addEventListener('click', () => {
        inspector.classList.add('collapsed');
        openBtn.style.display = 'flex';
        this.initIcons();
      });

      openBtn.addEventListener('click', () => {
        inspector.classList.remove('collapsed');
        openBtn.style.display = 'none';
        this.initIcons();
      });
    }
  }

  // ==========================================================================
  // Pointer Interaction Pipeline
  // ==========================================================================
  onPointerDown(e) {
    if (e.button === 1 || this.spacePressed || this.currentTool === 'hand') {
      // Middle click, Space+drag, or Hand Tool = Canvas Panning
      this.isPanning = true;
      this.panStart = { x: e.clientX - this.scrollX, y: e.clientY - this.scrollY };
      this.canvas.style.cursor = 'grabbing';
      return;
    }

    const scenePoint = screenToScene(e.clientX, e.clientY, this.scrollX, this.scrollY, this.zoom);

    // 1. Eraser Tool
    if (this.currentTool === 'eraser') {
      this.eraseAtPoint(scenePoint);
      return;
    }

    // 2. Select Tool
    if (this.currentTool === 'select') {
      const selected = this.elements.filter(el => this.selectedElementIds.has(el.id));

      // Check if user clicked any resize or rotate handle of selected elements
      if (selected.length === 1) {
        const sel = selected[0];
        if (sel.routing === 'orthogonal' || sel.type === 'elbow-arrow') {
          const waypoints = getOrthogonalWaypointHandles(sel);
          const midWp = waypoints.find(w => w.id === 'mid');
          if (midWp && Math.hypot(scenePoint.x - midWp.x, scenePoint.y - midWp.y) <= 14 / this.zoom) {
            this.isDraggingElbow = true;
            this.elbowTarget = sel;
            this.drawStart = scenePoint;
            return;
          }
          const startWp = waypoints.find(w => w.id === 'start');
          if (startWp && Math.hypot(scenePoint.x - startWp.x, scenePoint.y - startWp.y) <= 14 / this.zoom) {
            this.isResizing = true;
            this.activeHandle = 'arrow-start';
            this.resizeOrigin = { x: sel.x, y: sel.y, width: sel.width, height: sel.height };
            this.drawStart = scenePoint;
            return;
          }
          const endWp = waypoints.find(w => w.id === 'end');
          if (endWp && Math.hypot(scenePoint.x - endWp.x, scenePoint.y - endWp.y) <= 14 / this.zoom) {
            this.isResizing = true;
            this.activeHandle = 'arrow-end';
            this.resizeOrigin = { x: sel.x, y: sel.y, width: sel.width, height: sel.height };
            this.drawStart = scenePoint;
            return;
          }
        } else if (sel.type === 'arrow' || sel.type === 'line') {
          const pStart = { x: sel.x, y: sel.y };
          const pEnd = { x: sel.x + sel.width, y: sel.y + sel.height };
          if (Math.hypot(scenePoint.x - pStart.x, scenePoint.y - pStart.y) <= 14 / this.zoom) {
            this.isResizing = true;
            this.activeHandle = 'arrow-start';
            this.resizeOrigin = { x: sel.x, y: sel.y, width: sel.width, height: sel.height };
            this.drawStart = scenePoint;
            return;
          }
          if (Math.hypot(scenePoint.x - pEnd.x, scenePoint.y - pEnd.y) <= 14 / this.zoom) {
            this.isResizing = true;
            this.activeHandle = 'arrow-end';
            this.resizeOrigin = { x: sel.x, y: sel.y, width: sel.width, height: sel.height };
            this.drawStart = scenePoint;
            return;
          }
        } else {
          const bounds = getElementBounds(sel);
          const handles = getResizeHandles(bounds);
          const hitHandle = hitTestHandle(scenePoint, handles, this.zoom);

          if (hitHandle) {
            if (hitHandle.handle === 'rotate') {
              this.isRotating = true;
              this.rotationCenter = {
                x: bounds.x + bounds.width / 2,
                y: bounds.y + bounds.height / 2
              };
            } else {
              this.isResizing = true;
              this.activeHandle = hitHandle.handle;
              this.resizeOrigin = { ...bounds };
            }
            this.drawStart = scenePoint;
            return;
          }
        }
      }

      // Check if clicked an element
      let hitElement = null;
      for (let i = this.elements.length - 1; i >= 0; i--) {
        if (hitTest(scenePoint.x, scenePoint.y, this.elements[i])) {
          hitElement = this.elements[i];
          break;
        }
      }

      if (hitElement) {
        if (e.shiftKey) {
          // Toggle in multi-selection
          if (this.selectedElementIds.has(hitElement.id)) {
            this.selectedElementIds.delete(hitElement.id);
          } else {
            this.selectedElementIds.add(hitElement.id);
          }
        } else {
          // If not already in selection, make it sole selection
          if (!this.selectedElementIds.has(hitElement.id)) {
            this.selectedElementIds.clear();
            this.selectedElementIds.add(hitElement.id);
          }
        }

        // Prepare drag offsets for all selected elements
        this.isDraggingElement = true;
        this.drawStart = scenePoint;
        this.dragOffsets.clear();
        for (const el of this.elements) {
          if (this.selectedElementIds.has(el.id)) {
            this.dragOffsets.set(el.id, { x: el.x - scenePoint.x, y: el.y - scenePoint.y, originX: el.x, originY: el.y });
          }
        }
      } else {
        // Clicked empty space: clear selection or start marquee
        if (!e.shiftKey) {
          this.selectedElementIds.clear();
        }
        this.selectionBox = {
          startX: scenePoint.x,
          startY: scenePoint.y,
          currentX: scenePoint.x,
          currentY: scenePoint.y
        };
      }

      this.updateInspectorUI();
      this.render();
      return;
    }

    // 3. Shape Creation Tools
    if (this.currentTool === 'node') {
      const newNode = {
        id: generateId(),
        type: 'node',
        x: scenePoint.x - 110,
        y: scenePoint.y - 42,
        width: 220,
        height: 85,
        title: 'New Service',
        subtitle: 'Node.js · Port 8080',
        badge: 'SERVICE',
        icon: 'Server',
        themeColor: '#1971c2',
        backgroundColor: '#ffffff',
        cardStyle: 'modern',
        strokeWidth: 1.5,
        seed: generateSeed()
      };
      this.elements.push(newNode);
      this.selectedElementIds.clear();
      this.selectedElementIds.add(newNode.id);
      this.history.record(this.elements);
      if (!this.isToolLocked) {
        this.setTool('select');
      }
      this.updateInspectorUI();
      this.render();
      return;
    }

    if (this.currentTool === 'text') {
      this.startInlineTextEditor(scenePoint, e.clientX, e.clientY);
      return;
    }

    // Drawing new shape
    this.isDrawing = true;
    this.drawStart = scenePoint;

    if (this.currentTool === 'freedraw') {
      this.previewElement = {
        id: generateId(),
        type: 'freedraw',
        x: scenePoint.x,
        y: scenePoint.y,
        width: 0,
        height: 0,
        points: [[scenePoint.x, scenePoint.y]],
        angle: 0,
        ...this.activeStyles,
        seed: generateSeed()
      };
    } else {
      const isElbow = this.currentTool === 'elbow-arrow';
      this.previewElement = {
        id: generateId(),
        type: isElbow ? 'arrow' : this.currentTool,
        routing: isElbow ? 'orthogonal' : (this.activeStyles.routing || 'straight'),
        isAnimated: Boolean(this.activeStyles.isAnimated),
        elbowRatio: 0.5,
        elbowOrientation: 'auto',
        x: scenePoint.x,
        y: scenePoint.y,
        width: 0,
        height: 0,
        angle: 0,
        ...this.activeStyles,
        seed: generateSeed()
      };
      if (isElbow) {
        this.previewElement.routing = 'orthogonal';
      }
    }

    this.render();
  }

  onPointerMove(e) {
    if (this.isPanning) {
      this.scrollX = e.clientX - this.panStart.x;
      this.scrollY = e.clientY - this.panStart.y;
      this.clampPan();
      this.render();
      return;
    }

    const scenePoint = screenToScene(e.clientX, e.clientY, this.scrollX, this.scrollY, this.zoom);

    // Eraser drag
    if (this.currentTool === 'eraser' && (e.buttons === 1)) {
      this.eraseAtPoint(scenePoint);
      return;
    }

    // Dragging middle elbow waypoint handle
    if (this.isDraggingElbow && this.elbowTarget) {
      const el = this.elbowTarget;
      const dx = (el.x + el.width) - el.x;
      const dy = (el.y + el.height) - el.y;
      const isVertical = el.elbowOrientation === 'vertical' || (el.elbowOrientation !== 'horizontal' && Math.abs(dy) >= Math.abs(dx));
      if (isVertical && dy !== 0) {
        const newRatio = (scenePoint.y - el.y) / dy;
        el.elbowRatio = Math.max(0.1, Math.min(0.9, newRatio));
      } else if (!isVertical && dx !== 0) {
        const newRatio = (scenePoint.x - el.x) / dx;
        el.elbowRatio = Math.max(0.1, Math.min(0.9, newRatio));
      }
      el._cacheKey = null;
      this.render();
      return;
    }

    // Dragging selected elements
    if (this.isDraggingElement) {
      for (const el of this.elements) {
        if (this.selectedElementIds.has(el.id)) {
          const offset = this.dragOffsets.get(el.id);
          if (offset) {
            const dx = scenePoint.x - this.drawStart.x;
            const dy = scenePoint.y - this.drawStart.y;
            el.x = offset.originX + dx;
            el.y = offset.originY + dy;
            if (el.type === 'freedraw' && el.points) {
              // translate all points
              if (!offset.originPoints) {
                offset.originPoints = el.points.map(p => [...p]);
              }
              el.points = offset.originPoints.map(([px, py]) => [px + dx, py + dy]);
            }
            el._cacheKey = null;
          }
        }
      }
      this.render();
      return;
    }

    // Resizing single element
    if (this.isResizing) {
      const selected = this.elements.find(el => this.selectedElementIds.has(el.id));
      if (selected) {
        this.performResize(selected, scenePoint);
        this.render();
      }
      return;
    }

    // Rotating single element
    if (this.isRotating) {
      const selected = this.elements.find(el => this.selectedElementIds.has(el.id));
      if (selected) {
        const angle = Math.atan2(scenePoint.y - this.rotationCenter.y, scenePoint.x - this.rotationCenter.x) + Math.PI / 2;
        selected.angle = angle;
        selected._cacheKey = null;
        this.render();
      }
      return;
    }

    // Marquee Selection Box
    if (this.selectionBox) {
      this.selectionBox.currentX = scenePoint.x;
      this.selectionBox.currentY = scenePoint.y;
      this.render();
      return;
    }

    // Drawing preview element
    if (this.isDrawing && this.previewElement) {
      if (this.previewElement.type === 'freedraw') {
        const lastPt = this.previewElement.points[this.previewElement.points.length - 1];
        if (Math.hypot(scenePoint.x - lastPt[0], scenePoint.y - lastPt[1]) > 2) {
          this.previewElement.points.push([scenePoint.x, scenePoint.y]);
        }
      } else {
        this.previewElement.width = scenePoint.x - this.drawStart.x;
        this.previewElement.height = scenePoint.y - this.drawStart.y;
      }
      this.render();
      return;
    }

    // Hover handle cursor indicator in select tool
    if (this.currentTool === 'select' && this.selectedElementIds.size === 1) {
      const selected = this.elements.find(el => this.selectedElementIds.has(el.id));
      if (selected) {
        if (selected.routing === 'orthogonal' || selected.type === 'elbow-arrow') {
          const waypoints = getOrthogonalWaypointHandles(selected);
          const midWp = waypoints.find(w => w.id === 'mid');
          const isVert = selected.elbowOrientation === 'vertical' || (selected.elbowOrientation !== 'horizontal' && Math.abs(selected.height) >= Math.abs(selected.width));
          if (midWp && Math.hypot(scenePoint.x - midWp.x, scenePoint.y - midWp.y) <= 14 / this.zoom) {
            this.canvas.style.cursor = isVert ? 'ns-resize' : 'ew-resize';
            return;
          }
          const startWp = waypoints.find(w => w.id === 'start');
          if (startWp && Math.hypot(scenePoint.x - startWp.x, scenePoint.y - startWp.y) <= 14 / this.zoom) {
            this.canvas.style.cursor = 'move';
            return;
          }
          const endWp = waypoints.find(w => w.id === 'end');
          if (endWp && Math.hypot(scenePoint.x - endWp.x, scenePoint.y - endWp.y) <= 14 / this.zoom) {
            this.canvas.style.cursor = 'move';
            return;
          }
        } else if (selected.type === 'arrow' || selected.type === 'line') {
          const pStart = { x: selected.x, y: selected.y };
          const pEnd = { x: selected.x + selected.width, y: selected.y + selected.height };
          if (Math.hypot(scenePoint.x - pStart.x, scenePoint.y - pStart.y) <= 14 / this.zoom ||
              Math.hypot(scenePoint.x - pEnd.x, scenePoint.y - pEnd.y) <= 14 / this.zoom) {
            this.canvas.style.cursor = 'move';
            return;
          }
        } else {
          const bounds = getElementBounds(selected);
          const handles = getResizeHandles(bounds);
          const hitHandle = hitTestHandle(scenePoint, handles, this.zoom);
          if (hitHandle) {
            this.canvas.style.cursor = hitHandle.cursor;
            return;
          }
        }
      }
    }

    if (!this.spacePressed) {
      this.canvas.style.cursor = this.currentTool === 'select' ? 'default' : this.currentTool === 'hand' ? 'grab' : this.currentTool === 'text' ? 'text' : 'crosshair';
    }
  }

  onPointerUp(e) {
    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = (this.spacePressed || this.currentTool === 'hand') ? 'grab' : (this.currentTool === 'select' ? 'default' : 'crosshair');
      return;
    }

    if (this.isDraggingElbow) {
      this.isDraggingElbow = false;
      this.elbowTarget = null;
      this.history.record(this.elements);
      this.scheduleAutoSave();
      this.render();
      return;
    }

    if (this.isDraggingElement) {
      this.isDraggingElement = false;
      this.graphDirty = true;
      this.history.record(this.elements);
      this.render();
      return;
    }

    if (this.isResizing || this.isRotating) {
      this.isResizing = false;
      this.isRotating = false;
      this.graphDirty = true;
      this.history.record(this.elements);
      this.render();
      return;
    }

    if (this.selectionBox) {
      // Finalize marquee selection
      const box = {
        minX: Math.min(this.selectionBox.startX, this.selectionBox.currentX),
        minY: Math.min(this.selectionBox.startY, this.selectionBox.currentY),
        maxX: Math.max(this.selectionBox.startX, this.selectionBox.currentX),
        maxY: Math.max(this.selectionBox.startY, this.selectionBox.currentY)
      };

      for (const el of this.elements) {
        const b = getElementBounds(el);
        if (
          b.x + b.width >= box.minX &&
          b.x <= box.maxX &&
          b.y + b.height >= box.minY &&
          b.y <= box.maxY
        ) {
          this.selectedElementIds.add(el.id);
        }
      }
      this.selectionBox = null;
      this.updateInspectorUI();
      this.render();
      return;
    }

    if (this.isDrawing && this.previewElement) {
      this.isDrawing = false;
      // Filter out tiny accidental clicks for shapes
      if (
        this.previewElement.type !== 'freedraw' &&
        Math.abs(this.previewElement.width) < 4 &&
        Math.abs(this.previewElement.height) < 4
      ) {
        this.previewElement = null;
        this.render();
        return;
      }

      const finalElement = normalizeElement(this.previewElement);
      this.elements.push(finalElement);
      this.previewElement = null;

      // Select newly drawn element
      this.selectedElementIds.clear();
      this.selectedElementIds.add(finalElement.id);

      // Revert to select tool unless lock is on
      if (!this.isToolLocked) {
        this.setTool('select');
      }

      this.history.record(this.elements);
      this.updateInspectorUI();
      this.render();
    }
  }

  performResize(el, point) {
    const o = this.resizeOrigin;
    const handle = this.activeHandle;

    if (handle === 'arrow-start') {
      const endX = o.x + o.width;
      const endY = o.y + o.height;
      el.x = point.x;
      el.y = point.y;
      el.width = endX - point.x;
      el.height = endY - point.y;
      el._cacheKey = null;
      return;
    }
    if (handle === 'arrow-end') {
      el.width = point.x - el.x;
      el.height = point.y - el.y;
      el._cacheKey = null;
      return;
    }

    if (handle.includes('e')) {
      el.width = Math.max(10, point.x - o.x);
    }
    if (handle.includes('s')) {
      el.height = Math.max(10, point.y - o.y);
    }
    if (handle.includes('w')) {
      const newWidth = Math.max(10, (o.x + o.width) - point.x);
      el.x = (o.x + o.width) - newWidth;
      el.width = newWidth;
    }
    if (handle.includes('n')) {
      const newHeight = Math.max(10, (o.y + o.height) - point.y);
      el.y = (o.y + o.height) - newHeight;
      el.height = newHeight;
    }
    el._cacheKey = null;
  }

  eraseAtPoint(point) {
    const initialLen = this.elements.length;
    this.elements = this.elements.filter(el => !hitTest(point.x, point.y, el));
    if (this.elements.length !== initialLen) {
      this.selectedElementIds.clear();
      this.history.record(this.elements);
      this.render();
    }
  }

  // ==========================================================================
  // Inline Text Editor
  // ==========================================================================
  startInlineTextEditor(scenePoint, screenX, screenY, existingElement = null) {
    const textarea = document.getElementById('inlineTextEditor');
    if (!textarea) return;

    textarea.style.display = 'block';
    textarea.style.left = `${screenX}px`;
    textarea.style.top = `${screenY}px`;
    textarea.style.minWidth = '140px';
    textarea.style.minHeight = '36px';
    textarea.style.zIndex = '1000';
    textarea.value = existingElement ? (existingElement.text || '') : '';
    textarea.style.fontSize = `${(existingElement ? existingElement.fontSize || 24 : 24) * this.zoom}px`;

    const stopProp = (e) => e.stopPropagation();
    textarea.addEventListener('pointerdown', stopProp);
    textarea.addEventListener('mousedown', stopProp);
    textarea.addEventListener('click', stopProp);

    let committed = false;
    const commit = () => {
      if (committed) return;
      committed = true;
      textarea.style.display = 'none';
      const text = textarea.value.trim();
      textarea.removeEventListener('blur', onBlur);
      textarea.removeEventListener('keydown', onKeyDown);
      textarea.removeEventListener('pointerdown', stopProp);
      textarea.removeEventListener('mousedown', stopProp);
      textarea.removeEventListener('click', stopProp);

      if (text.length > 0) {
        if (existingElement) {
          existingElement.text = text;
          existingElement._cacheKey = null;
        } else {
          const newEl = {
            id: generateId(),
            type: 'text',
            x: scenePoint.x,
            y: scenePoint.y,
            text: text,
            fontSize: 24,
            angle: 0,
            strokeColor: this.activeStyles.strokeColor,
            roughness: this.activeStyles.roughness,
            opacity: this.activeStyles.opacity,
            seed: generateSeed()
          };
          this.elements.push(newEl);
          this.selectedElementIds.clear();
          this.selectedElementIds.add(newEl.id);
        }
        this.history.record(this.elements);
      } else if (existingElement) {
        // Empty text deletes element
        this.elements = this.elements.filter(e => e.id !== existingElement.id);
        this.selectedElementIds.delete(existingElement.id);
        this.history.record(this.elements);
      }

      if (!this.isToolLocked) {
        this.setTool('select');
      }
      this.render();
    };

    const onKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        commit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        committed = true;
        textarea.style.display = 'none';
        textarea.removeEventListener('blur', onBlur);
        textarea.removeEventListener('keydown', onKeyDown);
        textarea.removeEventListener('pointerdown', stopProp);
        textarea.removeEventListener('mousedown', stopProp);
        textarea.removeEventListener('click', stopProp);
        if (!this.isToolLocked) this.setTool('select');
        this.render();
      }
    };

    const onBlur = () => {
      setTimeout(commit, 80);
    };

    textarea.addEventListener('keydown', onKeyDown);
    textarea.addEventListener('blur', onBlur);

    setTimeout(() => {
      textarea.focus();
      if (existingElement) textarea.select();
    }, 40);
  }

  startInlineShapeTextEditor(shapeEl, screenX, screenY) {
    const textarea = document.getElementById('inlineTextEditor');
    if (!textarea) return;

    textarea.style.display = 'block';
    textarea.style.left = `${screenX}px`;
    textarea.style.top = `${screenY}px`;
    textarea.style.width = `${Math.max(120, (shapeEl.width - 16) * this.zoom)}px`;
    textarea.style.minHeight = `${Math.max(40, (shapeEl.height - 16) * this.zoom)}px`;
    textarea.style.zIndex = '1000';
    textarea.value = shapeEl.text || '';
    textarea.style.fontSize = `${(shapeEl.fontSize || 20) * this.zoom}px`;
    textarea.style.textAlign = shapeEl.textAlign || 'center';

    const stopProp = (e) => e.stopPropagation();
    textarea.addEventListener('pointerdown', stopProp);
    textarea.addEventListener('mousedown', stopProp);
    textarea.addEventListener('click', stopProp);

    let committed = false;
    const commit = () => {
      if (committed) return;
      committed = true;
      textarea.style.display = 'none';
      const text = textarea.value.trim();
      textarea.removeEventListener('blur', onBlur);
      textarea.removeEventListener('keydown', onKeyDown);
      textarea.removeEventListener('pointerdown', stopProp);
      textarea.removeEventListener('mousedown', stopProp);
      textarea.removeEventListener('click', stopProp);

      shapeEl.text = text;
      shapeEl._cacheKey = null;
      this.history.record(this.elements);
      this.updateInspectorUI();
      this.render();
    };

    const onKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        commit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        committed = true;
        textarea.style.display = 'none';
        textarea.removeEventListener('blur', onBlur);
        textarea.removeEventListener('keydown', onKeyDown);
        textarea.removeEventListener('pointerdown', stopProp);
        textarea.removeEventListener('mousedown', stopProp);
        textarea.removeEventListener('click', stopProp);
        this.render();
      }
    };

    const onBlur = () => {
      setTimeout(commit, 80);
    };

    textarea.addEventListener('keydown', onKeyDown);
    textarea.addEventListener('blur', onBlur);

    setTimeout(() => {
      textarea.focus();
      textarea.select();
    }, 40);
  }

  onDoubleClick(e) {
    const scenePoint = screenToScene(e.clientX, e.clientY, this.scrollX, this.scrollY, this.zoom);
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const el = this.elements[i];
      if (el.type === 'text' && hitTest(scenePoint.x, scenePoint.y, el)) {
        const screenPos = sceneToScreen(el.x, el.y, this.scrollX, this.scrollY, this.zoom);
        this.startInlineTextEditor(scenePoint, screenPos.x, screenPos.y, el);
        return;
      }
      if ((el.type === 'rectangle' || el.type === 'ellipse' || el.type === 'diamond') && hitTest(scenePoint.x, scenePoint.y, el)) {
        this.selectedElementIds.clear();
        this.selectedElementIds.add(el.id);
        this.updateInspectorUI();
        const screenPos = sceneToScreen(el.x + 8, el.y + 8, this.scrollX, this.scrollY, this.zoom);
        this.startInlineShapeTextEditor(el, screenPos.x, screenPos.y);
        return;
      }
      if (el.type === 'activity-action' && hitTest(scenePoint.x, scenePoint.y, el)) {
        this.selectedElementIds.clear();
        this.selectedElementIds.add(el.id);
        this.updateInspectorUI();
        const actionTitleInput = document.getElementById('propActionTitle');
        if (actionTitleInput) {
          actionTitleInput.focus();
          actionTitleInput.select();
        }
        return;
      }
      if (el.type === 'node' && hitTest(scenePoint.x, scenePoint.y, el)) {
        const screenPos = sceneToScreen(el.x, el.y, this.scrollX, this.scrollY, this.zoom);
        this.showNodeQuickEditModal(el, screenPos.x, screenPos.y);
        return;
      }
      if (el.type === 'erd-table' && hitTest(scenePoint.x, scenePoint.y, el)) {
        this.selectedElementIds.clear();
        this.selectedElementIds.add(el.id);
        this.updateInspectorUI();
        const tableNameInput = document.getElementById('propErdTableName');
        if (tableNameInput) {
          tableNameInput.focus();
          tableNameInput.select();
        }
        return;
      }
      if (el.type === 'state-node' && hitTest(scenePoint.x, scenePoint.y, el)) {
        this.selectedElementIds.clear();
        this.selectedElementIds.add(el.id);
        this.updateInspectorUI();
        const stateTitleInput = document.getElementById('propStateTitle');
        if (stateTitleInput) {
          stateTitleInput.focus();
          stateTitleInput.select();
        }
        return;
      }
      if (el.type === 'swimlane' && hitTest(scenePoint.x, scenePoint.y, el)) {
        this.selectedElementIds.clear();
        this.selectedElementIds.add(el.id);
        this.updateInspectorUI();
        const swimlaneTitleInput = document.getElementById('propSwimlaneTitle');
        if (swimlaneTitleInput) {
          swimlaneTitleInput.focus();
          swimlaneTitleInput.select();
        }
        return;
      }
      if ((el.type === 'arrow' || el.type === 'line') && hitTest(scenePoint.x, scenePoint.y, el)) {
        this.selectedElementIds.clear();
        this.selectedElementIds.add(el.id);
        this.updateInspectorUI();
        const labelInput = document.getElementById('propArrowLabel');
        if (labelInput) labelInput.focus();
        return;
      }
    }
  }

  // ==========================================================================
  // Zoom & Pan Wheel
  // ==========================================================================
  onWheel(e) {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Pinch / Ctrl+Scroll Zoom
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const newZoom = Math.max(0.15, Math.min(4.0, this.zoom * zoomFactor));

      // Zoom towards mouse pointer
      this.scrollX = mouseX - (mouseX - this.scrollX) * (newZoom / this.zoom);
      this.scrollY = mouseY - (mouseY - this.scrollY) * (newZoom / this.zoom);
      this.zoom = newZoom;

      document.getElementById('zoomDisplay').textContent = `${Math.round(this.zoom * 100)}%`;
      this.render();
    } else if (e.shiftKey) {
      // Shift + Wheel horizontal scroll
      this.scrollX -= e.deltaY;
      this.clampPan();
      this.render();
    } else {
      // Pan
      this.scrollX -= e.deltaX;
      this.scrollY -= e.deltaY;
      this.clampPan();
      this.render();
    }
  }

  clampPan() {
    const MAX_COORD = 10000000;
    this.scrollX = Math.max(-MAX_COORD, Math.min(MAX_COORD, Number.isFinite(this.scrollX) ? this.scrollX : 0));
    this.scrollY = Math.max(-MAX_COORD, Math.min(MAX_COORD, Number.isFinite(this.scrollY) ? this.scrollY : 0));
  }

  changeZoom(factor) {
    const newZoom = Math.max(0.15, Math.min(4.0, this.zoom * factor));
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    this.scrollX = cx - (cx - this.scrollX) * (newZoom / this.zoom);
    this.scrollY = cy - (cy - this.scrollY) * (newZoom / this.zoom);
    this.clampPan();
    this.zoom = newZoom;
    document.getElementById('zoomDisplay').textContent = `${Math.round(this.zoom * 100)}%`;
    this.render();
  }

  resetZoom() {
    this.zoom = 1.0;
    this.scrollX = 40;
    this.scrollY = 40;
    document.getElementById('zoomDisplay').textContent = '100%';
    this.render();
  }

  // ==========================================================================
  // Keyboard Shortcuts
  // ==========================================================================
  onKeyDown(e) {
    if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') {
      return;
    }

    if (e.code === 'Space' && !this.spacePressed) {
      this.spacePressed = true;
      this.canvas.style.cursor = 'grab';
    }

    // Number hotkeys (1-9)
    if (['1', 'v', 'V'].includes(e.key) && !e.ctrlKey && !e.metaKey) this.setTool('select');
    if (['2', 'r', 'R'].includes(e.key) && !e.ctrlKey && !e.metaKey) this.setTool('rectangle');
    if (['3', 'd', 'D'].includes(e.key) && !e.ctrlKey && !e.metaKey) this.setTool('diamond');
    if (['4', 'c', 'C'].includes(e.key) && !e.ctrlKey && !e.metaKey) this.setTool('ellipse');
    if (['5', 'a', 'A'].includes(e.key) && !e.ctrlKey && !e.metaKey && !e.shiftKey) this.setTool('arrow');
    if ((['o', 'O'].includes(e.key) || (e.shiftKey && ['a', 'A'].includes(e.key))) && !e.ctrlKey && !e.metaKey) this.setTool('elbow-arrow');
    if (['6', 'l', 'L'].includes(e.key) && !e.ctrlKey && !e.metaKey) this.setTool('line');
    if (['7', 'p', 'P'].includes(e.key) && !e.ctrlKey && !e.metaKey) this.setTool('freedraw');
    if (['8', 't', 'T'].includes(e.key) && !e.ctrlKey && !e.metaKey) this.setTool('text');
    if (['9', 'e', 'E'].includes(e.key) && !e.ctrlKey && !e.metaKey) this.setTool('eraser');
    if ((e.key === 'i' || e.key === 'I') && !e.ctrlKey && !e.metaKey) this.triggerImageUpload();
    if (['0', 'n', 'N'].includes(e.key) && !e.ctrlKey && !e.metaKey) this.setTool('node');
    if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.metaKey) this.setTool('hand');

    // Quick Save / Export to SVG (Ctrl+S / Cmd+S)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      const els = (this.selectedElements && this.selectedElements.length > 0)
        ? this.selectedElements
        : this.elements;
      exportToSvg(els, this.theme, { canvasBackground: this.canvasBackground });
      this.showToast('Diagram saved as SVG (Ctrl+S)', 'success');
      return;
    }

    // Clipboard: Copy (Ctrl+C), Paste (Ctrl+V), Cut (Ctrl+X)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      this.copySelected();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
      e.preventDefault();
      this.pasteClipboard();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'x' || e.key === 'X')) {
      e.preventDefault();
      this.cutSelected();
      return;
    }

    // Select All (Ctrl+A)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      this.selectedElementIds.clear();
      for (const el of this.elements) {
        this.selectedElementIds.add(el.id);
      }
      this.updateInspectorUI();
      this.render();
      return;
    }

    // Arrow keys: Nudge selected or Pan canvas in all 4 directions
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : (this.selectedElementIds.size > 0 ? 1 : 40);
      const dx = e.key === 'ArrowLeft' ? -step : (e.key === 'ArrowRight' ? step : 0);
      const dy = e.key === 'ArrowUp' ? -step : (e.key === 'ArrowDown' ? step : 0);

      if (this.selectedElementIds.size > 0) {
        for (const el of this.elements) {
          if (this.selectedElementIds.has(el.id)) {
            el.x += dx;
            el.y += dy;
            if (el.points) {
              el.points = el.points.map(([px, py]) => [px + dx, py + dy]);
            }
            el._cacheKey = null;
          }
        }
        this.history.record(this.elements);
        this.render();
      } else {
        // Pan canvas smoothly
        this.scrollX -= dx;
        this.scrollY -= dy;
        this.clampPan();
        this.render();
      }
      return;
    }

    // Grid toggle
    if (e.key === 'g' || e.key === 'G') {
      this.showGrid = !this.showGrid;
      this.render();
    }

    // Alt + M toggles system telemetry overlay
    if (e.altKey && (e.key === 'm' || e.key === 'M')) {
      e.preventDefault();
      this.toggleMetricsOverlay();
      return;
    }

    // Minimap toggle (M)
    if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.altKey) {
      this.minimap?.toggle();
    }

    // Presentation mode toggle (F)
    if (e.key === 'f' || e.key === 'F') {
      this.presenter?.toggle();
    }

    // Shortcuts Cheat Sheet toggle (?)
    if ((e.key === '?' || (e.key === '/' && e.shiftKey)) && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      const modal = document.getElementById('shortcutsModal');
      if (modal) {
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
        createIcons({ icons });
      }
      return;
    }

    // Escape exits modals, presentation mode, or deselects
    if (e.key === 'Escape') {
      const shortcutsModal = document.getElementById('shortcutsModal');
      if (shortcutsModal && shortcutsModal.style.display === 'flex') {
        shortcutsModal.style.display = 'none';
        return;
      }
      const confirmModal = document.getElementById('confirmModal');
      if (confirmModal && confirmModal.style.display === 'flex') {
        confirmModal.style.display = 'none';
        return;
      }
      if (this.presenter && this.presenter.isActive) {
        this.presenter.exit();
        return;
      }
      if (this.selectedElementIds.size > 0) {
        this.selectedElementIds.clear();
        this.updateInspectorUI();
        this.render();
      }
    }

    // Delete
    if (e.key === 'Delete' || e.key === 'Backspace') {
      this.deleteSelected();
    }

    // Duplicate (Ctrl+D)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      this.duplicateSelected();
    }

    // Layers (Ctrl+], Ctrl+[, Ctrl+Shift+], Ctrl+Shift+[)
    const isBracketRight = e.key === ']' || e.key === '}' || e.code === 'BracketRight';
    const isBracketLeft = e.key === '[' || e.key === '{' || e.code === 'BracketLeft';
    if ((e.ctrlKey || e.metaKey) && isBracketRight) {
      e.preventDefault();
      if (e.shiftKey) this.bringToFront();
      else this.bringForward();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && isBracketLeft) {
      e.preventDefault();
      if (e.shiftKey) this.sendToBack();
      else this.sendBackward();
      return;
    }

    // Undo / Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      if (e.shiftKey) {
        this.redo();
      } else {
        this.undo();
      }
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
      e.preventDefault();
      this.redo();
    }
  }

  onKeyUp(e) {
    if (e.code === 'Space') {
      this.spacePressed = false;
      this.canvas.style.cursor = (this.currentTool === 'hand') ? 'grab' : (this.currentTool === 'select' ? 'default' : 'crosshair');
    }
  }

  // ==========================================================================
  // Element Actions
  // ==========================================================================
  copySelected() {
    if (this.selectedElementIds.size === 0) return;
    this.clipboard = [];
    for (const el of this.elements) {
      if (this.selectedElementIds.has(el.id)) {
        const copy = JSON.parse(JSON.stringify(el));
        delete copy._drawable;
        delete copy._cacheKey;
        this.clipboard.push(copy);
      }
    }
  }

  cutSelected() {
    if (this.selectedElementIds.size === 0) return;
    this.copySelected();
    this.deleteSelected();
  }

  pasteClipboard() {
    if (!this.clipboard || this.clipboard.length === 0) return;
    const newSelectedIds = new Set();
    const pasted = [];

    for (const el of this.clipboard) {
      const copy = JSON.parse(JSON.stringify(el));
      copy.id = generateId();
      copy.seed = generateSeed();
      copy.x += 24;
      copy.y += 24;
      if (copy.points) {
        copy.points = copy.points.map(([px, py]) => [px + 24, py + 24]);
      }
      delete copy._drawable;
      delete copy._cacheKey;
      pasted.push(copy);
      newSelectedIds.add(copy.id);
    }

    // Offset clipboard so repeated pastes cascade neatly
    for (const item of this.clipboard) {
      item.x += 24;
      item.y += 24;
      if (item.points) {
        item.points = item.points.map(([px, py]) => [px + 24, py + 24]);
      }
    }

    this.elements.push(...pasted);
    this.selectedElementIds = newSelectedIds;
    this.history.record(this.elements);
    this.updateInspectorUI();
    this.render();
  }
  deleteSelected() {
    if (this.selectedElementIds.size === 0) return;
    this.elements = this.elements.filter(el => !this.selectedElementIds.has(el.id));
    this.selectedElementIds.clear();
    this.history.record(this.elements);
    this.updateInspectorUI();
    this.render();
  }

  duplicateSelected() {
    if (this.selectedElementIds.size === 0) return;
    const newSelectedIds = new Set();
    const duplicates = [];

    for (const el of this.elements) {
      if (this.selectedElementIds.has(el.id)) {
        const copy = JSON.parse(JSON.stringify(el));
        copy.id = generateId();
        copy.seed = generateSeed();
        copy.x += 24;
        copy.y += 24;
        if (copy.points) {
          copy.points = copy.points.map(([px, py]) => [px + 24, py + 24]);
        }
        delete copy._drawable;
        delete copy._cacheKey;
        duplicates.push(copy);
        newSelectedIds.add(copy.id);
      }
    }

    this.elements.push(...duplicates);
    this.selectedElementIds = newSelectedIds;
    this.history.record(this.elements);
    this.updateInspectorUI();
    this.render();
  }

  bringToFront() {
    if (this.selectedElementIds.size === 0) return;
    const selected = [];
    const rest = [];
    for (const el of this.elements) {
      if (this.selectedElementIds.has(el.id)) selected.push(el);
      else rest.push(el);
    }
    this.elements = [...rest, ...selected];
    this.history.record(this.elements);
    this.render();
    this.showToast('Brought to front', 'info');
  }

  bringForward() {
    if (this.selectedElementIds.size === 0) return;
    let changed = false;
    for (let i = this.elements.length - 2; i >= 0; i--) {
      if (this.selectedElementIds.has(this.elements[i].id) && !this.selectedElementIds.has(this.elements[i + 1].id)) {
        const temp = this.elements[i];
        this.elements[i] = this.elements[i + 1];
        this.elements[i + 1] = temp;
        changed = true;
      }
    }
    if (changed) {
      this.history.record(this.elements);
      this.render();
      this.showToast('Brought forward', 'info');
    }
  }

  sendBackward() {
    if (this.selectedElementIds.size === 0) return;
    let changed = false;
    for (let i = 1; i < this.elements.length; i++) {
      if (this.selectedElementIds.has(this.elements[i].id) && !this.selectedElementIds.has(this.elements[i - 1].id)) {
        const temp = this.elements[i];
        this.elements[i] = this.elements[i - 1];
        this.elements[i - 1] = temp;
        changed = true;
      }
    }
    if (changed) {
      this.history.record(this.elements);
      this.render();
      this.showToast('Sent backward', 'info');
    }
  }

  sendToBack() {
    if (this.selectedElementIds.size === 0) return;
    const selected = [];
    const rest = [];
    for (const el of this.elements) {
      if (this.selectedElementIds.has(el.id)) selected.push(el);
      else rest.push(el);
    }
    this.elements = [...selected, ...rest];
    this.history.record(this.elements);
    this.render();
    this.showToast('Sent to back', 'info');
  }

  undo() {
    const prev = this.history.undo();
    if (prev) {
      this.elements = prev;
      this.selectedElementIds.clear();
      this.updateInspectorUI();
      this.render();
    }
  }

  redo() {
    const next = this.history.redo();
    if (next) {
      this.elements = next;
      this.selectedElementIds.clear();
      this.updateInspectorUI();
      this.render();
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.body.className = `theme-${this.theme}`;
    const icon = document.getElementById('theme-icon');
    if (this.theme === 'dark') {
      icon.setAttribute('data-lucide', 'sun');
      if (this.canvasBackground === '#ffffff') {
        this.canvasBackground = '#121212';
      }
    } else {
      icon.setAttribute('data-lucide', 'moon');
      if (this.canvasBackground === '#121212') {
        this.canvasBackground = '#ffffff';
      }
    }
    this.initIcons();
    if (this.canvas) {
      this.canvas.style.backgroundColor = this.canvasBackground;
    }
    this.updateInspectorUI();
    this.scheduleAutoSave();
    this.render();
  }

  // ==========================================================================
  // Modals & Export Handling
  // ==========================================================================
  bindModals() {
    const archModal = document.getElementById('archModal');
    const exportModal = document.getElementById('exportModal');

    document.getElementById('btn-architecture')?.addEventListener('click', () => {
      if (archModal) {
        archModal.style.display = 'flex';
        this.renderDemoRoughShape();
      }
    });
    document.getElementById('btn-close-arch-modal')?.addEventListener('click', () => {
      if (archModal) archModal.style.display = 'none';
    });

    document.getElementById('btn-export-menu')?.addEventListener('click', () => {
      exportModal.style.display = 'flex';
    });
    document.getElementById('btn-close-export-modal')?.addEventListener('click', () => {
      exportModal.style.display = 'none';
    });

    // Close on overlay backdrop click
    [archModal, exportModal].filter(Boolean).forEach(m => {
      m.addEventListener('click', (e) => {
        if (e.target === m) m.style.display = 'none';
      });
    });

    // Export Triggers
    const getExportElements = () => {
      return (this.selectedElements && this.selectedElements.length > 0)
        ? this.selectedElements
        : this.elements;
    };

    document.getElementById('export-png').addEventListener('click', () => {
      const els = getExportElements();
      exportToPng(els, this.theme, 2, { metricsOverlay: this.showMetricsOverlay, canvasBackground: this.canvasBackground });
      exportModal.style.display = 'none';
      this.showToast(els === this.selectedElements ? 'Selected elements exported as PNG' : 'Diagram exported as PNG', 'success');
    });
    document.getElementById('export-svg').addEventListener('click', () => {
      const els = getExportElements();
      exportToSvg(els, this.theme, { canvasBackground: this.canvasBackground });
      exportModal.style.display = 'none';
      this.showToast(els === this.selectedElements ? 'Selected elements exported as SVG' : 'Diagram exported as SVG', 'success');
    });
    document.getElementById('export-pdf')?.addEventListener('click', () => {
      const els = getExportElements();
      exportToPdf(els, this.theme, { metricsOverlay: this.showMetricsOverlay, canvasBackground: this.canvasBackground });
      exportModal.style.display = 'none';
      this.showToast(els === this.selectedElements ? 'Selected elements exported as PDF' : 'Diagram exported as PDF', 'success');
    });
    document.getElementById('export-gif')?.addEventListener('click', () => {
      const els = getExportElements();
      exportToGif(els, this.theme, { metricsOverlay: this.showMetricsOverlay, canvasBackground: this.canvasBackground });
      exportModal.style.display = 'none';
      this.showToast('Generating animated GIF...', 'info');
    });
    document.getElementById('export-sql-ddl')?.addEventListener('click', () => {
      exportModal.style.display = 'none';
      this.openSqlPreviewModal();
    });
    document.getElementById('export-mermaid')?.addEventListener('click', () => {
      exportModal.style.display = 'none';
      this.openMermaidModal();
    });
    document.getElementById('export-json').addEventListener('click', () => {
      exportToJson(this.elements, { viewBackgroundColor: this.canvasBackground });
      exportModal.style.display = 'none';
      this.showToast('Diagram saved as JSON file', 'success');
    });

    // Import Image Trigger in Modal
    document.getElementById('import-image-trigger')?.addEventListener('click', () => {
      exportModal.style.display = 'none';
      this.triggerImageUpload();
    });

    // Import Trigger with Destructive Confirmation
    const fileInput = document.getElementById('fileInput');
    document.getElementById('import-json-trigger').addEventListener('click', () => {
      fileInput.click();
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];

        // If the user selected a bitmap image file through fileInput, route directly to image insertion.
        // SVGs can contain embedded Excalidraw diagrams, so they are routed through importFromJson.
        const isSvg = file.name.endsWith('.svg') || file.type === 'image/svg+xml';
        const isBitmapImg = (file.type && file.type.startsWith('image/') && !isSvg) ||
                            /\.(png|jpe?g|webp|gif|bmp|ico)$/i.test(file.name);
        if (isBitmapImg) {
          exportModal.style.display = 'none';
          this.insertImageFromFile(file);
          e.target.value = '';
          return;
        }

        const proceedWithImport = () => {
          importFromJson(file, (elements, appState) => {
            this.elements = elements;
            if (appState && appState.viewBackgroundColor) {
              this.setCanvasBackground(appState.viewBackgroundColor);
            }
            this.selectedElementIds.clear();
            this.history.record(this.elements);
            if (this.elements.length > 0) {
              const fit = calculateZoomToFit(this.elements, this.canvas.clientWidth, this.canvas.clientHeight, 60);
              this.zoom = fit.zoom;
              this.scrollX = fit.scrollX;
              this.scrollY = fit.scrollY;
              document.getElementById('zoomDisplay').textContent = `${Math.round(this.zoom * 100)}%`;
            } else {
              this.resetZoom();
            }
            exportModal.style.display = 'none';
            this.updateEmptyState();
            this.render();
            this.showToast(`Imported ${elements.length} elements from ${file.name}`, 'success');
          });
        };

        if (this.elements.length > 0) {
          this.showConfirmDialog({
            title: 'Import Diagram File?',
            message: `Importing "${file.name}" will replace your current canvas (${this.elements.length} elements). Unsaved changes will be overwritten. You can undo this with Ctrl+Z.`,
            confirmText: 'Import & Overwrite',
            confirmDanger: true,
            onConfirm: proceedWithImport
          });
        } else {
          proceedWithImport();
        }
        e.target.value = '';
      }
    });

    // SQL DDL Preview Modal Handlers
    const sqlModal = document.getElementById('sqlPreviewModal');
    const sqlPreviewBox = document.getElementById('sqlCodePreview');
    const btnCloseSql = document.getElementById('btn-close-sql-modal');
    if (btnCloseSql && sqlModal) {
      btnCloseSql.addEventListener('click', () => { sqlModal.style.display = 'none'; });
      sqlModal.addEventListener('click', (e) => { if (e.target === sqlModal) sqlModal.style.display = 'none'; });
    }

    document.querySelectorAll('#sqlDialectControl .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#sqlDialectControl .segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeSqlDialect = btn.dataset.dialect || 'postgres';
        this.refreshSqlPreview();
      });
    });

    const btnCopySqlModal = document.getElementById('btnCopySqlModal');
    if (btnCopySqlModal && sqlPreviewBox) {
      btnCopySqlModal.addEventListener('click', async () => {
        await copySqlToClipboard(sqlPreviewBox.value);
        this.showToast(`Copied ${this.activeSqlDialect.toUpperCase()} DDL to clipboard`, 'success');
        const origText = btnCopySqlModal.innerHTML;
        btnCopySqlModal.innerHTML = `<i data-lucide="check"></i> <span>Copied!</span>`;
        btnCopySqlModal.style.background = '#2b8a3e';
        createIcons({ icons });
        setTimeout(() => {
          btnCopySqlModal.innerHTML = origText;
          btnCopySqlModal.style.background = '#1971c2';
          createIcons({ icons });
        }, 1500);
      });
    }

    const btnDownloadSqlModal = document.getElementById('btnDownloadSqlModal');
    if (btnDownloadSqlModal && sqlPreviewBox) {
      btnDownloadSqlModal.addEventListener('click', () => {
        const fname = this.targetSqlTable
          ? `${(this.targetSqlTable.tableName || 'table').toLowerCase().replace(/[^a-z0-9_]/g, '_')}.sql`
          : `schema-${Date.now()}.sql`;
        downloadSqlFile(fname, sqlPreviewBox.value);
        this.showToast(`Downloaded SQL file (${fname})`, 'success');
      });
    }

    // Mermaid.js Interop Modal Handlers
    const mermaidModal = document.getElementById('mermaidModal');
    const btnCloseMermaid = document.getElementById('btn-close-mermaid-modal');
    if (btnCloseMermaid && mermaidModal) {
      btnCloseMermaid.addEventListener('click', () => { mermaidModal.style.display = 'none'; });
      mermaidModal.addEventListener('click', (e) => { if (e.target === mermaidModal) mermaidModal.style.display = 'none'; });
    }

    const tabExport = document.getElementById('tabMermaidExport');
    const tabImport = document.getElementById('tabMermaidImport');
    const secExport = document.getElementById('sectionMermaidExport');
    const secImport = document.getElementById('sectionMermaidImport');

    if (tabExport && tabImport && secExport && secImport) {
      tabExport.addEventListener('click', () => {
        tabExport.classList.add('active');
        tabImport.classList.remove('active');
        secExport.style.display = 'flex';
        secImport.style.display = 'none';
      });
      tabImport.addEventListener('click', () => {
        tabImport.classList.add('active');
        tabExport.classList.remove('active');
        secImport.style.display = 'flex';
        secExport.style.display = 'none';
      });
    }

    const btnCopyMermaid = document.getElementById('btnCopyMermaidCode');
    const mermaidExportText = document.getElementById('mermaidExportText');
    if (btnCopyMermaid && mermaidExportText) {
      btnCopyMermaid.addEventListener('click', async () => {
        await copySqlToClipboard(mermaidExportText.value);
        this.showToast('Copied Mermaid markup to clipboard', 'success');
        const orig = btnCopyMermaid.innerHTML;
        btnCopyMermaid.innerHTML = `<i data-lucide="check"></i> <span>Copied!</span>`;
        btnCopyMermaid.style.background = '#2b8a3e';
        createIcons({ icons });
        setTimeout(() => {
          btnCopyMermaid.innerHTML = orig;
          btnCopyMermaid.style.background = '#12b886';
          createIcons({ icons });
        }, 1500);
      });
    }

    const btnApplyImport = document.getElementById('btnApplyMermaidImport');
    const mermaidImportText = document.getElementById('mermaidImportText');
    const importErrorBox = document.getElementById('mermaidImportError');

    if (btnApplyImport && mermaidImportText) {
      btnApplyImport.addEventListener('click', () => {
        const text = mermaidImportText.value;
        const res = importFromMermaid(text);
        if (!res.success) {
          if (importErrorBox) {
            importErrorBox.textContent = res.error || 'Failed to parse Mermaid markup.';
            importErrorBox.style.display = 'block';
          }
          this.showToast(res.error || 'Failed to parse Mermaid markup', 'error');
          return;
        }

        const applyMermaid = () => {
          if (importErrorBox) importErrorBox.style.display = 'none';
          this.elements = res.elements;
          this.selectedElementIds.clear();
          this.history.record(this.elements);
          this.resetZoom();
          if (mermaidModal) mermaidModal.style.display = 'none';
          this.updateEmptyState();
          this.render();
          this.showToast(`Imported ${res.elements.length} elements from Mermaid`, 'success');
        };

        if (this.elements.length > 0) {
          this.showConfirmDialog({
            title: 'Import Mermaid Diagram?',
            message: `Importing will replace your current canvas (${this.elements.length} elements). Unsaved changes will be overwritten. You can undo this with Ctrl+Z.`,
            confirmText: 'Import & Overwrite',
            confirmDanger: true,
            onConfirm: applyMermaid
          });
        } else {
          applyMermaid();
        }
      });
    }

    // Architecture tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.id === 'tabMermaidExport' || btn.id === 'tabMermaidImport') return;
        document.querySelectorAll('.tab-btn').forEach(b => {
          if (b.id !== 'tabMermaidExport' && b.id !== 'tabMermaidImport') b.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(`tab-${btn.dataset.tab}`);
        if (target) target.classList.add('active');
        if (btn.dataset.tab === 'live-test') {
          this.renderDemoRoughShape();
        }
      });
    });
  }

  openSqlPreviewModal(targetTable = null) {
    this.targetSqlTable = targetTable;
    this.activeSqlDialect = this.activeSqlDialect || 'postgres';
    const modal = document.getElementById('sqlPreviewModal');
    const title = document.getElementById('sqlPreviewTitle');
    if (title) {
      title.textContent = targetTable 
        ? `Table "${targetTable.tableName || 'unnamed'}" SQL DDL`
        : 'Database Schema SQL DDL';
    }
    this.refreshSqlPreview();
    if (modal) {
      modal.style.display = 'flex';
      createIcons({ icons });
    }
  }

  refreshSqlPreview() {
    const previewBox = document.getElementById('sqlCodePreview');
    if (!previewBox) return;
    const dialect = this.activeSqlDialect || 'postgres';
    if (this.targetSqlTable) {
      previewBox.value = generateTableDdl(this.targetSqlTable, { dialect });
    } else {
      previewBox.value = generateSqlDdl(this.elements, { dialect });
    }
  }

  openMermaidModal() {
    const modal = document.getElementById('mermaidModal');
    const exportText = document.getElementById('mermaidExportText');
    const importError = document.getElementById('mermaidImportError');

    if (exportText) {
      exportText.value = exportToMermaid(this.elements);
    }
    if (importError) {
      importError.style.display = 'none';
    }

    // Default to Export Tab
    const tabExport = document.getElementById('tabMermaidExport');
    const tabImport = document.getElementById('tabMermaidImport');
    const secExport = document.getElementById('sectionMermaidExport');
    const secImport = document.getElementById('sectionMermaidImport');

    if (tabExport && tabImport && secExport && secImport) {
      tabExport.classList.add('active');
      tabImport.classList.remove('active');
      secExport.style.display = 'flex';
      secImport.style.display = 'none';
    }

    if (modal) {
      modal.style.display = 'flex';
      createIcons({ icons });
    }
  }

  // ==========================================================================
  // Interactive Rough.js Tester inside Architecture Modal
  // ==========================================================================
  initDemoPlayground() {
    this.demoSeed = 12345;
    const slider = document.getElementById('demoRoughness');
    const select = document.getElementById('demoFillStyle');
    const reseedBtn = document.getElementById('btn-demo-reseed');

    slider.addEventListener('input', (e) => {
      document.getElementById('demoRoughnessVal').textContent = e.target.value;
      this.renderDemoRoughShape();
    });
    select.addEventListener('change', () => this.renderDemoRoughShape());
    reseedBtn.addEventListener('click', () => {
      this.demoSeed = generateSeed();
      this.renderDemoRoughShape();
    });
  }

  renderDemoRoughShape() {
    const canvas = document.getElementById('demoRoughCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rc = rough.canvas(canvas);
    const roughness = parseFloat(document.getElementById('demoRoughness').value);
    const fillStyle = document.getElementById('demoFillStyle').value;

    const opts = {
      seed: this.demoSeed,
      roughness: roughness,
      stroke: '#1971c2',
      strokeWidth: 3,
      fill: '#a5d8ff',
      fillStyle: fillStyle
    };

    // Draw rect and circle side by side
    rc.rectangle(25, 25, 160, 160, opts);
    rc.circle(290, 105, 140, opts);
  }
}

// Instantiate on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();

  if (new URLSearchParams(window.location.search).get('autoSaveGifs') === 'true') {
    setTimeout(async () => {
      console.log('[AutoGIF] Starting automated GIF generation...');
      const banner = document.createElement('div');
      banner.id = 'auto-gif-status';
      banner.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);background:#1098ad;color:#fff;padding:8px 16px;border-radius:20px;z-index:999999;font-weight:700;font-family:sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
      banner.textContent = 'Generating Sprint 3 GIFs...';
      document.body.appendChild(banner);

      try {
        await window.generateAndSaveSprint3Gifs();
        banner.textContent = 'Sprint 3 GIFs generated and saved successfully!';
        banner.style.background = '#2b8a3e';
      } catch (err) {
        banner.textContent = 'Error: ' + err.message;
        banner.style.background = '#e03131';
      }
    }, 500);
  }
});

// Sprint 3 GIF Generation Helper
window.exportToGif = exportToGif;
window.getTemplateElements = getTemplateElements;
window.generateAllTemplateGifs = async function() {
  const templates = [
    { key: 'c4-context', filename: 'c4_context_architecture.gif' },
    { key: 'c4-container', filename: 'c4_container_architecture.gif' },
    { key: 'flash-sale', filename: 'flash_sale_high_concurrency.gif' },
    { key: 'global-ha', filename: 'global_ha_multi_region.gif' },
    { key: 'fintech-pci', filename: 'fintech_pci_banking.gif' },
    { key: 'aws', filename: 'aws_cloud_architecture.gif' },
    { key: 'gcp', filename: 'gcp_cloud_pipeline.gif' },
    { key: 'azure', filename: 'azure_enterprise_architecture.gif' },
    { key: 'microservices', filename: 'event_driven_microservices.gif' },
    { key: 'modular-monolith', filename: 'modular_monolith_architecture.gif' },
    { key: 'monolithic', filename: 'monolithic_3tier_architecture.gif' },
    { key: 'sequence', filename: 'distributed_sequence_diagram.gif' },
    { key: 'erd', filename: 'database_schema_erd.gif' },
    { key: 'state-machine', filename: 'state_machine_workflow.gif' },
    { key: 'logic-flowchart', filename: 'logic_flowchart_decision.gif' },
    { key: 'activity', filename: 'business_activity_process.gif' }
  ];

  const results = [];
  for (const tpl of templates) {
    try {
      console.log(`[GIF] Generating animated GIF for ${tpl.key}...`);
      const elements = getTemplateElements(tpl.key);
      if (!elements || elements.length === 0) {
        console.warn(`[GIF] No elements found for ${tpl.key}`);
        continue;
      }
      const { base64 } = await exportToGif(elements, 'light', { 
        metricsOverlay: true, 
        returnBase64: true,
        scale: 0.85
      });
      
      const resp = await fetch('/api/save-gif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: tpl.filename, base64 })
      });
      const json = await resp.json();
      results.push(json);
      console.log(`[GIF] Successfully saved ${tpl.filename} (${json.size} bytes)`);
    } catch (err) {
      console.error(`[GIF] Error generating ${tpl.filename}:`, err);
    }
  }
  return results;
};

window.generateAndSaveSprint3Gifs = window.generateAllTemplateGifs;

