/**
 * ExcaliCraft: SQL DDL Code Generator (Sprint 4)
 * Generates production-ready ANSI SQL, PostgreSQL, and MySQL DDL from on-canvas ERD tables.
 * Implements SEC-S4-01 (SQL Identifier Sanitization & Injection Prevention).
 */

/**
 * Sanitizes and quotes a SQL identifier to prevent SQL injection (SEC-S4-01).
 * @param {string} identifier - Raw table or column name
 * @param {'postgres' | 'mysql' | 'ansi'} [dialect='postgres']
 * @returns {string} Safe quoted SQL identifier
 */
export function sanitizeSqlIdentifier(identifier, dialect = 'postgres') {
  if (!identifier || typeof identifier !== 'string') {
    return dialect === 'mysql' ? '`unnamed`' : '"unnamed"';
  }

  // Strip null bytes, control characters, and line breaks
  let cleaned = identifier.replace(/[\x00-\x1f\x7f]/g, '').trim();
  if (!cleaned) {
    cleaned = 'unnamed';
  }

  if (dialect === 'mysql') {
    // MySQL uses backticks; escape backticks by doubling
    return `\`${cleaned.replace(/`/g, '``')}\``;
  }

  // ANSI SQL & PostgreSQL use standard double quotes; escape quotes by doubling
  return `"${cleaned.replace(/"/g, '""')}"`;
}

/**
 * Normalizes user-entered column type to standard SQL data types.
 * @param {string} rawType - e.g. 'uuid', 'varchar(255)', 'timestamp'
 * @param {boolean} isPk - whether this column is a primary key
 * @param {'postgres' | 'mysql' | 'ansi'} dialect
 * @returns {string} Standard SQL data type
 */
export function normalizeSqlType(rawType, isPk = false, dialect = 'postgres') {
  if (!rawType || typeof rawType !== 'string') {
    return isPk ? (dialect === 'mysql' ? 'VARCHAR(36)' : 'UUID') : 'VARCHAR(255)';
  }

  const trimmed = rawType.trim();
  const lower = trimmed.toLowerCase();

  // Match types with parameter lists like varchar(100), decimal(10,2)
  const paramMatch = trimmed.match(/^([a-zA-Z]+)\s*\((.+)\)$/);
  if (paramMatch) {
    const baseType = paramMatch[1].toLowerCase();
    const params = paramMatch[2].trim();

    if (baseType === 'varchar') return `VARCHAR(${params})`;
    if (baseType === 'char') return `CHAR(${params})`;
    if (baseType === 'decimal' || baseType === 'numeric') return `DECIMAL(${params})`;
  }

  if (lower === 'uuid') {
    return dialect === 'mysql' ? 'VARCHAR(36)' : 'UUID';
  }
  if (lower === 'string' || lower === 'varchar') {
    return 'VARCHAR(255)';
  }
  if (lower === 'text') {
    return 'TEXT';
  }
  if (lower === 'int' || lower === 'integer') {
    return 'INTEGER';
  }
  if (lower === 'bigint') {
    return 'BIGINT';
  }
  if (lower === 'smallint') {
    return 'SMALLINT';
  }
  if (lower === 'bool' || lower === 'boolean') {
    return dialect === 'mysql' ? 'TINYINT(1)' : 'BOOLEAN';
  }
  if (lower === 'timestamp' || lower === 'timestamptz') {
    return dialect === 'mysql' ? 'DATETIME' : 'TIMESTAMP';
  }
  if (lower === 'date') {
    return 'DATE';
  }
  if (lower === 'json' || lower === 'jsonb') {
    return dialect === 'postgres' ? 'JSONB' : 'JSON';
  }
  if (lower === 'serial') {
    return dialect === 'mysql' ? 'INT AUTO_INCREMENT' : 'SERIAL';
  }
  if (lower === 'bigserial') {
    return dialect === 'mysql' ? 'BIGINT AUTO_INCREMENT' : 'BIGSERIAL';
  }
  if (lower === 'float' || lower === 'double') {
    return dialect === 'postgres' ? 'DOUBLE PRECISION' : 'DOUBLE';
  }

  // Fallback: sanitize custom user type to alphanumeric with optional length
  const safeCustom = trimmed.replace(/[^a-zA-Z0-9_(),\s]/g, '');
  return safeCustom.toUpperCase() || 'VARCHAR(255)';
}

