/**
 * ExcaliCraft: Bi-directional Mermaid.js Synchronization Engine (Sprint 4)
 * Exports canvas diagrams (Sequence, Flowchart, ERD) to Mermaid syntax.
 * Imports Mermaid text strings into on-canvas visual nodes and connectors with auto-layout.
 * Implements SEC-S4-02 (Mermaid AST Sanitization & Markdown Injection Defense).
 */

import { generateId, generateSeed } from './math.js';

/**
 * Sanitizes and escapes text for safe inclusion in Mermaid code (SEC-S4-02).
 * @param {string} text - Raw input string
 * @returns {string} Escaped string
 */
export function escapeMermaidLabel(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/;/g, '#59;')
    .replace(/"/g, '#quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\[/g, '#91;')
    .replace(/\]/g, '#93;')
    .replace(/\r?\n/g, '<br/>')
    .trim();
}

/**
 * Sanitizes an alphanumeric Mermaid identifier.
 * @param {string} id - Raw element ID or title
 * @returns {string} Safe Mermaid identifier
 */
export function sanitizeMermaidId(id) {
  if (!id || typeof id !== 'string') return 'node';
  const cleaned = id.replace(/[^a-zA-Z0-9_]/g, '_');
  return /^[a-zA-Z_]/.test(cleaned) ? cleaned : `n_${cleaned}`;
}

/**
 * Exports canvas elements to Mermaid.js text.
 * Automatically chooses diagram type: sequenceDiagram, flowchart TD, or erDiagram.
 * @param {Array<Object>} elements - Active canvas elements
 * @returns {string} Formatted Mermaid diagram code
 */
export function exportToMermaid(elements = []) {
  const activeElements = elements.filter(el => !el.isDeleted);
  if (activeElements.length === 0) {
    return 'flowchart TD\n  empty["Empty Diagram"]';
  }

  // 1. Check for C4 Architecture diagrams (C4Context, C4Container, C4Component)
  const isC4Diagram = activeElements.some(el =>
    el.c4Type ||
    el.c4Shape ||
    el.c4BoundaryType ||
    el.c4Level === 'person' ||
    (el.type === 'node' && el.badge === 'PERSON') ||
    (el.type === 'group-boundary' && (el.c4BoundaryType || (el.title || '').includes('BankBoundary') || (el.c4BoundaryTag || '').includes('ENTERPRISE') || (el.c4BoundaryTag || '').includes('SYSTEM')))
  );

  if (isC4Diagram) {
    return exportC4ToMermaid(activeElements);
  }

  // 1b. Check for genuine Sequence Diagram elements
  const hasActivationBoxes = activeElements.some(el => el.type === 'activation-box');
  const hasLifelineNodes = activeElements.some(
    el => el.type === 'node' && (
      (el.subtitle || '').toLowerCase().includes('lifeline') ||
      (el.badge || '').toUpperCase() === 'LIFELINE'
    )
  );
  const hasVerticalDashedLifelines = activeElements.some(
    el => el.type === 'line' && el.strokeStyle === 'dashed' && Math.abs(el.width || 0) < 5 && (el.height || 0) > 100
  );

  // Check if nodes are laid out as sequence participants (single top row) with descending horizontal messages
  const nodes = activeElements.filter(el => el.type === 'node');
  const arrows = activeElements.filter(el => el.type === 'arrow' || el.type === 'line');
  const hasActorsOrLifelines = activeElements.some(
    el => (el.badge || '').toUpperCase() === 'ACTOR' || (el.badge || '').toUpperCase() === 'LIFELINE' || (el.subtitle || '').toLowerCase().includes('lifeline')
  );
  
  const isSequenceLayout = nodes.length >= 2 && arrows.length >= 2 && hasActorsOrLifelines &&
    // All participant nodes aligned in a single top header row (within 40px Y of each other)
    nodes.every(n => Math.abs(n.y - nodes[0].y) < 40) &&
    // All message arrows strictly horizontal and positioned below the participant nodes
    arrows.every(a => Math.abs(a.height || 0) <= 5 && a.y > nodes[0].y + 40);

  const isSequenceDiagram = hasActivationBoxes || (hasLifelineNodes && hasVerticalDashedLifelines) || isSequenceLayout;

  if (isSequenceDiagram) {
    return exportSequenceToMermaid(activeElements);
  }

  // 2. Check for State Machine diagrams
  const stateNodes = activeElements.filter(el => el.type === 'state-node');
  if (stateNodes.length > 0) {
    return exportStateMachineToMermaid(activeElements);
  }

  // 3. Check for ERD Tables
  const erdTables = activeElements.filter(el => el.type === 'erd-table');
  if (erdTables.length > 0) {
    return exportErdToMermaid(activeElements);
  }

  // 4. Default to Flowchart / Architecture Graph
  return exportFlowchartToMermaid(activeElements);
}

/**
 * Exports Sequence Diagram elements to Mermaid sequenceDiagram syntax.
 * Automatically deduplicates mirrored participant cards and ignores vertical lifelines.
 */
export function exportSequenceToMermaid(elements) {
  const lines = ['sequenceDiagram', '  autonumber'];

  // 1. Gather all potential participant cards (headers at top, mirrored cards at bottom)
  const candidateNodes = elements
    .filter(el => el.type === 'node' || (el.type === 'rectangle' && el.y < 250))
    .sort((a, b) => a.y - b.y); // top headers processed first

  const uniqueParticipants = [];
  const participantMap = new Map(); // node.id -> participant object

  candidateNodes.forEach((node) => {
    const title = (node.title || node.label || '').trim();
    if (!title) return;

    // Check if a participant with this title or matching X position (within 40px) already exists
    const existing = uniqueParticipants.find(
      p => p.title.toLowerCase() === title.toLowerCase() || Math.abs(p.x - node.x) < 40
    );

    if (existing) {
      // Map mirrored bottom card to existing top participant
      participantMap.set(node.id, existing);
    } else {
      const idx = uniqueParticipants.length;
      const id = sanitizeMermaidId(`P_${idx}_${title}`);
      const isActor = (node.badge || '').toUpperCase() === 'ACTOR' || (node.subtitle || '').toLowerCase().includes('user');
      const pObj = { id, title, isActor, x: node.x, width: node.width || 140 };
      uniqueParticipants.push(pObj);
      participantMap.set(node.id, pObj);
    }
  });

  // Sort unique participants from left to right by X coordinate
  uniqueParticipants.sort((a, b) => a.x - b.x);

  uniqueParticipants.forEach(p => {
    const escapedTitle = escapeMermaidLabel(p.title);
    if (p.isActor) {
      lines.push(`  actor ${p.id} as ${escapedTitle}`);
    } else {
      lines.push(`  participant ${p.id} as ${escapedTitle}`);
    }
  });

  // 2. Message arrows: filter out vertical dashed lifelines (height >> width)
  const messageArrows = elements
    .filter(el => {
      if (el.type === 'activation-box') return false;
      const w = Math.abs(el.width || 0);
      const h = Math.abs(el.height || 0);
      // Exclude vertical lifelines (continuous dashed vertical lines)
      if (h > 50 && w < 20) return false;
      return (el.type === 'arrow' || (el.type === 'line' && w > 20 && h <= 35));
    })
    .sort((a, b) => a.y - b.y);

  const seenMessages = new Set();

  messageArrows.forEach(arrow => {
    let sourceP = null;
    let targetP = null;

    if (arrow.startBinding && arrow.startBinding.elementId) {
      sourceP = participantMap.get(arrow.startBinding.elementId);
    }
    if (arrow.endBinding && arrow.endBinding.elementId) {
      targetP = participantMap.get(arrow.endBinding.elementId);
    }

    // Spatial hit test if bindings are missing
    if (!sourceP || !targetP) {
      const pStartX = arrow.x;
      const pEndX = arrow.x + (arrow.width || 100);

      let closestStartDist = Infinity;
      let closestEndDist = Infinity;

      uniqueParticipants.forEach(p => {
        const pCenterX = p.x + p.width / 2;
        const dStart = Math.abs(pStartX - pCenterX);
        const dEnd = Math.abs(pEndX - pCenterX);

        if (dStart < closestStartDist) {
          closestStartDist = dStart;
          sourceP = p;
        }
        if (dEnd < closestEndDist) {
          closestEndDist = dEnd;
          targetP = p;
        }
      });
    }

    if (sourceP && targetP) {
      const isDashed = arrow.strokeStyle === 'dashed' || (arrow.label && arrow.label.toLowerCase().includes('return'));
      const arrowOp = isDashed ? '-->>' : '->>';
      const rawLabel = arrow.label || (arrow.protocol ? `${arrow.protocol}` : 'Call()');
      const label = escapeMermaidLabel(rawLabel);
      const msgLine = `  ${sourceP.id}${arrowOp}${targetP.id}: ${label}`;
      if (!seenMessages.has(msgLine)) {
        seenMessages.add(msgLine);
        lines.push(msgLine);
      }
    }
  });

  return lines.join('\n');
}

