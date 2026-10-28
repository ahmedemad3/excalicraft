/**
 * ExcaliCraft Mathematical & Geometric Foundations
 * Handles coordinate system transformation, collision detection, and handle anchors
 */

export function generateId() {
  return 'elem_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function generateSeed() {
  // Rough.js deterministic seed: positive 31-bit integer
  return Math.floor(Math.random() * 2147483647);
}

/**
 * Transforms screen client coordinates (pixels on monitor) to scene coordinates (world space)
 */
export function screenToScene(clientX, clientY, scrollX, scrollY, zoom) {
  return {
    x: (clientX - scrollX) / zoom,
    y: (clientY - scrollY) / zoom
  };
}

/**
 * Transforms scene coordinates (world space) to screen client coordinates
 */
export function sceneToScreen(sceneX, sceneY, scrollX, scrollY, zoom) {
  return {
    x: sceneX * zoom + scrollX,
    y: sceneY * zoom + scrollY
  };
}

/**
 * Normalizes element so width and height are positive, adjusting (x, y) accordingly
 */
export function normalizeElement(element) {
  let { x, y, width, height, type } = element;
  
  if (type === 'line' || type === 'arrow' || type === 'elbow-arrow') {
    return element;
  }

  if (width < 0) {
    x = x + width;
    width = Math.abs(width);
  }
  if (height < 0) {
    y = y + height;
    height = Math.abs(height);
  }

  return {
    ...element,
    x,
    y,
    width,
    height
  };
}

/**
 * Computes orthogonal stepped waypoints [p0, p1, p2, p3] for an elbow/flow arrow
 */
export function getOrthogonalArrowPoints(element) {
  const startX = element.x;
  const startY = element.y;
  const endX = element.x + element.width;
  const endY = element.y + element.height;

  const dx = endX - startX;
  const dy = endY - startY;

  let isVerticalFirst = true;
  if (element.elbowOrientation === 'horizontal') {
    isVerticalFirst = false;
  } else if (element.elbowOrientation === 'vertical') {
    isVerticalFirst = true;
  } else {
    // Default to vertical-first if vertical distance is significant or >= horizontal
    isVerticalFirst = Math.abs(dy) >= Math.abs(dx);
  }

  const ratio = (element.elbowRatio !== undefined && Number.isFinite(element.elbowRatio))
    ? Math.max(0.1, Math.min(0.9, element.elbowRatio))
    : 0.5;

  if (isVerticalFirst) {
    const midY = startY + dy * ratio;
    return [
      { x: startX, y: startY },
      { x: startX, y: midY },
      { x: endX, y: midY },
      { x: endX, y: endY }
    ];
  } else {
    const midX = startX + dx * ratio;
    return [
      { x: startX, y: startY },
      { x: midX, y: startY },
      { x: midX, y: endY },
      { x: endX, y: endY }
    ];
  }
}

/**
 * Computes waypoint handles and elbow split handle along an orthogonal arrow
 */
export function getOrthogonalWaypointHandles(element) {
  const pts = getOrthogonalArrowPoints(element);
  return [
    { id: 'start', x: pts[0].x, y: pts[0].y, type: 'port' },
    { id: 'seg1', x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2, type: 'waypoint' },
    { id: 'mid', x: (pts[1].x + pts[2].x) / 2, y: (pts[1].y + pts[2].y) / 2, type: 'elbow' },
    { id: 'seg2', x: (pts[2].x + pts[3].x) / 2, y: (pts[2].y + pts[3].y) / 2, type: 'waypoint' },
    { id: 'end', x: pts[3].x, y: pts[3].y, type: 'port' }
  ];
}

/**
 * Calculates perpendicular distance from point (px, py) to line segment (x1, y1)-(x2, y2)
 */
export function distanceToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return Math.hypot(px - projX, py - projY);
}

/**
 * Bounding Box calculation for an element
 */
