/**
 * ExcaliCraft Export & Import Engine
 * Supports PNG (Hi-DPI), SVG (Vector with Rough.js), PDF (via jsPDF), and native .excalidraw JSON schemas
 */

import rough from 'roughjs';
import { jsPDF } from 'jspdf';
import gifencPkg from 'gifenc';
const { GIFEncoder, quantize, applyPalette } = gifencPkg.GIFEncoder ? gifencPkg : (gifencPkg.default || gifencPkg);
import { getElementsBounds, getElementBounds, getOrthogonalArrowPoints } from './math.js';
import { SceneRenderer, isColorLight } from './renderer.js';
import { ArchitectureGraph } from './graph.js';

export function getSvgFontFamily(familyCode) {
  const code = Number(familyCode) || 1;
  if (code === 2) return "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  if (code === 3) return "'JetBrains Mono', 'Cascadia Code', monospace";
  if (code === 4) return "'Times New Roman', serif";
  return "'Caveat', cursive, sans-serif";
}

function createSvgShapeText(el, theme) {
  const fontSize = el.fontSize || 20;
  const fontFamily = getSvgFontFamily(el.fontFamily);
  const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  const lines = String(el.text || '').split('\n');
  const lineHeight = (el.lineHeight || 1.25) * fontSize;
  const totalTextHeight = lines.length * lineHeight;

  const minX = el.width < 0 ? el.x + el.width : el.x;
  const minY = el.height < 0 ? el.y + el.height : el.y;
  const shapeW = Math.abs(el.width || 0);
  const shapeH = Math.abs(el.height || 0);

  let startY = minY + (shapeH - totalTextHeight) / 2 + fontSize * 0.85;
  if (el.verticalAlign === 'top') {
    startY = minY + 12 + fontSize * 0.85;
  } else if (el.verticalAlign === 'bottom') {
    startY = minY + shapeH - totalTextHeight - 12 + fontSize * 0.85;
  }

  const textAlign = el.textAlign || 'center';
  let anchorX = minX + shapeW / 2;
  let textAnchor = 'middle';
  if (textAlign === 'left') {
    anchorX = minX + 12;
    textAnchor = 'start';
  } else if (textAlign === 'right') {
    anchorX = minX + shapeW - 12;
    textAnchor = 'end';
  }

  let textColor = el.strokeColor || '#1e1e1e';
  if (el.backgroundColor && el.backgroundColor !== 'transparent') {
    if (theme === 'dark' && !isColorLight(el.backgroundColor)) textColor = '#f8f9fa';
  } else if (theme === 'dark' && (!el.strokeColor || el.strokeColor === '#1e1e1e' || el.strokeColor === '#000000')) {
    textColor = '#f8f9fa';
  }

  textNode.setAttribute('x', `${anchorX}`);
  textNode.setAttribute('y', `${startY}`);
  textNode.setAttribute('fill', textColor);
  textNode.setAttribute('font-family', fontFamily);
  textNode.setAttribute('font-size', `${fontSize}px`);
  textNode.setAttribute('text-anchor', textAnchor);

  lines.forEach((line, idx) => {
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan.setAttribute('x', `${anchorX}`);
    tspan.setAttribute('dy', idx === 0 ? '0' : `${lineHeight}`);
    tspan.setAttribute('xml:space', 'preserve');
    tspan.textContent = line || ' ';
    textNode.appendChild(tspan);
  });
  return textNode;
}

export function exportToPng(elements, theme = 'light', scale = 2, options = {}) {
  if (!elements || elements.length === 0) {
    alert('Canvas is empty. Draw something before exporting!');
    return;
  }

  const bounds = getElementsBounds(elements);
  if (!bounds) return;

  const padding = 60; // Generous margin ensuring no cards, shadows, or labels are cut off
  const width = Math.ceil(bounds.width + padding * 2);
  const height = Math.ceil(bounds.height + padding * 2);

  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = width * scale;
  offscreenCanvas.height = height * scale;

  const ctx = offscreenCanvas.getContext('2d');

  // Background
  ctx.fillStyle = options.canvasBackground || (theme === 'dark' ? '#121212' : '#ffffff');
  ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

  ctx.save();
  ctx.scale(scale, scale);
  const scrollX = -bounds.x + padding;
  const scrollY = -bounds.y + padding;
  ctx.translate(scrollX, scrollY);

  const renderer = new SceneRenderer(offscreenCanvas);
  const graph = new ArchitectureGraph(elements);
  const spofNodeIds = options.spofNodeIds || graph.detectSpofs();
  const capacityMetrics = options.capacityMetrics || graph.analyzeCapacity();
  const renderOptions = {
    metricsOverlay: Boolean(options.metricsOverlay),
    spofNodeIds,
    capacityMetrics
  };

  // Render group boundaries first
  for (const element of elements) {
    if (element.type === 'group-boundary') {
      renderer.renderElement(element, theme, renderOptions);
    }
  }
  // Render all other elements
  for (const element of elements) {
    if (element.type !== 'group-boundary') {
      renderer.renderElement(element, theme, renderOptions);
    }
  }
  ctx.restore();

  // Download trigger
  const link = document.createElement('a');
  link.download = `excalidraw-diagram-${Date.now()}.png`;
  link.href = offscreenCanvas.toDataURL('image/png');
  link.click();
}