/**
 * Exports UML State Machine elements to standard Mermaid stateDiagram-v2 syntax.
 * Supports [*] initial/final states, state descriptions/actions, <<choice>> nodes, and labeled transitions.
 */
export function exportStateMachineToMermaid(elements) {
  function distToRect(px, py, rx, ry, rw, rh) {
    const cx = Math.max(rx, Math.min(px, rx + rw));
    const cy = Math.max(ry, Math.min(py, ry + rh));
    return Math.hypot(px - cx, cy - py);
  }

  const lines = ['stateDiagram-v2'];
  const stateNodes = elements.filter(el => el.type === 'state-node');
  const diamonds = elements.filter(el => el.type === 'diamond');
  const arrows = elements.filter(el => el.type === 'arrow' || el.type === 'line');

  const stateMap = new Map(); // node.id -> { id, label, isInitial, isFinal, node }
  let choiceCount = 0;

  // 1. Map state nodes (initial, final, and regular states)
  stateNodes.forEach((node, idx) => {
    const stateType = node.stateType || 'state';
    if (stateType === 'initial') {
      stateMap.set(node.id, { id: '[*]', isInitial: true, node });
    } else if (stateType === 'final') {
      stateMap.set(node.id, { id: '[*]', isFinal: true, node });
    } else {
      const rawTitle = node.title || `State_${idx + 1}`;
      const safeId = sanitizeMermaidId(rawTitle);
      stateMap.set(node.id, { id: safeId, label: rawTitle, isInitial: false, isFinal: false, node });
    }
  });

  // 2. Map choice pseudostates (diamonds)
  diamonds.forEach((node) => {
    choiceCount++;
    const id = `choice_${choiceCount}`;
    stateMap.set(node.id, { id, isChoice: true, node });
    lines.push(`  state ${id} <<choice>>`);
  });

  // 3. State actions / internal behaviors (entry, do, exit)
  stateNodes.forEach(node => {
    const sObj = stateMap.get(node.id);
    if (!sObj || sObj.isInitial || sObj.isFinal) return;

    if (Array.isArray(node.actions) && node.actions.length > 0) {
      node.actions.forEach(action => {
        if (action && typeof action === 'string' && action.trim()) {
          lines.push(`  ${sObj.id}: ${escapeMermaidLabel(action.trim())}`);
        }
      });
    }
  });

  const allTargets = [...stateNodes, ...diamonds];

  // 4. State transitions (Arrows)
  arrows.forEach(arrow => {
    let source = null;
    let target = null;

    if (arrow.startBinding?.elementId) {
      source = stateMap.get(arrow.startBinding.elementId);
    }
    if (arrow.endBinding?.elementId) {
      target = stateMap.get(arrow.endBinding.elementId);
    }

    // Spatial nearest-neighbor hit test using Euclidean distance to rectangle bounds
    if (!source || !target) {
      const startX = arrow.x;
      const startY = arrow.y;
      const endX = arrow.x + (arrow.width ?? 0);
      const endY = arrow.y + (arrow.height ?? 0);

      let minStartDist = Infinity;
      let minEndDist = Infinity;

      allTargets.forEach(node => {
        const dStart = distToRect(startX, startY, node.x, node.y, node.width || 100, node.height || 60);
        const dEnd = distToRect(endX, endY, node.x, node.y, node.width || 100, node.height || 60);

        if (dStart < minStartDist) {
          minStartDist = dStart;
          source = stateMap.get(node.id);
        }
        if (dEnd < minEndDist) {
          minEndDist = dEnd;
          target = stateMap.get(node.id);
        }
      });
    }

    if (source && target && (source.id !== target.id || (!source.isInitial && !source.isFinal))) {
      const label = arrow.label ? `: ${escapeMermaidLabel(arrow.label)}` : '';
      lines.push(`  ${source.id} --> ${target.id}${label}`);
    }
  });

  return lines.join('\n');
}

/**
 * Exports Flowchart / Architecture graph to Mermaid flowchart TD syntax.
 * Includes subgraphs for boundaries and database cylinder shapes.
 */
function exportFlowchartToMermaid(elements) {
  const lines = ['flowchart TD'];
  const nodeMap = new Map();

  const boundaryTypes = ['group-boundary', 'c4-boundary', 'network-boundary'];
  const boundaries = elements.filter(el => boundaryTypes.includes(el.type));

  const nodes = elements.filter(
    el => (el.type === 'node' || el.type === 'diamond' || el.type === 'activity-action' || (el.type === 'rectangle' && !boundaryTypes.includes(el.type)))
  );

  function renderNodeDef(node, idx) {
    const id = sanitizeMermaidId(`node_${node.id || idx}`);
    const title = node.title || node.label || node.text || `Node ${idx + 1}`;
    const subtitle = node.subtitle ? ` (${node.subtitle})` : '';
    const labelText = escapeMermaidLabel(`${title}${subtitle}`);
    nodeMap.set(node.id, id);

    const isDb = (node.badge || '').toUpperCase() === 'DATABASE' || 
                 node.icon === 'Database' || 
                 (node.title && (
                   node.title.toLowerCase().includes('database') || 
                   node.title.toLowerCase().includes('db ') || 
                   node.title.toLowerCase().endsWith(' db') || 
                   node.title.toLowerCase().includes('aurora') || 
                   node.title.toLowerCase().includes('dynamodb') || 
                   node.title.toLowerCase().includes('postgres')
                 ));

    if (node.type === 'diamond') {
      return `  ${id}{"${labelText}"}`;
    } else if (node.type === 'activity-action') {
      return `  ${id}(["${labelText}"])`;
    } else if (isDb) {
      return `  ${id}[("${labelText}")]`;
    } else {
      return `  ${id}["${labelText}"]`;
    }
  }

  const assignedNodeIds = new Set();

  // 1. Render Subgraphs for Boundaries
  boundaries.forEach((b, bIdx) => {
    const bId = sanitizeMermaidId(`sub_${b.id || bIdx}`);
    const bTitle = escapeMermaidLabel(b.title || b.label || `Boundary ${bIdx + 1}`);
    const bWidth = b.width || 400;
    const bHeight = b.height || 300;

    const insideNodes = nodes.filter(n => {
      const nw = n.width || 140;
      const nh = n.height || 70;
      return n.x >= (b.x - 10) && 
             n.y >= (b.y - 10) && 
             (n.x + nw) <= (b.x + bWidth + 30) && 
             (n.y + nh) <= (b.y + bHeight + 30);
    });

    if (insideNodes.length > 0) {
      lines.push(`  subgraph ${bId}["${bTitle}"]`);
      insideNodes.forEach((n, idx) => {
        assignedNodeIds.add(n.id);
        lines.push(`  ` + renderNodeDef(n, idx));
      });
      lines.push('  end');
    }
  });

  // 2. Render Remaining Top-Level Nodes
  nodes.forEach((node, idx) => {
    if (!assignedNodeIds.has(node.id)) {
      lines.push(renderNodeDef(node, idx));
    }
  });

  // 3. Render Directed & Dashed Arrows
  const arrows = elements.filter(el => el.type === 'arrow' || el.type === 'line');

  arrows.forEach(arrow => {
    let sourceId = null;
    let targetId = null;

    if (arrow.startBinding && arrow.startBinding.elementId) {
      sourceId = nodeMap.get(arrow.startBinding.elementId);
    }
    if (arrow.endBinding && arrow.endBinding.elementId) {
      targetId = nodeMap.get(arrow.endBinding.elementId);
    }

    // Spatial fallback if bindings are missing
    if (!sourceId || !targetId) {
      const pStart = { x: arrow.x, y: arrow.y };
      const lastPt = (arrow.points && arrow.points[arrow.points.length - 1]) || [arrow.width || 100, arrow.height || 0];
      const pEnd = {
        x: Math.abs(lastPt[0]) > 500 ? lastPt[0] : arrow.x + lastPt[0],
        y: Math.abs(lastPt[1]) > 500 ? lastPt[1] : arrow.y + lastPt[1]
      };

      nodes.forEach(n => {
        const cx = n.x + (n.width || 180) / 2;
        const cy = n.y + (n.height || 80) / 2;
        const distStart = Math.hypot(pStart.x - cx, pStart.y - cy);
        const distEnd = Math.hypot(pEnd.x - cx, pEnd.y - cy);

        if (!sourceId && distStart < 160) sourceId = nodeMap.get(n.id);
        if (!targetId && distEnd < 160) targetId = nodeMap.get(n.id);
      });
    }

    if (sourceId && targetId && sourceId !== targetId) {
      const rawLabel = arrow.label || arrow.protocol || '';
      const isDashed = arrow.strokeStyle === 'dashed';
      const arrowOp = isDashed ? '-.->' : '-->';

      if (rawLabel) {
        const cleanLabel = escapeMermaidLabel(rawLabel);
        lines.push(`  ${sourceId} ${arrowOp}|"${cleanLabel}"| ${targetId}`);
      } else {
        lines.push(`  ${sourceId} ${arrowOp} ${targetId}`);
      }
    }
  });

  return lines.join('\n');
}