/**
 * Extracts ERD table relationships from canvas connectors and column naming.
 * @param {Array<Object>} elements - All canvas elements
 * @returns {Array<Object>} List of resolved foreign key relationships
 */
export function findErdRelationships(elements = []) {
  const tables = elements.filter(el => el.type === 'erd-table' && !el.isDeleted);
  const arrows = elements.filter(el => (el.type === 'arrow' || el.type === 'line') && !el.isDeleted);
  const tableMapById = new Map();
  const tableMapByName = new Map();

  tables.forEach(t => {
    tableMapById.set(t.id, t);
    const normName = (t.tableName || 'unnamed').toLowerCase().trim();
    tableMapByName.set(normName, t);
    // Also index singular name (e.g. 'users' -> 'user')
    if (normName.endsWith('s')) {
      tableMapByName.set(normName.slice(0, -1), t);
    }
  });

  const relationships = [];
  const processedKeys = new Set();

  // Helper to test if point is inside or very close to an element bounding box
  function isNearElement(px, py, el, threshold = 60) {
    const minX = el.x - threshold;
    const maxX = el.x + (el.width || 200) + threshold;
    const minY = el.y - threshold;
    const maxY = el.y + (el.height || 150) + threshold;
    return px >= minX && px <= maxX && py >= minY && py <= maxY;
  }

  // 1. Resolve from Arrow Connectors
  arrows.forEach(arrow => {
    let sourceTable = null;
    let targetTable = null;

    if (arrow.startBinding && arrow.startBinding.elementId) {
      sourceTable = tableMapById.get(arrow.startBinding.elementId);
    }
    if (arrow.endBinding && arrow.endBinding.elementId) {
      targetTable = tableMapById.get(arrow.endBinding.elementId);
    }

    // Fallback: Proximity hit test if bindings are missing
    if (!sourceTable || !targetTable) {
      const pStart = { x: arrow.x, y: arrow.y };
      const lastPt = (arrow.points && arrow.points[arrow.points.length - 1]) || [arrow.width || 100, arrow.height || 0];
      const pEnd = {
        x: Math.abs(lastPt[0]) > 500 ? lastPt[0] : arrow.x + lastPt[0],
        y: Math.abs(lastPt[1]) > 500 ? lastPt[1] : arrow.y + lastPt[1]
      };

      tables.forEach(t => {
        if (!sourceTable && isNearElement(pStart.x, pStart.y, t)) {
          sourceTable = t;
        }
        if (!targetTable && isNearElement(pEnd.x, pEnd.y, t)) {
          targetTable = t;
        }
      });
    }

    if (sourceTable && targetTable && sourceTable.id !== targetTable.id) {
      // Determine which is parent and which is child
      // Check column names for foreign keys in both tables
      const checkAndAdd = (childT, parentT) => {
        const parentName = (parentT.tableName || '').toLowerCase().trim();
        const parentSingular = parentName.endsWith('s') ? parentName.slice(0, -1) : parentName;
        const parentPk = (parentT.columns || []).find(c => c.key === 'PK' || c.isPk) || { name: 'id' };

        (childT.columns || []).forEach(col => {
          const colName = (col.name || '').toLowerCase().trim();
          const isFkCol = col.key === 'FK' || col.isFk ||
            colName === `${parentSingular}_id` ||
            colName === `${parentName}_id` ||
            (arrow.label && arrow.label.includes(colName));

          if (isFkCol) {
            const relKey = `${childT.tableName}.${col.name}->${parentT.tableName}.${parentPk.name}`;
            if (!processedKeys.has(relKey)) {
              processedKeys.add(relKey);
              relationships.push({
                childTable: childT.tableName,
                childColumn: col.name,
                parentTable: parentT.tableName,
                parentColumn: parentPk.name,
                constraintName: `fk_${childT.tableName}_${parentT.tableName}`
              });
            }
          }
        });
      };

      checkAndAdd(targetTable, sourceTable);
      checkAndAdd(sourceTable, targetTable);
    }
  });

  // 2. Infer remaining FK columns based on naming convention (e.g. orders.user_id -> users.id)
  tables.forEach(childT => {
    (childT.columns || []).forEach(col => {
      const colName = (col.name || '').toLowerCase().trim();
      if ((col.key === 'FK' || col.isFk || colName.endsWith('_id')) && colName !== 'id') {
        const targetPrefix = colName.replace(/_id$/, '');
        const parentT = tableMapByName.get(targetPrefix);

        if (parentT && parentT.id !== childT.id) {
          const parentPk = (parentT.columns || []).find(c => c.key === 'PK' || c.isPk) || { name: 'id' };
          const relKey = `${childT.tableName}.${col.name}->${parentT.tableName}.${parentPk.name}`;
          if (!processedKeys.has(relKey)) {
            processedKeys.add(relKey);
            relationships.push({
              childTable: childT.tableName,
              childColumn: col.name,
              parentTable: parentT.tableName,
              parentColumn: parentPk.name,
              constraintName: `fk_${childT.tableName}_${parentT.tableName}`
            });
          }
        }
      }
    });
  });

  return relationships;
}

