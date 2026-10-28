/**
 * ExcaliCraft Icon Renderer & Registry
 * Renders vector Lucide icons & Cloud Provider Architecture Icons (AWS, GCP, Azure, Tech)
 */

import { icons } from 'lucide';

export const ARCHITECTURE_ICONS = [
  // --- AWS Category ---
  { name: 'Aws', label: 'AWS Cloud', provider: 'aws', iconKey: 'Cloud', color: '#ff9900' },
  { name: 'Lambda', label: 'AWS Lambda', provider: 'aws', iconKey: 'Zap', color: '#ff9900' },
  { name: 'S3', label: 'Amazon S3', provider: 'aws', iconKey: 'HardDrive', color: '#e03131' },
  { name: 'Ec2', label: 'Amazon EC2', provider: 'aws', iconKey: 'Server', color: '#ff9900' },
  { name: 'Rds', label: 'Amazon RDS', provider: 'aws', iconKey: 'Database', color: '#1971c2' },
  { name: 'Dynamodb', label: 'Amazon DynamoDB', provider: 'aws', iconKey: 'Layers', color: '#1971c2' },
  { name: 'ApiGateway', label: 'Amazon API Gateway', provider: 'aws', iconKey: 'Network', color: '#f08c00' },
  { name: 'Cloudfront', label: 'Amazon CloudFront', provider: 'aws', iconKey: 'Globe', color: '#9c36b5' },
  { name: 'Sqs', label: 'Amazon SQS', provider: 'aws', iconKey: 'MessageSquare', color: '#f08c00' },
  { name: 'Cloudwatch', label: 'Amazon CloudWatch', provider: 'aws', iconKey: 'Activity', color: '#e03131' },

  // --- Google Cloud Category ---
  { name: 'Gcp', label: 'Google Cloud Platform', provider: 'gcp', iconKey: 'Cloud', color: '#4285f4' },
  { name: 'Cloudrun', label: 'GCP Cloud Run', provider: 'gcp', iconKey: 'Cpu', color: '#4285f4' },
  { name: 'Cloudstorage', label: 'GCP Cloud Storage', provider: 'gcp', iconKey: 'HardDrive', color: '#34a853' },
  { name: 'Bigquery', label: 'GCP BigQuery', provider: 'gcp', iconKey: 'Database', color: '#4285f4' },
  { name: 'Cloudfunctions', label: 'GCP Cloud Functions', provider: 'gcp', iconKey: 'Zap', color: '#ea4335' },
  { name: 'Pubsub', label: 'GCP Pub/Sub', provider: 'gcp', iconKey: 'MessageSquare', color: '#fbbc05' },
  { name: 'Gke', label: 'Google Kubernetes (GKE)', provider: 'gcp', iconKey: 'Boxes', color: '#4285f4' },
  { name: 'Cloudsql', label: 'GCP Cloud SQL', provider: 'gcp', iconKey: 'Database', color: '#4285f4' },

  // --- Azure Category ---
  { name: 'Azure', label: 'Microsoft Azure', provider: 'azure', iconKey: 'Cloud', color: '#0078d4' },
  { name: 'Appservice', label: 'Azure App Service', provider: 'azure', iconKey: 'Server', color: '#0078d4' },
  { name: 'Azurefunctions', label: 'Azure Functions', provider: 'azure', iconKey: 'Zap', color: '#0078d4' },
  { name: 'Blobstorage', label: 'Azure Blob Storage', provider: 'azure', iconKey: 'HardDrive', color: '#0078d4' },
  { name: 'Cosmosdb', label: 'Azure Cosmos DB', provider: 'azure', iconKey: 'Globe', color: '#0078d4' },
  { name: 'Azuresql', label: 'Azure SQL Database', provider: 'azure', iconKey: 'Database', color: '#0078d4' },
  { name: 'Aks', label: 'Azure Kubernetes (AKS)', provider: 'azure', iconKey: 'Boxes', color: '#0078d4' },
  { name: 'Eventgrid', label: 'Azure Event Grid', provider: 'azure', iconKey: 'Activity', color: '#0078d4' },

  // --- Tech & Open Source Category ---
  { name: 'Docker', label: 'Docker Containers', provider: 'tech', iconKey: 'Boxes', color: '#2496ed' },
  { name: 'Kubernetes', label: 'Kubernetes Cluster', provider: 'tech', iconKey: 'Layers', color: '#326ce5' },
  { name: 'Postgres', label: 'PostgreSQL Database', provider: 'tech', iconKey: 'Database', color: '#336791' },
  { name: 'Redis', label: 'Redis In-Memory Cache', provider: 'tech', iconKey: 'Zap', color: '#dc382d' },
  { name: 'Kafka', label: 'Apache Kafka Broker', provider: 'tech', iconKey: 'MessageSquare', color: '#231f20' },
  { name: 'Mongodb', label: 'MongoDB NoSQL', provider: 'tech', iconKey: 'Database', color: '#47a248' },
  { name: 'Shield', label: 'Security & Auth', provider: 'tech', iconKey: 'Shield', color: '#2f9e44' },
  { name: 'Terminal', label: 'Worker / Service', provider: 'tech', iconKey: 'Terminal', color: '#495057' },
  { name: 'Server', label: 'Generic Server Node', provider: 'tech', iconKey: 'Server', color: '#1971c2' },
  { name: 'Smartphone', label: 'Mobile Application', provider: 'tech', iconKey: 'Smartphone', color: '#1971c2' }
];