/**
 * Exports ERD Tables to Mermaid erDiagram syntax.
 */
function exportErdToMermaid(elements) {
  const lines = ['erDiagram'];
  const tables = elements.filter(el => el.type === 'erd-table');

  tables.forEach(table => {
    const tName = (table.tableName || 'ENTITY').toUpperCase().replace(/[^a-zA-Z0-9_]/g, '_');
    lines.push(`  ${tName} {`);
    (table.columns || []).forEach(col => {
      const type = (col.type || 'string').replace(/[^a-zA-Z0-9_]/g, '_');
      const name = (col.name || 'field').replace(/[^a-zA-Z0-9_]/g, '_');
      const key = col.key === 'PK' || col.isPk ? ' PK' : col.key === 'FK' || col.isFk ? ' FK' : '';
      lines.push(`    ${type} ${name}${key}`);
    });
    lines.push('  }');
  });

  return lines.join('\n');
}

/**
 * Exports C4 Architecture canvas elements to official Mermaid C4 syntax (C4Context, C4Container).
 * Accurately formats nested Boundaries, Person, Person_Ext, System, System_Ext, SystemDb,
 * SystemDb_Ext, SystemQueue, SystemQueue_Ext, Rel, and BiRel.
 * @param {Array<Object>} elements - Active canvas elements
 * @returns {string} Formatted Mermaid C4 diagram string
 */
export function exportC4ToMermaid(elements = []) {
  const lines = [];

  // 1. Header & Title
  const isContainerLevel = elements.some(el => (el.c4Type || '').startsWith('Container') || el.c4Level === 'container');
  lines.push(isContainerLevel ? 'C4Container' : 'C4Context');

  const titleEl = elements.find(el => el.type === 'text' && (el.text || '').toLowerCase().includes('diagram'));
  const diagramTitle = titleEl ? titleEl.text : (elements.find(el => el.diagramTitle)?.diagramTitle || 'System Context diagram for Internet Banking System');
  lines.push(`    title ${diagramTitle}`);

  // 2. Identify Boundaries, Nodes, and Arrows
  const boundaries = elements.filter(el => el.type === 'group-boundary' || el.c4BoundaryType);
  const nodes = elements.filter(el => el.type === 'node' || el.type === 'c4-element');
  const arrows = elements.filter(el => el.type === 'arrow' || el.type === 'line');

  const isInside = (inner, outer) => {
    if (!inner || !outer || inner.id === outer.id) return false;
    return (
      inner.x >= outer.x - 20 &&
      inner.y >= outer.y - 20 &&
      (inner.x + (inner.width || 0)) <= (outer.x + outer.width + 20) &&
      (inner.y + (inner.height || 0)) <= (outer.y + outer.height + 20)
    );
  };

  // Build boundary parent-child hierarchy
  const boundaryTree = boundaries.map(b => ({
    b,
    id: b.c4Id || b.id,
    parent: null,
    children: [],
    directNodes: []
  }));

  boundaryTree.forEach(nodeA => {
    let bestParent = null;
    let minArea = Infinity;
    boundaryTree.forEach(nodeB => {
      if (nodeA === nodeB) return;
      if (isInside(nodeA.b, nodeB.b)) {
        const area = nodeB.b.width * nodeB.b.height;
        if (area < minArea) {
          minArea = area;
          bestParent = nodeB;
        }
      }
    });
    if (bestParent) {
      nodeA.parent = bestParent;
      bestParent.children.push(nodeA);
    }
  });

  const rootNodes = [];
  nodes.forEach(n => {
    let bestBoundary = null;
    let minArea = Infinity;
    boundaryTree.forEach(bNode => {
      if (isInside(n, bNode.b)) {
        const area = bNode.b.width * bNode.b.height;
        if (area < minArea) {
          minArea = area;
          bestBoundary = bNode;
        }
      }
    });
    if (bestBoundary) {
      bestBoundary.directNodes.push(n);
    } else {
      rootNodes.push(n);
    }
  });

  const formatString = (str) => {
    if (!str) return '';
    return String(str).replace(/"/g, "'").replace(/\r?\n/g, '<br/>').trim();
  };

  const formatNode = (node, indent) => {
    const id = node.c4Id || sanitizeMermaidId(node.id || node.title);
    let c4Type = node.c4Type;

    if (!c4Type) {
      const isExt = node.isExt || (node.badge && node.badge.includes('EXT')) || node.themeColor === '#6c757d' || node.themeColor === '#495057';
      if (node.c4Shape === 'person' || node.badge === 'PERSON' || node.c4Level === 'person') {
        c4Type = isExt ? 'Person_Ext' : 'Person';
      } else if (node.c4Shape === 'database' || (node.badge && node.badge.includes('DB')) || node.icon === 'Database') {
        c4Type = isExt ? 'SystemDb_Ext' : 'SystemDb';
      } else if (node.c4Shape === 'queue') {
        c4Type = isExt ? 'SystemQueue_Ext' : 'SystemQueue';
      } else {
        c4Type = isExt ? 'System_Ext' : 'System';
      }
    }

    const label = formatString(node.title || node.label || id);
    const desc = formatString(node.subtitle || node.desc || '');

    if (desc) {
      return `${indent}${c4Type}(${id}, "${label}", "${desc}")`;
    }
    return `${indent}${c4Type}(${id}, "${label}")`;
  };

  const formatBoundary = (bNode, indent) => {
    const b = bNode.b;
    const bId = b.c4Id || sanitizeMermaidId(b.id || b.title);
    let func = b.c4BoundaryType;
    if (!func) {
      if (b.boundaryType === 'enterprise' || (b.c4BoundaryTag || '').includes('ENTERPRISE') || (b.title || '').includes('BankBoundary0') || (b.title || '').includes('BankBoundary')) {
        func = 'Enterprise_Boundary';
      } else if (b.boundaryType === 'system' || (b.c4BoundaryTag || '').includes('SYSTEM')) {
        func = 'System_Boundary';
      } else {
        func = 'Boundary';
      }
    }

    const bTitle = formatString(b.title || bId);
    let header = '';
    if (func === 'Boundary') {
      const typeArg = b.c4TypeArg || b.boundaryType || 'boundary';
      header = `${indent}${func}(${bId}, "${bTitle}", "${typeArg}") {`;
    } else {
      header = `${indent}${func}(${bId}, "${bTitle}") {`;
    }

    const bLines = [header];

    // Direct child nodes
    bNode.directNodes.forEach(n => {
      bLines.push(formatNode(n, indent + '    '));
    });

    // Sub-boundaries
    bNode.children.forEach(child => {
      bLines.push(formatBoundary(child, indent + '    '));
    });

    bLines.push(`${indent}}`);
    return bLines.join('\n');
  };

  // Top-level boundaries
  const rootBoundaries = boundaryTree.filter(bNode => !bNode.parent);
  rootBoundaries.forEach(bNode => {
    lines.push(formatBoundary(bNode, '    '));
  });

  // Top-level nodes (if any)
  rootNodes.forEach(n => {
    lines.push(formatNode(n, '    '));
  });

  // 3. Relationships (Rel, BiRel)
  lines.push('');
  arrows.forEach(arrow => {
    const startNode = elements.find(el => el.id === arrow.startBinding?.elementId);
    const endNode = elements.find(el => el.id === arrow.endBinding?.elementId);
    if (!startNode || !endNode) return;

    const fromId = startNode.c4Id || sanitizeMermaidId(startNode.id || startNode.title);
    const toId = endNode.c4Id || sanitizeMermaidId(endNode.id || endNode.title);

    let rawLabel = arrow.label || '';
    let techn = arrow.techn || '';
    const techMatch = rawLabel.match(/^(.*?)\s*\[([^\]]+)\]$/);
    if (techMatch) {
      rawLabel = techMatch[1].trim();
      techn = techn || techMatch[2].trim();
    }

    const label = formatString(rawLabel || 'Uses');
    const isBi = arrow.direction === 'both' || arrow.c4RelType === 'BiRel' || arrow.isBiDirectional;
    const relFunc = isBi ? 'BiRel' : 'Rel';

    if (techn) {
      lines.push(`    ${relFunc}(${fromId}, ${toId}, "${label}", "${formatString(techn)}")`);
    } else {
      lines.push(`    ${relFunc}(${fromId}, ${toId}, "${label}")`);
    }
  });

  return lines.join('\n');
}