/**
 * Generates SQL DDL for a single ERD table.
 * @param {Object} tableElement - ERD table element
 * @param {Object} [options={}] - Options (dialect, etc.)
 * @returns {string} CREATE TABLE SQL statement
 */
export function generateTableDdl(tableElement, options = {}) {
  const dialect = options.dialect || 'postgres';
  const tableName = tableElement.tableName || 'unnamed_table';
  const quotedTableName = sanitizeSqlIdentifier(tableName, dialect);
  const columns = tableElement.columns || [];

  if (columns.length === 0) {
    return `CREATE TABLE ${quotedTableName} (\n  ${sanitizeSqlIdentifier('id', dialect)} ${normalizeSqlType('uuid', true, dialect)} PRIMARY KEY\n);`;
  }

  const colDefs = columns.map(col => {
    const colName = col.name || 'unnamed_col';
    const quotedColName = sanitizeSqlIdentifier(colName, dialect);
    const isPk = col.key === 'PK' || col.isPk === true;
    const sqlType = normalizeSqlType(col.type, isPk, dialect);

    let def = `  ${quotedColName} ${sqlType}`;

    if (isPk) {
      def += ' PRIMARY KEY';
    } else {
      // Common default conventions
      const lowerName = colName.toLowerCase();
      if (lowerName === 'created_at' || lowerName === 'updated_at') {
        def += ' DEFAULT CURRENT_TIMESTAMP';
      } else if (col.notNull !== false && (lowerName.includes('email') || lowerName.includes('name') || lowerName.includes('status'))) {
        def += ' NOT NULL';
      }
    }

    return def;
  });

  return `CREATE TABLE ${quotedTableName} (\n${colDefs.join(',\n')}\n);`;
}

/**
 * Topologically sorts tables so parent tables appear before child tables.
 * @param {Array<Object>} tables
 * @param {Array<Object>} relationships
 * @returns {Array<Object>} Sorted tables
 */
function sortTablesTopologically(tables, relationships) {
  const tableMap = new Map(tables.map(t => [t.tableName.toLowerCase(), t]));
  const adj = new Map();
  const inDegree = new Map();

  tables.forEach(t => {
    const name = t.tableName.toLowerCase();
    adj.set(name, []);
    inDegree.set(name, 0);
  });

  relationships.forEach(rel => {
    const parent = rel.parentTable.toLowerCase();
    const child = rel.childTable.toLowerCase();
    if (adj.has(parent) && adj.has(child) && parent !== child) {
      adj.get(parent).push(child);
      inDegree.set(child, (inDegree.get(child) || 0) + 1);
    }
  });

  const queue = [];
  inDegree.forEach((deg, name) => {
    if (deg === 0) queue.push(name);
  });

  const sorted = [];
  while (queue.length > 0) {
    const current = queue.shift();
    if (tableMap.has(current)) {
      sorted.push(tableMap.get(current));
    }
    const neighbors = adj.get(current) || [];
    neighbors.forEach(next => {
      inDegree.set(next, inDegree.get(next) - 1);
      if (inDegree.get(next) === 0) {
        queue.push(next);
      }
    });
  }

  // Add any remaining tables (e.g. in case of cycles or unreferenced)
  tables.forEach(t => {
    if (!sorted.includes(t)) {
      sorted.push(t);
    }
  });

  return sorted;
}