export function getElementBounds(element) {
  if (element.type === 'line' || element.type === 'arrow' || element.type === 'elbow-arrow') {
    let pts = [
      { x: element.x, y: element.y },
      { x: element.x + element.width, y: element.y + element.height }
    ];
    if (element.routing === 'orthogonal' || element.type === 'elbow-arrow') {
      pts = getOrthogonalArrowPoints(element);
    }

    let minX = Math.min(...pts.map(p => p.x));
    let minY = Math.min(...pts.map(p => p.y));
    let maxX = Math.max(...pts.map(p => p.x));
    let maxY = Math.max(...pts.map(p => p.y));

    // If arrow has a label pill, expand bounds to include the label pill
    if (element.label) {
      const midX = pts.length >= 4 ? (pts[1].x + pts[2].x) / 2 : (pts[0].x + pts[1].x) / 2;
      const midY = pts.length >= 4 ? (pts[1].y + pts[2].y) / 2 : (pts[0].y + pts[1].y) / 2;
      const pillHalfW = (element.label.length * 9 + 30) / 2;
      const pillHalfH = 18;
      minX = Math.min(minX, midX - pillHalfW);
      maxX = Math.max(maxX, midX + pillHalfW);
      minY = Math.min(minY, midY - pillHalfH);
      maxY = Math.max(maxY, midY + pillHalfH);
    }

    // Account for arrow tips and stroke width
    minX -= 16;
    minY -= 16;
    maxX += 16;
    maxY += 16;

    return {
      x: minX,
      y: minY,
      width: Math.max(maxX - minX, 10),
      height: Math.max(maxY - minY, 10)
    };
  }

  if (element.type === 'group-boundary') {
    const minX = element.width < 0 ? element.x + element.width : element.x;
    // Header pill extends 16px above y
    const minY = (element.height < 0 ? element.y + element.height : element.y) - 18;
    const width = Math.abs(element.width);
    const height = Math.abs(element.height) + 18;
    return { x: minX, y: minY, width, height };
  }

  if (element.type === 'node' || element.type === 'c4-element') {
    const minX = element.width < 0 ? element.x + element.width : element.x;
    const minY = element.height < 0 ? element.y + element.height : element.y;
    // Card drop shadow blur 10, offset 4
    return {
      x: minX - 6,
      y: minY - 4,
      width: Math.abs(element.width) + 12,
      height: Math.abs(element.height) + 16
    };
  }

  if (element.type === 'freedraw') {
    if (!element.points || element.points.length === 0) {
      return { x: element.x, y: element.y, width: 20, height: 20 };
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [px, py] of element.points) {
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    }
    return {
      x: minX - 5,
      y: minY - 5,
      width: Math.max(maxX - minX + 10, 10),
      height: Math.max(maxY - minY + 10, 10)
    };
  }

  if (element.type === 'text') {
    const minX = element.x;
    const minY = element.y;
    const fontSize = element.fontSize || 20;
    const lines = String(element.text || '').split('\n');
    let maxLineLen = 0;
    for (const line of lines) {
      if (line.length > maxLineLen) maxLineLen = line.length;
    }
    const width = (element.width && element.width > 0)
      ? element.width
      : Math.max(maxLineLen * (fontSize * 0.62), 20);
    const height = (element.height && element.height > 0)
      ? element.height
      : Math.max(lines.length * (fontSize * 1.3), fontSize * 1.3);
    return { x: minX, y: minY, width, height };
  }

  // Rectangle, Diamond, Ellipse
  const minX = element.width < 0 ? element.x + element.width : element.x;
  const minY = element.height < 0 ? element.y + element.height : element.y;
  const width = Math.abs(element.width);
  const height = Math.abs(element.height);

  return { x: minX, y: minY, width, height };
}

/**
 * Group Bounding Box
 */