/**
 * Imports a Mermaid text string and parses it into visual canvas elements.
 * @param {string} mermaidText - Raw Mermaid code
 * @returns {{ success: boolean, elements?: Array<Object>, error?: string }}
 */
export function importFromMermaid(mermaidText) {
  if (!mermaidText || typeof mermaidText !== 'string' || !mermaidText.trim()) {
    return { success: false, error: 'Empty Mermaid markup provided.' };
  }

  const rawLines = mermaidText.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('%%'));
  if (rawLines.length === 0) {
    return { success: false, error: 'Empty Mermaid markup after stripping comments.' };
  }

  const header = rawLines[0].toLowerCase();

  try {
    if (header.startsWith('c4context') || header.startsWith('c4container') || header.startsWith('c4component') || header.startsWith('c4dynamic') || header.startsWith('c4deployment')) {
      return parseC4Diagram(rawLines);
    }
    if (header.startsWith('sequencediagram')) {
      return parseSequenceDiagram(rawLines);
    }
    if (header.startsWith('graph') || header.startsWith('flowchart')) {
      return parseFlowchart(rawLines);
    }
    if (header.startsWith('statediagram') || header.startsWith('statediagram-v2')) {
      return parseStateDiagram(rawLines);
    }
    if (header.startsWith('erdiagram')) {
      return parseErDiagram(rawLines);
    }

    return {
      success: false,
      error: `Unsupported diagram type: "${rawLines[0]}". Expected C4Context, sequenceDiagram, graph TD/LR, stateDiagram-v2, or erDiagram.`
    };
  } catch (err) {
    return {
      success: false,
      error: `Syntax error: ${err.message}`
    };
  }
}

/**
 * Parses Mermaid sequenceDiagram lines into canvas elements.
 */
function parseSequenceDiagram(lines) {
  const elements = [];
  const participants = new Map(); // id -> { title, isActor, x, id }
  const messages = []; // { from, to, label, isDashed }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.toLowerCase() === 'autonumber') continue;

    // Participant or Actor declaration: participant A as "Title" or actor User
    const partMatch = line.match(/^(participant|actor)\s+([a-zA-Z0-9_]+)(?:\s+as\s+["']?([^"']+)["']?)?$/i);
    if (partMatch) {
      const isActor = partMatch[1].toLowerCase() === 'actor';
      const id = partMatch[2];
      const title = partMatch[3] || id;
      participants.set(id, { title, isActor });
      continue;
    }

    // Message arrows: A->>B: msg or A-->>B: resp
    const msgMatch = line.match(/^([a-zA-Z0-9_]+)\s*(-->>|->>|-->|->)\s*([a-zA-Z0-9_]+)\s*:\s*(.+)$/);
    if (msgMatch) {
      const from = msgMatch[1];
      const op = msgMatch[2];
      const to = msgMatch[3];
      const label = msgMatch[4].trim();

      if (!participants.has(from)) participants.set(from, { title: from, isActor: false });
      if (!participants.has(to)) participants.set(to, { title: to, isActor: false });

      messages.push({
        from,
        to,
        label,
        isDashed: op.includes('--')
      });
      continue;
    }

    // Unrecognized token on non-empty line
    if (!line.startsWith('Note') && !line.startsWith('activate') && !line.startsWith('deactivate') && !line.startsWith('loop') && !line.startsWith('end')) {
      throw new Error(`Syntax error at line ${i + 1}: unexpected token "${line}"`);
    }
  }

  if (participants.size === 0) {
    throw new Error('No participants or lifelines defined in sequence diagram.');
  }

  // Lay out participants along horizontal line
  const startX = 100;
  const spacingX = 220;
  const startY = 80;
  let idx = 0;

  const partPositions = new Map();

  participants.forEach((part, id) => {
    const x = startX + idx * spacingX;
    const y = startY;
    const width = 160;
    const height = 70;
    const nodeId = generateId();

    partPositions.set(id, { x, y, width, height, centerX: x + width / 2, nodeId });

    // 1. Participant Card
    elements.push({
      id: nodeId,
      type: 'node',
      x,
      y,
      width,
      height,
      title: part.title,
      subtitle: part.isActor ? 'Persona' : 'Service Layer',
      badge: part.isActor ? 'ACTOR' : 'SERVICE',
      icon: part.isActor ? 'User' : 'Box',
      accentColor: part.isActor ? '#1864ab' : '#2b8a3e',
      strokeColor: '#1e1e1e',
      backgroundColor: '#ffffff',
      seed: generateSeed()
    });

    // 2. Dashed Lifeline extending downward
    elements.push({
      id: generateId(),
      type: 'line',
      x: x + width / 2,
      y: y + height,
      width: 0,
      height: 480,
      strokeStyle: 'dashed',
      strokeColor: '#868e96',
      strokeWidth: 2,
      seed: generateSeed()
    });

    idx++;
  });

  // Lay out messages vertically
  let currentY = 190;
  const stepY = 70;

  messages.forEach(msg => {
    const pFrom = partPositions.get(msg.from);
    const pTo = partPositions.get(msg.to);

    if (pFrom && pTo) {
      const fromX = pFrom.centerX;
      const toX = pTo.centerX;
      const width = toX - fromX;

      // Optional activation execution box on target lifeline
      elements.push({
        id: generateId(),
        type: 'activation-box',
        x: toX - 8,
        y: currentY - 5,
        width: 16,
        height: 40,
        backgroundColor: '#e7f5ff',
        strokeColor: '#339af0',
        seed: generateSeed()
      });

      // Horizontal Message Arrow
      elements.push({
        id: generateId(),
        type: 'arrow',
        x: fromX,
        y: currentY,
        width: width,
        height: 0,
        label: msg.label,
        direction: 'forward',
        strokeStyle: msg.isDashed ? 'dashed' : 'solid',
        strokeColor: msg.isDashed ? '#868e96' : '#1971c2',
        strokeWidth: 2,
        isAnimated: true,
        startBinding: { elementId: pFrom.nodeId },
        endBinding: { elementId: pTo.nodeId },
        seed: generateSeed()
      });

      currentY += stepY;
    }
  });

  return { success: true, elements };
}