export function exportToPdf(elements, theme = 'light', options = {}) {
  if (!elements || elements.length === 0) {
    alert('Canvas is empty. Draw something before exporting!');
    return;
  }

  const bounds = getElementsBounds(elements);
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) return;

  const padding = 30;
  const canvasW = Math.ceil(bounds.width + padding * 2);
  const canvasH = Math.ceil(bounds.height + padding * 2);

  // Standard ISO A4 Landscape: 841.89 x 595.28 pt (matches reference format)
  // For small single vertical diagrams (width < height and height <= 900), portrait can be used.
  // Otherwise, landscape is standard for architecture, flowcharts, and multi-page note slides.
  const isSinglePagePortrait = !options.landscape && (canvasW < canvasH) && (canvasH <= 900);
  const pageW = isSinglePagePortrait ? 595.28 : 841.89;
  const pageH = isSinglePagePortrait ? 841.89 : 595.28;
  const orientation = isSinglePagePortrait ? 'portrait' : 'landscape';

  const margin = 28; // ~0.38-inch clean margin
  const availW = pageW - margin * 2;
  const availH = pageH - margin * 2;

  // Render high-fidelity 2x retina canvas containing all exported elements
  const supersample = 2;
  const fullCanvas = document.createElement('canvas');
  fullCanvas.width = canvasW * supersample;
  fullCanvas.height = canvasH * supersample;
  const ctx = fullCanvas.getContext('2d');

  ctx.fillStyle = options.canvasBackground || (theme === 'dark' ? '#121212' : '#ffffff');
  ctx.fillRect(0, 0, fullCanvas.width, fullCanvas.height);

  ctx.save();
  ctx.scale(supersample, supersample);
  ctx.translate(-bounds.x + padding, -bounds.y + padding);

  const renderer = new SceneRenderer(fullCanvas);
  const graph = new ArchitectureGraph(elements);
  const spofNodeIds = options.spofNodeIds || graph.detectSpofs();
  const capacityMetrics = options.capacityMetrics || graph.analyzeCapacity();
  const renderOptions = {
    metricsOverlay: Boolean(options.metricsOverlay),
    spofNodeIds,
    capacityMetrics
  };

  // Render group boundaries & swimlanes first
  for (const element of elements) {
    if (element.type === 'group-boundary' || element.type === 'swimlane') {
      renderer.renderElement(element, theme, renderOptions);
    }
  }
  // Render shapes, lines, text, icons
  for (const element of elements) {
    if (element.type !== 'group-boundary' && element.type !== 'swimlane') {
      renderer.renderElement(element, theme, renderOptions);
    }
  }
  ctx.restore();

  const pdf = new jsPDF({
    orientation,
    unit: 'pt',
    format: 'a4'
  });

  // Calculate width scale: the diagram fits comfortably across the page width
  const widthScale = availW / canvasW;
  const sliceHeightPx = availH / widthScale;

  // Single page fit check:
  if (canvasH * widthScale <= availH || options.singlePage) {
    const fitScale = Math.min(availW / canvasW, availH / canvasH);
    const destW = canvasW * fitScale;
    const destH = canvasH * fitScale;
    const destX = (pageW - destW) / 2;
    const destY = (pageH - destH) / 2;

    pdf.addImage(fullCanvas, 'PNG', destX, destY, destW, destH, '', 'FAST');
  } else {
    // Multi-page continuous slice (matching Skia/Chrome print behavior in reference PDF)
    const numPages = Math.ceil(canvasH / sliceHeightPx);

    for (let p = 0; p < numPages; p++) {
      if (p > 0) {
        pdf.addPage('a4', orientation);
      }

      const startY = p * sliceHeightPx;
      const currentSliceH = Math.min(sliceHeightPx, canvasH - startY);

      // Create high-res slice canvas
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvasW * supersample;
      sliceCanvas.height = Math.ceil(currentSliceH * supersample);
      const sliceCtx = sliceCanvas.getContext('2d');

      sliceCtx.fillStyle = options.canvasBackground || (theme === 'dark' ? '#121212' : '#ffffff');
      sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

      sliceCtx.drawImage(
        fullCanvas,
        0, Math.round(startY * supersample), canvasW * supersample, Math.round(currentSliceH * supersample),
        0, 0, canvasW * supersample, Math.round(currentSliceH * supersample)
      );

      const destW = availW;
      const destH = currentSliceH * widthScale;
      const destX = margin;
      const destY = (p === numPages - 1 && destH < availH * 0.7) ? (pageH - destH) / 2 : margin;

      pdf.addImage(sliceCanvas, 'PNG', destX, destY, destW, destH, '', 'FAST');
    }
  }

  pdf.save(`excalidraw-architecture-${Date.now()}.pdf`);
}