export function getElementsBounds(elements) {
  if (elements.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const el of elements) {
    const b = getElementBounds(el);
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Hit testing: determines if scene point (px, py) touches an element
 */
export function hitTest(px, py, element) {
  const tolerance = Math.max(8, (element.strokeWidth || 2) * 2);

  if (element.type === 'line' || element.type === 'arrow' || element.type === 'elbow-arrow') {
    if (element.routing === 'orthogonal' || element.type === 'elbow-arrow') {
      const pts = getOrthogonalArrowPoints(element);
      for (let i = 0; i < pts.length - 1; i++) {
        if (distanceToSegment(px, py, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y) <= tolerance) {
          return true;
        }
      }
      if (element.label) {
        const midX = (pts[1].x + pts[2].x) / 2;
        const midY = (pts[1].y + pts[2].y) / 2;
        if (Math.abs(px - midX) <= 60 && Math.abs(py - midY) <= 20) {
          return true;
        }
      }
      return false;
    }

    const dist = distanceToSegment(px, py, element.x, element.y, element.x + element.width, element.y + element.height);
    if (dist <= tolerance) return true;
    if (element.label) {
      const midX = element.x + element.width / 2;
      const midY = element.y + element.height / 2;
      if (Math.abs(px - midX) <= 60 && Math.abs(py - midY) <= 20) {
        return true;
      }
    }
    return false;
  }

  if (element.type === 'freedraw') {
    if (!element.points || element.points.length < 2) return false;
    for (let i = 0; i < element.points.length - 1; i++) {
      const [x1, y1] = element.points[i];
      const [x2, y2] = element.points[i + 1];
      if (distanceToSegment(px, py, x1, y1, x2, y2) <= tolerance) {
        return true;
      }
    }
    return false;
  }

  const bounds = getElementBounds(element);
  const isInsideBox = (
    px >= bounds.x - tolerance &&
    px <= bounds.x + bounds.width + tolerance &&
    py >= bounds.y - tolerance &&
    py <= bounds.y + bounds.height + tolerance
  );

  if (!isInsideBox) return false;

  // If filled, any point inside is a hit
  if (element.fillStyle && element.fillStyle !== 'none' && element.backgroundColor && element.backgroundColor !== 'transparent') {
    return true;
  }

  if (element.type === 'text' || element.type === 'image') {
    return isInsideBox;
  }

  if (element.type === 'rectangle') {
    // Check stroke boundary tolerance
    const distLeft = Math.abs(px - bounds.x);
    const distRight = Math.abs(px - (bounds.x + bounds.width));
    const distTop = Math.abs(py - bounds.y);
    const distBottom = Math.abs(py - (bounds.y + bounds.height));
    return (
      (distLeft <= tolerance && py >= bounds.y - tolerance && py <= bounds.y + bounds.height + tolerance) ||
      (distRight <= tolerance && py >= bounds.y - tolerance && py <= bounds.y + bounds.height + tolerance) ||
      (distTop <= tolerance && px >= bounds.x - tolerance && px <= bounds.x + bounds.width + tolerance) ||
      (distBottom <= tolerance && px >= bounds.x - tolerance && px <= bounds.x + bounds.width + tolerance)
    );
  }

  if (element.type === 'ellipse') {
    const rx = bounds.width / 2;
    const ry = bounds.height / 2;
    if (rx === 0 || ry === 0) return false;
    const cx = bounds.x + rx;
    const cy = bounds.y + ry;
    const normalizedDist = Math.pow((px - cx) / rx, 2) + Math.pow((py - cy) / ry, 2);
    // Inside or near perimeter
    return normalizedDist <= 1.25;
  }

  if (element.type === 'diamond') {
    return isInsideBox; // Diamond approximation with bounding box
  }

  return isInsideBox;
}

/**
 * Returns handles for resizing and rotation
 */
export function getResizeHandles(bounds) {
  const { x, y, width, height } = bounds;
  const halfW = width / 2;
  const halfH = height / 2;

  return {
    nw: { x: x, y: y, cursor: 'nwse-resize' },
    n:  { x: x + halfW, y: y, cursor: 'ns-resize' },
    ne: { x: x + width, y: y, cursor: 'nesw-resize' },
    e:  { x: x + width, y: y + halfH, cursor: 'ew-resize' },
    se: { x: x + width, y: y + height, cursor: 'nwse-resize' },
    s:  { x: x + halfW, y: y + height, cursor: 'ns-resize' },
    sw: { x: x, y: y + height, cursor: 'nesw-resize' },
    w:  { x: x, y: y + halfH, cursor: 'ew-resize' },
    rotate: { x: x + halfW, y: y - 26, cursor: 'grab' }
  };
}

/**
 * Checks if a scene point hits any resize handle
 */
export function hitTestHandle(scenePoint, handles, zoom) {
  const handleRadius = 9 / zoom;
  for (const [name, pos] of Object.entries(handles)) {
    const dist = Math.hypot(scenePoint.x - pos.x, scenePoint.y - pos.y);
    if (dist <= handleRadius) {
      return { handle: name, ...pos };
    }
  }
  return null;
}

/**
 * Calculates zoom level and scroll coordinates to frame elements within viewport
 */
export function calculateZoomToFit(elements, viewportWidth, viewportHeight, padding = 60) {
  if (!elements || elements.length === 0) {
    return { zoom: 1.0, scrollX: 40, scrollY: 40 };
  }

  const bounds = getElementsBounds(elements);
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
    return { zoom: 1.0, scrollX: 40, scrollY: 40 };
  }

  const availW = Math.max(viewportWidth - padding * 2, 100);
  const availH = Math.max(viewportHeight - padding * 2, 100);

  const zoomW = availW / bounds.width;
  const zoomH = availH / bounds.height;
  // Clamp between 20% and 250%
  const targetZoom = Math.min(Math.max(Math.min(zoomW, zoomH), 0.2), 2.5);

  const scrollX = (viewportWidth - bounds.width * targetZoom) / 2 - bounds.x * targetZoom;
  const scrollY = (viewportHeight - bounds.height * targetZoom) / 2 - bounds.y * targetZoom;

  return {
    zoom: Number(targetZoom.toFixed(2)),
    scrollX: Math.round(scrollX),
    scrollY: Math.round(scrollY)
  };
}