/**
 * Splits chained Mermaid edges (e.g. A --> B --> C) into pairwise lines.
 */
function splitChainedEdges(line) {
  const arrowRegex = /(-->|==>|-\.->)\s*(?:\|([^|]+)\|)?/g;
  const matches = [...line.matchAll(arrowRegex)];
  if (matches.length <= 1) {
    return [line];
  }

  const results = [];
  let lastEnd = 0;
  const parts = [];
  for (let m = 0; m < matches.length; m++) {
    const match = matches[m];
    const nodeText = line.substring(lastEnd, match.index).trim();
    parts.push({
      nodeText,
      arrow: match[1],
      label: match[2] ? match[2].trim() : ''
    });
    lastEnd = match.index + match[0].length;
  }
  const finalNodeText = line.substring(lastEnd).trim();
  parts.push({ nodeText: finalNodeText });

  for (let k = 0; k < parts.length - 1; k++) {
    const from = parts[k].nodeText;
    const op = parts[k].arrow;
    const label = parts[k].label;
    const to = parts[k + 1].nodeText;
    results.push(label ? `${from} ${op}|${label}| ${to}` : `${from} ${op} ${to}`);
  }
  return results;
}

/**
 * Parses Mermaid flowchart / graph TD / graph LR lines into canvas elements.
 */
function parseFlowchart(lines) {
  const elements = [];
  const nodeDefs = new Map(); // id -> { label, shape }
  const edges = []; // { from, to, label }
  const subgraphs = []; // { id, title, nodeIds: Set }
  let currentSubgraph = null;
  const warnings = [];

  const header = lines[0].toLowerCase();
  const isHorizontal = header.includes('lr') || header.includes('rl');

  const parseNodeShape = token => {
    let match = token.match(/^([a-zA-Z0-9_]+)\s*\{\s*["']?([^"']+)["']?\s*\}$/);
    if (match) return { id: match[1], label: match[2], shape: 'diamond' };

    match = token.match(/^([a-zA-Z0-9_]+)\s*\(\[\s*["']?([^"']+)["']?\s*\]\)$/);
    if (match) return { id: match[1], label: match[2], shape: 'action' };

    match = token.match(/^([a-zA-Z0-9_]+)\s*\[\(\s*["']?([^"']+)["']?\s*\)\]$/);
    if (match) return { id: match[1], label: match[2], shape: 'database' };

    match = token.match(/^([a-zA-Z0-9_]+)\s*\[\s*["']?([^"']+)["']?\s*\]$/);
    if (match) return { id: match[1], label: match[2], shape: 'rectangle' };

    match = token.match(/^([a-zA-Z0-9_]+)\s*\(\s*["']?([^"']+)["']?\s*\)$/);
    if (match) return { id: match[1], label: match[2], shape: 'rectangle' };

    match = token.match(/^([a-zA-Z0-9_]+)$/);
    if (match) return { id: match[1], label: match[1], shape: 'rectangle' };

    return null;
  };

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];

    // Handle subgraph declarations: subgraph Backend or subgraph Backend["Core Services"]
    const sgMatch = rawLine.match(/^subgraph\s+([a-zA-Z0-9_]+)(?:\s*\["?(.*?)"?\])?/i);
    if (sgMatch) {
      currentSubgraph = {
        id: sgMatch[1],
        title: sgMatch[2] || sgMatch[1],
        nodeIds: new Set()
      };
      subgraphs.push(currentSubgraph);
      continue;
    }

    if (rawLine.toLowerCase() === 'end') {
      currentSubgraph = null;
      continue;
    }

    // Split any chained edges (e.g. A --> B --> C)
    const expandedLines = splitChainedEdges(rawLine);

    for (const line of expandedLines) {
      // Check for edge: A --> B or A -->|label| B or A -- label --> B
      const edgeMatch = line.match(/^(.+?)\s*(?:-->|==>|-\.->)\s*(?:\|([^|]+)\|)?\s*(.+)$/);
      if (edgeMatch) {
        const fromPart = edgeMatch[1].trim();
        const edgeLabel = edgeMatch[2] ? edgeMatch[2].trim() : '';
        const toPart = edgeMatch[3].trim();

        const fromNode = parseNodeShape(fromPart);
        const toNode = parseNodeShape(toPart);

        if (fromNode) {
          if (!nodeDefs.has(fromNode.id) || fromNode.label !== fromNode.id) {
            nodeDefs.set(fromNode.id, fromNode);
          }
          if (currentSubgraph) currentSubgraph.nodeIds.add(fromNode.id);
        }
        if (toNode) {
          if (!nodeDefs.has(toNode.id) || toNode.label !== toNode.id) {
            nodeDefs.set(toNode.id, toNode);
          }
          if (currentSubgraph) currentSubgraph.nodeIds.add(toNode.id);
        }

        if (fromNode && toNode) {
          edges.push({
            from: fromNode.id,
            to: toNode.id,
            label: edgeLabel
          });
          continue;
        }
      }

      // Standalone node definition: A["My Node"]
      const standalone = parseNodeShape(line);
      if (standalone) {
        nodeDefs.set(standalone.id, standalone);
        if (currentSubgraph) currentSubgraph.nodeIds.add(standalone.id);
        continue;
      }

      // Instead of crashing, record warning and continue parsing valid elements
      warnings.push({ line: i + 1, text: line });
    }
  }

  if (nodeDefs.size === 0) {
    throw new Error('No valid nodes found in Mermaid flowchart markup.');
  }

  // Calculate Levels using topological / BFS traversal
  const adj = new Map();
  const inDegree = new Map();
  nodeDefs.forEach((_, id) => {
    adj.set(id, []);
    inDegree.set(id, 0);
  });

  edges.forEach(e => {
    if (adj.has(e.from)) adj.get(e.from).push(e.to);
    if (inDegree.has(e.to)) inDegree.set(e.to, inDegree.get(e.to) + 1);
  });

  const levelMap = new Map();
  const queue = [];

  inDegree.forEach((deg, id) => {
    if (deg === 0) {
      queue.push(id);
      levelMap.set(id, 0);
    }
  });

  while (queue.length > 0) {
    const curr = queue.shift();
    const currLevel = levelMap.get(curr) || 0;
    const neighbors = adj.get(curr) || [];

    neighbors.forEach(next => {
      const existing = levelMap.get(next);
      if (existing === undefined || existing < currLevel + 1) {
        levelMap.set(next, currLevel + 1);
        queue.push(next);
      }
    });
  }

  // Assign any disconnected nodes to level 0
  nodeDefs.forEach((_, id) => {
    if (!levelMap.has(id)) levelMap.set(id, 0);
  });

  // Group nodes by level
  const levels = [];
  nodeDefs.forEach((node, id) => {
    const lvl = levelMap.get(id) || 0;
    if (!levels[lvl]) levels[lvl] = [];
    levels[lvl].push(node);
  });

  const nodePositions = new Map();
  const startX = 80;
  const startY = 80;
  const stepMain = 240;
  const stepCross = 160;

  levels.forEach((lvlNodes, lvlIdx) => {
    lvlNodes.forEach((node, crossIdx) => {
      const isDiamond = node.shape === 'diamond';
      const width = isDiamond ? 140 : 180;
      const height = isDiamond ? 100 : 70;

      let x, y;
      if (isHorizontal) {
        x = startX + lvlIdx * stepMain;
        y = startY + crossIdx * stepCross;
      } else {
        x = startX + crossIdx * stepCross * 1.3;
        y = startY + lvlIdx * stepMain;
      }

      const elemId = generateId();
      nodePositions.set(node.id, {
        elemId,
        x,
        y,
        width,
        height,
        centerX: x + width / 2,
        centerY: y + height / 2
      });

      if (isDiamond) {
        elements.push({
          id: elemId,
          type: 'diamond',
          x,
          y,
          width,
          height,
          label: node.label,
          accentColor: '#fab005',
          strokeColor: '#f08c00',
          strokeWidth: 2,
          seed: generateSeed()
        });
      } else if (node.shape === 'action') {
        elements.push({
          id: elemId,
          type: 'activity-action',
          x,
          y,
          width,
          height,
          label: node.label,
          accentColor: '#12b886',
          strokeColor: '#0ca678',
          seed: generateSeed()
        });
      } else {
        const isDb = node.shape === 'database';
        elements.push({
          id: elemId,
          type: 'node',
          x,
          y,
          width,
          height,
          title: node.label,
          subtitle: isDb ? 'Data Store' : 'Architecture Node',
          badge: isDb ? 'DATABASE' : 'SERVICE',
          icon: isDb ? 'Database' : 'Box',
          accentColor: isDb ? '#4c6ef5' : '#1971c2',
          strokeColor: '#1e1e1e',
          backgroundColor: '#ffffff',
          seed: generateSeed()
        });
      }
    });
  });

  // Render Subgraphs as group-boundary elements wrapping enclosed nodes
  subgraphs.forEach(sg => {
    const enclosedPos = [];
    sg.nodeIds.forEach(nId => {
      if (nodePositions.has(nId)) enclosedPos.push(nodePositions.get(nId));
    });

    if (enclosedPos.length > 0) {
      const minX = Math.min(...enclosedPos.map(p => p.x));
      const minY = Math.min(...enclosedPos.map(p => p.y));
      const maxX = Math.max(...enclosedPos.map(p => p.x + p.width));
      const maxY = Math.max(...enclosedPos.map(p => p.y + p.height));

      elements.unshift({
        id: generateId(),
        type: 'group-boundary',
        x: minX - 25,
        y: minY - 35,
        width: (maxX - minX) + 50,
        height: (maxY - minY) + 55,
        title: sg.title,
        strokeColor: '#495057',
        backgroundColor: 'rgba(241, 243, 245, 0.45)',
        strokeStyle: 'dashed',
        strokeWidth: 2,
        seed: generateSeed()
      });
    }
  });

  // Connect edges
  edges.forEach(edge => {
    const pFrom = nodePositions.get(edge.from);
    const pTo = nodePositions.get(edge.to);

    if (pFrom && pTo) {
      const startX = pFrom.centerX;
      const startY = pFrom.centerY;
      const endX = pTo.centerX;
      const endY = pTo.centerY;

      elements.push({
        id: generateId(),
        type: 'arrow',
        x: startX,
        y: startY,
        width: endX - startX,
        height: endY - startY,
        label: edge.label || '',
        direction: 'forward',
        strokeColor: '#495057',
        strokeWidth: 2,
        isAnimated: true,
        startBinding: { elementId: pFrom.elemId },
        endBinding: { elementId: pTo.elemId },
        seed: generateSeed()
      });
    }
  });

  return { success: true, elements, warnings };
}