export async function exportToGif(elements, theme = 'light', options = {}) {
  if (!elements || elements.length === 0) {
    alert('Canvas is empty. Draw something before exporting!');
    return;
  }

  const bounds = getElementsBounds(elements);
  if (!bounds) return;

  const padding = 60; // Generous margin ensuring no cards, shadows, or labels are cut off (matches PNG)
  const rawWidth = Math.ceil(bounds.width + padding * 2);
  const rawHeight = Math.ceil(bounds.height + padding * 2);

  // Full crisp resolution matching PNG export dimensions
  const scale = options.scale || 1;
  const width = Math.round(rawWidth * scale);
  const height = Math.round(rawHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const gif = GIFEncoder();
  const numFrames = 16;
  const loopDuration = 1600; // ms per pulse cycle
  const delay = Math.round(loopDuration / numFrames); // ms per frame

  const renderer = new SceneRenderer(canvas);

  const graph = new ArchitectureGraph(elements);
  const spofNodeIds = options.spofNodeIds || graph.detectSpofs();
  const capacityMetrics = options.capacityMetrics || graph.analyzeCapacity();
  const renderOptions = {
    metricsOverlay: Boolean(options.metricsOverlay),
    spofNodeIds,
    capacityMetrics
  };

  for (let f = 0; f < numFrames; f++) {
    const simulatedTime = (f / numFrames) * loopDuration;
    renderer.currentTime = simulatedTime;

    // Clear background
    ctx.fillStyle = options.canvasBackground || (theme === 'dark' ? '#121212' : '#ffffff');
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.scale(scale, scale);
    const scrollX = -bounds.x + padding;
    const scrollY = -bounds.y + padding;
    ctx.translate(scrollX, scrollY);

    // Render group boundaries first
    for (const el of elements) {
      if (el.type === 'group-boundary') {
        renderer.renderElement(el, theme, renderOptions);
      }
    }
    // Render other elements
    for (const el of elements) {
      if (el.type !== 'group-boundary') {
        renderer.renderElement(el, theme, renderOptions);
      }
    }
    ctx.restore();

    const { data } = ctx.getImageData(0, 0, width, height);
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    gif.writeFrame(index, width, height, { palette, delay });
  }

  gif.finish();
  const bytes = gif.bytes();

  if (options && options.returnBase64) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return { base64, bytes };
  }

  const blob = new Blob([bytes], { type: 'image/gif' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = options && options.filename ? options.filename : `excalidraw-animation-${Date.now()}.gif`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
  return { bytes };
}

export function exportToSvg(elements, theme = 'light', options = {}) {
  if (!elements || elements.length === 0) {
    alert('Canvas is empty. Draw something before exporting!');
    return;
  }

  const bounds = getElementsBounds(elements);
  if (!bounds) return;

  const padding = 60;
  const width = Math.ceil(bounds.width + padding * 2);
  const height = Math.ceil(bounds.height + padding * 2);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', `${width}`);
  svg.setAttribute('height', `${height}`);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  // Background rect
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', '100%');
  bg.setAttribute('height', '100%');
  bg.setAttribute('fill', options.canvasBackground || (theme === 'dark' ? '#121212' : '#ffffff'));
  svg.appendChild(bg);

  // Embedded font styles so exported SVG renders correctly in any viewer
  const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleEl.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap');
    text {
      user-select: none;
      white-space: pre;
    }
  `;
  svg.appendChild(styleEl);

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${-bounds.x + padding}, ${-bounds.y + padding})`);
  svg.appendChild(g);

  const rc = rough.svg(svg);

  for (const el of elements) {
    const opts = {
      seed: el.seed,
      roughness: el.roughness,
      stroke: el.strokeColor,
      strokeWidth: el.strokeWidth,
      fill: el.backgroundColor === 'transparent' ? undefined : el.backgroundColor,
      fillStyle: el.fillStyle === 'none' ? undefined : el.fillStyle,
      strokeLineDash: el.strokeStyle === 'dashed' ? [8, 6] : el.strokeStyle === 'dotted' ? [2, 4] : undefined
    };

    let node = null;
    const { x, y, width: w, height: h } = el;

    switch (el.type) {
      case 'rectangle': {
        const isRound = el.edges === 'round' || Boolean(el.roundness);
        let shapeNode = null;
        if (isRound) {
          const r = Math.min(16, Math.abs(w) * 0.15, Math.abs(h) * 0.15);
          const pathData = `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
          shapeNode = rc.path(pathData, opts);
        } else {
          shapeNode = rc.rectangle(x, y, w, h, opts);
        }
        if (el.text) {
          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          group.appendChild(shapeNode);
          group.appendChild(createSvgShapeText(el, theme));
          node = group;
        } else {
          node = shapeNode;
        }
        break;
      }
      case 'diamond': {
        const shapeNode = rc.polygon([
          [x + w / 2, y],
          [x + w, y + h / 2],
          [x + w / 2, y + h],
          [x, y + h / 2]
        ], opts);
        if (el.text) {
          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          group.appendChild(shapeNode);
          group.appendChild(createSvgShapeText(el, theme));
          node = group;
        } else {
          node = shapeNode;
        }
        break;
      }
      case 'ellipse': {
        const shapeNode = rc.ellipse(x + w / 2, y + h / 2, w, h, opts);
        if (el.text) {
          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          group.appendChild(shapeNode);
          group.appendChild(createSvgShapeText(el, theme));
          node = group;
        } else {
          node = shapeNode;
        }
        break;
      }
      case 'line': {
        if (el.points && el.points.length > 1) {
          const absolutePoints = el.points.map(([px, py]) => [x + px, y + py]);
          node = rc.linearPath(absolutePoints, opts);
        } else {
          node = rc.line(x, y, x + w, y + h, opts);
        }
        break;
      }
      case 'elbow-arrow':
      case 'arrow': {
        const arrowGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const isOrthogonal = el.routing === 'orthogonal' || el.type === 'elbow-arrow';

        if (isOrthogonal) {
          const pts = getOrthogonalArrowPoints(el);
          const [p0, p1, p2, p3] = pts;

          const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const pathData = `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`;
          pathEl.setAttribute('d', pathData);
          pathEl.setAttribute('stroke', el.strokeColor || (theme === 'dark' ? '#adb5bd' : '#495057'));
          pathEl.setAttribute('stroke-width', String(el.strokeWidth || 2));
          pathEl.setAttribute('fill', 'none');
          pathEl.setAttribute('stroke-linejoin', 'round');
          pathEl.setAttribute('stroke-linecap', 'round');
          arrowGroup.appendChild(pathEl);

          // Flow dash stroke
          if (el.isAnimated !== false) {
            const flowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            flowPath.setAttribute('d', pathData);
            flowPath.setAttribute('stroke', '#38bdf8');
            flowPath.setAttribute('stroke-width', String((el.strokeWidth || 2) + 0.6));
            flowPath.setAttribute('fill', 'none');
            flowPath.setAttribute('stroke-dasharray', '8 8');
            flowPath.setAttribute('stroke-linejoin', 'round');
            flowPath.setAttribute('stroke-linecap', 'round');
            arrowGroup.appendChild(flowPath);
          }

          // Anchor ports (blue concentric rings)
          const createPort = (px, py) => {
            const portG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const outer = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            outer.setAttribute('cx', String(px));
            outer.setAttribute('cy', String(py));
            outer.setAttribute('r', '7.5');
            outer.setAttribute('fill', 'rgba(56, 189, 248, 0.25)');
            outer.setAttribute('stroke', '#38bdf8');
            outer.setAttribute('stroke-width', '1.8');
            portG.appendChild(outer);

            const inner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            inner.setAttribute('cx', String(px));
            inner.setAttribute('cy', String(py));
            inner.setAttribute('r', '3');
            inner.setAttribute('fill', el.strokeColor || '#1971c2');
            portG.appendChild(inner);
            return portG;
          };

          arrowGroup.appendChild(createPort(p0.x, p0.y));
          arrowGroup.appendChild(createPort(p3.x, p3.y));

          // Tip at p3
          if (el.direction !== 'none') {
            const angle = Math.atan2(p3.y - p2.y, p3.x - p2.x);
            const arrowLength = 16;
            const arrowAngle = Math.PI / 6;
            const leftX = p3.x - arrowLength * Math.cos(angle - arrowAngle);
            const leftY = p3.y - arrowLength * Math.sin(angle - arrowAngle);
            const rightX = p3.x - arrowLength * Math.cos(angle + arrowAngle);
            const rightY = p3.y - arrowLength * Math.sin(angle + arrowAngle);

            const tipPath = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            tipPath.setAttribute('points', `${p3.x},${p3.y} ${leftX},${leftY} ${rightX},${rightY}`);
            tipPath.setAttribute('fill', el.strokeColor || '#1971c2');
            arrowGroup.appendChild(tipPath);
          }

          // Tip at p0 if bidirectional
          if (el.direction === 'bidirectional') {
            const angle = Math.atan2(p0.y - p1.y, p0.x - p1.x);
            const arrowLength = 16;
            const arrowAngle = Math.PI / 6;
            const leftX = p0.x - arrowLength * Math.cos(angle - arrowAngle);
            const leftY = p0.y - arrowLength * Math.sin(angle - arrowAngle);
            const rightX = p0.x - arrowLength * Math.cos(angle + arrowAngle);
            const rightY = p0.y - arrowLength * Math.sin(angle + arrowAngle);

            const tipPath = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            tipPath.setAttribute('points', `${p0.x},${p0.y} ${leftX},${leftY} ${rightX},${rightY}`);
            tipPath.setAttribute('fill', el.strokeColor || '#1971c2');
            arrowGroup.appendChild(tipPath);
          }

          // Label
          if (el.label) {
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const pillW = Math.max(el.label.length * 8 + 24, 60);
            const pillH = 22;

            const pillBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            pillBg.setAttribute('x', `${midX - pillW / 2}`);
            pillBg.setAttribute('y', `${midY - pillH / 2}`);
            pillBg.setAttribute('width', `${pillW}`);
            pillBg.setAttribute('height', `${pillH}`);
            pillBg.setAttribute('rx', '6');
            pillBg.setAttribute('ry', '6');
            pillBg.setAttribute('fill', theme === 'dark' ? '#212529' : '#ffffff');
            pillBg.setAttribute('stroke', theme === 'dark' ? '#373a40' : '#ced4da');
            pillBg.setAttribute('stroke-width', '1');
            arrowGroup.appendChild(pillBg);

            const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            labelText.setAttribute('x', `${midX}`);
            labelText.setAttribute('y', `${midY + 4}`);
            labelText.setAttribute('text-anchor', 'middle');
            labelText.setAttribute('fill', theme === 'dark' ? '#74c0fc' : '#1971c2');
            labelText.setAttribute('font-family', "'JetBrains Mono', monospace");
            labelText.setAttribute('font-weight', '600');
            labelText.setAttribute('font-size', '11px');
            labelText.textContent = el.label;
            arrowGroup.appendChild(labelText);
          }

          node = arrowGroup;
          break;
        }

        let lineNode = null;
        if (el.points && el.points.length > 1) {
          const absolutePoints = el.points.map(([px, py]) => [x + px, y + py]);
          lineNode = rc.linearPath(absolutePoints, opts);
        } else {
          lineNode = rc.line(x, y, x + w, y + h, opts);
        }
        arrowGroup.appendChild(lineNode);

        // Arrow tip at end
        if (el.direction !== 'none') {
          const angle = Math.atan2(h, w);
          const arrowLength = 16;
          const arrowAngle = Math.PI / 6;
          const endX = x + w;
          const endY = y + h;
          const leftX = endX - arrowLength * Math.cos(angle - arrowAngle);
          const leftY = endY - arrowLength * Math.sin(angle - arrowAngle);
          const rightX = endX - arrowLength * Math.cos(angle + arrowAngle);
          const rightY = endY - arrowLength * Math.sin(angle + arrowAngle);

          const tipPath = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          tipPath.setAttribute('points', `${endX},${endY} ${leftX},${leftY} ${rightX},${rightY}`);
          tipPath.setAttribute('fill', el.strokeColor || '#1971c2');
          arrowGroup.appendChild(tipPath);
        }

        // Arrow tip at start if bidirectional
        if (el.direction === 'bidirectional') {
          const angle = Math.atan2(-h, -w);
          const arrowLength = 16;
          const arrowAngle = Math.PI / 6;
          const leftX = x - arrowLength * Math.cos(angle - arrowAngle);
          const leftY = y - arrowLength * Math.sin(angle - arrowAngle);
          const rightX = x - arrowLength * Math.cos(angle + arrowAngle);
          const rightY = y - arrowLength * Math.sin(angle + arrowAngle);

          const tipPath = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          tipPath.setAttribute('points', `${x},${y} ${leftX},${leftY} ${rightX},${rightY}`);
          tipPath.setAttribute('fill', el.strokeColor || '#1971c2');
          arrowGroup.appendChild(tipPath);
        }

        // Arrow label pill
        if (el.label) {
          const midX = x + w / 2;
          const midY = y + h / 2;
          const pillW = Math.max(el.label.length * 8 + 24, 60);
          const pillH = 22;

          const pillBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          pillBg.setAttribute('x', `${midX - pillW / 2}`);
          pillBg.setAttribute('y', `${midY - pillH / 2}`);
          pillBg.setAttribute('width', `${pillW}`);
          pillBg.setAttribute('height', `${pillH}`);
          pillBg.setAttribute('rx', '6');
          pillBg.setAttribute('ry', '6');
          pillBg.setAttribute('fill', theme === 'dark' ? '#212529' : '#ffffff');
          pillBg.setAttribute('stroke', theme === 'dark' ? '#373a40' : '#ced4da');
          pillBg.setAttribute('stroke-width', '1');
          arrowGroup.appendChild(pillBg);

          const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          labelText.setAttribute('x', `${midX}`);
          labelText.setAttribute('y', `${midY + 4}`);
          labelText.setAttribute('text-anchor', 'middle');
          labelText.setAttribute('fill', theme === 'dark' ? '#74c0fc' : '#1971c2');
          labelText.setAttribute('font-family', "'JetBrains Mono', monospace");
          labelText.setAttribute('font-weight', '600');
          labelText.setAttribute('font-size', '11px');
          labelText.textContent = el.label;
          arrowGroup.appendChild(labelText);
        }

        node = arrowGroup;
        break;
      }
      case 'freedraw':
        if (el.points && el.points.length > 1) {
          node = rc.linearPath(el.points, { ...opts, roughness: Math.max(0.2, el.roughness * 0.4) });
        }
        break;
      case 'text': {
        const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const fontSize = el.fontSize || 20;
        const fontFamily = getSvgFontFamily(el.fontFamily);
        const textAlign = el.textAlign || 'left';

        const lines = String(el.text || '').split('\n');
        let maxLineLen = 0;
        lines.forEach(l => {
          if (l.length > maxLineLen) maxLineLen = l.length;
        });
        const approxW = maxLineLen * fontSize * 0.6;
        const totalW = Math.max(el.width || 0, approxW);

        let textAnchor = 'start';
        let anchorX = x;
        if (textAlign === 'center') {
          textAnchor = 'middle';
          anchorX = x + totalW / 2;
        } else if (textAlign === 'right') {
          textAnchor = 'end';
          anchorX = x + totalW;
        }

        textNode.setAttribute('x', `${anchorX}`);
        textNode.setAttribute('fill', el.strokeColor || '#1e1e1e');
        textNode.setAttribute('font-family', fontFamily);
        textNode.setAttribute('font-size', `${fontSize}px`);
        textNode.setAttribute('text-anchor', textAnchor);
        if (el.opacity !== undefined) {
          textNode.setAttribute('opacity', `${el.opacity / 100}`);
        }

        const lineHeight = (el.lineHeight || 1.25) * fontSize;
        const totalTextHeight = lines.length * lineHeight;

        let startY = y + fontSize * 0.85;
        if (el.height && el.height > totalTextHeight) {
          if (el.verticalAlign === 'middle') {
            startY = y + (el.height - totalTextHeight) / 2 + fontSize * 0.85;
          } else if (el.verticalAlign === 'bottom') {
            startY = y + (el.height - totalTextHeight) + fontSize * 0.85;
          }
        }
        textNode.setAttribute('y', `${startY}`);

        lines.forEach((line, index) => {
          const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          tspan.setAttribute('x', `${anchorX}`);
          tspan.setAttribute('dy', index === 0 ? '0' : `${lineHeight}`);
          tspan.setAttribute('xml:space', 'preserve');
          tspan.textContent = line || ' ';
          textNode.appendChild(tspan);
        });

        node = textNode;
        break;
      }
      case 'image': {
        const src = el.dataURL || el.url || '';
        if (src) {
          const imgNode = document.createElementNS('http://www.w3.org/2000/svg', 'image');
          imgNode.setAttribute('href', src);
          imgNode.setAttribute('x', `${x}`);
          imgNode.setAttribute('y', `${y}`);
          imgNode.setAttribute('width', `${w}`);
          imgNode.setAttribute('height', `${h}`);
          imgNode.setAttribute('preserveAspectRatio', 'none');
          if (el.opacity !== undefined && el.opacity < 100) {
            imgNode.setAttribute('opacity', `${el.opacity / 100}`);
          }
          node = imgNode;
        }
        break;
      }
      case 'node': {
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const accent = el.themeColor || el.strokeColor || '#1971c2';
        
        // Base card rect
        const cardRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        cardRect.setAttribute('x', `${x}`);
        cardRect.setAttribute('y', `${y}`);
        cardRect.setAttribute('width', `${w}`);
        cardRect.setAttribute('height', `${h}`);
        cardRect.setAttribute('rx', '10');
        cardRect.setAttribute('ry', '10');
        cardRect.setAttribute('fill', el.backgroundColor || (theme === 'dark' ? '#18191c' : '#ffffff'));
        cardRect.setAttribute('stroke', theme === 'dark' ? '#2c2e33' : '#dee2e6');
        cardRect.setAttribute('stroke-width', `${el.strokeWidth || 1.5}`);
        nodeGroup.appendChild(cardRect);

        // Top accent stripe
        const topStripe = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        topStripe.setAttribute('x', `${x}`);
        topStripe.setAttribute('y', `${y}`);
        topStripe.setAttribute('width', `${w}`);
        topStripe.setAttribute('height', '4');
        topStripe.setAttribute('rx', '2');
        topStripe.setAttribute('fill', accent);
        nodeGroup.appendChild(topStripe);

        // Title text
        const titleSvg = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleSvg.setAttribute('x', `${x + 56}`);
        titleSvg.setAttribute('y', `${y + 28}`);
        titleSvg.setAttribute('fill', theme === 'dark' ? '#f8f9fa' : '#212529');
        titleSvg.setAttribute('font-family', "'Outfit', sans-serif");
        titleSvg.setAttribute('font-weight', '600');
        titleSvg.setAttribute('font-size', '14px');
        titleSvg.textContent = el.title || 'Service Node';
        nodeGroup.appendChild(titleSvg);

        // Subtitle text
        const subSvg = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        subSvg.setAttribute('x', `${x + 56}`);
        subSvg.setAttribute('y', `${y + 45}`);
        subSvg.setAttribute('fill', theme === 'dark' ? '#909296' : '#6c757d');
        subSvg.setAttribute('font-family', "'JetBrains Mono', monospace");
        subSvg.setAttribute('font-size', '11px');
        subSvg.textContent = el.subtitle || '';
        nodeGroup.appendChild(subSvg);

        // Badge pill
        if (el.badge) {
          const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          badgeText.setAttribute('x', `${x + 56}`);
          badgeText.setAttribute('y', `${y + 68}`);
          badgeText.setAttribute('fill', accent);
          badgeText.setAttribute('font-family', "'Outfit', sans-serif");
          badgeText.setAttribute('font-weight', '700');
          badgeText.setAttribute('font-size', '9px');
          badgeText.textContent = el.badge.toUpperCase();
          nodeGroup.appendChild(badgeText);
        }

        node = nodeGroup;
        break;
      }
      case 'c4-element': {
        const c4Group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const c4Type = el.c4Type || '';
        const isExt = c4Type.endsWith('_Ext') || el.isExt === true || (el.badge && el.badge.includes('EXT'));
        const shape = el.c4Shape || (c4Type.startsWith('Person') || el.badge === 'PERSON' ? 'person' : (c4Type.includes('Db') ? 'database' : (c4Type.includes('Queue') ? 'queue' : 'system')));
        const defaultColor = isExt ? '#6c757d' : (shape === 'person' ? '#08427b' : '#1168bd');
        const mainColor = el.themeColor || defaultColor;

        if (shape === 'person') {
          const headR = Math.min(24, Math.floor(w * 0.18));
          const headCx = x + w / 2;
          const headCy = y + headR + 2;

          const headCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          headCircle.setAttribute('cx', `${headCx}`);
          headCircle.setAttribute('cy', `${headCy}`);
          headCircle.setAttribute('r', `${headR}`);
          headCircle.setAttribute('fill', mainColor);
          headCircle.setAttribute('stroke', isExt ? '#495057' : '#06315c');
          headCircle.setAttribute('stroke-width', '1.5');
          c4Group.appendChild(headCircle);

          const bodyTopY = headCy + headR + 4;
          const bodyH = Math.max(30, h - (bodyTopY - y));
          const bodyRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          bodyRect.setAttribute('x', `${x}`);
          bodyRect.setAttribute('y', `${bodyTopY}`);
          bodyRect.setAttribute('width', `${w}`);
          bodyRect.setAttribute('height', `${bodyH}`);
          bodyRect.setAttribute('rx', '14');
          bodyRect.setAttribute('fill', mainColor);
          bodyRect.setAttribute('stroke', isExt ? '#495057' : '#06315c');
          bodyRect.setAttribute('stroke-width', '1.5');
          c4Group.appendChild(bodyRect);

          const titleSvg = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          titleSvg.setAttribute('x', `${x + w / 2}`);
          titleSvg.setAttribute('y', `${bodyTopY + 18}`);
          titleSvg.setAttribute('text-anchor', 'middle');
          titleSvg.setAttribute('fill', '#ffffff');
          titleSvg.setAttribute('font-family', "'Outfit', sans-serif");
          titleSvg.setAttribute('font-weight', '700');
          titleSvg.setAttribute('font-size', '13px');
          titleSvg.textContent = el.title || el.label || 'Banking Customer';
          c4Group.appendChild(titleSvg);

          const tagSvg = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          tagSvg.setAttribute('x', `${x + w / 2}`);
          tagSvg.setAttribute('y', `${bodyTopY + 32}`);
          tagSvg.setAttribute('text-anchor', 'middle');
          tagSvg.setAttribute('fill', 'rgba(255,255,255,0.85)');
          tagSvg.setAttribute('font-family', "'JetBrains Mono', monospace");
          tagSvg.setAttribute('font-size', '10px');
          tagSvg.textContent = el.c4Tag || (isExt ? '[Person]' : '[Person]');
          c4Group.appendChild(tagSvg);
        } else if (shape === 'database') {
          const rx = w / 2;
          const ry = Math.min(16, h * 0.18);
          const cx = x + rx;
          const topCy = y + ry;
          const bottomCy = y + h - ry;

          const cylPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          cylPath.setAttribute('d', `M ${x} ${topCy} A ${rx} ${ry} 0 0 0 ${x + w} ${topCy} L ${x + w} ${bottomCy} A ${rx} ${ry} 0 0 1 ${x} ${bottomCy} Z`);
          cylPath.setAttribute('fill', mainColor);
          cylPath.setAttribute('stroke', isExt ? '#495057' : '#0c4d8c');
          cylPath.setAttribute('stroke-width', '1.5');
          c4Group.appendChild(cylPath);

          const lid = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
          lid.setAttribute('cx', `${cx}`);
          lid.setAttribute('cy', `${topCy}`);
          lid.setAttribute('rx', `${rx}`);
          lid.setAttribute('ry', `${ry}`);
          lid.setAttribute('fill', mainColor);
          lid.setAttribute('stroke', isExt ? '#495057' : '#0c4d8c');
          lid.setAttribute('stroke-width', '1.5');
          c4Group.appendChild(lid);

          const titleSvg = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          titleSvg.setAttribute('x', `${cx}`);
          titleSvg.setAttribute('y', `${topCy + ry + 16}`);
          titleSvg.setAttribute('text-anchor', 'middle');
          titleSvg.setAttribute('fill', '#ffffff');
          titleSvg.setAttribute('font-family', "'Outfit', sans-serif");
          titleSvg.setAttribute('font-weight', '700');
          titleSvg.setAttribute('font-size', '13px');
          titleSvg.textContent = el.title || el.label || 'Database';
          c4Group.appendChild(titleSvg);

          const tagSvg = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          tagSvg.setAttribute('x', `${cx}`);
          tagSvg.setAttribute('y', `${topCy + ry + 30}`);
          tagSvg.setAttribute('text-anchor', 'middle');
          tagSvg.setAttribute('fill', 'rgba(255,255,255,0.85)');
          tagSvg.setAttribute('font-family', "'JetBrains Mono', monospace");
          tagSvg.setAttribute('font-size', '10px');
          tagSvg.textContent = el.c4Tag || (isExt ? '[Database]' : '[Database]');
          c4Group.appendChild(tagSvg);
        } else {
          // Standard System / Container Box or Queue
          const r = shape === 'queue' ? Math.min(18, h / 2) : 8;
          const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          box.setAttribute('x', `${x}`);
          box.setAttribute('y', `${y}`);
          box.setAttribute('width', `${w}`);
          box.setAttribute('height', `${h}`);
          box.setAttribute('rx', `${r}`);
          box.setAttribute('fill', mainColor);
          box.setAttribute('stroke', isExt ? '#495057' : '#0c4d8c');
          box.setAttribute('stroke-width', '1.5');
          c4Group.appendChild(box);

          const titleSvg = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          titleSvg.setAttribute('x', `${x + w / 2}`);
          titleSvg.setAttribute('y', `${y + 24}`);
          titleSvg.setAttribute('text-anchor', 'middle');
          titleSvg.setAttribute('fill', '#ffffff');
          titleSvg.setAttribute('font-family', "'Outfit', sans-serif");
          titleSvg.setAttribute('font-weight', '700');
          titleSvg.setAttribute('font-size', '13px');
          titleSvg.textContent = el.title || el.label || 'Software System';
          c4Group.appendChild(titleSvg);

          const tagSvg = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          tagSvg.setAttribute('x', `${x + w / 2}`);
          tagSvg.setAttribute('y', `${y + 40}`);
          tagSvg.setAttribute('text-anchor', 'middle');
          tagSvg.setAttribute('fill', 'rgba(255,255,255,0.85)');
          tagSvg.setAttribute('font-family', "'JetBrains Mono', monospace");
          tagSvg.setAttribute('font-size', '10px');
          tagSvg.textContent = el.c4Tag || (shape === 'queue' ? '[Message Queue]' : '[Software System]');
          c4Group.appendChild(tagSvg);
        }

        node = c4Group;
        break;
      }
      case 'group-boundary': {
        const boundaryGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const isC4 = !!(el.c4BoundaryType || el.boundaryType === 'c4-boundary' || el.subtype === 'c4-boundary' || el.boundaryType === 'enterprise' || el.boundaryType === 'system');
        const accent = el.strokeColor || (isC4 ? '#868e96' : '#339af0');
        
        const bRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bRect.setAttribute('x', `${x}`);
        bRect.setAttribute('y', `${y}`);
        bRect.setAttribute('width', `${w}`);
        bRect.setAttribute('height', `${h}`);
        bRect.setAttribute('fill', el.backgroundColor || (theme === 'dark' ? 'rgba(30,41,59,0.3)' : 'rgba(231,245,255,0.3)'));
        bRect.setAttribute('stroke', accent);
        bRect.setAttribute('stroke-width', `${el.strokeWidth || 1.8}`);
        
        if (el.strokeStyle === 'solid') {
          // Solid line (no dash)
        } else if (el.strokeStyle === 'dotted') {
          bRect.setAttribute('stroke-dasharray', '2,4');
        } else {
          // Dashed (or C4 default dashed)
          bRect.setAttribute('stroke-dasharray', '6,6');
        }
        boundaryGroup.appendChild(bRect);

        if (isC4) {
          const bTitle = el.title || 'Boundary';
          const bTag = el.c4BoundaryTag || (el.boundaryType === 'enterprise' ? '[ENTERPRISE]' : (el.boundaryType === 'system' ? '[SYSTEM]' : '[boundary]'));
          
          const titleTag = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          titleTag.setAttribute('x', `${x + w / 2}`);
          titleTag.setAttribute('y', `${y + 18}`);
          titleTag.setAttribute('text-anchor', 'middle');
          titleTag.setAttribute('fill', theme === 'dark' ? '#f8f9fa' : '#212529');
          titleTag.setAttribute('font-family', "'Outfit', sans-serif");
          titleTag.setAttribute('font-weight', '700');
          titleTag.setAttribute('font-size', '12px');
          titleTag.textContent = bTitle;
          boundaryGroup.appendChild(titleTag);

          const tagSvg = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          tagSvg.setAttribute('x', `${x + w / 2}`);
          tagSvg.setAttribute('y', `${y + 32}`);
          tagSvg.setAttribute('text-anchor', 'middle');
          tagSvg.setAttribute('fill', theme === 'dark' ? '#adb5bd' : '#6c757d');
          tagSvg.setAttribute('font-family', "'JetBrains Mono', monospace");
          tagSvg.setAttribute('font-weight', '600');
          tagSvg.setAttribute('font-size', '10px');
          tagSvg.textContent = bTag;
          boundaryGroup.appendChild(tagSvg);
        } else if (el.title) {
          const titleTag = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          titleTag.setAttribute('x', `${x + 16}`);
          titleTag.setAttribute('y', `${y - 4}`);
          titleTag.setAttribute('fill', accent);
          titleTag.setAttribute('font-family', "'Outfit', sans-serif");
          titleTag.setAttribute('font-weight', '600');
          titleTag.setAttribute('font-size', '12px');
          titleTag.textContent = el.title;
          boundaryGroup.appendChild(titleTag);
        }

        node = boundaryGroup;
        break;
      }
      case 'note': {
        const noteGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        noteGroup.setAttribute('data-element-id', el.id || '');
        const cardStyle = el.cardStyle || 'sticky';
        const isAdr = cardStyle === 'adr';
        const bgFill = el.backgroundColor || (isAdr ? (theme === 'dark' ? '#1e293b' : '#ffffff') : (el.themeColor || '#fff9db'));
        const borderColor = el.strokeColor || (isAdr ? (el.themeColor || '#1971c2') : 'rgba(0,0,0,0.15)');

        // Background card rect
        const cardRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        cardRect.setAttribute('x', `${x}`);
        cardRect.setAttribute('y', `${y}`);
        cardRect.setAttribute('width', `${w}`);
        cardRect.setAttribute('height', `${h}`);
        cardRect.setAttribute('rx', isAdr ? '8' : '4');
        cardRect.setAttribute('fill', bgFill);
        cardRect.setAttribute('stroke', borderColor);
        cardRect.setAttribute('stroke-width', isAdr ? '1.5' : '1');
        noteGroup.appendChild(cardRect);

        if (isAdr) {
          // Top accent bar
          const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          bar.setAttribute('x', `${x}`);
          bar.setAttribute('y', `${y}`);
          bar.setAttribute('width', `${w}`);
          bar.setAttribute('height', '6');
          bar.setAttribute('rx', '4');
          bar.setAttribute('fill', el.themeColor || '#1971c2');
          noteGroup.appendChild(bar);

          // Status Badge
          const status = el.status || 'PROPOSED';
          const statusBg = status === 'ACCEPTED' ? '#2b8a3e' : (status === 'SUPERSEDED' ? '#868e96' : '#f08c00');
          const badgeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          badgeRect.setAttribute('x', `${x + w - 85}`);
          badgeRect.setAttribute('y', `${y + 12}`);
          badgeRect.setAttribute('width', '75');
          badgeRect.setAttribute('height', '18');
          badgeRect.setAttribute('rx', '4');
          badgeRect.setAttribute('fill', statusBg);
          noteGroup.appendChild(badgeRect);

          const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          badgeText.setAttribute('x', `${x + w - 47}`);
          badgeText.setAttribute('y', `${y + 24}`);
          badgeText.setAttribute('text-anchor', 'middle');
          badgeText.setAttribute('fill', '#ffffff');
          badgeText.setAttribute('font-family', "'Outfit', sans-serif");
          badgeText.setAttribute('font-weight', '700');
          badgeText.setAttribute('font-size', '9px');
          badgeText.textContent = status;
          noteGroup.appendChild(badgeText);
        }

        // Title
        if (el.title) {
          const titleTag = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          titleTag.setAttribute('x', `${x + 14}`);
          titleTag.setAttribute('y', `${y + 25}`);
          titleTag.setAttribute('fill', isAdr ? (theme === 'dark' ? '#f8f9fa' : '#212529') : '#343a40');
          titleTag.setAttribute('font-family', "'Outfit', sans-serif");
          titleTag.setAttribute('font-weight', '700');
          titleTag.setAttribute('font-size', '13px');
          titleTag.textContent = String(el.title).replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');
          noteGroup.appendChild(titleTag);
        }

        // Markdown text lines
        const rawContent = el.content || el.text || '';
        const lines = rawContent.split('\n');
        let lineY = y + (el.title ? 45 : 25);
        lines.slice(0, 10).forEach(line => {
          if (!line.trim()) {
            lineY += 12;
            return;
          }
          const textTag = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          textTag.setAttribute('x', `${x + 14}`);
          textTag.setAttribute('y', `${lineY}`);
          textTag.setAttribute('fill', theme === 'dark' && isAdr ? '#dee2e6' : '#495057');
          textTag.setAttribute('font-family', isAdr ? "'Inter', sans-serif" : "'Virgil', 'Caveat', cursive");
          textTag.setAttribute('font-size', '11px');
          textTag.textContent = line.trim().replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');
          noteGroup.appendChild(textTag);
          lineY += 16;
        });

        node = noteGroup;
        break;
      }
    }

    if (node) {
      if (el.opacity !== undefined) {
        node.setAttribute('opacity', `${el.opacity / 100}`);
      }
      g.appendChild(node);
    }
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);

  if (options && options.returnString) {
    return svgString;
  }

  if (typeof Blob !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    try {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `excalidraw-diagram-${Date.now()}.svg`;
      link.href = url;
      if (typeof link.click === 'function') {
        link.click();
      }
      URL.revokeObjectURL(url);
    } catch {
      // Fallback for non-browser environments
    }
  }

  return svgString;
}

export function exportToJson(elements, appState = {}) {
  const files = {};
  elements.forEach(el => {
    if (el.type === 'image' && (el.dataURL || el.src)) {
      const fileId = el.fileId || el.id;
      files[fileId] = {
        mimeType: el.mimeType || 'image/png',
        id: fileId,
        dataURL: el.dataURL || el.src,
        created: Date.now()
      };
    }
  });

  const payload = {
    type: 'excalidraw',
    version: 2,
    source: 'https://excalidraw.com',
    elements: elements.map(el => {
      // Strip internal cache variables
      const clean = { ...el };
      delete clean._drawable;
      delete clean._cacheKey;
      return clean;
    }),
    appState: {
      viewBackgroundColor: appState.canvasBackground || '#ffffff',
      gridSize: 20,
      ...appState
    },
    files
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = `diagram-${Date.now()}.excalidraw`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

export function sanitizeImportedElements(rawElements, files = {}) {
  if (!Array.isArray(rawElements)) return [];

  const allowedTypes = new Set([
    'rectangle', 'ellipse', 'diamond', 'line', 'arrow', 'freedraw', 'text',
    'node', 'erd-table', 'swimlane', 'state-node', 'activation-box', 'group-boundary',
    'activity-action', 'fork-node', 'join-node', 'flow-final', 'image', 'c4-element', 'note'
  ]);

  const sanitizeNumber = (val, fallback, min = -1e7, max = 1e7) => {
    const num = Number(val);
    if (!Number.isFinite(num)) return fallback;
    return Math.max(min, Math.min(max, num));
  };

  const sanitizeString = (val, fallback = '') => {
    if (val === null || val === undefined) return fallback;
    return String(val);
  };

  return rawElements.slice(0, 10000).filter(item => item && typeof item === 'object').map((el, index) => {
    const cleanEl = {};

    const type = allowedTypes.has(el.type) ? el.type : 'rectangle';
    cleanEl.id = sanitizeString(el.id, `imported_${index}_${Date.now()}`);
    cleanEl.type = type;
    cleanEl.x = sanitizeNumber(el.x, 0);
    cleanEl.y = sanitizeNumber(el.y, 0);
    cleanEl.width = sanitizeNumber(el.width, 100, 0, 1e7);
    cleanEl.height = sanitizeNumber(el.height, 100, 0, 1e7);
    cleanEl.angle = sanitizeNumber(el.angle, 0, -Math.PI * 4, Math.PI * 4);
    cleanEl.strokeColor = sanitizeString(el.strokeColor, '#1e1e1e');
    cleanEl.backgroundColor = sanitizeString(el.backgroundColor, 'transparent');
    cleanEl.fillStyle = ['none', 'solid', 'hachure', 'zigzag', 'cross-hatch', 'dots'].includes(el.fillStyle) ? el.fillStyle : 'none';
    cleanEl.strokeWidth = sanitizeNumber(el.strokeWidth, 2, 1, 50);
    cleanEl.roughness = sanitizeNumber(el.roughness, 1, 0, 5.0);
    cleanEl.opacity = sanitizeNumber(el.opacity, 100, 0, 100);
    cleanEl.strokeStyle = ['solid', 'dashed', 'dotted'].includes(el.strokeStyle) ? el.strokeStyle : 'solid';
    cleanEl.seed = sanitizeNumber(el.seed, Math.floor(Math.random() * 2000000000), 0, 2147483647);

    // Image attributes & resolution from files dictionary
    if (type === 'image') {
      cleanEl.fileId = sanitizeString(el.fileId);
      cleanEl.dataURL = el.dataURL || 
        (files && el.fileId && files[el.fileId] && (files[el.fileId].dataURL || files[el.fileId].src)) ||
        (files && files[el.id] && (files[el.id].dataURL || files[el.id].src)) ||
        el.src || el.url || '';
      cleanEl.scale = Array.isArray(el.scale) ? [sanitizeNumber(el.scale[0], 1), sanitizeNumber(el.scale[1], 1)] : [1, 1];
      cleanEl.crop = el.crop || null;
      cleanEl.status = el.status || 'saved';
    }

    // Text & Typography attributes
    if (el.text !== undefined) cleanEl.text = sanitizeString(el.text);
    cleanEl.fontSize = sanitizeNumber(el.fontSize, 20, 8, 200);
    cleanEl.fontFamily = [1, 2, 3, 4].includes(Number(el.fontFamily)) ? Number(el.fontFamily) : 1;
    cleanEl.textAlign = ['left', 'center', 'right'].includes(el.textAlign) 
      ? el.textAlign 
      : (type === 'text' ? 'left' : 'center');
    cleanEl.verticalAlign = ['top', 'middle', 'bottom'].includes(el.verticalAlign) 
      ? el.verticalAlign 
      : 'middle';
    if (el.lineHeight !== undefined) cleanEl.lineHeight = sanitizeNumber(el.lineHeight, 1.25, 0.5, 5);
    if (el.baseline !== undefined) cleanEl.baseline = sanitizeNumber(el.baseline, 0);
    if (el.containerId) cleanEl.containerId = sanitizeString(el.containerId);
    if (Array.isArray(el.boundElements)) cleanEl.boundElements = el.boundElements.slice(0, 100);
    if (el.locked !== undefined) cleanEl.locked = Boolean(el.locked);
    if (el.link) cleanEl.link = sanitizeString(el.link);

    // Edges & Roundness (Sharp / Rounded corners)
    if (el.roundness) {
      cleanEl.roundness = typeof el.roundness === 'object' ? el.roundness : { type: 3 };
      cleanEl.edges = 'round';
    } else if (el.edges) {
      cleanEl.edges = el.edges === 'round' ? 'round' : 'sharp';
      cleanEl.roundness = cleanEl.edges === 'round' ? { type: 3 } : null;
    } else {
      cleanEl.edges = 'sharp';
      cleanEl.roundness = null;
    }

    // Architecture Node attributes
    if (el.title !== undefined) cleanEl.title = sanitizeString(el.title);
    if (el.subtitle !== undefined) cleanEl.subtitle = sanitizeString(el.subtitle);
    if (el.badge !== undefined) cleanEl.badge = sanitizeString(el.badge);
    if (el.icon !== undefined) cleanEl.icon = sanitizeString(el.icon);
    if (el.label !== undefined) cleanEl.label = sanitizeString(el.label);
    if (el.themeColor !== undefined) cleanEl.themeColor = sanitizeString(el.themeColor);
    if (el.cardStyle !== undefined) cleanEl.cardStyle = el.cardStyle === 'sketch' ? 'sketch' : 'modern';

    // Note attributes (ADR & Sticky Note)
    if (el.subType !== undefined) cleanEl.subType = sanitizeString(el.subType, 'sticky');
    if (el.content !== undefined) cleanEl.content = sanitizeString(el.content);
    if (el.status !== undefined) cleanEl.status = sanitizeString(el.status);

    // Freedraw points clamp (CWE-400 resource exhaustion mitigation - max 5,000 points)
    if (Array.isArray(el.points)) {
      cleanEl.points = el.points.slice(0, 5000).map(p => {
        if (!Array.isArray(p)) return [0, 0];
        return [sanitizeNumber(p[0], 0), sanitizeNumber(p[1], 0)];
      });
    }

    // ERD Columns clamp (max 100 columns)
    if (Array.isArray(el.columns)) {
      cleanEl.columns = el.columns.slice(0, 100).map((col, cIdx) => ({
        key: ['PK', 'FK', ''].includes(col?.key) ? col.key : '',
        name: sanitizeString(col?.name, `col_${cIdx + 1}`),
        type: sanitizeString(col?.type, 'TEXT'),
        isPk: Boolean(col?.isPk || col?.key === 'PK'),
        isFk: Boolean(col?.isFk || col?.key === 'FK')
      }));
      cleanEl.tableName = sanitizeString(el.tableName, 'table_name');
      cleanEl.tableType = sanitizeString(el.tableType, 'TABLE');
    }

    // UML State Node action compartments (max 50)
    if (Array.isArray(el.actions)) {
      cleanEl.actions = el.actions.slice(0, 50).map(a => sanitizeString(a));
    }

    // Connectors
    if (el.startBinding && typeof el.startBinding === 'object') {
      cleanEl.startBinding = {
        elementId: sanitizeString(el.startBinding.elementId),
        connectionPoint: sanitizeString(el.startBinding.connectionPoint)
      };
    }
    if (el.endBinding && typeof el.endBinding === 'object') {
      cleanEl.endBinding = {
        elementId: sanitizeString(el.endBinding.elementId),
        connectionPoint: sanitizeString(el.endBinding.connectionPoint)
      };
    }
    if (el.direction !== undefined) {
      cleanEl.direction = ['one-way', 'bidirectional', 'none'].includes(el.direction) ? el.direction : 'one-way';
    }
    if (el.animatedFlow !== undefined) {
      cleanEl.animatedFlow = Boolean(el.animatedFlow);
    }

    return cleanEl;
  });
}

/**
 * Extracts and decompresses the embedded Excalidraw JSON scene payload from an SVG file
 */
export async function decodeExcalidrawSvg(svgText) {
  if (!svgText || typeof svgText !== 'string') return null;
  const match = svgText.match(/<!-- payload-start -->([\s\S]*?)<!-- payload-end -->/);
  if (!match) return null;
  try {
    const raw = match[1].trim();
    // In Excalidraw, SVG payload is base64 encoded JSON
    // { version: "1", encoding: "bstring", compressed: true, encoded: "..." }
    let jsonStr;
    if (typeof atob === 'function') {
      jsonStr = atob(raw);
    } else {
      jsonStr = Buffer.from(raw, 'base64').toString('latin1');
    }
    const meta = JSON.parse(jsonStr);
    if (meta.compressed && meta.encoded) {
      const bytes = Uint8Array.from(meta.encoded, c => c.charCodeAt(0) & 0xff);
      if (typeof DecompressionStream !== 'undefined') {
        const ds = new DecompressionStream('deflate');
        const writer = ds.writable.getWriter();
        writer.write(bytes);
        writer.close();
        const reader = ds.readable.getReader();
        const chunks = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
        const merged = new Uint8Array(totalLen);
        let off = 0;
        for (const c of chunks) {
          merged.set(c, off);
          off += c.length;
        }
        const sceneStr = new TextDecoder('utf-8').decode(merged);
        return JSON.parse(sceneStr);
      }
    } else if (meta.elements) {
      return meta;
    }
  } catch (err) {
    console.warn('Failed to decode Excalidraw SVG embedded payload:', err);
  }
  return null;
}

export function importFromJson(file, onLoad) {
  const isSvg = file && (file.type === 'image/svg+xml' || /\.svg$/i.test(file.name));
  const reader = new FileReader();

  if (isSvg) {
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const decoded = await decodeExcalidrawSvg(text);
        if (decoded && Array.isArray(decoded.elements)) {
          const sanitized = sanitizeImportedElements(decoded.elements, decoded.files || {});
          onLoad(sanitized, decoded.appState || {});
          return;
        }
      } catch (err) {
        console.warn('SVG payload extraction error:', err);
      }
      alert(`"${file.name}" does not contain embedded Excalidraw diagram data. Use "Insert Image" to place SVG graphics on the canvas.`);
    };
    reader.readAsText(file);
    return;
  }

  if (file && ((file.type && file.type.startsWith('image/')) || /\.(png|jpe?g|webp|gif|bmp|ico)$/i.test(file.name))) {
    alert(`"${file.name}" is an image file, not a diagram JSON file. Please use the Insert Image tool (hotkey I) or "Insert / Import Image" in the menu.`);
    return;
  }

  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      let rawElements = null;
      const files = (data && typeof data === 'object' && data.files) ? data.files : {};
      if (data && Array.isArray(data.elements)) {
        rawElements = data.elements;
      } else if (Array.isArray(data)) {
        rawElements = data;
      }

      if (rawElements) {
        const sanitizedElements = sanitizeImportedElements(rawElements, files);
        try {
          onLoad(sanitizedElements, (data && data.appState) || {});
        } catch (loadErr) {
          console.error('[importFromJson] Error executing onLoad callback:', loadErr);
        }
      } else {
        alert('Invalid Excalidraw JSON file structure.');
      }
    } catch (err) {
      alert('Error parsing JSON file: ' + err.message);
    }
  };
  reader.readAsText(file);
}
