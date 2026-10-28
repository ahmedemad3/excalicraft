/**
 * ExcaliCraft Rendering Engine
 * Integrates Rough.js for sketchy aesthetics, element drawing, viewport grid, and selection box
 */

import rough from 'roughjs';
import { getElementBounds, getResizeHandles, getOrthogonalArrowPoints, getOrthogonalWaypointHandles } from './math.js';
import { drawLucideIcon } from './icons.js';

/**
 * Determines whether a CSS color (hex, rgb, rgba) is perceptually light.
 * Used for dynamic text contrast across dark/light themes.
 */
export function isColorLight(color) {
  if (!color || color === 'transparent') return false;
  const c = String(color).trim().toLowerCase();
  if (c === 'white' || c === '#fff' || c === '#ffffff') return true;
  if (c === 'black' || c === '#000' || c === '#000000') return false;

  // Hex: #rgb or #rrggbb
  if (c.startsWith('#')) {
    let hex = c.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(ch => ch + ch).join('');
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
    }
  }

  // rgb / rgba
  const rgbMatch = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
  }

  return false;
}

export class SceneRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.rc = rough.canvas(canvas);
    this.generator = this.rc.generator;
  }

  /**
   * Resizes internal canvas bitmap to match client rect and device pixel ratio (Hi-DPI)
   */
  resize(width, height) {
    const dpr = window.devicePixelRatio || 1;
    this.width = width;
    this.height = height;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  /**
   * Clears canvas and renders the entire scene graph with current camera and selection
   */
  render({
    elements,
    selectedElements = [],
    scrollX = 0,
    scrollY = 0,
    zoom = 1,
    showGrid = true,
    theme = 'light',
    selectionBox = null,
    previewElement = null,
    metricsOverlay = false,
    spofNodeIds = null,
    capacityMetrics = null,
    canvasBackground = null
  }) {
    const { ctx } = this;
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const width = this.width || this.canvas.clientWidth || (this.canvas.width ? this.canvas.width / dpr : 1920);
    const height = this.height || this.canvas.clientHeight || (this.canvas.height ? this.canvas.height / dpr : 1080);
    const renderOptions = { metricsOverlay, spofNodeIds, capacityMetrics };

    // 1. Clear background
    ctx.save();
    ctx.fillStyle = canvasBackground || (theme === 'dark' ? '#121212' : '#f8f9fa');
    ctx.fillRect(0, 0, width, height);

    // 2. Draw subtle grid dots
    if (showGrid) {
      this.renderGrid(scrollX, scrollY, zoom, theme, width, height);
    }

    // 3. Apply Camera Matrix (Screen -> Scene space)
    ctx.translate(scrollX, scrollY);
    ctx.scale(zoom, zoom);

    // 4. Render committed elements in exact layer order (painter's algorithm)
    for (const element of elements) {
      try {
        this.renderElement(element, theme, renderOptions);
      } catch (err) {
        console.warn('Failed to render element:', element?.id, err);
      }
    }

    // 5. Render actively drawing preview element
    if (previewElement) {
      this.renderElement(previewElement, theme, renderOptions);
    }

    // 6. Render Selection Highlight Bounding Box & Handles
    if (selectedElements.length > 0) {
      this.renderSelectionBounds(selectedElements, zoom);
    }

    // 7. Render marquee box-selection rectangle (in Scene coordinates)
    if (selectionBox) {
      this.renderSelectionMarquee(selectionBox);
    }

    ctx.restore();
  }

  /**
   * Renders a periodic infinite dot grid in sync with pan and zoom
   */
  renderGrid(scrollX, scrollY, zoom, theme, viewWidth, viewHeight) {
    const { ctx } = this;
    const gridSize = 24 * zoom;
    const dotColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';

    const startX = (scrollX % gridSize) - gridSize;
    const startY = (scrollY % gridSize) - gridSize;

    ctx.save();
    ctx.fillStyle = dotColor;

    for (let x = startX; x <= viewWidth + gridSize; x += gridSize) {
      for (let y = startY; y <= viewHeight + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /**
   * Renders a single Excalidraw element using Rough.js or Canvas Text
   */
  renderElement(element, theme = 'light', options = {}) {
    const { ctx, rc } = this;
    ctx.save();

    // Opacity
    ctx.globalAlpha = (element.opacity !== undefined ? element.opacity : 100) / 100;

    // Rotation transform if any
    if (element.angle) {
      const bounds = getElementBounds(element);
      const cx = bounds.x + bounds.width / 2;
      const cy = bounds.y + bounds.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(element.angle);
      ctx.translate(-cx, -cy);
    }

    // 0. C4 Architecture Elements (Person, Database, Queue, System, Component)
    if (element.c4Shape || element.c4Type || element.type === 'c4-element' || (element.type === 'node' && (element.c4Shape || element.c4Type || (element.badge === 'PERSON' && element.c4Level === 'person')))) {
      this.renderC4Element(element, theme, options);
      ctx.restore();
      return;
    }

    // 1. Architecture Node Card (Eraser style)
    if (element.type === 'node') {
      this.renderNodeCard(element, theme, options);
      ctx.restore();
      return;
    }

    // 2. ERD Database Table Building Block
    if (element.type === 'erd-table') {
      this.renderErdTable(element, theme, options);
      ctx.restore();
      return;
    }

    // 3. Process Swimlane Building Block
    if (element.type === 'swimlane') {
      this.renderSwimlane(element, theme);
      ctx.restore();
      return;
    }

    // 4. UML State Machine Node
    if (element.type === 'state-node') {
      this.renderStateNode(element, theme);
      ctx.restore();
      return;
    }

    // 5. Sequence Lifeline Activation Box
    if (element.type === 'activation-box') {
      this.renderActivationBox(element, theme);
      ctx.restore();
      return;
    }

    // 6. Group / Container Boundary
    if (element.type === 'group-boundary') {
      this.renderGroupBoundary(element, theme, options);
      ctx.restore();
      return;
    }

    // 7. Decision / Merge Diamond Node
    if (element.type === 'diamond') {
      this.renderDiamond(element, theme);
      ctx.restore();
      return;
    }

    // 8. Activity Diagram Action Node
    if (element.type === 'activity-action') {
      this.renderActivityAction(element, theme);
      ctx.restore();
      return;
    }

    // 9. Activity Diagram Synchronization Fork / Join Bar
    if (element.type === 'fork-node' || element.type === 'join-node') {
      this.renderForkJoin(element, theme);
      ctx.restore();
      return;
    }

    // 10. Activity Flow Final Node (Circle with X)
    if (element.type === 'flow-final') {
      this.renderFlowFinal(element, theme);
      ctx.restore();
      return;
    }

    // 11. Responsive Smooth Pencil Freedraw
    if (element.type === 'freedraw') {
      this.renderFreedraw(element, theme);
      ctx.restore();
      return;
    }

    // 12. Text Element
    if (element.type === 'text') {
      this.renderTextElement(element);
      ctx.restore();
      return;
    }

    // 13. Labeled Arrow or Line or Elbow Arrow
    if (element.type === 'arrow' || element.type === 'line' || element.type === 'elbow-arrow') {
      this.renderArrow(element, theme, options);
      ctx.restore();
      return;
    }

    // 14. Inserted Image Element
    if (element.type === 'image') {
      this.renderImage(element);
      ctx.restore();
      return;
    }

    // 5. Standard Primitive Shape (Rectangle, Ellipse, Diamond, Freedraw)
    const drawable = this.getOrCreateDrawable(element);
    if (drawable) {
      rc.draw(drawable);
    }

    if (element.text && (element.type === 'rectangle' || element.type === 'ellipse' || element.type === 'diamond')) {
      this.renderShapeText(element, theme);
    }

    ctx.restore();
  }

  /**
   * Renders a fancy Eraser System Architecture Node Card
   */
  renderNodeCard(element, theme, options = {}) {
    const { ctx, rc } = this;
    const { x, y, width, height } = element;
    const isDark = theme === 'dark';

    const accentColor = element.themeColor || element.strokeColor || '#1971c2';
    const isSketch = element.cardStyle === 'sketch';

    ctx.save();

    // 1. Card Container (Rounded Rect or Rough.js)
    let defaultBg = isDark ? '#1e1f24' : '#ffffff';
    let effectiveBg = element.backgroundColor;
    if (isDark) {
      if (!effectiveBg || effectiveBg === '#ffffff' || effectiveBg === '#fff' || effectiveBg.toLowerCase() === 'white' || effectiveBg === 'rgb(255, 255, 255)' || effectiveBg === 'transparent') {
        effectiveBg = '#1e1f24';
      }
    } else {
      if (!effectiveBg || effectiveBg === 'transparent') {
        effectiveBg = '#ffffff';
      }
    }
    const isCardLight = isColorLight(effectiveBg);

    if (isSketch) {
      const drawable = this.getOrCreateDrawable({
        ...element,
        type: 'rectangle',
        strokeColor: accentColor,
        backgroundColor: effectiveBg,
        fillStyle: element.fillStyle || 'solid'
      });
      if (drawable) rc.draw(drawable);
    } else {
      // Modern Crisp Eraser Card with shadow and smooth border
      ctx.beginPath();
      const r = 10;
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, height, r);
      } else {
        ctx.rect(x, y, width, height);
      }

      // Card Background
      ctx.fillStyle = effectiveBg;
      ctx.shadowColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Card Border
      ctx.strokeStyle = isDark ? (isCardLight ? '#adb5bd' : '#2c2e33') : '#dee2e6';
      ctx.lineWidth = element.strokeWidth || 1.5;
      ctx.stroke();

      // Top Accent Header Stripe (Eraser Signature style)
      ctx.save();
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, 4, [r, r, 0, 0]);
      } else {
        ctx.rect(x, y, width, 4);
      }
      ctx.fillStyle = accentColor;
      ctx.fill();
      ctx.restore();
    }

    // 2. Icon Badge
    const iconSize = 20;
    const badgeSize = 34;
    const iconBoxX = x + 12;
    const iconBoxY = y + 14;

    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(iconBoxX, iconBoxY, badgeSize, badgeSize, 8);
    } else {
      ctx.rect(iconBoxX, iconBoxY, badgeSize, badgeSize);
    }
    // Soft pastel tint background for icon
    ctx.fillStyle = isDark
      ? (isCardLight ? `${accentColor}20` : 'rgba(255,255,255,0.08)')
      : `${accentColor}18`;
    ctx.fill();
    ctx.strokeStyle = isDark
      ? (isCardLight ? `${accentColor}50` : 'rgba(255,255,255,0.15)')
      : `${accentColor}40`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Render the vector Lucide icon
    drawLucideIcon(ctx, element.icon || 'Server', iconBoxX + 7, iconBoxY + 7, iconSize, accentColor, 2);
    ctx.restore();

    // 2b. C4 Architecture Level Badge (Context, Container, Component, Deployment)
    let c4BadgeWidth = 0;
    if (element.c4Level) {
      const c4Colors = {
        context: { bg: '#f3f0ff', stroke: '#7048e8', text: '#5f3dc4', darkBg: '#3b2559', darkText: '#d0bfff' },
        container: { bg: '#e7f5ff', stroke: '#1c7ed6', text: '#1971c2', darkBg: '#183b56', darkText: '#a5d8ff' },
        component: { bg: '#e6fcf5', stroke: '#0ca678', text: '#099268', darkBg: '#123b32', darkText: '#96f2d7' },
        deployment: { bg: '#fff4e6', stroke: '#fd7e14', text: '#d9480f', darkBg: '#472714', darkText: '#ffc078' }
      };
      const c4Config = c4Colors[element.c4Level] || c4Colors.container;
      const c4Label = `[${String(element.c4Level).toUpperCase()}]`;
      ctx.save();
      ctx.font = "700 9px 'JetBrains Mono', monospace";
      const c4Metrics = ctx.measureText(c4Label);
      const c4W = c4Metrics.width + 10;
      const c4H = 18;
      const c4X = x + width - c4W - 10;
      const c4Y = y + 10;
      c4BadgeWidth = c4W + 12;

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(c4X, c4Y, c4W, c4H, 4);
      } else {
        ctx.rect(c4X, c4Y, c4W, c4H);
      }
      ctx.fillStyle = isDark ? c4Config.darkBg : c4Config.bg;
      ctx.fill();
      ctx.strokeStyle = c4Config.stroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = isDark ? c4Config.darkText : c4Config.text;
      ctx.textBaseline = 'middle';
      ctx.fillText(c4Label, c4X + 5, c4Y + c4H / 2);
      ctx.restore();
    }

    // 3. Text Header (Title & Subtitle)
    const textStartX = iconBoxX + badgeSize + 10;
    const maxTextW = Math.max(40, width - (textStartX - x) - c4BadgeWidth - 6);

    // Title
    ctx.font = "600 15px 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = isCardLight ? '#212529' : '#f8f9fa';
    ctx.textBaseline = 'top';
    const titleText = String(element.title || 'Service Node');
    ctx.fillText(titleText, textStartX, y + 14, maxTextW);

    // Subtitle / Technology Stack
    ctx.font = "400 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = isCardLight ? '#495057' : '#adb5bd';
    const subText = String(element.subtitle || 'Active Instance');
    ctx.fillText(subText, textStartX, y + 33, maxTextW);

    // 4. Role / Badge Chip
    if (element.badge) {
      ctx.font = "700 10px 'Outfit', sans-serif";
      const badgeText = String(element.badge || '').toUpperCase();
      const textMetrics = ctx.measureText(badgeText);
      const pillW = textMetrics.width + 12;
      const pillH = 18;
      const pillX = textStartX;
      const pillY = y + 54;

      ctx.save();
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(pillX, pillY, pillW, pillH, 9);
      } else {
        ctx.rect(pillX, pillY, pillW, pillH);
      }
      ctx.fillStyle = isCardLight ? `${accentColor}18` : `${accentColor}35`;
      ctx.fill();
      ctx.strokeStyle = isCardLight ? `${accentColor}50` : accentColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = isCardLight ? accentColor : '#e7f5ff';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, pillX + 6, pillY + pillH / 2);
      ctx.restore();
    }

    // 5. SPOF Alert Indicator (Single Point of Failure) - Immediate or via Graph Analysis
    const isExplicitSpof = element.isSpof === true;
    const isExplicitNonSpof = element.isSpof === false;
    const isGraphSpof = !!(options && options.metricsOverlay && options.spofNodeIds && options.spofNodeIds.has(element.id));
    const showSpof = isExplicitSpof || (!isExplicitNonSpof && isGraphSpof);

    if (showSpof) {
      ctx.save();
      ctx.font = "700 11px 'Outfit', sans-serif";
      const alertText = "⚠️ SPOF ALERT";
      const spofMetrics = ctx.measureText(alertText);
      const spofW = spofMetrics.width + 16;
      const spofH = 22;
      const spofX = x + width - spofW - 8;
      const spofY = y - 11; // Floating on top border for maximum visibility

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(spofX, spofY, spofW, spofH, 6);
      } else {
        ctx.rect(spofX, spofY, spofW, spofH);
      }
      ctx.fillStyle = '#e03131';
      ctx.shadowColor = 'rgba(224, 49, 49, 0.45)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowColor = 'transparent';

      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.fillText(alertText, spofX + 8, spofY + spofH / 2);
      ctx.restore();

      // Pulsing warning border around the SPOF node card
      ctx.save();
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, height, 8);
      } else {
        ctx.rect(x, y, width, height);
      }
      ctx.strokeStyle = '#fa5252';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    // 6. Telemetry & Reliability Overlays (Quantitative Modeling / Alt+M)
    if (options && options.metricsOverlay) {
      // 6a. Node Latency & Capacity Utilization Pill
      const cap = options.capacityMetrics?.get(element.id);
      const latency = Number(element.latencyMs ?? element.latency) || 0;
      const telemetryItems = [];
      if (latency > 0) telemetryItems.push(`⏱ ${latency}ms`);

      const inQps = cap ? Number(cap.incomingQps ?? cap.inflowQps ?? 0) : 0;
      const capLimit = cap ? Number(cap.capacity ?? cap.maxCapacity ?? 0) : Number(element.maxCapacityQps ?? element.maxCapacity ?? 0);

      if (capLimit > 0 || inQps > 0) {
        const isOverflow = cap ? (cap.isSaturated || cap.isOverloaded) : (capLimit > 0 && inQps > capLimit);
        const ratio = cap?.saturationRatio ?? (capLimit > 0 ? Math.round((inQps / capLimit) * 100) : 100);
        if (isOverflow) {
          telemetryItems.push(`🔥 ${inQps.toLocaleString()}/${capLimit.toLocaleString()} QPS (${ratio}%)`);
        } else {
          telemetryItems.push(`⚡ ${inQps.toLocaleString()}/${capLimit.toLocaleString()} QPS`);
        }
      }

      if (telemetryItems.length > 0) {
        ctx.save();
        ctx.font = "600 10px 'JetBrains Mono', monospace";
        const metricText = telemetryItems.join(' · ');
        const mMetrics = ctx.measureText(metricText);
        const mW = mMetrics.width + 14;
        const mH = 20;
        const mX = x + 10;
        const mY = y + height - 10; // Floating on bottom border

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(mX, mY, mW, mH, 6);
        } else {
          ctx.rect(mX, mY, mW, mH);
        }
        const isOverflow = cap && (cap.isSaturated || cap.isOverloaded);
        ctx.fillStyle = isDark ? (isOverflow ? '#491217' : '#141517') : (isOverflow ? '#fff0f0' : '#212529');
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowColor = 'transparent';

        ctx.strokeStyle = isOverflow ? '#ff6b6b' : (isDark ? '#373a40' : '#495057');
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = isOverflow ? '#ff8787' : (isDark ? '#69db7c' : '#a9e34b');
        ctx.textBaseline = 'middle';
        ctx.fillText(metricText, mX + 7, mY + mH / 2);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  /**
   * Renders a frosted Group / Boundary Container or Network Boundary Archetype
   */
  renderGroupBoundary(element, theme, options = {}) {
    const { ctx } = this;
    const { x, y, width, height } = element;
    const isDark = theme === 'dark';
    const boundaryType = element.boundaryType || element.subtype || 'standard';
    const cidr = element.cidr ? String(element.cidr).trim() : '';

    // Archetype-tailored color accents and styles
    let accentColor = element.strokeColor;
    let bgColor = element.backgroundColor;

    const isC4Boundary = !!(element.c4BoundaryType || element.boundaryType === 'c4-boundary' || element.subtype === 'c4-boundary');

    if (isC4Boundary) {
      accentColor = accentColor || '#868e96';
      bgColor = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)';
    } else if (isDark) {
      if (!bgColor || bgColor === '#ffffff' || isColorLight(bgColor) || bgColor.includes('231, 245, 255') || bgColor.includes('255, 243, 205') || bgColor.includes('235, 251, 238') || bgColor.includes('237, 242, 255')) {
        if (boundaryType === 'vpc') bgColor = 'rgba(25, 113, 194, 0.12)';
        else if (boundaryType === 'public-subnet') bgColor = 'rgba(43, 138, 62, 0.12)';
        else if (boundaryType === 'private-subnet') bgColor = 'rgba(76, 110, 245, 0.12)';
        else if (boundaryType === 'k8s-cluster') bgColor = 'rgba(50, 108, 229, 0.12)';
        else bgColor = 'rgba(25, 113, 194, 0.08)';
      }
      if (boundaryType === 'vpc') accentColor = accentColor || '#1971c2';
      else if (boundaryType === 'public-subnet') accentColor = accentColor || '#2b8a3e';
      else if (boundaryType === 'private-subnet') accentColor = accentColor || '#4c6ef5';
      else if (boundaryType === 'k8s-cluster') accentColor = accentColor || '#326ce5';
      else accentColor = accentColor || '#4dabf7';
    } else {
      if (boundaryType === 'vpc') {
        accentColor = accentColor || '#1971c2';
        bgColor = bgColor || 'rgba(231, 245, 255, 0.45)';
      } else if (boundaryType === 'public-subnet') {
        accentColor = accentColor || '#2b8a3e';
        bgColor = bgColor || 'rgba(235, 251, 238, 0.45)';
      } else if (boundaryType === 'private-subnet') {
        accentColor = accentColor || '#4c6ef5';
        bgColor = bgColor || 'rgba(237, 242, 255, 0.45)';
      } else if (boundaryType === 'k8s-cluster') {
        accentColor = accentColor || '#326ce5';
        bgColor = bgColor || 'rgba(237, 242, 255, 0.45)';
      } else {
        accentColor = accentColor || '#4dabf7';
        bgColor = bgColor || 'rgba(231, 245, 255, 0.35)';
      }
    }

    ctx.save();
    // 1. Translucent container fill
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, width, height);

    // 2. Boundary Border (Single or Double Border for VPC, dashed or solid based on strokeStyle)
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = element.strokeWidth || (isC4Boundary ? 1.5 : 1.8);
    let lineDash = [];
    if (element.strokeStyle === 'solid') {
      lineDash = [];
    } else if (element.strokeStyle === 'dotted') {
      lineDash = [2, 4];
    } else if (element.strokeStyle === 'dashed') {
      lineDash = [6, 6];
    } else {
      lineDash = isC4Boundary ? [6, 6] : (boundaryType === 'vpc' ? [] : [6, 4]);
    }
    ctx.setLineDash(lineDash);
    ctx.strokeRect(x, y, width, height);

    if (isC4Boundary) {
      // C4 Official Centered Boundary Header Label
      const bTitle = element.title || 'Boundary';
      const bTag = element.c4BoundaryTag || (element.boundaryType === 'enterprise' ? '[ENTERPRISE]' : (element.boundaryType === 'system' ? '[SYSTEM]' : '[boundary]'));
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = "700 12px 'Outfit', sans-serif";
      ctx.fillStyle = isDark ? '#f8f9fa' : '#212529';
      ctx.fillText(bTitle, x + width / 2, y + 8);
      ctx.font = "600 10px 'JetBrains Mono', monospace";
      ctx.fillStyle = isDark ? '#adb5bd' : '#6c757d';
      ctx.fillText(bTag, x + width / 2, y + 23);
      ctx.restore();
      ctx.restore();
      return;
    }

    if (boundaryType === 'vpc') {
      // Secondary inner contour for cloud perimeter isolation
      ctx.save();
      ctx.strokeStyle = isDark ? 'rgba(25, 113, 194, 0.4)' : 'rgba(25, 113, 194, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x + 5, y + 5, width - 10, height - 10);
      ctx.restore();
    } else if (boundaryType === 'k8s-cluster') {
      // Corner brackets for Kubernetes namespace
      ctx.save();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      const bracketLen = 14;
      // Top-Left
      ctx.beginPath(); ctx.moveTo(x, y + bracketLen); ctx.lineTo(x, y); ctx.lineTo(x + bracketLen, y); ctx.stroke();
      // Top-Right
      ctx.beginPath(); ctx.moveTo(x + width - bracketLen, y); ctx.lineTo(x + width, y); ctx.lineTo(x + width, y + bracketLen); ctx.stroke();
      // Bottom-Left
      ctx.beginPath(); ctx.moveTo(x, y + height - bracketLen); ctx.lineTo(x, y + height); ctx.lineTo(x + bracketLen, y + height); ctx.stroke();
      // Bottom-Right
      ctx.beginPath(); ctx.moveTo(x + width - bracketLen, y + height); ctx.lineTo(x + width, y + height); ctx.lineTo(x + width, y + height - bracketLen); ctx.stroke();
      ctx.restore();
    }
    ctx.setLineDash([]);

    // 3. Header Pill Tag at top-left
    let prefix = '';
    if (boundaryType === 'vpc') prefix = '☁ VPC: ';
    else if (boundaryType === 'public-subnet') prefix = '🌐 Public Subnet: ';
    else if (boundaryType === 'private-subnet') prefix = '🔒 Private Subnet: ';
    else if (boundaryType === 'k8s-cluster') prefix = '☸ K8s Cluster: ';

    const rawTitle = element.title || (boundaryType === 'vpc' ? 'VPC Network' : (boundaryType.includes('subnet') ? 'Subnet' : 'Group Boundary'));
    const titleText = `${prefix}${rawTitle}`;

    ctx.font = "600 12px 'Outfit', sans-serif";
    const tMetrics = ctx.measureText(titleText);
    const pillW = tMetrics.width + 24;
    const pillH = 24;
    const pillX = x + 12;
    const pillY = y - 12;

    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(pillX, pillY, pillW, pillH, 12);
    } else {
      ctx.rect(pillX, pillY, pillW, pillH);
    }
    ctx.fillStyle = isDark ? '#1a1b1e' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = isDark ? '#ffffff' : '#1e1e1e';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleText, pillX + 12, pillY + pillH / 2);
    ctx.restore();

    // 4. CIDR Block Annotation Pill at top-right
    if (cidr) {
      ctx.save();
      ctx.font = "700 11px 'JetBrains Mono', monospace";
      const cidrMetrics = ctx.measureText(cidr);
      const cW = cidrMetrics.width + 16;
      const cH = 22;
      const cX = x + width - cW - 14;
      const cY = y - 11;

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(cX, cY, cW, cH, 6);
      } else {
        ctx.rect(cX, cY, cW, cH);
      }
      ctx.fillStyle = isDark ? '#141517' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = isDark ? '#373a40' : '#dee2e6';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = isDark ? '#74c0fc' : '#1c7ed6';
      ctx.textBaseline = 'middle';
      ctx.fillText(cidr, cX + 8, cY + cH / 2);
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Renders an ERD Table Building Block (Eraser standard)
   */
  renderErdTable(element, theme, options = {}) {
    const { ctx } = this;
    const { x, y, width, height } = element;
    const isDark = theme === 'dark';
    const accentColor = element.themeColor || '#1971c2';
    const columns = Array.isArray(element.columns) ? element.columns.slice(0, 100) : [];

    ctx.save();

    // 1. Table Card Background with Shadow
    const r = 8;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, height, r);
    } else {
      ctx.rect(x, y, width, height);
    }
    let defaultBg = isDark ? '#1e1f24' : '#ffffff';
    let effectiveBg = element.backgroundColor;
    if (isDark) {
      if (!effectiveBg || effectiveBg === '#ffffff' || effectiveBg === '#fff' || effectiveBg.toLowerCase() === 'white' || effectiveBg === 'rgb(255, 255, 255)' || effectiveBg === 'transparent') {
        effectiveBg = '#1e1f24';
      }
    } else {
      if (!effectiveBg || effectiveBg === 'transparent') {
        effectiveBg = '#ffffff';
      }
    }
    const isTableLight = isColorLight(effectiveBg);

    ctx.fillStyle = effectiveBg;
    ctx.shadowColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.08)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.strokeStyle = isDark ? (isTableLight ? '#ced4da' : '#2c2e33') : '#dee2e6';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // SPOF Alert Indicator for ERD Table / Database Node
    const isExplicitSpof = element.isSpof === true;
    const isExplicitNonSpof = element.isSpof === false;
    const isGraphSpof = !!(options && options.metricsOverlay && options.spofNodeIds && options.spofNodeIds.has(element.id));
    if (isExplicitSpof || (!isExplicitNonSpof && isGraphSpof)) {
      ctx.save();
      ctx.font = "700 11px 'Outfit', sans-serif";
      const alertText = "⚠️ SPOF ALERT";
      const spofMetrics = ctx.measureText(alertText);
      const spofW = spofMetrics.width + 16;
      const spofH = 22;
      const spofX = x + width - spofW - 8;
      const spofY = y - 11;

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(spofX, spofY, spofW, spofH, 6);
      } else {
        ctx.rect(spofX, spofY, spofW, spofH);
      }
      ctx.fillStyle = '#e03131';
      ctx.shadowColor = 'rgba(224, 49, 49, 0.45)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowColor = 'transparent';

      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillText(alertText, spofX + 8, spofY + spofH / 2);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, height, r);
      } else {
        ctx.rect(x, y, width, height);
      }
      ctx.strokeStyle = '#fa5252';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Header Bar with Accent Color
    const headerHeight = 36;
    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, headerHeight, [r, r, 0, 0]);
    } else {
      ctx.rect(x, y, width, headerHeight);
    }
    ctx.fillStyle = isDark ? '#25262b' : `${accentColor}12`;
    ctx.fill();

    // Header top accent line
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, 3, [r, r, 0, 0]);
    } else {
      ctx.rect(x, y, width, 3);
    }
    ctx.fillStyle = accentColor;
    ctx.fill();

    // Header divider line
    ctx.beginPath();
    ctx.moveTo(x, y + headerHeight);
    ctx.lineTo(x + width, y + headerHeight);
    ctx.strokeStyle = isDark ? '#2c2e33' : '#dee2e6';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Table Icon & Table Name
    const tableName = element.tableName || element.title || 'table';
    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = isDark ? '#ffffff' : '#1e1e1e';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(`⊞  ${tableName}`, x + 12, y + headerHeight / 2 + 1);

    // Type Badge (e.g. TABLE)
    const badgeText = element.tableType || element.badge || 'TABLE';
    ctx.font = "600 9px 'Outfit', sans-serif";
    const bMetrics = ctx.measureText(badgeText);
    const bW = bMetrics.width + 12;
    const bH = 18;
    const bX = x + width - bW - 10;
    const bY = y + (headerHeight - bH) / 2 + 1;

    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(bX, bY, bW, bH, 4);
    } else {
      ctx.rect(bX, bY, bW, bH);
    }
    ctx.fillStyle = `${accentColor}25`;
    ctx.fill();
    ctx.fillStyle = accentColor;
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, bX + bW / 2, bY + bH / 2);
    ctx.restore();

    // 3. Render Table Columns
    const rowHeight = 24;
    const startRowY = y + headerHeight + 8;

    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      const rowY = startRowY + i * rowHeight;

      // Zebra striping
      if (i % 2 === 1) {
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)';
        ctx.fillRect(x + 2, rowY - 4, width - 4, rowHeight);
      }

      // Key Badge (PK / FK)
      if (col.key === 'PK') {
        ctx.font = "700 9px 'JetBrains Mono', monospace";
        ctx.fillStyle = '#f59f00';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('PK', x + 12, rowY + 6);
      } else if (col.key === 'FK') {
        ctx.font = "700 9px 'JetBrains Mono', monospace";
        ctx.fillStyle = '#228be6';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('FK', x + 12, rowY + 6);
      } else {
        ctx.font = "700 9px 'JetBrains Mono', monospace";
        ctx.fillStyle = isDark ? '#495057' : '#ced4da';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('•', x + 16, rowY + 6);
      }

      // Column Name
      ctx.font = col.key ? "600 12px 'JetBrains Mono', monospace" : "400 12px 'JetBrains Mono', monospace";
      ctx.fillStyle = isTableLight ? '#212529' : '#e9ecef';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(col.name, x + 38, rowY + 6);

      // Column Type
      ctx.font = "400 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = isTableLight ? '#495057' : '#adb5bd';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(col.type, x + width - 12, rowY + 6);
    }

    ctx.restore();
  }

  /**
   * Renders a Process Swimlane Horizontal Container
   */
  renderSwimlane(element, theme) {
    const { ctx } = this;
    const { x, y, width, height } = element;
    const isDark = theme === 'dark';
    const accentColor = element.color || element.themeColor || '#1971c2';

    ctx.save();

    // 1. Main Lane Background
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    const defaultBg = isDark ? '#18191c' : `${accentColor}08`;
    ctx.fillStyle = (element.backgroundColor && element.backgroundColor !== 'transparent') ? element.backgroundColor : defaultBg;
    ctx.fill();

    // Lane Border
    ctx.strokeStyle = isDark ? '#2c2e33' : `${accentColor}35`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Left Header Tab
    const tabWidth = 44;
    ctx.beginPath();
    ctx.rect(x, y, tabWidth, height);
    ctx.fillStyle = isDark ? '#25262b' : `${accentColor}18`;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + tabWidth, y);
    ctx.lineTo(x + tabWidth, y + height);
    ctx.strokeStyle = isDark ? '#2c2e33' : `${accentColor}40`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Vertical Lane Title inside Header Tab
    ctx.save();
    ctx.translate(x + tabWidth / 2, y + height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = "700 12px 'Outfit', sans-serif";
    ctx.fillStyle = isDark ? '#ffffff' : accentColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(element.title || 'Lane', 0, 0);
    ctx.restore();

    ctx.restore();
  }

  /**
   * Renders a Lifeline Activation Execution Box
   */
  renderActivationBox(element, theme) {
    const { ctx } = this;
    const { x, y, width, height } = element;
    const isDark = theme === 'dark';
    const accentColor = element.color || '#1971c2';

    ctx.save();
    ctx.beginPath();
    const r = 3;
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, height, r);
    } else {
      ctx.rect(x, y, width, height);
    }
    ctx.fillStyle = isDark ? '#25262b' : '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Renders a UML State Machine Node
   */
  renderStateNode(element, theme) {
    const { ctx } = this;
    const { x, y, width, height } = element;
    const isDark = theme === 'dark';
    const accentColor = element.color || '#f76707';

    ctx.save();

    if (element.stateType === 'initial') {
      const radius = width / 2;
      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#ffffff' : '#212529';
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.restore();
      return;
    }

    if (element.stateType === 'final') {
      const radius = width / 2;
      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? '#ffffff' : '#212529';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius - 5, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#ffffff' : '#212529';
      ctx.fill();
      ctx.restore();
      return;
    }

    // Standard State Card with actions compartment
    const r = 10;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, height, r);
    } else {
      ctx.rect(x, y, width, height);
    }
    const defaultBg = isDark ? '#1a1b1e' : '#ffffff';
    ctx.fillStyle = (element.backgroundColor && element.backgroundColor !== 'transparent') ? element.backgroundColor : defaultBg;
    ctx.shadowColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.08)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Top Header for State Name
    const headerH = 32;
    ctx.font = "700 13px 'Outfit', sans-serif";
    ctx.fillStyle = isDark ? '#ffffff' : '#212529';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(element.title || 'State', x + width / 2, y + headerH / 2);

    // Divider line
    if (element.actions && element.actions.length > 0) {
      ctx.beginPath();
      ctx.moveTo(x, y + headerH);
      ctx.lineTo(x + width, y + headerH);
      ctx.strokeStyle = isDark ? '#2c2e33' : '#e9ecef';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = "400 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = isDark ? '#adb5bd' : '#495057';
      ctx.textAlign = 'left';
      if (Array.isArray(element.actions)) {
        element.actions.forEach((act, idx) => {
          ctx.fillText(String(act), x + 12, y + headerH + 16 + idx * 18);
        });
      }
    }

    ctx.restore();
  }

  /**
   * Renders a Decision / Merge Diamond Node with centered text
   */
  renderDiamond(element, theme) {
    const { ctx } = this;
    const { x, y, width, height } = element;
    const isDark = theme === 'dark';
    const halfW = width / 2;
    const halfH = height / 2;
    const strokeColor = element.strokeColor || '#f59f00';
    const bgColor = element.backgroundColor || (isDark ? 'rgba(255, 243, 191, 0.12)' : 'rgba(255, 243, 191, 0.5)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + halfW, y);
    ctx.lineTo(x + width, y + halfH);
    ctx.lineTo(x + halfW, y + height);
    ctx.lineTo(x, y + halfH);
    ctx.closePath();

    if (element.fillStyle !== 'none' && bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.shadowColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.06)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      ctx.fill();
      ctx.shadowColor = 'transparent';
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = element.strokeWidth || 2;
    if (element.strokeStyle === 'dashed') {
      ctx.setLineDash([6, 4]);
    } else if (element.strokeStyle === 'dotted') {
      ctx.setLineDash([2, 3]);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Centered Condition / Label
    const text = element.text || element.label || '';
    if (text) {
      ctx.font = "600 13px 'Outfit', sans-serif";
      ctx.fillStyle = isDark ? '#ffffff' : '#212529';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + halfW, y + halfH);
    }

    ctx.restore();
  }

  /**
   * Renders a responsive, butter-smooth Freedraw (Pencil) stroke
   */
  renderFreedraw(element, theme) {
    const { ctx } = this;
    const points = element.points;
    if (!points || points.length === 0) return;

    ctx.save();
    ctx.strokeStyle = element.strokeColor || (theme === 'dark' ? '#ffffff' : '#1e1e1e');
    ctx.fillStyle = element.strokeColor || (theme === 'dark' ? '#ffffff' : '#1e1e1e');
    ctx.lineWidth = element.strokeWidth || 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (points.length === 1) {
      ctx.beginPath();
      ctx.arc(points[0][0], points[0][1], (element.strokeWidth || 2.5) / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);

    if (points.length === 2) {
      ctx.lineTo(points[1][0], points[1][1]);
    } else {
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i][0] + points[i + 1][0]) / 2;
        const yc = (points[i][1] + points[i + 1][1]) / 2;
        ctx.quadraticCurveTo(points[i][0], points[i][1], xc, yc);
      }
      ctx.lineTo(points[points.length - 1][0], points[points.length - 1][1]);
    }

    ctx.stroke();
    ctx.restore();
  }

  /**
   * Renders an Activity Diagram Action State
   */
  renderActivityAction(element, theme) {
    const { ctx } = this;
    const { x, y, width, height } = element;
    const isDark = theme === 'dark';
    const accentColor = element.themeColor || element.strokeColor || '#2f9e44';
    const r = 16; // Significant rounding for activity actions

    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, height, r);
    } else {
      ctx.rect(x, y, width, height);
    }

    const defaultBg = isDark ? '#1a1b1e' : 'rgba(47, 158, 68, 0.08)';
    ctx.fillStyle = (element.backgroundColor && element.backgroundColor !== 'transparent') ? element.backgroundColor : defaultBg;
    ctx.shadowColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.06)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = element.strokeWidth || 1.8;
    ctx.stroke();

    // Centered Action Label
    ctx.font = "600 13px 'Outfit', sans-serif";
    ctx.fillStyle = isDark ? '#ffffff' : '#212529';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(element.title || element.text || 'Action Step', x + width / 2, y + height / 2);

    ctx.restore();
  }

  /**
   * Renders an Inserted Raster or Vector Image
   */
  renderImage(element) {
    const ctx = this.ctx;
    const src = element.dataURL || element.url || '';
    if (!src) return;

    if (!this.imageCache) {
      this.imageCache = new Map();
    }

    let img = this.imageCache.get(src);
    if (!img) {
      img = new Image();
      img.src = src;
      img.onload = () => {
        if (typeof window !== 'undefined' && window.app && typeof window.app.render === 'function') {
          window.app.render();
        }
      };
      this.imageCache.set(src, img);
    }

    ctx.save();
    const opacity = (element.opacity !== undefined) ? element.opacity / 100 : 1;
    ctx.globalAlpha = opacity;

    const width = Math.abs(element.width || 0);
    const height = Math.abs(element.height || 0);
    const x = element.width < 0 ? element.x + element.width : element.x;
    const y = element.height < 0 ? element.y + element.height : element.y;

    if (img.complete && img.naturalWidth > 0) {
      // Rounded corner clipping if requested
      if (element.edges === 'round' || element.roundness) {
        const r = Math.min(12, width / 8, height / 8);
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, width, height, r);
        } else {
          ctx.rect(x, y, width, height);
        }
        ctx.clip();
      }
      ctx.drawImage(img, x, y, width, height);
    } else {
      ctx.strokeStyle = '#adb5bd';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = '#868e96';
      ctx.font = "12px 'Outfit', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Loading image...', x + width / 2, y + height / 2);
    }
    ctx.restore();
  }

  /**
   * Renders an Activity Fork / Join Synchronization Bar
   */
  renderForkJoin(element, theme) {
    const { ctx } = this;
    const { x, y, width, height } = element;
    const isDark = theme === 'dark';
    const barColor = isDark ? '#f8f9fa' : '#212529';

    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, height, 4);
    } else {
      ctx.rect(x, y, width, height);
    }
    ctx.fillStyle = barColor;
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.fill();
    ctx.restore();
  }

  /**
   * Renders an Activity Flow Final Node (Circle with an X inside)
   */
  renderFlowFinal(element, theme) {
    const { ctx } = this;
    const { x, y, width, height } = element;
    const isDark = theme === 'dark';
    const radius = Math.min(width, height) / 2;
    const cx = x + radius;
    const cy = y + radius;
    const strokeColor = isDark ? '#ff6b6b' : '#e03131';

    ctx.save();
    // Outer circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    const defaultFinalBg = isDark ? '#1a1b1e' : '#ffffff';
    ctx.fillStyle = (element.backgroundColor && element.backgroundColor !== 'transparent') ? element.backgroundColor : defaultFinalBg;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner X
    const offset = radius * 0.55;
    ctx.beginPath();
    ctx.moveTo(cx - offset, cy - offset);
    ctx.lineTo(cx + offset, cy + offset);
    ctx.moveTo(cx + offset, cy - offset);
    ctx.lineTo(cx - offset, cy + offset);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Renders an arrow or line with directionality, labels, and animated signal pulses
   */
  renderArrow(element, theme, options = {}) {
    const { ctx, rc } = this;
    const isDark = theme === 'dark';
    const isOrthogonal = element.routing === 'orthogonal' || element.type === 'elbow-arrow';

    const startX = element.x;
    const startY = element.y;
    const endX = element.x + element.width;
    const endY = element.y + element.height;

    if (isOrthogonal) {
      const pts = getOrthogonalArrowPoints(element);
      const [p0, p1, p2, p3] = pts;

      const d01 = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const d12 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const d23 = Math.hypot(p3.x - p2.x, p3.y - p2.y);
      const maxR = Math.min(14, d01 / 2, d12 / 2, d23 / 2);
      const r = Math.max(0, Number.isFinite(maxR) ? maxR : 0);

      const drawOrthogonalPath = () => {
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        if (r > 1) {
          ctx.arcTo(p1.x, p1.y, p2.x, p2.y, r);
          ctx.arcTo(p2.x, p2.y, p3.x, p3.y, r);
        } else {
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
        ctx.lineTo(p3.x, p3.y);
      };

      // 1. Base dark/neutral line
      ctx.save();
      drawOrthogonalPath();
      ctx.strokeStyle = element.strokeColor || (isDark ? '#adb5bd' : '#495057');
      ctx.lineWidth = element.strokeWidth || 2;
      if (element.strokeStyle === 'dashed') {
        ctx.setLineDash([8, 6]);
      } else if (element.strokeStyle === 'dotted') {
        ctx.setLineDash([3, 4]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();

      // 1b. Animated electric cyan packet flow dash (ONLY if explicitly isAnimated === true)
      const isFlowAnimated = element.isAnimated === true;
      const now = (this.currentTime !== undefined) ? this.currentTime : Date.now();
      if (isFlowAnimated) {
        drawOrthogonalPath();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = (element.strokeWidth || 2) + 0.6;
        ctx.setLineDash([8, 8]);
        ctx.lineDashOffset = -((now / 35) % 16);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw Arrowhead at Destination (pointing into p3 from p2)
      if (element.direction !== 'none' && element.type !== 'line') {
        this.renderArrowTip(p3.x, p3.y, p2.x, p2.y, element);
      }

      // 3. Draw Arrowhead at Start (if bidirectional)
      if (element.direction === 'bidirectional') {
        this.renderArrowTip(p0.x, p0.y, p1.x, p1.y, element);
      }

      // 4. Animated Signal Pulse Particle travelling along the 3 segments (ONLY if isFlowAnimated)
      if (isFlowAnimated) {
        const totalDist = d01 + d12 + d23;
        if (totalDist > 0) {
          const animSpeed = 1800; // ms per cycle
          const t = (now % animSpeed) / animSpeed;
          const currDist = t * totalDist;

          let pulseX, pulseY;
          if (currDist <= d01) {
            const frac = d01 > 0 ? currDist / d01 : 0;
            pulseX = p0.x + (p1.x - p0.x) * frac;
            pulseY = p0.y + (p1.y - p0.y) * frac;
          } else if (currDist <= d01 + d12) {
            const frac = d12 > 0 ? (currDist - d01) / d12 : 0;
            pulseX = p1.x + (p2.x - p1.x) * frac;
            pulseY = p1.y + (p2.y - p1.y) * frac;
          } else {
            const frac = d23 > 0 ? (currDist - d01 - d12) / d23 : 0;
            pulseX = p2.x + (p3.x - p2.x) * frac;
            pulseY = p2.y + (p3.y - p2.y) * frac;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.restore();
        }
      }

      // 6. Draw Connection Label in high-contrast pill
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      if (element.label) {
        ctx.save();
        ctx.font = "600 11px 'JetBrains Mono', monospace";
        const textMetrics = ctx.measureText(element.label);
        const pillW = textMetrics.width + 18;
        const pillH = 22;
        const pillX = midX - pillW / 2;
        const pillY = midY - pillH / 2;

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(pillX, pillY, pillW, pillH, 6);
        } else {
          ctx.rect(pillX, pillY, pillW, pillH);
        }
        ctx.fillStyle = isDark ? '#212529' : '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fill();
        ctx.shadowColor = 'transparent';

        ctx.strokeStyle = isDark ? '#373a40' : '#ced4da';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = isDark ? '#74c0fc' : (element.strokeColor || '#1971c2');
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(element.label, midX, midY);
        ctx.restore();
      }

      // 6b. Telemetry Overlay
      if (options && options.metricsOverlay && (element.qps || element.latencyMs)) {
        const telemetryY = element.label ? midY + 22 : midY;

        ctx.save();
        ctx.font = "700 10px 'JetBrains Mono', monospace";
        const parts = [];
        if (element.qps) parts.push(`${Number(element.qps).toLocaleString()} QPS`);
        if (element.latencyMs) parts.push(`${Number(element.latencyMs)}ms`);
        const telemetryStr = `⚡ ${parts.join(' · ')}`;

        const tMetrics = ctx.measureText(telemetryStr);
        const pillW = tMetrics.width + 16;
        const pillH = 20;
        const pillX = midX - pillW / 2;
        const pillY = telemetryY - pillH / 2;

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(pillX, pillY, pillW, pillH, 5);
        } else {
          ctx.rect(pillX, pillY, pillW, pillH);
        }
        ctx.fillStyle = isDark ? '#141517' : '#212529';
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        ctx.fill();
        ctx.shadowColor = 'transparent';

        const isHighVolume = Number(element.qps) >= 10000;
        ctx.strokeStyle = isHighVolume ? '#ff922b' : '#373a40';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = isHighVolume ? '#ffd43b' : '#69db7c';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(telemetryStr, midX, telemetryY);
        ctx.restore();
      }

      return;
    }

    // 1. Draw base line - Native crisp 2D canvas for guaranteed rendering across all angles & dash patterns
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = element.strokeColor || (isDark ? '#adb5bd' : '#495057');
    ctx.lineWidth = element.strokeWidth || 1.8;
    if (element.strokeStyle === 'dashed') {
      ctx.setLineDash([8, 6]);
    } else if (element.strokeStyle === 'dotted') {
      ctx.setLineDash([3, 4]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.restore();

    // 2. Draw Arrowhead at End
    if (element.direction !== 'none' && element.type === 'arrow') {
      this.renderArrowTip(endX, endY, startX, startY, element);
    }

    // 3. Draw Arrowhead at Start (if bidirectional)
    if (element.direction === 'bidirectional') {
      this.renderArrowTip(startX, startY, endX, endY, element);
    }

    // 4. Draw Connection Label in high-contrast pill
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    if (element.label) {
      ctx.save();
      ctx.font = "600 11px 'JetBrains Mono', monospace";
      const textMetrics = ctx.measureText(element.label);
      const pillW = textMetrics.width + 18;
      const pillH = 22;
      const pillX = midX - pillW / 2;
      const pillY = midY - pillH / 2;

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(pillX, pillY, pillW, pillH, 6);
      } else {
        ctx.rect(pillX, pillY, pillW, pillH);
      }
      ctx.fillStyle = isDark ? '#212529' : '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.fill();
      ctx.shadowColor = 'transparent';

      ctx.strokeStyle = isDark ? '#373a40' : '#ced4da';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = isDark ? '#74c0fc' : (element.strokeColor || '#1971c2');
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(element.label, midX, midY);
      ctx.restore();
    }

    // 4b. Draw Telemetry Overlay (QPS & Hop Latency) when enabled
    if (options && options.metricsOverlay && (element.qps || element.latencyMs)) {
      const telemetryY = element.label ? midY + 22 : midY;

      ctx.save();
      ctx.font = "700 10px 'JetBrains Mono', monospace";
      const parts = [];
      if (element.qps) parts.push(`${Number(element.qps).toLocaleString()} QPS`);
      if (element.latencyMs) parts.push(`${Number(element.latencyMs)}ms`);
      const telemetryStr = `⚡ ${parts.join(' · ')}`;

      const tMetrics = ctx.measureText(telemetryStr);
      const pillW = tMetrics.width + 16;
      const pillH = 20;
      const pillX = midX - pillW / 2;
      const pillY = telemetryY - pillH / 2;

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(pillX, pillY, pillW, pillH, 5);
      } else {
        ctx.rect(pillX, pillY, pillW, pillH);
      }
      ctx.fillStyle = isDark ? '#141517' : '#212529';
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.fill();
      ctx.shadowColor = 'transparent';

      const isHighVolume = Number(element.qps) >= 10000;
      ctx.strokeStyle = isHighVolume ? '#ff922b' : '#373a40';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = isHighVolume ? '#ffd43b' : '#69db7c';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(telemetryStr, midX, telemetryY);
      ctx.restore();
    }

    // 5. Draw Animated Signal Pulse if active
    if (element.isAnimated) {
      const animSpeed = 1600; // ms per loop
      const now = (this.currentTime !== undefined) ? this.currentTime : Date.now();
      const t = (now % animSpeed) / animSpeed;
      const pulseX = startX + (endX - startX) * t;
      const pulseY = startY + (endY - startY) * t;

      ctx.save();
      ctx.beginPath();
      ctx.arc(pulseX, pulseY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = element.strokeColor || '#1971c2';
      ctx.shadowColor = element.strokeColor || '#1971c2';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
  }

  renderArrowTip(tipX, tipY, fromX, fromY, element) {
    const { ctx } = this;
    const angle = Math.atan2(tipY - fromY, tipX - fromX);
    const headLength = Math.max(12, (element.strokeWidth || 2) * 4);
    const arrowSpread = Math.PI / 6; // 30 degrees

    const p1X = tipX - headLength * Math.cos(angle - arrowSpread);
    const p1Y = tipY - headLength * Math.sin(angle - arrowSpread);
    const p2X = tipX - headLength * Math.cos(angle + arrowSpread);
    const p2Y = tipY - headLength * Math.sin(angle + arrowSpread);

    ctx.save();
    ctx.fillStyle = element.strokeColor || '#1971c2';
    ctx.strokeStyle = element.strokeColor || '#1971c2';
    ctx.lineWidth = element.strokeWidth || 2;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(p1X, p1Y);
    ctx.lineTo(p2X, p2Y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Renders a circular connection anchor port with concentric glow and inner core dot
   * (matches attached screenshot)
   */
  renderAnchorPort(x, y, color = '#1971c2', isDark = false) {
    const { ctx } = this;
    ctx.save();

    // Outer concentric glow ring
    ctx.beginPath();
    ctx.arc(x, y, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.22)';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Inner center port dot
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#ffffff' : color;
    ctx.fill();

    ctx.restore();
  }

  /**
   * Caches Rough.js generated shapes to preserve high 60fps performance and jitter stability
   */
  getOrCreateDrawable(element) {
    const cacheKey = `${element.id}_${element.x}_${element.y}_${element.width}_${element.height}_${element.seed}_${element.strokeColor}_${element.backgroundColor}_${element.fillStyle}_${element.strokeWidth}_${element.roughness}_${element.strokeStyle}`;
    
    if (element._cacheKey === cacheKey && element._drawable) {
      return element._drawable;
    }

    const hasBg = element.backgroundColor && element.backgroundColor !== 'transparent';
    const effectiveFillStyle = (element.fillStyle && element.fillStyle !== 'none') 
      ? element.fillStyle 
      : (hasBg ? 'solid' : undefined);

    const options = {
      seed: element.seed,
      roughness: element.roughness,
      stroke: element.strokeColor,
      strokeWidth: element.strokeWidth,
      fill: hasBg ? element.backgroundColor : undefined,
      fillStyle: effectiveFillStyle,
      strokeLineDash: element.strokeStyle === 'dashed' ? [8, 6] : element.strokeStyle === 'dotted' ? [2, 4] : undefined
    };

    let shape = null;
    const { x, y, width, height } = element;

    try {
      switch (element.type) {
        case 'rectangle': {
          const isRound = element.edges === 'round' || Boolean(element.roundness);
          if (isRound) {
            const r = Math.min(16, Math.abs(width) * 0.15, Math.abs(height) * 0.15);
            const pathData = `M ${x + r} ${y} L ${x + width - r} ${y} Q ${x + width} ${y} ${x + width} ${y + r} L ${x + width} ${y + height - r} Q ${x + width} ${y + height} ${x + width - r} ${y + height} L ${x + r} ${y + height} Q ${x} ${y + height} ${x} ${y + height - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
            shape = this.generator.path(pathData, options);
          } else {
            shape = this.generator.rectangle(x, y, width, height, options);
          }
          break;
        }

        case 'diamond': {
          const halfW = width / 2;
          const halfH = height / 2;
          shape = this.generator.polygon([
            [x + halfW, y],
            [x + width, y + halfH],
            [x + halfW, y + height],
            [x, y + halfH]
          ], options);
          break;
        }

        case 'ellipse': {
          shape = this.generator.ellipse(x + width / 2, y + height / 2, width, height, options);
          break;
        }

        case 'line':
        case 'arrow':
          shape = this.generator.line(x, y, x + width, y + height, options);
          break;

        case 'freedraw':
          if (element.points && element.points.length > 1) {
            shape = this.generator.linearPath(element.points, {
              ...options,
              roughness: Math.max(0.2, element.roughness * 0.4)
            });
          }
          break;
      }
    } catch (err) {
      console.warn('Rough.js shape generation error:', err);
    }

    element._cacheKey = cacheKey;
    element._drawable = shape;
    return shape;
  }

  /**
   * Renders the arrow tip with matching hand-drawn stroke
   */
  renderArrowHead(element) {
    const { rc } = this;
    const startX = element.x;
    const startY = element.y;
    const endX = element.x + element.width;
    const endY = element.y + element.height;

    const angle = Math.atan2(endY - startY, endX - startX);
    const headLength = Math.max(14, element.strokeWidth * 4);
    const arrowSpread = Math.PI / 6; // 30 degrees

    const p1 = [
      endX - headLength * Math.cos(angle - arrowSpread),
      endY - headLength * Math.sin(angle - arrowSpread)
    ];
    const p2 = [
      endX - headLength * Math.cos(angle + arrowSpread),
      endY - headLength * Math.sin(angle + arrowSpread)
    ];

    const headOpts = {
      seed: element.seed + 1,
      roughness: element.roughness,
      stroke: element.strokeColor,
      strokeWidth: element.strokeWidth
    };

    rc.draw(this.generator.line(endX, endY, p1[0], p1[1], headOpts));
    rc.draw(this.generator.line(endX, endY, p2[0], p2[1], headOpts));
  }

  /**
   * Resolves the CSS font specification based on element.fontFamily and element.fontSize
   * 1: Virgil (hand-drawn cursive)
   * 2: Outfit / Nunito (sans-serif)
   * 3: JetBrains Mono / Cascadia (monospace code)
   * 4: Times New Roman / Comic (serif / assistant)
   */
  getFontString(element) {
    const fontSize = element.fontSize || 20;
    const familyCode = Number(element.fontFamily) || 1;
    let fontName = "'Caveat', cursive, sans-serif";
    if (familyCode === 2) {
      fontName = "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    } else if (familyCode === 3) {
      fontName = "'JetBrains Mono', monospace";
    } else if (familyCode === 4) {
      fontName = "'Times New Roman', serif";
    }
    return `${fontSize}px ${fontName}`;
  }

  /**
   * Renders hand-drawn text with multiline wrapping, font family, text align, and vertical align
   */
  renderTextElement(element) {
    const { ctx } = this;
    const fontSize = element.fontSize || 20;
    ctx.font = this.getFontString(element);
    ctx.fillStyle = element.strokeColor || '#1e1e1e';
    ctx.textBaseline = 'top';

    const lines = String(element.text || '').split('\n');
    const lineHeight = (element.lineHeight || 1.25) * fontSize;
    const totalTextHeight = lines.length * lineHeight;

    let maxLineWidth = 0;
    lines.forEach(line => {
      const w = ctx.measureText(line).width;
      if (w > maxLineWidth) maxLineWidth = w;
    });

    const totalW = Math.max(element.width || 0, maxLineWidth);
    if (!element.width || element.width < maxLineWidth) {
      element.width = Math.ceil(maxLineWidth);
    }
    if (!element.height || element.height < totalTextHeight) {
      element.height = Math.ceil(totalTextHeight);
    }

    let startY = element.y;
    if (element.height && element.height > totalTextHeight) {
      if (element.verticalAlign === 'middle') {
        startY = element.y + (element.height - totalTextHeight) / 2;
      } else if (element.verticalAlign === 'bottom') {
        startY = element.y + element.height - totalTextHeight;
      }
    }

    const textAlign = element.textAlign || 'left';
    ctx.textAlign = textAlign;

    let alignX = element.x;
    if (textAlign === 'center') {
      alignX = element.x + totalW / 2;
    } else if (textAlign === 'right') {
      alignX = element.x + totalW;
    } else {
      alignX = element.x;
    }

    lines.forEach((line, index) => {
      ctx.fillText(line, alignX, startY + index * lineHeight);
    });
  }

  /**
   * Renders centered text inside primitive shapes (rectangle, ellipse, diamond)
   */
  renderShapeText(element, theme = 'light') {
    if (!element.text) return;
    const { ctx } = this;
    ctx.save();

    let textColor = element.strokeColor || '#1e1e1e';
    if (element.backgroundColor && element.backgroundColor !== 'transparent') {
      const isBgLight = isColorLight(element.backgroundColor);
      if (theme === 'dark' && !isBgLight) {
        textColor = '#f8f9fa';
      }
    } else if (theme === 'dark') {
      if (!element.strokeColor || element.strokeColor === '#1e1e1e' || element.strokeColor === '#000000') {
        textColor = '#f8f9fa';
      }
    }

    const fontSize = element.fontSize || 20;
    ctx.font = this.getFontString(element);
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'top';

    const textAlign = element.textAlign || 'center';
    ctx.textAlign = textAlign;

    const lines = String(element.text).split('\n');
    const lineHeight = (element.lineHeight || 1.25) * fontSize;
    const totalHeight = lines.length * lineHeight;

    const minX = element.width < 0 ? element.x + element.width : element.x;
    const minY = element.height < 0 ? element.y + element.height : element.y;
    const shapeW = Math.abs(element.width || 0);
    const shapeH = Math.abs(element.height || 0);

    let startY = minY + (shapeH - totalHeight) / 2;
    if (element.verticalAlign === 'top') {
      startY = minY + 10;
    } else if (element.verticalAlign === 'bottom') {
      startY = minY + shapeH - totalHeight - 10;
    }

    let alignX = minX + shapeW / 2;
    if (textAlign === 'left') {
      alignX = minX + 12;
    } else if (textAlign === 'right') {
      alignX = minX + shapeW - 12;
    }

    lines.forEach((line, index) => {
      ctx.fillText(line, alignX, startY + index * lineHeight);
    });

    ctx.restore();
  }

  /**
   * Selection highlight bounding box with 8 resize handles and 1 rotation anchor
   */
  renderSelectionBounds(selectedElements, zoom) {
    const { ctx } = this;
    if (selectedElements.length === 0) return;

    for (const el of selectedElements) {
      // Connectors & Arrows: custom endpoint and waypoint handles, no 8-handle box or rotation stem
      if (el.routing === 'orthogonal' || el.type === 'elbow-arrow') {
        ctx.save();
        const waypoints = getOrthogonalWaypointHandles(el);
        for (const wp of waypoints) {
          if (wp.type === 'port') {
            // Concentric anchor port rings at start and end
            ctx.beginPath();
            ctx.arc(wp.x, wp.y, 8 / zoom, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(wp.x, wp.y, 5 / zoom, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2 / zoom;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(wp.x, wp.y, 2.5 / zoom, 0, Math.PI * 2);
            ctx.fillStyle = '#2563eb';
            ctx.fill();
          } else if (wp.type === 'waypoint' || wp.type === 'elbow') {
            // Translucent cyan circular waypoint handles
            const hRadius = 7 / zoom;
            ctx.beginPath();
            ctx.arc(wp.x, wp.y, hRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
            ctx.fill();
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 1.5 / zoom;
            ctx.stroke();

            // Inner core dot for middle elbow handle
            if (wp.id === 'mid') {
              ctx.beginPath();
              ctx.arc(wp.x, wp.y, 2.5 / zoom, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.fill();
            }
          }
        }
        ctx.restore();
        continue;
      }

      if (el.type === 'arrow' || el.type === 'line') {
        ctx.save();
        const pStart = { x: el.x, y: el.y };
        const pEnd = { x: el.x + el.width, y: el.y + el.height };
        for (const pt of [pStart, pEnd]) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6 / zoom, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = '#1c7ed6';
          ctx.lineWidth = 2 / zoom;
          ctx.stroke();
        }
        ctx.restore();
        continue;
      }

      const bounds = getElementBounds(el);
      const padding = 6 / zoom;
      const x = bounds.x - padding;
      const y = bounds.y - padding;
      const w = bounds.width + padding * 2;
      const h = bounds.height + padding * 2;

      ctx.save();
      // Bounding box border
      ctx.strokeStyle = '#339af0';
      ctx.lineWidth = 1.2 / zoom;
      ctx.setLineDash([4 / zoom, 3 / zoom]);
      ctx.strokeRect(x, y, w, h);

      // Handles
      const handles = getResizeHandles({ x, y, width: w, height: h });
      const handleSize = 8 / zoom;
      const halfSize = handleSize / 2;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1c7ed6';
      ctx.lineWidth = 1.5 / zoom;
      ctx.setLineDash([]);

      for (const [name, pos] of Object.entries(handles)) {
        if (name === 'rotate') {
          // Circular rotation handle
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, halfSize + 1, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Connecting vertical stem to top of box
          ctx.beginPath();
          ctx.moveTo(x + w / 2, y);
          ctx.lineTo(pos.x, pos.y + halfSize);
          ctx.strokeStyle = '#339af0';
          ctx.stroke();
        } else {
          // Square resize handle
          ctx.fillRect(pos.x - halfSize, pos.y - halfSize, handleSize, handleSize);
          ctx.strokeRect(pos.x - halfSize, pos.y - halfSize, handleSize, handleSize);
        }
      }

      ctx.restore();
    }
  }

  /**
   * Renders official C4 Model Architecture Primitives (Person, Database, Queue, System)
   * Follows standard C4 specification and color palettes (#08427b Person, #1168bd System/Db/Queue, #6c757d External)
   */
  renderC4Element(element, theme, options = {}) {
    const { ctx } = this;
    const { x, y, width, height } = element;
    const isDark = theme === 'dark';
    const c4Type = element.c4Type || '';
    const isExt = c4Type.endsWith('_Ext') || element.isExt === true || (element.badge && element.badge.includes('EXT'));
    const shape = element.c4Shape || (c4Type.startsWith('Person') || element.badge === 'PERSON' ? 'person' : (c4Type.includes('Db') ? 'database' : (c4Type.includes('Queue') ? 'queue' : 'system')));

    // Standard authentic C4 color palette
    const defaultColor = isExt
      ? '#6c757d' // External Person/System/Db/Queue is muted grey
      : (shape === 'person' ? '#08427b' : '#1168bd'); // Person is deep navy #08427b, System/Db/Queue is C4 blue #1168bd
    const mainColor = element.themeColor || defaultColor;

    ctx.save();

    if (shape === 'person') {
      // 1. Person: Circle head + rounded shoulder body
      const headRadius = Math.min(24, Math.floor(width * 0.18));
      const headCx = x + width / 2;
      const headCy = y + headRadius + 2;

      // Circular Head
      ctx.beginPath();
      ctx.arc(headCx, headCy, headRadius, 0, Math.PI * 2);
      ctx.fillStyle = mainColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = isExt ? '#495057' : '#06315c';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Rounded Torso / Body
      const bodyTopY = headCy + headRadius + 4;
      const bodyHeight = Math.max(30, height - (bodyTopY - y));
      const r = 16;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, bodyTopY, width, bodyHeight, [r, r, 10, 10]);
      } else {
        ctx.rect(x, bodyTopY, width, bodyHeight);
      }
      ctx.fillStyle = mainColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = isExt ? '#495057' : '#06315c';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // White Centered Text inside Body
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const title = element.title || element.label || 'Banking Customer';
      ctx.font = "700 13px 'Outfit', -apple-system, sans-serif";
      ctx.fillText(title, x + width / 2, bodyTopY + 16, width - 16);

      const tag = element.c4Tag || (isExt ? '[Person]' : '[Person]');
      ctx.font = "italic 400 10px 'JetBrains Mono', monospace";
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(tag, x + width / 2, bodyTopY + 30);

      const desc = element.subtitle || element.desc || '';
      if (desc) {
        ctx.font = "400 10px 'Outfit', sans-serif";
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.renderCenteredMultilineText(ctx, desc, x + width / 2, bodyTopY + 46, width - 18, 12);
      }
    } else if (shape === 'database') {
      // 2. 3D Cylinder Database shape
      const rx = width / 2;
      const ry = Math.min(16, height * 0.18);
      const cx = x + rx;
      const topCy = y + ry;
      const bottomCy = y + height - ry;

      // Bottom curved body
      ctx.beginPath();
      ctx.ellipse(cx, bottomCy, rx, ry, 0, 0, Math.PI);
      ctx.lineTo(x, topCy);
      ctx.ellipse(cx, topCy, rx, ry, 0, Math.PI, 0);
      ctx.lineTo(x + width, bottomCy);
      ctx.closePath();
      ctx.fillStyle = mainColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = isExt ? '#495057' : '#0c4d8c';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Top ellipse lid
      ctx.beginPath();
      ctx.ellipse(cx, topCy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = mainColor;
      ctx.fill();
      ctx.strokeStyle = isExt ? '#495057' : '#0c4d8c';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text inside cylinder
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const title = element.title || element.label || 'Database';
      ctx.font = "700 13px 'Outfit', sans-serif";
      ctx.fillText(title, cx, topCy + ry + 12, width - 16);

      const tag = element.c4Tag || (isExt ? '[Software System]' : '[Software System]');
      ctx.font = "italic 400 10px 'JetBrains Mono', monospace";
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(tag, cx, topCy + ry + 26);

      const desc = element.subtitle || element.desc || '';
      if (desc) {
        ctx.font = "400 10px 'Outfit', sans-serif";
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.renderCenteredMultilineText(ctx, desc, cx, topCy + ry + 42, width - 18, 12);
      }
    } else if (shape === 'queue') {
      // 3. Queue Capsule shape
      const r = Math.min(18, height / 2);
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, height, r);
      } else {
        ctx.rect(x, y, width, height);
      }
      ctx.fillStyle = mainColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = isExt ? '#495057' : '#0c4d8c';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Queue side divider line (classic C4 queue visual indicator)
      ctx.beginPath();
      ctx.ellipse(x + width - r, y + height / 2, r * 0.6, height / 2 - 2, 0, -Math.PI / 2, Math.PI / 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text inside queue
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const title = element.title || element.label || 'Queue';
      ctx.font = "700 13px 'Outfit', sans-serif";
      ctx.fillText(title, x + (width - r) / 2, y + 16, width - r - 12);

      const tag = element.c4Tag || (isExt ? '[Software System]' : '[Software System]');
      ctx.font = "italic 400 10px 'JetBrains Mono', monospace";
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(tag, x + (width - r) / 2, y + 30);

      const desc = element.subtitle || element.desc || '';
      if (desc) {
        ctx.font = "400 10px 'Outfit', sans-serif";
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.renderCenteredMultilineText(ctx, desc, x + (width - r) / 2, y + 45, width - r - 12, 12);
      }
    } else {
      // 4. Standard C4 Software System or Container Box
      const r = 8;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, height, r);
      } else {
        ctx.rect(x, y, width, height);
      }
      ctx.fillStyle = mainColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = isExt ? '#495057' : '#0c4d8c';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text inside Box
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const title = element.title || element.label || 'System';
      ctx.font = "700 13px 'Outfit', sans-serif";
      ctx.fillText(title, x + width / 2, y + 20, width - 16);

      const tag = element.c4Tag || (isExt ? '[Software System]' : '[Software System]');
      ctx.font = "italic 400 10px 'JetBrains Mono', monospace";
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(tag, x + width / 2, y + 35);

      const desc = element.subtitle || element.desc || '';
      if (desc) {
        ctx.font = "400 10px 'Outfit', sans-serif";
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.renderCenteredMultilineText(ctx, desc, x + width / 2, y + 52, width - 16, 12);
      }
    }

    ctx.restore();
  }

  /**
   * Helper to render centered text with word-wrapping across multiple lines
   */
  renderCenteredMultilineText(ctx, text, centerX, startY, maxWidth, lineHeight = 13) {
    if (!text) return;
    const cleanText = text.replace(/<br\s*\/?>/gi, '\n');
    const paragraphs = cleanText.split('\n');
    let currentY = startY;

    for (const paragraph of paragraphs) {
      const words = paragraph.split(' ');
      let currentLine = '';

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine ? `${currentLine} ${words[n]}` : words[n];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(currentLine, centerX, currentY);
          currentLine = words[n];
          currentY += lineHeight;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        ctx.fillText(currentLine, centerX, currentY);
        currentY += lineHeight;
      }
    }
  }

  /**
   * Marquee drag-to-select blue box
   */
  renderSelectionMarquee(box) {
    const { ctx } = this;
    const x = Math.min(box.startX, box.currentX);
    const y = Math.min(box.startY, box.currentY);
    const w = Math.abs(box.currentX - box.startX);
    const h = Math.abs(box.currentY - box.startY);

    ctx.save();
    ctx.fillStyle = 'rgba(51, 154, 240, 0.12)';
    ctx.strokeStyle = 'rgba(51, 154, 240, 0.85)';
    ctx.lineWidth = 1;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }
}