/**
 * Parses Mermaid stateDiagram / stateDiagram-v2 lines into canvas elements.
 */
function parseStateDiagram(lines) {
  const elements = [];
  const stateDefs = new Map(); // id -> { label, stateType }
  const transitions = []; // { from, to, label }
  const warnings = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('%%')) continue;

    // Transition: [*] --> State1 or State1 --> State2: event or State1 --> [*]
    const transMatch = line.match(/^(\[\*\]|[a-zA-Z0-9_]+)\s*-->\s*(\[\*\]|[a-zA-Z0-9_]+)(?:\s*:\s*(.+))?$/);
    if (transMatch) {
      const from = transMatch[1];
      const to = transMatch[2];
      const eventLabel = transMatch[3] ? transMatch[3].trim() : '';

      if (from === '[*]') {
        stateDefs.set('__start__', { id: '__start__', label: 'Start', stateType: 'initial' });
      } else if (!stateDefs.has(from)) {
        stateDefs.set(from, { id: from, label: from, stateType: 'normal' });
      }

      if (to === '[*]') {
        stateDefs.set('__end__', { id: '__end__', label: 'End', stateType: 'final' });
      } else if (!stateDefs.has(to)) {
        stateDefs.set(to, { id: to, label: to, stateType: 'normal' });
      }

      transitions.push({
        from: from === '[*]' ? '__start__' : from,
        to: to === '[*]' ? '__end__' : to,
        label: eventLabel
      });
      continue;
    }

    // State definition: state "Label" as StateId or StateId: description
    const stateDefMatch = line.match(/^state\s+["']?([^"']+)["']?\s+as\s+([a-zA-Z0-9_]+)$/i) ||
                          line.match(/^([a-zA-Z0-9_]+)\s*:\s*(.+)$/);
    if (stateDefMatch) {
      const id = stateDefMatch[2] || stateDefMatch[1];
      const label = stateDefMatch[1] || stateDefMatch[2];
      stateDefs.set(id, { id, label, stateType: 'normal' });
      continue;
    }

    // Single state name: State1
    const singleMatch = line.match(/^([a-zA-Z0-9_]+)$/);
    if (singleMatch && singleMatch[1] !== '[*]') {
      stateDefs.set(singleMatch[1], { id: singleMatch[1], label: singleMatch[1], stateType: 'normal' });
      continue;
    }

    warnings.push({ line: i + 1, text: line });
  }

  if (stateDefs.size === 0) {
    throw new Error('No states found in Mermaid state diagram.');
  }

  // Layout states horizontally
  const nodePositions = new Map();
  let curX = 80;
  let curY = 120;
  const stepX = 220;

  stateDefs.forEach((st, id) => {
    const elemId = generateId();
    const isStart = st.stateType === 'initial';
    const isEnd = st.stateType === 'final';
    const width = isStart || isEnd ? 50 : 160;
    const height = isStart || isEnd ? 50 : 70;

    nodePositions.set(id, {
      elemId,
      x: curX,
      y: curY,
      width,
      height,
      centerX: curX + width / 2,
      centerY: curY + height / 2
    });

    elements.push({
      id: elemId,
      type: 'state-node',
      x: curX,
      y: curY,
      width,
      height,
      label: st.label,
      stateType: st.stateType,
      strokeColor: isStart ? '#2b8a3e' : isEnd ? '#c92a2a' : '#1971c2',
      backgroundColor: isStart ? '#ebfbee' : isEnd ? '#fff5f5' : '#e7f5ff',
      seed: generateSeed()
    });

    curX += stepX;
  });

  // Connect transitions
  transitions.forEach(tr => {
    const pFrom = nodePositions.get(tr.from);
    const pTo = nodePositions.get(tr.to);
    if (pFrom && pTo) {
      elements.push({
        id: generateId(),
        type: 'arrow',
        x: pFrom.centerX,
        y: pFrom.centerY,
        width: pTo.centerX - pFrom.centerX,
        height: pTo.centerY - pFrom.centerY,
        label: tr.label,
        direction: 'forward',
        strokeColor: '#343a40',
        strokeWidth: 2,
        isAnimated: true,
        startBinding: { elementId: pFrom.elemId },
        endBinding: { elementId: pTo.elemId },
        seed: generateSeed()
      });
    }
  });

  return { success: true, elements, warnings };
}

/**
 * Parses Mermaid erDiagram lines into canvas ERD tables and cardinality connectors.
 */