/**
 * Custom Cloud/Architecture SVG Path definitions
 */
const CUSTOM_PATHS = {
  // AWS signature swoop
  aws: "M2 14c3-1 7-1 10 1 3 2 7 2 10 0M17 12l5 3-2-5",
  // Cloud database cylinder
  database: "M4 6c0-2.2 3.6-4 8-4s8 1.8 8 4v12c0 2.2-3.6 4-8 4s-8-1.8-8-4V6zM4 12c0 2.2 3.6 4 8 4s8-1.8 8-4",
  // Serverless lightning
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z"
};

/**
 * Draws an architecture icon onto canvas at (x, y) with given size and color
 */
export function drawLucideIcon(ctx, iconName, x, y, size = 20, strokeColor = '#1971c2', strokeWidth = 2) {
  const safeName = typeof iconName === 'string' ? iconName : '';
  const match = ARCHITECTURE_ICONS.find(i => i.name.toLowerCase() === safeName.toLowerCase());
  const effectiveKey = match ? match.iconKey : safeName;

  // Normalize icon key to PascalCase
  const key = effectiveKey ? (effectiveKey.charAt(0).toUpperCase() + effectiveKey.slice(1)) : 'Box';
  const iconData = icons[key] || icons[effectiveKey] || icons.Box;
  if (!iconData) return;

  ctx.save();
  ctx.translate(x, y);
  const scale = size / 24;
  ctx.scale(scale, scale);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth / scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const [tag, attrs] of iconData) {
    if (tag === 'rect') {
      const rx = parseFloat(attrs.rx || 0);
      const ry = parseFloat(attrs.ry || 0);
      const w = parseFloat(attrs.width);
      const h = parseFloat(attrs.height);
      const bx = parseFloat(attrs.x);
      const by = parseFloat(attrs.y);
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function' && rx > 0) {
        ctx.roundRect(bx, by, w, h, rx);
      } else {
        ctx.rect(bx, by, w, h);
      }
      ctx.stroke();
    } else if (tag === 'circle') {
      ctx.beginPath();
      ctx.arc(parseFloat(attrs.cx), parseFloat(attrs.cy), parseFloat(attrs.r), 0, Math.PI * 2);
      ctx.stroke();
    } else if (tag === 'ellipse') {
      ctx.beginPath();
      const cx = parseFloat(attrs.cx);
      const cy = parseFloat(attrs.cy);
      const rx = parseFloat(attrs.rx);
      const ry = parseFloat(attrs.ry);
      if (typeof ctx.ellipse === 'function') {
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      } else {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(rx, ry);
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.restore();
      }
      ctx.stroke();
    } else if (tag === 'line') {
      ctx.beginPath();
      ctx.moveTo(parseFloat(attrs.x1), parseFloat(attrs.y1));
      ctx.lineTo(parseFloat(attrs.x2), parseFloat(attrs.y2));
      ctx.stroke();
    } else if (tag === 'path') {
      if (typeof Path2D !== 'undefined') {
        const p = new Path2D(attrs.d);
        ctx.stroke(p);
      }
    } else if (tag === 'polyline' || tag === 'polygon') {
      const pts = (attrs.points || '').trim().split(/\s+/).map(p => p.split(',').map(Number));
      if (pts.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          if (!isNaN(pts[i][0]) && !isNaN(pts[i][1])) {
            ctx.lineTo(pts[i][0], pts[i][1]);
          }
        }
        if (tag === 'polygon') ctx.closePath();
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

/**
 * Generates an inline SVG string for an architecture Lucide icon.
 * Guarantees immediate render without DOM icon replacement race conditions.
 */
export function getLucideSvg(iconName, strokeColor = 'currentColor', size = 16) {
  const safeName = typeof iconName === 'string' ? iconName : '';
  const match = ARCHITECTURE_ICONS.find(i => i.name.toLowerCase() === safeName.toLowerCase());
  const effectiveKey = match ? match.iconKey : safeName;
  const key = effectiveKey ? (effectiveKey.charAt(0).toUpperCase() + effectiveKey.slice(1)) : 'Box';
  const iconData = icons[key] || icons[effectiveKey] || icons.Box;
  if (!iconData) return '';

  let inner = '';
  for (const [tag, attrs] of iconData) {
    const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
    inner += `<${tag} ${attrStr} />`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${(effectiveKey || 'box').toLowerCase()}">${inner}</svg>`;
}