/**
 * Generates full SQL DDL schema script from canvas elements.
 * @param {Array<Object>} elements - Canvas elements
 * @param {Object} [options={}] - Options (dialect, includeDrop, separateConstraints)
 * @returns {string} Complete formatted SQL DDL script
 */
export function generateSqlDdl(elements = [], options = {}) {
  const dialect = options.dialect || 'postgres';
  const includeDrop = options.includeDrop !== false;
  const tables = elements.filter(el => el.type === 'erd-table' && !el.isDeleted);

  if (tables.length === 0) {
    return `-- No ERD tables found on canvas.\n-- Add ERD tables using the Component Library or load the ERD template.`;
  }

  const relationships = findErdRelationships(elements);
  const sortedTables = sortTablesTopologically(tables, relationships);

  const parts = [];
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  parts.push(`-- ============================================================`);
  parts.push(`-- ExcaliCraft SQL DDL Schema Export`);
  parts.push(`-- Dialect: ${dialect.toUpperCase()}`);
  parts.push(`-- Generated: ${now} UTC`);
  parts.push(`-- Tables: ${tables.length} | Relationships: ${relationships.length}`);
  parts.push(`-- ============================================================\n`);

  if (includeDrop) {
    parts.push(`-- 1. Drop existing tables (child first, cascade)`);
    // Reverse topologically sorted for clean dropping
    const dropOrder = [...sortedTables].reverse();
    dropOrder.forEach(t => {
      const qName = sanitizeSqlIdentifier(t.tableName, dialect);
      const cascade = dialect === 'postgres' ? ' CASCADE' : '';
      parts.push(`DROP TABLE IF EXISTS ${qName}${cascade};`);
    });
    parts.push('');
  }

  parts.push(`-- 2. Create tables`);
  sortedTables.forEach(t => {
    parts.push(generateTableDdl(t, { dialect }));
    parts.push('');
  });

  if (relationships.length > 0) {
    parts.push(`-- 3. Foreign Key Constraints`);
    relationships.forEach(rel => {
      const qChildTable = sanitizeSqlIdentifier(rel.childTable, dialect);
      const qChildCol = sanitizeSqlIdentifier(rel.childColumn, dialect);
      const qParentTable = sanitizeSqlIdentifier(rel.parentTable, dialect);
      const qParentCol = sanitizeSqlIdentifier(rel.parentColumn, dialect);
      const qConstraint = sanitizeSqlIdentifier(rel.constraintName, dialect);

      parts.push(
        `ALTER TABLE ${qChildTable} ADD CONSTRAINT ${qConstraint} \n  FOREIGN KEY (${qChildCol}) REFERENCES ${qParentTable} (${qParentCol});\n`
      );
    });
  }

  return parts.join('\n');
}

/**
 * Downloads a generated SQL script file to the user's computer.
 * @param {string} filename - Target filename e.g. 'schema.sql'
 * @param {string} sqlContent - SQL text content
 */
export function downloadSqlFile(filename, sqlContent) {
  const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `schema-${Date.now()}.sql`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies SQL DDL to system clipboard securely.
 * @param {string} sqlContent - SQL text
 * @returns {Promise<boolean>}
 */
export async function copySqlToClipboard(sqlContent) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(sqlContent);
    return true;
  }
  // Fallback
  const textarea = document.createElement('textarea');
  textarea.value = sqlContent;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const success = document.execCommand('copy');
  document.body.removeChild(textarea);
  return success;
}