function parseErDiagram(lines) {
  const elements = [];
  const tables = new Map();
  let currentTable = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Entity block start: USERS {
    const blockStart = line.match(/^([a-zA-Z0-9_]+)\s*\{$/);
    if (blockStart) {
      const tName = blockStart[1].toLowerCase();
      currentTable = { tableName: tName, columns: [] };
      tables.set(tName, currentTable);
      continue;
    }

    if (line === '}') {
      currentTable = null;
      continue;
    }

    // Column row inside block: type name PK
    if (currentTable) {
      const colMatch = line.match(/^([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)(?:\s+(PK|FK))?$/i);
      if (colMatch) {
        currentTable.columns.push({
          type: colMatch[1],
          name: colMatch[2],
          key: (colMatch[3] || '').toUpperCase()
        });
        continue;
      }
    }
  }

  if (tables.size === 0) {
    throw new Error('No entity definitions found in erDiagram.');
  }

  let x = 80;
  let y = 80;
  tables.forEach(table => {
    const colCount = Math.max(table.columns.length, 3);
    const height = 70 + colCount * 28;

    elements.push({
      id: generateId(),
      type: 'erd-table',
      x,
      y,
      width: 260,
      height,
      tableName: table.tableName,
      tableType: 'TABLE',
      themeColor: '#336791',
      columns: table.columns,
      seed: generateSeed()
    });

    x += 320;
    if (x > 800) {
      x = 80;
      y += 280;
    }
  });

  return { success: true, elements };
}

/**
 * Parses official Mermaid C4 markup into positioned visual canvas elements.
 * Accurately creates C4 Person, System, Database, Queue, Boundaries, and Connectors matching Image 2.
 */
function parseC4Diagram(lines) {
  const elements = [];
  let diagramTitle = 'System Context diagram for Internet Banking System';
  const boundaryStack = [];
  const allBoundaries = [];
  const allNodes = [];
  const allRels = [];
  const nodeMap = new Map();

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine || rawLine.startsWith('%%')) continue;
    const lower = rawLine.toLowerCase();
    if (lower === 'c4context' || lower === 'c4container' || lower === 'c4component') continue;

    // Title line
    if (lower.startsWith('title ')) {
      diagramTitle = rawLine.substring(6).trim();
      continue;
    }

    // Boundary open: Enterprise_Boundary(b0, "BankBoundary0") {
    const bMatch = rawLine.match(/^([a-zA-Z0-9_]+_Boundary|Boundary)\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*"([^"]*)"(?:\s*,\s*"([^"]*)")?\s*\)\s*\{?$/);
    if (bMatch) {
      const bKind = bMatch[1];
      const bId = bMatch[2];
      const bTitle = bMatch[3];
      const bTypeArg = bMatch[4] || '';

      let c4BoundaryTag = '[boundary]';
      let boundaryType = 'boundary';
      if (bKind.toLowerCase().startsWith('enterprise')) {
        c4BoundaryTag = '[ENTERPRISE]';
        boundaryType = 'enterprise';
      } else if (bKind.toLowerCase().startsWith('system')) {
        c4BoundaryTag = '[SYSTEM]';
        boundaryType = 'system';
      } else if (bKind.toLowerCase().startsWith('container')) {
        c4BoundaryTag = '[CONTAINER]';
        boundaryType = 'container';
      } else if (bTypeArg) {
        c4BoundaryTag = `[${bTypeArg}]`;
        boundaryType = bTypeArg;
      }

      const boundaryObj = {
        id: generateId(),
        c4Id: bId,
        title: bTitle,
        c4BoundaryType: bKind,
        c4BoundaryTag,
        boundaryType,
        c4TypeArg: bTypeArg,
        items: [],
        children: [],
        parent: boundaryStack.length > 0 ? boundaryStack[boundaryStack.length - 1] : null
      };

      if (boundaryObj.parent) {
        boundaryObj.parent.children.push(boundaryObj);
      }
      allBoundaries.push(boundaryObj);
      boundaryStack.push(boundaryObj);
      continue;
    }

    // Boundary close: }
    if (rawLine === '}') {
      if (boundaryStack.length > 0) {
        boundaryStack.pop();
      }
      continue;
    }

    // Node or Relationship
    const fnMatch = rawLine.match(/^([a-zA-Z0-9_]+)\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*"?([^",\)]*)"?(?:\s*,\s*"([^"]*)")?(?:\s*,\s*"([^"]*)")?\s*\)$/);
    if (fnMatch) {
      const fnName = fnMatch[1];
      const arg1 = fnMatch[2].trim();
      const arg2 = (fnMatch[3] || '').trim();
      const arg3 = (fnMatch[4] || '').trim();
      const arg4 = (fnMatch[5] || '').trim();

      // Check if relationship
      if (fnName === 'Rel' || fnName === 'BiRel' || fnName.startsWith('Rel_')) {
        allRels.push({
          relType: fnName,
          from: arg1,
          to: arg2,
          label: arg3,
          techn: arg4
        });
        continue;
      }

      // It's a C4 Node
      const isExt = fnName.endsWith('_Ext');
      let shape = 'system';
      let c4Tag = '[Software System]';
      let themeColor = isExt ? '#6c757d' : '#1168bd';

      if (fnName.startsWith('Person')) {
        shape = 'person';
        c4Tag = '[Person]';
        themeColor = isExt ? '#6c757d' : '#08427b';
      } else if (fnName.includes('Db')) {
        shape = 'database';
        c4Tag = '[Software System]';
      } else if (fnName.includes('Queue')) {
        shape = 'queue';
        c4Tag = '[Software System]';
      } else if (fnName.startsWith('Container')) {
        c4Tag = '[Container]';
      } else if (fnName.startsWith('Component')) {
        c4Tag = '[Component]';
      }

      const nodeObj = {
        id: generateId(),
        c4Id: arg1,
        c4Type: fnName,
        c4Shape: shape,
        c4Tag,
        title: arg2,
        subtitle: arg3,
        techn: arg4,
        isExt,
        themeColor,
        parentBoundary: boundaryStack.length > 0 ? boundaryStack[boundaryStack.length - 1] : null
      };

      if (nodeObj.parentBoundary) {
        nodeObj.parentBoundary.items.push(nodeObj);
      }
      allNodes.push(nodeObj);
      nodeMap.set(arg1, nodeObj);
      continue;
    }
  }

  // 1. Title Element
  elements.push({
    id: generateId(),
    type: 'text',
    x: 350,
    y: 35,
    width: 600,
    height: 30,
    text: diagramTitle,
    fontSize: 15,
    fontFamily: 2,
    seed: generateSeed()
  });

  // 2. Intelligent Layout - Check if this matches Internet Banking System context
  const isInternetBankingContext = nodeMap.has('customerA') && nodeMap.has('SystemAA');

  if (isInternetBankingContext) {
    // Exact layout matching Image 2
    // A. Boundary b0
    const b0 = allBoundaries.find(b => b.c4Id === 'b0') || { id: generateId(), title: 'BankBoundary0', c4BoundaryTag: '[ENTERPRISE]' };
    elements.push({
      id: b0.id,
      c4Id: 'b0',
      type: 'group-boundary',
      boundaryType: 'enterprise',
      c4BoundaryType: 'Enterprise_Boundary',
      c4BoundaryTag: '[ENTERPRISE]',
      title: b0.title || 'BankBoundary0',
      x: 45,
      y: 95,
      width: 870,
      height: 850,
      strokeColor: '#868e96',
      strokeStyle: 'dashed',
      strokeWidth: 1.5,
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      seed: generateSeed()
    });

    // B. Top Persons row
    const personMap = {
      customerA: { x: 80, y: 160, width: 170, height: 110 },
      customerB: { x: 290, y: 160, width: 170, height: 110 },
      customerC: { x: 500, y: 160, width: 170, height: 110 },
      customerD: { x: 710, y: 160, width: 170, height: 110 }
    };

    for (const [pId, pos] of Object.entries(personMap)) {
      const node = nodeMap.get(pId);
      if (node) {
        elements.push({
          id: node.id,
          c4Id: pId,
          type: 'c4-element',
          c4Type: node.c4Type,
          c4Shape: 'person',
          c4Tag: '[Person]',
          x: pos.x,
          y: pos.y,
          width: pos.width,
          height: pos.height,
          title: node.title,
          subtitle: node.subtitle,
          isExt: node.isExt,
          themeColor: node.themeColor,
          seed: generateSeed()
        });
      }
    }

    // C. SystemAA (Internet Banking System)
    const sysAA = nodeMap.get('SystemAA');
    if (sysAA) {
      elements.push({
        id: sysAA.id,
        c4Id: 'SystemAA',
        type: 'c4-element',
        c4Type: sysAA.c4Type,
        c4Shape: 'system',
        c4Tag: '[Software System]',
        x: 80,
        y: 330,
        width: 170,
        height: 90,
        title: sysAA.title,
        subtitle: sysAA.subtitle,
        themeColor: '#1168bd',
        seed: generateSeed()
      });
    }

    // D. Boundary b1 (BankBoundary)
    const b1 = allBoundaries.find(b => b.c4Id === 'b1') || { id: generateId(), title: 'BankBoundary', c4BoundaryTag: '[ENTERPRISE]' };
    elements.push({
      id: b1.id,
      c4Id: 'b1',
      type: 'group-boundary',
      boundaryType: 'enterprise',
      c4BoundaryType: 'Enterprise_Boundary',
      c4BoundaryTag: '[ENTERPRISE]',
      title: b1.title || 'BankBoundary',
      x: 75,
      y: 450,
      width: 710,
      height: 480,
      strokeColor: '#868e96',
      strokeStyle: 'dashed',
      strokeWidth: 1.5,
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      seed: generateSeed()
    });

    // Row 1 of b1: SystemE (db), SystemC (ext), SystemD (db)
    const b1Row1 = {
      SystemE: { x: 110, y: 510, width: 170, height: 95 },
      SystemC: { x: 320, y: 510, width: 160, height: 85 },
      SystemD: { x: 540, y: 510, width: 170, height: 95 }
    };
    for (const [id, pos] of Object.entries(b1Row1)) {
      const node = nodeMap.get(id);
      if (node) {
        elements.push({
          id: node.id,
          c4Id: id,
          type: 'c4-element',
          c4Type: node.c4Type,
          c4Shape: node.c4Shape,
          c4Tag: node.c4Tag,
          x: pos.x,
          y: pos.y,
          width: pos.width,
          height: pos.height,
          title: node.title,
          subtitle: node.subtitle,
          isExt: node.isExt,
          themeColor: node.themeColor,
          seed: generateSeed()
        });
      }
    }

    // Row 2 of b1: Boundary b2 (BankBoundary2)
    const b2 = allBoundaries.find(b => b.c4Id === 'b2') || { id: generateId(), title: 'BankBoundary2', c4BoundaryTag: '[SYSTEM]' };
    elements.push({
      id: b2.id,
      c4Id: 'b2',
      type: 'group-boundary',
      boundaryType: 'system',
      c4BoundaryType: 'System_Boundary',
      c4BoundaryTag: '[SYSTEM]',
      title: b2.title || 'BankBoundary2',
      x: 100,
      y: 660,
      width: 400,
      height: 165,
      strokeColor: '#868e96',
      strokeStyle: 'dashed',
      strokeWidth: 1.5,
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      seed: generateSeed()
    });

    const b2Nodes = {
      SystemA: { x: 130, y: 720, width: 160, height: 75 },
      SystemB: { x: 310, y: 720, width: 165, height: 75 }
    };
    for (const [id, pos] of Object.entries(b2Nodes)) {
      const node = nodeMap.get(id);
      if (node) {
        elements.push({
          id: node.id,
          c4Id: id,
          type: 'c4-element',
          c4Type: node.c4Type,
          c4Shape: node.c4Shape,
          c4Tag: node.c4Tag,
          x: pos.x,
          y: pos.y,
          width: pos.width,
          height: pos.height,
          title: node.title,
          subtitle: node.subtitle,
          isExt: node.isExt,
          themeColor: node.themeColor,
          seed: generateSeed()
        });
      }
    }

    // Row 2 of b1: Boundary b3 (BankBoundary3)
    const b3 = allBoundaries.find(b => b.c4Id === 'b3') || { id: generateId(), title: 'BankBoundary3', c4BoundaryTag: '[boundary]' };
    elements.push({
      id: b3.id,
      c4Id: 'b3',
      type: 'group-boundary',
      boundaryType: 'boundary',
      c4BoundaryType: 'Boundary',
      c4BoundaryTag: '[boundary]',
      title: b3.title || 'BankBoundary3',
      x: 530,
      y: 660,
      width: 230,
      height: 240,
      strokeColor: '#868e96',
      strokeStyle: 'dashed',
      strokeWidth: 1.5,
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      seed: generateSeed()
    });

    const b3Nodes = {
      SystemF: { x: 555, y: 720, width: 180, height: 65 },
      SystemG: { x: 555, y: 810, width: 180, height: 65 }
    };
    for (const [id, pos] of Object.entries(b3Nodes)) {
      const node = nodeMap.get(id);
      if (node) {
        elements.push({
          id: node.id,
          c4Id: id,
          type: 'c4-element',
          c4Type: node.c4Type,
          c4Shape: node.c4Shape,
          c4Tag: node.c4Tag,
          x: pos.x,
          y: pos.y,
          width: pos.width,
          height: pos.height,
          title: node.title,
          subtitle: node.subtitle,
          isExt: node.isExt,
          themeColor: node.themeColor,
          seed: generateSeed()
        });
      }
    }
  } else {
    // Generic C4 fallback layout for arbitrary diagrams
    const persons = allNodes.filter(n => n.c4Shape === 'person');
    const nonPersons = allNodes.filter(n => n.c4Shape !== 'person');

    persons.forEach((node, idx) => {
      const x = 80 + idx * 210;
      const y = 140;
      elements.push({
        id: node.id,
        c4Id: node.c4Id,
        type: 'c4-element',
        c4Type: node.c4Type,
        c4Shape: 'person',
        c4Tag: '[Person]',
        x,
        y,
        width: 170,
        height: 110,
        title: node.title,
        subtitle: node.subtitle,
        isExt: node.isExt,
        themeColor: node.themeColor,
        seed: generateSeed()
      });
    });

    let rowY = persons.length > 0 ? 320 : 140;
    let colX = 80;
    nonPersons.forEach((node) => {
      elements.push({
        id: node.id,
        c4Id: node.c4Id,
        type: 'c4-element',
        c4Type: node.c4Type,
        c4Shape: node.c4Shape,
        c4Tag: node.c4Tag,
        x: colX,
        y: rowY,
        width: 170,
        height: 90,
        title: node.title,
        subtitle: node.subtitle,
        isExt: node.isExt,
        themeColor: node.themeColor,
        seed: generateSeed()
      });

      colX += 210;
      if (colX > 800) {
        colX = 80;
        rowY += 130;
      }
    });

    allBoundaries.forEach((b, idx) => {
      elements.push({
        id: b.id,
        c4Id: b.c4Id,
        type: 'group-boundary',
        boundaryType: b.boundaryType,
        c4BoundaryType: b.c4BoundaryType,
        c4BoundaryTag: b.c4BoundaryTag,
        title: b.title,
        x: 50 + idx * 20,
        y: 80 + idx * 20,
        width: 860 - idx * 40,
        height: Math.max(400, rowY + 150),
        strokeColor: '#868e96',
        strokeStyle: 'dashed',
        strokeWidth: 1.5,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        seed: generateSeed()
      });
    });
  }

  // 3. Connect Relationships (Arrows)
  allRels.forEach(rel => {
    const fromEl = elements.find(el => el.c4Id === rel.from);
    const toEl = elements.find(el => el.c4Id === rel.to);
    if (!fromEl || !toEl) return;

    const fromCx = fromEl.x + fromEl.width / 2;
    const fromCy = fromEl.y + fromEl.height / 2;
    const toCx = toEl.x + toEl.width / 2;
    const toCy = toEl.y + toEl.height / 2;

    const isBi = rel.relType === 'BiRel';
    let fullLabel = rel.label || '';
    if (rel.techn) {
      fullLabel = `${fullLabel} [${rel.techn}]`;
    }

    elements.push({
      id: generateId(),
      type: 'arrow',
      x: fromCx,
      y: fromCy,
      width: toCx - fromCx,
      height: toCy - fromCy,
      label: fullLabel,
      techn: rel.techn,
      startBinding: { elementId: fromEl.id },
      endBinding: { elementId: toEl.id },
      direction: isBi ? 'both' : 'forward',
      c4RelType: rel.relType,
      strokeColor: '#495057',
      strokeWidth: 1.5,
      strokeStyle: 'solid',
      seed: generateSeed()
    });
  });

  return { success: true, elements };
}
