/**
 * ExcaliCraft Smart Architecture Templates (Eraser Diagrams Standard)
 * Follows Eraser.io specifications: https://github.com/eraserlabs/eraser-diagrams
 * Comprehensive coverage of:
 * - Cloud Architecture: AWS, Google Cloud, Azure
 * - Architecture Patterns: Monolithic, Modular Monolithic, Microservices
 * - UML Diagrams: Flowchart, Sequence Diagram, State Machine
 * - Database: Entity Relationship Diagram (ERD)
 */

import { generateId, generateSeed } from './math.js';

// ============================================================================
// 1. CLOUD ARCHITECTURES: AWS, Google Cloud, Azure
// ============================================================================

/**
 * AWS Serverless & Event-Driven Architecture Template
 */
export function getAwsArchitectureTemplate() {
  const elements = [];

  // Group: AWS Cloud Boundary
  elements.push({
    id: generateId(),
    type: 'group-boundary',
    x: 280,
    y: 80,
    width: 860,
    height: 520,
    title: 'AWS Region: us-east-1 (N. Virginia)',
    strokeColor: '#ff9900',
    backgroundColor: 'rgba(255, 243, 205, 0.35)',
    strokeStyle: 'dashed',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // Client
  elements.push({
    id: generateId(),
    type: 'node',
    x: 40,
    y: 220,
    width: 200,
    height: 80,
    title: 'Web & Mobile Client',
    subtitle: 'Next.js · Flutter · TLS 1.3',
    badge: 'CLIENT',
    icon: 'Smartphone',
    themeColor: '#ff9900',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Edge: CloudFront & Route53
  elements.push({
    id: generateId(),
    type: 'node',
    x: 320,
    y: 220,
    width: 210,
    height: 80,
    title: 'Amazon CloudFront',
    subtitle: 'Global Edge CDN · Route 53',
    badge: 'EDGE',
    icon: 'Cloudfront',
    themeColor: '#9c36b5',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Ingress: API Gateway
  elements.push({
    id: generateId(),
    type: 'node',
    x: 580,
    y: 220,
    width: 210,
    height: 80,
    title: 'HTTP API Gateway',
    subtitle: 'REST & WebSocket Endpoints',
    badge: 'GATEWAY',
    icon: 'ApiGateway',
    themeColor: '#e03131',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Compute: Lambda Orders
  elements.push({
    id: generateId(),
    type: 'node',
    x: 860,
    y: 130,
    width: 220,
    height: 80,
    title: 'Order Processor',
    subtitle: 'AWS Lambda (Node.js 20)',
    badge: 'SERVERLESS',
    icon: 'Lambda',
    themeColor: '#ff9900',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Compute: Lambda Auth
  elements.push({
    id: generateId(),
    type: 'node',
    x: 860,
    y: 250,
    width: 220,
    height: 80,
    title: 'Auth & JWT Validator',
    subtitle: 'AWS Lambda · Cognito Authorizer',
    badge: 'SECURITY',
    icon: 'Lambda',
    themeColor: '#ff9900',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Queue: SQS
  elements.push({
    id: generateId(),
    type: 'node',
    x: 860,
    y: 370,
    width: 220,
    height: 80,
    title: 'Events FIFO Queue',
    subtitle: 'Amazon SQS (At-least-once)',
    badge: 'MESSAGING',
    icon: 'Sqs',
    themeColor: '#f08c00',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Database: DynamoDB
  elements.push({
    id: generateId(),
    type: 'node',
    x: 600,
    y: 470,
    width: 210,
    height: 80,
    title: 'Orders Table',
    subtitle: 'Amazon DynamoDB (On-Demand)',
    badge: 'NOSQL',
    icon: 'Dynamodb',
    themeColor: '#1971c2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Storage: S3
  elements.push({
    id: generateId(),
    type: 'node',
    x: 320,
    y: 470,
    width: 210,
    height: 80,
    title: 'Media Assets Bucket',
    subtitle: 'Amazon S3 (Encrypted CMEK)',
    badge: 'STORAGE',
    icon: 'S3',
    themeColor: '#2f9e44',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Observability: CloudWatch
  elements.push({
    id: generateId(),
    type: 'node',
    x: 860,
    y: 490,
    width: 220,
    height: 80,
    title: 'CloudWatch & X-Ray',
    subtitle: 'Structured Logs · Traces',
    badge: 'OBSERVABILITY',
    icon: 'Cloudwatch',
    themeColor: '#e03131',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Connectors
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 240,
    y: 260,
    width: 80,
    height: 0,
    label: 'HTTPS / TLS 1.3',
    direction: 'forward',
    strokeColor: '#ff9900',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 530,
    y: 260,
    width: 50,
    height: 0,
    label: 'Origin Route',
    direction: 'forward',
    strokeColor: '#e03131',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 790,
    y: 240,
    width: 70,
    height: -70,
    label: '/orders',
    direction: 'forward',
    strokeColor: '#ff9900',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 790,
    y: 260,
    width: 70,
    height: 30,
    label: '/auth',
    direction: 'forward',
    strokeColor: '#ff9900',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 970,
    y: 210,
    width: 0,
    height: 160,
    label: 'Dispatch Event',
    direction: 'forward',
    strokeColor: '#f08c00',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 860,
    y: 410,
    width: -150,
    height: 60,
    label: 'Batch Write',
    direction: 'forward',
    strokeColor: '#1971c2',
    isAnimated: true,
    seed: generateSeed()
  });

  return elements;
}

/**
 * Google Cloud Platform (GCP) Modern Cloud Architecture Template
 */
export function getGcpArchitectureTemplate() {
  const elements = [];

  // Group: GCP Project Boundary
  elements.push({
    id: generateId(),
    type: 'group-boundary',
    x: 300,
    y: 80,
    width: 860,
    height: 520,
    title: 'Google Cloud Platform (GCP) Project: enterprise-prod',
    strokeColor: '#4285f4',
    backgroundColor: 'rgba(232, 240, 254, 0.4)',
    strokeStyle: 'dashed',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // Client
  elements.push({
    id: generateId(),
    type: 'node',
    x: 50,
    y: 230,
    width: 200,
    height: 80,
    title: 'User Frontend',
    subtitle: 'Angular · PWA · Global DNS',
    badge: 'CLIENT',
    icon: 'Smartphone',
    themeColor: '#4285f4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Cloud Load Balancer
  elements.push({
    id: generateId(),
    type: 'node',
    x: 340,
    y: 230,
    width: 210,
    height: 80,
    title: 'Cloud Load Balancing',
    subtitle: 'Anycast IP · Cloud Armor WAF',
    badge: 'INGRESS',
    icon: 'Gcp',
    themeColor: '#4285f4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Compute: Cloud Run
  elements.push({
    id: generateId(),
    type: 'node',
    x: 610,
    y: 150,
    width: 220,
    height: 80,
    title: 'API Microservices',
    subtitle: 'Cloud Run (Autoscale 0 to N)',
    badge: 'CONTAINER',
    icon: 'Cloudrun',
    themeColor: '#4285f4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Compute: Cloud Functions
  elements.push({
    id: generateId(),
    type: 'node',
    x: 610,
    y: 310,
    width: 220,
    height: 80,
    title: 'Event Worker',
    subtitle: 'Cloud Functions (Gen 2)',
    badge: 'SERVERLESS',
    icon: 'Cloudfunctions',
    themeColor: '#ea4335',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Messaging: Pub/Sub
  elements.push({
    id: generateId(),
    type: 'node',
    x: 900,
    y: 150,
    width: 210,
    height: 80,
    title: 'Ingestion Pub/Sub',
    subtitle: 'Cloud Pub/Sub Topic',
    badge: 'STREAM',
    icon: 'Pubsub',
    themeColor: '#fbbc05',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Storage: Cloud SQL
  elements.push({
    id: generateId(),
    type: 'node',
    x: 900,
    y: 310,
    width: 210,
    height: 80,
    title: 'Transactional DB',
    subtitle: 'Cloud SQL (PostgreSQL 16 HA)',
    badge: 'RDBMS',
    icon: 'Cloudsql',
    themeColor: '#4285f4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Analytics: BigQuery
  elements.push({
    id: generateId(),
    type: 'node',
    x: 900,
    y: 470,
    width: 210,
    height: 80,
    title: 'Enterprise Lakehouse',
    subtitle: 'BigQuery ML & Vector Search',
    badge: 'ANALYTICS',
    icon: 'Bigquery',
    themeColor: '#34a853',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Storage: Cloud Storage
  elements.push({
    id: generateId(),
    type: 'node',
    x: 610,
    y: 470,
    width: 220,
    height: 80,
    title: 'Object Data Store',
    subtitle: 'Cloud Storage (Multi-region)',
    badge: 'STORAGE',
    icon: 'Cloudstorage',
    themeColor: '#34a853',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Connectors
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 250,
    y: 270,
    width: 90,
    height: 0,
    label: 'HTTPS / HTTP/3',
    direction: 'forward',
    strokeColor: '#4285f4',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 550,
    y: 250,
    width: 60,
    height: -60,
    label: 'gRPC / JSON',
    direction: 'forward',
    strokeColor: '#4285f4',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 830,
    y: 190,
    width: 70,
    height: 0,
    label: 'Publish Event',
    direction: 'forward',
    strokeColor: '#fbbc05',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 900,
    y: 210,
    width: -120,
    height: 100,
    label: 'Push Subscription',
    direction: 'forward',
    strokeColor: '#ea4335',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 830,
    y: 350,
    width: 70,
    height: 0,
    label: 'SQL Queries',
    direction: 'bidirectional',
    strokeColor: '#4285f4',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 1005,
    y: 390,
    width: 0,
    height: 80,
    label: 'CDC Stream / BigQuery',
    direction: 'forward',
    strokeColor: '#34a853',
    isAnimated: true,
    seed: generateSeed()
  });

  return elements;
}

/**
 * Microsoft Azure Cloud Architecture Template
 */
export function getAzureArchitectureTemplate() {
  const elements = [];

  // Group 1: Data Sources Boundary
  elements.push({
    id: generateId(),
    type: 'group-boundary',
    x: 40,
    y: 60,
    width: 170,
    height: 520,
    title: 'Data sources',
    strokeColor: '#0078d4',
    backgroundColor: 'rgba(235, 243, 252, 0.3)',
    strokeStyle: 'solid',
    strokeWidth: 1.5,
    seed: generateSeed()
  });

  // Source Nodes
  elements.push({
    id: generateId(),
    type: 'node',
    x: 55,
    y: 100,
    width: 140,
    height: 70,
    title: 'Microsoft SQL',
    subtitle: 'On-premises DB',
    badge: 'SQL',
    icon: 'Postgres',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 55,
    y: 195,
    width: 140,
    height: 70,
    title: 'Relational DBs',
    subtitle: 'On-premises ERP',
    badge: 'SQL',
    icon: 'Postgres',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 55,
    y: 290,
    width: 140,
    height: 70,
    title: 'Azure SQL DB',
    subtitle: 'Geo-replicated',
    badge: 'AZURE SQL',
    icon: 'Postgres',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 55,
    y: 385,
    width: 140,
    height: 70,
    title: 'Storage Table',
    subtitle: 'RA-GRS tier',
    badge: 'TABLE',
    icon: 'Blobstorage',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 55,
    y: 480,
    width: 140,
    height: 70,
    title: 'Cosmos DB',
    subtitle: 'Multi-region writes',
    badge: 'NOSQL',
    icon: 'Cosmosdb',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Group 2: Global Services Boundary
  elements.push({
    id: generateId(),
    type: 'group-boundary',
    x: 230,
    y: 60,
    width: 180,
    height: 520,
    title: 'Global services',
    strokeColor: '#7950f2',
    backgroundColor: 'rgba(243, 240, 255, 0.3)',
    strokeStyle: 'solid',
    strokeWidth: 1.5,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 245,
    y: 100,
    width: 150,
    height: 70,
    title: 'Traffic Manager',
    subtitle: 'Azure Front Door',
    badge: 'GATEWAY',
    icon: 'Azure',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 245,
    y: 220,
    width: 150,
    height: 70,
    title: 'Entra ID',
    subtitle: 'Authentication & SSO',
    badge: 'IDENTITY',
    icon: 'Shield',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 245,
    y: 340,
    width: 150,
    height: 70,
    title: 'Key Vault',
    subtitle: 'Tiered secrets vault',
    badge: 'SECURITY',
    icon: 'Shield',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 245,
    y: 460,
    width: 150,
    height: 70,
    title: 'Azure Monitor',
    subtitle: 'Failover & Health Alerts',
    badge: 'MONITOR',
    icon: 'Activity',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Group 3: Primary Region — East US (Active)
  elements.push({
    id: generateId(),
    type: 'group-boundary',
    x: 430,
    y: 60,
    width: 680,
    height: 250,
    title: 'Primary region — East US (active)',
    strokeColor: '#2b8a3e',
    backgroundColor: 'rgba(235, 251, 238, 0.35)',
    strokeStyle: 'solid',
    strokeWidth: 2,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 450,
    y: 95,
    width: 140,
    height: 70,
    title: 'Storage Blob',
    subtitle: 'Ingestion landing zone',
    badge: 'STORAGE',
    icon: 'Blobstorage',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 450,
    y: 200,
    width: 140,
    height: 70,
    title: 'Data Factory',
    subtitle: 'Active ETL pipeline',
    badge: 'ETL',
    icon: 'Azurefunctions',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 620,
    y: 95,
    width: 140,
    height: 70,
    title: 'SQL DW',
    subtitle: 'Warehouse Synapse',
    badge: 'WAREHOUSE',
    icon: 'Postgres',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 790,
    y: 95,
    width: 140,
    height: 70,
    title: 'Analysis Services',
    subtitle: 'Tabular semantic cube',
    badge: 'SEMANTIC',
    icon: 'Boxes',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 950,
    y: 95,
    width: 140,
    height: 70,
    title: 'Power BI',
    subtitle: 'Primary workspace',
    badge: 'ACTIVE BI',
    icon: 'Boxes',
    themeColor: '#f59f00',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Group 4: Secondary Region — West US (Warm Standby / DR)
  elements.push({
    id: generateId(),
    type: 'group-boundary',
    x: 430,
    y: 330,
    width: 680,
    height: 250,
    title: 'Secondary region — West US (warm standby / DR)',
    strokeColor: '#e03131',
    backgroundColor: 'rgba(255, 245, 245, 0.35)',
    strokeStyle: 'solid',
    strokeWidth: 2,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 450,
    y: 365,
    width: 140,
    height: 70,
    title: 'Storage Blob',
    subtitle: 'Geo-replicated target',
    badge: 'REPLICA',
    icon: 'Blobstorage',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 450,
    y: 470,
    width: 140,
    height: 70,
    title: 'Data Factory',
    subtitle: 'Standby ETL pipeline',
    badge: 'STANDBY',
    icon: 'Azurefunctions',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 620,
    y: 365,
    width: 140,
    height: 70,
    title: 'SQL DW',
    subtitle: 'Restored replica',
    badge: 'REPLICA',
    icon: 'Postgres',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 790,
    y: 365,
    width: 140,
    height: 70,
    title: 'Analysis Services',
    subtitle: 'Standby semantic cube',
    badge: 'STANDBY',
    icon: 'Boxes',
    themeColor: '#0078d4',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 950,
    y: 365,
    width: 140,
    height: 70,
    title: 'Power BI',
    subtitle: 'Failover workspace',
    badge: 'FAILOVER',
    icon: 'Boxes',
    themeColor: '#868e96',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Ingress Routing
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 395,
    y: 135,
    width: 555,
    height: 0,
    label: 'active route',
    direction: 'forward',
    strokeColor: '#2b8a3e',
    isAnimated: true,
    seed: generateSeed()
  });

  // Cross-Region Sync Connectors:
  // Blob Primary -> Blob Secondary
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 520,
    y: 165,
    width: 0,
    height: 200,
    label: 'geo-replication',
    direction: 'forward',
    strokeColor: '#0078d4',
    strokeStyle: 'dashed',
    isAnimated: true,
    seed: generateSeed()
  });

  // SQL DW Primary -> SQL DW Secondary
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 690,
    y: 165,
    width: 0,
    height: 200,
    label: 'geo-backup restore',
    direction: 'forward',
    strokeColor: '#f76707',
    strokeStyle: 'dashed',
    isAnimated: true,
    seed: generateSeed()
  });

  // Analysis Services Model Sync
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 860,
    y: 165,
    width: 0,
    height: 200,
    label: 'model sync',
    direction: 'forward',
    strokeColor: '#1971c2',
    strokeStyle: 'dashed',
    isAnimated: true,
    seed: generateSeed()
  });

  // Power BI Failover Sync
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 1020,
    y: 165,
    width: 0,
    height: 200,
    label: 'failover sync',
    direction: 'forward',
    strokeColor: '#e03131',
    strokeStyle: 'dashed',
    isAnimated: true,
    seed: generateSeed()
  });

  return elements;
}

// ============================================================================
// 2. ARCHITECTURE PATTERNS: Monolithic, Modular Monolith, Microservices
// ============================================================================

/**
 * Classic Monolithic System Architecture
 */
export function getMonolithicTemplate() {
  const elements = [];

  // Monolith App Container
  elements.push({
    id: generateId(),
    type: 'group-boundary',
    x: 400,
    y: 80,
    width: 440,
    height: 520,
    title: 'Unified Monolithic Application Server (Rails / Django / Spring)',
    strokeColor: '#e03131',
    backgroundColor: 'rgba(255, 235, 235, 0.4)',
    strokeStyle: 'solid',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // Client
  elements.push({
    id: generateId(),
    type: 'node',
    x: 60,
    y: 240,
    width: 200,
    height: 80,
    title: 'Web Browser Client',
    subtitle: 'Server-Rendered HTML + JS',
    badge: 'CLIENT',
    icon: 'Globe',
    themeColor: '#1971c2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Nginx Reverse Proxy
  elements.push({
    id: generateId(),
    type: 'node',
    x: 430,
    y: 130,
    width: 380,
    height: 70,
    title: 'Nginx Reverse Proxy & SSL',
    subtitle: 'SSL Offload · Gzip · Static Caching',
    badge: 'WEB SERVER',
    icon: 'Server',
    themeColor: '#2f9e44',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // UI / Presentation Layer
  elements.push({
    id: generateId(),
    type: 'node',
    x: 430,
    y: 220,
    width: 380,
    height: 70,
    title: 'Presentation & Controllers Layer',
    subtitle: 'Routing, Validation, Session Cookies',
    badge: 'MVC VIEW/CONTROLLER',
    icon: 'Layers',
    themeColor: '#e03131',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Domain Business Logic Layer
  elements.push({
    id: generateId(),
    type: 'node',
    x: 430,
    y: 310,
    width: 380,
    height: 70,
    title: 'Business Domain Services Layer',
    subtitle: 'Order Rules, Pricing, Auth, Invoices',
    badge: 'BUSINESS LOGIC',
    icon: 'Cpu',
    themeColor: '#e03131',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Data Access Layer
  elements.push({
    id: generateId(),
    type: 'node',
    x: 430,
    y: 400,
    width: 380,
    height: 70,
    title: 'Data Access & ORM Layer',
    subtitle: 'ActiveRecord / Hibernate / Prisma',
    badge: 'PERSISTENCE',
    icon: 'Database',
    themeColor: '#e03131',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Primary Database
  elements.push({
    id: generateId(),
    type: 'node',
    x: 930,
    y: 200,
    width: 220,
    height: 80,
    title: 'Primary PostgreSQL DB',
    subtitle: 'Master Read/Write · ACID Guarantees',
    badge: 'PRIMARY RDBMS',
    icon: 'Postgres',
    themeColor: '#336791',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Read Replica
  elements.push({
    id: generateId(),
    type: 'node',
    x: 930,
    y: 340,
    width: 220,
    height: 80,
    title: 'Read Replica DB',
    subtitle: 'Async Streaming Replication',
    badge: 'READ ONLY',
    icon: 'Postgres',
    themeColor: '#336791',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Cache
  elements.push({
    id: generateId(),
    type: 'node',
    x: 930,
    y: 470,
    width: 220,
    height: 80,
    title: 'Redis Shared Cache',
    subtitle: 'Session Store & Job Queues',
    badge: 'IN-MEMORY',
    icon: 'Redis',
    themeColor: '#dc382d',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Connectors
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 260,
    y: 280,
    width: 170,
    height: -100,
    label: 'HTTP Request',
    direction: 'forward',
    strokeColor: '#1971c2',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 810,
    y: 435,
    width: 120,
    height: -190,
    label: 'Read/Write SQL',
    direction: 'bidirectional',
    strokeColor: '#336791',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 1040,
    y: 280,
    width: 0,
    height: 60,
    label: 'WAL Sync',
    direction: 'forward',
    strokeColor: '#336791',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 810,
    y: 450,
    width: 120,
    height: 50,
    label: 'Cache Get/Set',
    direction: 'bidirectional',
    strokeColor: '#dc382d',
    isAnimated: true,
    seed: generateSeed()
  });

  return elements;
}

/**
 * Modular Monolithic Architecture Template
 */
export function getModularMonolithTemplate() {
  const elements = [];

  // Group: Modular Monolith Boundary
  elements.push({
    id: generateId(),
    type: 'group-boundary',
    x: 320,
    y: 80,
    width: 780,
    height: 520,
    title: 'Modular Monolith Application Core (Bounded Contexts & Event Bus)',
    strokeColor: '#7950f2',
    backgroundColor: 'rgba(243, 240, 255, 0.45)',
    strokeStyle: 'solid',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // Client
  elements.push({
    id: generateId(),
    type: 'node',
    x: 50,
    y: 250,
    width: 200,
    height: 80,
    title: 'Single Page App',
    subtitle: 'React / Next.js SPA',
    badge: 'CLIENT',
    icon: 'Globe',
    themeColor: '#1971c2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // In-Process Event Dispatcher
  elements.push({
    id: generateId(),
    type: 'node',
    x: 360,
    y: 130,
    width: 700,
    height: 70,
    title: 'In-Process Domain Event Bus (MediatR / Guava EventBus)',
    subtitle: 'Zero Network Overhead · Decoupled Pub/Sub Between Modules',
    badge: 'INTERNAL EVENT BUS',
    icon: 'Activity',
    themeColor: '#7950f2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Module 1: Auth Module
  elements.push({
    id: generateId(),
    type: 'node',
    x: 360,
    y: 240,
    width: 210,
    height: 80,
    title: 'Auth & Identity Module',
    subtitle: 'Users, Roles, Sessions',
    badge: 'MODULE A',
    icon: 'Shield',
    themeColor: '#2f9e44',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Module 2: Orders Module
  elements.push({
    id: generateId(),
    type: 'node',
    x: 600,
    y: 240,
    width: 210,
    height: 80,
    title: 'Order Processing Module',
    subtitle: 'Cart, Checkout, State Engine',
    badge: 'MODULE B',
    icon: 'Cpu',
    themeColor: '#1971c2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Module 3: Billing Module
  elements.push({
    id: generateId(),
    type: 'node',
    x: 840,
    y: 240,
    width: 220,
    height: 80,
    title: 'Billing & Invoice Module',
    subtitle: 'Stripe API, Receipts, Tax',
    badge: 'MODULE C',
    icon: 'Terminal',
    themeColor: '#f08c00',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Module 4: Notification Module
  elements.push({
    id: generateId(),
    type: 'node',
    x: 360,
    y: 380,
    width: 210,
    height: 80,
    title: 'Notification Module',
    subtitle: 'Transactional Email & SMS',
    badge: 'MODULE D',
    icon: 'MessageSquare',
    themeColor: '#e03131',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Module 5: Inventory Module
  elements.push({
    id: generateId(),
    type: 'node',
    x: 600,
    y: 380,
    width: 210,
    height: 80,
    title: 'Inventory & Warehouse',
    subtitle: 'Stock Allocations, SKUs',
    badge: 'MODULE E',
    icon: 'Boxes',
    themeColor: '#0ca678',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Database with Segregated Schemas
  elements.push({
    id: generateId(),
    type: 'node',
    x: 840,
    y: 380,
    width: 220,
    height: 80,
    title: 'Modular Postgres DB',
    subtitle: 'Schemas: auth, orders, billing',
    badge: 'DATA ISOLATION',
    icon: 'Postgres',
    themeColor: '#336791',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Connectors
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 250,
    y: 290,
    width: 110,
    height: 0,
    label: 'REST API Request',
    direction: 'forward',
    strokeColor: '#1971c2',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 705,
    y: 240,
    width: 0,
    height: -40,
    label: 'OrderPlacedEvent',
    direction: 'forward',
    strokeColor: '#7950f2',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 950,
    y: 200,
    width: 0,
    height: 40,
    label: 'Consume Event',
    direction: 'forward',
    strokeColor: '#7950f2',
    isAnimated: true,
    seed: generateSeed()
  });

  return elements;
}

/**
 * Microservices Cloud Architecture Template
 */
export function getMicroservicesTemplate() {
  const elements = [];

  // Group: Private VPC Boundary
  elements.push({
    id: generateId(),
    type: 'group-boundary',
    x: 350,
    y: 80,
    width: 780,
    height: 520,
    title: 'Cloud Microservices Cluster (Kubernetes / Mesh)',
    strokeColor: '#1971c2',
    backgroundColor: 'rgba(231, 245, 255, 0.45)',
    strokeStyle: 'dashed',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // Client Tier
  elements.push({
    id: generateId(),
    type: 'node',
    x: 60,
    y: 230,
    width: 220,
    height: 80,
    title: 'Client Web & Mobile',
    subtitle: 'React / Next.js / iOS / Android',
    badge: 'PUBLIC CLIENT',
    icon: 'Globe',
    themeColor: '#1971c2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // API Gateway
  elements.push({
    id: generateId(),
    type: 'node',
    x: 390,
    y: 230,
    width: 210,
    height: 80,
    title: 'API Gateway',
    subtitle: 'Kong / Envoy Proxy',
    badge: 'INGRESS',
    icon: 'Network',
    themeColor: '#e03131',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Service 1: Auth
  elements.push({
    id: generateId(),
    type: 'node',
    x: 680,
    y: 130,
    width: 200,
    height: 80,
    title: 'Auth Service',
    subtitle: 'OAuth2 / OpenID Connect',
    badge: 'SECURITY',
    icon: 'Shield',
    themeColor: '#2f9e44',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Service 2: Orders
  elements.push({
    id: generateId(),
    type: 'node',
    x: 680,
    y: 250,
    width: 200,
    height: 80,
    title: 'Order Service',
    subtitle: 'Go / gRPC · Port 50051',
    badge: 'CORE SERVICE',
    icon: 'Server',
    themeColor: '#1971c2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Service 3: Payments
  elements.push({
    id: generateId(),
    type: 'node',
    x: 680,
    y: 370,
    width: 200,
    height: 80,
    title: 'Payment Service',
    subtitle: 'Node.js · Stripe Connector',
    badge: 'FINANCIAL',
    icon: 'Terminal',
    themeColor: '#f08c00',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Redis Cache
  elements.push({
    id: generateId(),
    type: 'node',
    x: 930,
    y: 130,
    width: 180,
    height: 80,
    title: 'Redis Cache',
    subtitle: 'Cluster Mode · TTL 3600',
    badge: 'IN-MEMORY',
    icon: 'Redis',
    themeColor: '#dc382d',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Postgres DB
  elements.push({
    id: generateId(),
    type: 'node',
    x: 930,
    y: 250,
    width: 180,
    height: 80,
    title: 'PostgreSQL DB',
    subtitle: 'Multi-AZ · Dedicated Schema',
    badge: 'DATABASE',
    icon: 'Postgres',
    themeColor: '#336791',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Kafka Event Bus
  elements.push({
    id: generateId(),
    type: 'node',
    x: 930,
    y: 370,
    width: 180,
    height: 80,
    title: 'Kafka Event Bus',
    subtitle: 'Partitions 12 · RF 3',
    badge: 'EVENT STREAM',
    icon: 'Kafka',
    themeColor: '#231f20',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Connectors
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 280,
    y: 270,
    width: 110,
    height: 0,
    label: 'HTTPS / JSON',
    direction: 'forward',
    strokeColor: '#1971c2',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 600,
    y: 250,
    width: 80,
    height: -80,
    label: 'JWT Verify',
    direction: 'bidirectional',
    strokeColor: '#2f9e44',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 600,
    y: 270,
    width: 80,
    height: 20,
    label: 'gRPC Call',
    direction: 'forward',
    strokeColor: '#1971c2',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 880,
    y: 170,
    width: 50,
    height: 0,
    label: 'Cache Get/Set',
    direction: 'bidirectional',
    strokeColor: '#dc382d',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 880,
    y: 290,
    width: 50,
    height: 0,
    label: 'SQL Query',
    direction: 'bidirectional',
    strokeColor: '#336791',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 880,
    y: 410,
    width: 50,
    height: 0,
    label: 'Publish Event',
    direction: 'forward',
    strokeColor: '#f08c00',
    isAnimated: true,
    seed: generateSeed()
  });

  return elements;
}

// ============================================================================
// 3. UML DIAGRAMS: Flowcharts, Sequence Diagrams, State Machines
// ============================================================================

/**
 * UML Activity Diagram Template (Swimlane Process)
 * Matches Eraser.io "Employee Expense Reimbursement — End-to-End Process" with Swimlanes
 */
export function getActivityDiagramTemplate() {
  const elements = [];

  // Title Text Block
  elements.push({
    id: generateId(),
    type: 'text',
    x: 50,
    y: 30,
    text: 'Employee Expense Reimbursement — End-to-End Process',
    fontSize: 22,
    strokeColor: '#1e1e1e',
    seed: generateSeed()
  });

  // 4 Horizontal Swimlanes
  const lanes = [
    { title: '👤 Employee', y: 70, height: 130, color: '#1971c2' },
    { title: '👔 Manager', y: 210, height: 130, color: '#2f9e44' },
    { title: '🏦 Finance / AP System', y: 350, height: 130, color: '#7950f2' },
    { title: '💳 Payment & Audit', y: 490, height: 130, color: '#f76707' }
  ];

  lanes.forEach(l => {
    elements.push({
      id: generateId(),
      type: 'swimlane',
      x: 50,
      y: l.y,
      width: 1100,
      height: l.height,
      title: l.title,
      color: l.color,
      seed: generateSeed()
    });
  });

  // --- Lane 1: Employee ---
  elements.push({
    id: generateId(),
    type: 'node',
    x: 120,
    y: 110,
    width: 140,
    height: 50,
    title: 'Fill Worksheet',
    subtitle: 'Enter itemized amounts',
    badge: 'START',
    icon: 'Activity',
    themeColor: '#1971c2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 300,
    y: 110,
    width: 150,
    height: 50,
    title: 'Collect Receipts',
    subtitle: 'Invoices & proofs',
    badge: 'ATTACH',
    icon: 'Boxes',
    themeColor: '#1971c2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 490,
    y: 110,
    width: 170,
    height: 50,
    title: 'Create Expense Report',
    subtitle: 'OCR scan & auto-fill',
    badge: 'OCR AUTO',
    icon: 'Cpu',
    themeColor: '#1971c2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Decision 1: Receipts Valid?
  elements.push({
    id: generateId(),
    type: 'diamond',
    x: 700,
    y: 95,
    width: 120,
    height: 80,
    strokeColor: '#f08c00',
    backgroundColor: '#fff9db',
    fillStyle: 'solid',
    strokeWidth: 2,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'text',
    x: 720,
    y: 125,
    text: 'Receipts Valid?',
    fontSize: 13,
    strokeColor: '#d9480f',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 870,
    y: 110,
    width: 160,
    height: 50,
    title: 'Submit for Approval',
    subtitle: 'Lock claim items',
    badge: 'SUBMIT',
    icon: 'Shield',
    themeColor: '#1971c2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // --- Lane 2: Manager ---
  elements.push({
    id: generateId(),
    type: 'node',
    x: 300,
    y: 250,
    width: 150,
    height: 50,
    title: 'Approval Queue',
    subtitle: 'Assigned to manager',
    badge: 'QUEUE',
    icon: 'Network',
    themeColor: '#2f9e44',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 490,
    y: 250,
    width: 170,
    height: 50,
    title: 'Review the Claim',
    subtitle: 'Budget & policy check',
    badge: 'AUDIT',
    icon: 'Terminal',
    themeColor: '#2f9e44',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Decision 2: Manager Decision
  elements.push({
    id: generateId(),
    type: 'diamond',
    x: 700,
    y: 235,
    width: 120,
    height: 80,
    strokeColor: '#f08c00',
    backgroundColor: '#fff9db',
    fillStyle: 'solid',
    strokeWidth: 2,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'text',
    x: 722,
    y: 265,
    text: 'Decision?',
    fontSize: 14,
    strokeColor: '#d9480f',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 870,
    y: 250,
    width: 160,
    height: 50,
    title: 'Approve & Sign-Off',
    subtitle: 'Digital signature applied',
    badge: 'APPROVED',
    icon: 'Shield',
    themeColor: '#2f9e44',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // --- Lane 3: Finance / AP System ---
  elements.push({
    id: generateId(),
    type: 'node',
    x: 300,
    y: 390,
    width: 150,
    height: 50,
    title: 'AP ERP Intake',
    subtitle: 'SAP/NetSuite ingestion',
    badge: 'ERP INTAKE',
    icon: 'Server',
    themeColor: '#7950f2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 490,
    y: 390,
    width: 170,
    height: 50,
    title: 'Tax & Compliance Check',
    subtitle: 'VAT & GL account code',
    badge: 'TAX CODE',
    icon: 'Cpu',
    themeColor: '#7950f2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Decision 3: Amount > $5k?
  elements.push({
    id: generateId(),
    type: 'diamond',
    x: 700,
    y: 375,
    width: 120,
    height: 80,
    strokeColor: '#f08c00',
    backgroundColor: '#fff9db',
    fillStyle: 'solid',
    strokeWidth: 2,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'text',
    x: 725,
    y: 405,
    text: '> $5,000?',
    fontSize: 14,
    strokeColor: '#d9480f',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 870,
    y: 390,
    width: 160,
    height: 50,
    title: 'Controller Clearance',
    subtitle: 'Executive override ok',
    badge: 'DIRECTOR OK',
    icon: 'Zap',
    themeColor: '#7950f2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // --- Lane 4: Payment & Audit ---
  elements.push({
    id: generateId(),
    type: 'node',
    x: 300,
    y: 530,
    width: 150,
    height: 50,
    title: 'Generate Payment Run',
    subtitle: 'Scheduled batch run',
    badge: 'PAYMENT BATCH',
    icon: 'Activity',
    themeColor: '#f76707',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 490,
    y: 530,
    width: 170,
    height: 50,
    title: 'Bank ACH Transfer',
    subtitle: 'Direct deposit dispatch',
    badge: 'ACH WIRE',
    icon: 'Globe',
    themeColor: '#f76707',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 700,
    y: 530,
    width: 160,
    height: 50,
    title: 'Payment Settled',
    subtitle: 'Bank webhook confirmation',
    badge: 'CONFIRMED',
    icon: 'Shield',
    themeColor: '#2f9e44',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 900,
    y: 530,
    width: 140,
    height: 50,
    title: 'Investigated & Filed',
    subtitle: 'Audit record locked',
    badge: 'TERMINAL',
    icon: 'Boxes',
    themeColor: '#2f9e44',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Flow Connectors
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 260,
    y: 135,
    width: 40,
    height: 0,
    direction: 'forward',
    strokeColor: '#1971c2',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 450,
    y: 135,
    width: 40,
    height: 0,
    direction: 'forward',
    strokeColor: '#1971c2',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 660,
    y: 135,
    width: 40,
    height: 0,
    direction: 'forward',
    strokeColor: '#1971c2',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 820,
    y: 135,
    width: 50,
    height: 0,
    label: 'Yes',
    direction: 'forward',
    strokeColor: '#2f9e44',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 950,
    y: 160,
    width: -500,
    height: 90,
    label: 'Notify Manager',
    direction: 'forward',
    strokeColor: '#2f9e44',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 450,
    y: 275,
    width: 40,
    height: 0,
    direction: 'forward',
    strokeColor: '#2f9e44',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 660,
    y: 275,
    width: 40,
    height: 0,
    direction: 'forward',
    strokeColor: '#2f9e44',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 820,
    y: 275,
    width: 50,
    height: 0,
    label: 'Approve',
    direction: 'forward',
    strokeColor: '#2f9e44',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 760,
    y: 235,
    width: -350,
    height: -75,
    label: 'Reject / Revise',
    direction: 'forward',
    strokeColor: '#e03131',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 950,
    y: 300,
    width: -500,
    height: 90,
    label: 'Forward to AP',
    direction: 'forward',
    strokeColor: '#7950f2',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 450,
    y: 415,
    width: 40,
    height: 0,
    direction: 'forward',
    strokeColor: '#7950f2',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 660,
    y: 415,
    width: 40,
    height: 0,
    direction: 'forward',
    strokeColor: '#7950f2',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 820,
    y: 415,
    width: 50,
    height: 0,
    label: 'Yes (> $5k)',
    direction: 'forward',
    strokeColor: '#7950f2',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 950,
    y: 440,
    width: -500,
    height: 90,
    label: 'Release Payment',
    direction: 'forward',
    strokeColor: '#f76707',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 450,
    y: 555,
    width: 40,
    height: 0,
    direction: 'forward',
    strokeColor: '#f76707',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 660,
    y: 555,
    width: 40,
    height: 0,
    direction: 'forward',
    strokeColor: '#2f9e44',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 860,
    y: 555,
    width: 40,
    height: 0,
    direction: 'forward',
    strokeColor: '#2f9e44',
    isAnimated: true,
    seed: generateSeed()
  });

  return elements;
}

export const getFlowchartTemplate = getActivityDiagramTemplate;

/**
 * UML Logic Flow Chart Diagram Template
 * Traditional algorithm / software control flow: Start/End pills, Decision Diamonds, Action steps
 */
export function getLogicFlowchartTemplate() {
  const elements = [];

  // Group Boundary
  elements.push({
    id: generateId(),
    type: 'group-boundary',
    x: 60,
    y: 40,
    width: 1040,
    height: 520,
    title: 'Software Logic & User Authentication Flowchart',
    strokeColor: '#2b8a3e',
    backgroundColor: 'rgba(235, 251, 238, 0.3)',
    strokeStyle: 'solid',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // 1. Start Pill
  elements.push({
    id: generateId(),
    type: 'node',
    x: 100,
    y: 120,
    width: 130,
    height: 50,
    title: 'START',
    subtitle: 'Submit Login Form',
    badge: 'BEGIN',
    icon: 'Activity',
    themeColor: '#2b8a3e',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Start -> Input Step Arrow
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 230,
    y: 145,
    width: 60,
    height: 0,
    direction: 'forward',
    strokeColor: '#2b8a3e',
    isAnimated: true,
    seed: generateSeed()
  });

  // 2. Input Step: Receive Credentials
  elements.push({
    id: generateId(),
    type: 'node',
    x: 290,
    y: 115,
    width: 160,
    height: 60,
    title: 'Receive Credentials',
    subtitle: 'email, password_hash',
    badge: 'INPUT',
    icon: 'Terminal',
    themeColor: '#1971c2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Input -> Decision 1 Arrow
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 450,
    y: 145,
    width: 60,
    height: 0,
    direction: 'forward',
    strokeColor: '#1971c2',
    isAnimated: true,
    seed: generateSeed()
  });

  // 3. Decision 1: Is Email & Password Valid? (Diamond)
  elements.push({
    id: generateId(),
    type: 'diamond',
    x: 510,
    y: 105,
    width: 120,
    height: 80,
    strokeColor: '#f08c00',
    backgroundColor: '#fff9db',
    fillStyle: 'solid',
    strokeWidth: 2,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'text',
    x: 530,
    y: 135,
    text: 'Valid Input?',
    fontSize: 13,
    strokeColor: '#d9480f',
    seed: generateSeed()
  });

  // Decision 1 [No] -> Display Validation Error (Downwards)
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 570,
    y: 185,
    width: 0,
    height: 80,
    label: '[No] Invalid',
    direction: 'forward',
    strokeColor: '#e03131',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 495,
    y: 265,
    width: 150,
    height: 55,
    title: 'Return 400 Bad Request',
    subtitle: 'Validation errors array',
    badge: 'REJECT',
    icon: 'Shield',
    themeColor: '#e03131',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Decision 1 [Yes] -> Query DB
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 630,
    y: 145,
    width: 70,
    height: 0,
    label: '[Yes]',
    direction: 'forward',
    strokeColor: '#2b8a3e',
    isAnimated: true,
    seed: generateSeed()
  });

  // 4. Process: Query User & Verify Argon2 Hash
  elements.push({
    id: generateId(),
    type: 'node',
    x: 700,
    y: 115,
    width: 170,
    height: 60,
    title: 'Verify Password Hash',
    subtitle: 'Argon2id verify against DB',
    badge: 'CRYPTO',
    icon: 'Postgres',
    themeColor: '#1971c2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Process -> Decision 2 Arrow
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 870,
    y: 145,
    width: 60,
    height: 0,
    direction: 'forward',
    strokeColor: '#1971c2',
    isAnimated: true,
    seed: generateSeed()
  });

  // 5. Decision 2: Password Match?
  elements.push({
    id: generateId(),
    type: 'diamond',
    x: 930,
    y: 105,
    width: 120,
    height: 80,
    strokeColor: '#f08c00',
    backgroundColor: '#fff9db',
    fillStyle: 'solid',
    strokeWidth: 2,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'text',
    x: 948,
    y: 135,
    text: 'Hash Match?',
    fontSize: 13,
    strokeColor: '#d9480f',
    seed: generateSeed()
  });

  // Decision 2 [No] -> 401 Unauthorized
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 990,
    y: 185,
    width: 0,
    height: 80,
    label: '[No] Mismatch',
    direction: 'forward',
    strokeColor: '#e03131',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 910,
    y: 265,
    width: 160,
    height: 55,
    title: 'Return 401 Unauthorized',
    subtitle: 'Audit failed attempt',
    badge: 'AUTH FAILED',
    icon: 'Shield',
    themeColor: '#e03131',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Decision 2 [Yes] -> Generate JWT & Token (Downwards)
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 990,
    y: 185,
    width: -200,
    height: 185,
    label: '[Yes] Matched',
    direction: 'forward',
    strokeColor: '#2b8a3e',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'node',
    x: 700,
    y: 370,
    width: 180,
    height: 60,
    title: 'Issue Session & JWT',
    subtitle: 'Sign payload with RS256 key',
    badge: 'TOKEN GEN',
    icon: 'Zap',
    themeColor: '#2b8a3e',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Token -> End Pill Arrow
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 880,
    y: 400,
    width: 70,
    height: 0,
    direction: 'forward',
    strokeColor: '#2b8a3e',
    isAnimated: true,
    seed: generateSeed()
  });

  // 6. End Pill: 200 OK
  elements.push({
    id: generateId(),
    type: 'node',
    x: 950,
    y: 375,
    width: 130,
    height: 50,
    title: 'END (200 OK)',
    subtitle: 'Set-Cookie: HttpOnly',
    badge: 'TERMINAL',
    icon: 'Activity',
    themeColor: '#2b8a3e',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  return elements;
}

/**
 * UML Sequence Diagram Template
 * Real Eraser.io Sequence Diagram: Lifeline Headers, Continuous Dashed Lifelines,
 * Execution Activation Bars, Horizontal Request & Return Message Arrows
 */
export function getSequenceTemplate() {
  const elements = [];

  // Title
  elements.push({
    id: generateId(),
    type: 'text',
    x: 100,
    y: 30,
    text: 'User Authentication & Authorization Protocol — OAuth2 / JWT Flow',
    fontSize: 22,
    strokeColor: '#1e1e1e',
    seed: generateSeed()
  });

  // Lifeline Participants
  const participants = [
    { name: 'Browser Client', role: 'ACTOR', x: 100, color: '#1971c2', icon: 'Globe' },
    { name: 'API Gateway', role: 'INGRESS', x: 400, color: '#e03131', icon: 'Network' },
    { name: 'Auth Microservice', role: 'SERVICE', x: 700, color: '#2f9e44', icon: 'Shield' },
    { name: 'PostgreSQL DB', role: 'DATABASE', x: 980, color: '#336791', icon: 'Postgres' }
  ];

  // Draw Top Participant Headers & Continuous Vertical Lifelines
  for (const p of participants) {
    const centerX = p.x + 90;

    // Top Participant Card
    elements.push({
      id: generateId(),
      type: 'node',
      x: p.x,
      y: 75,
      width: 180,
      height: 60,
      title: p.name,
      subtitle: `Lifeline (${p.role})`,
      badge: p.role,
      icon: p.icon,
      themeColor: p.color,
      backgroundColor: '#ffffff',
      cardStyle: 'modern',
      seed: generateSeed()
    });

    // Continuous Vertical Dashed Lifeline
    elements.push({
      id: generateId(),
      type: 'line',
      x: centerX,
      y: 135,
      width: 0,
      height: 490,
      strokeColor: '#adb5bd',
      strokeWidth: 1.5,
      strokeStyle: 'dashed',
      seed: generateSeed()
    });

    // Bottom Participant Card (Mirroring for readability)
    elements.push({
      id: generateId(),
      type: 'node',
      x: p.x,
      y: 630,
      width: 180,
      height: 50,
      title: p.name,
      subtitle: p.role,
      badge: p.role,
      icon: p.icon,
      themeColor: p.color,
      backgroundColor: '#ffffff',
      cardStyle: 'modern',
      seed: generateSeed()
    });
  }

  // Lifeline Activation Bars (Execution processing blocks)
  elements.push({
    id: generateId(),
    type: 'activation-box',
    x: 184,
    y: 180,
    width: 12,
    height: 420,
    color: '#1971c2',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'activation-box',
    x: 484,
    y: 195,
    width: 12,
    height: 380,
    color: '#e03131',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'activation-box',
    x: 784,
    y: 250,
    width: 12,
    height: 260,
    color: '#2f9e44',
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'activation-box',
    x: 1064,
    y: 310,
    width: 12,
    height: 90,
    color: '#336791',
    seed: generateSeed()
  });

  // Step 1: User -> Gateway (Synchronous Request)
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 196,
    y: 200,
    width: 288,
    height: 0,
    label: '1. POST /api/v1/auth/login',
    direction: 'forward',
    strokeColor: '#1971c2',
    isAnimated: true,
    seed: generateSeed()
  });

  // Step 2: Gateway -> Auth (gRPC Validate)
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 496,
    y: 260,
    width: 288,
    height: 0,
    label: '2. gRPC ValidateCredentials()',
    direction: 'forward',
    strokeColor: '#e03131',
    isAnimated: true,
    seed: generateSeed()
  });

  // Step 3: Auth -> DB (SELECT * FROM users)
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 796,
    y: 320,
    width: 268,
    height: 0,
    label: '3. SELECT user WHERE email = ?',
    direction: 'forward',
    strokeColor: '#336791',
    isAnimated: true,
    seed: generateSeed()
  });

  // Step 4: DB -> Auth (Return Record - Dashed Return Arrow)
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 1064,
    y: 390,
    width: -268,
    height: 0,
    label: '4. Row { id, password_hash }',
    direction: 'forward',
    strokeColor: '#336791',
    strokeStyle: 'dashed',
    isAnimated: true,
    seed: generateSeed()
  });

  // Step 5: Auth Internal Computation / Compare Hash
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 796,
    y: 435,
    width: 50,
    height: 25,
    label: '5. Compare Hash & Sign JWT',
    direction: 'forward',
    strokeColor: '#2f9e44',
    isAnimated: true,
    seed: generateSeed()
  });

  // Step 6: Auth -> Gateway (Return JWT Token - Dashed Return Arrow)
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 784,
    y: 500,
    width: -288,
    height: 0,
    label: '6. Signed JWT Bearer Token',
    direction: 'forward',
    strokeColor: '#2f9e44',
    strokeStyle: 'dashed',
    isAnimated: true,
    seed: generateSeed()
  });

  // Step 7: Gateway -> User (200 OK + Set-Cookie - Dashed Return Arrow)
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 484,
    y: 570,
    width: -288,
    height: 0,
    label: '7. 200 OK (Set-Cookie: HttpOnly)',
    direction: 'forward',
    strokeColor: '#1971c2',
    strokeStyle: 'dashed',
    isAnimated: true,
    seed: generateSeed()
  });

  return elements;
}

/**
 * UML State Machine Template
 */
export function getStateMachineTemplate() {
  const elements = [];

  // Group: State Machine Boundary
  elements.push({
    id: generateId(),
    type: 'group-boundary',
    x: 60,
    y: 50,
    width: 1040,
    height: 520,
    title: 'Order Lifecycle State Machine (UML 2.5 Statechart)',
    strokeColor: '#f76707',
    backgroundColor: 'rgba(255, 244, 230, 0.35)',
    strokeStyle: 'dashed',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // Initial State ●
  elements.push({
    id: generateId(),
    type: 'state-node',
    stateType: 'initial',
    x: 100,
    y: 220,
    width: 28,
    height: 28,
    color: '#1e1e1e',
    seed: generateSeed()
  });

  // Initial -> Draft Arrow
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 128,
    y: 234,
    width: 72,
    height: 0,
    direction: 'forward',
    strokeColor: '#1e1e1e',
    isAnimated: true,
    seed: generateSeed()
  });

  // State 1: Draft
  elements.push({
    id: generateId(),
    type: 'state-node',
    stateType: 'state',
    x: 200,
    y: 190,
    width: 200,
    height: 100,
    title: 'Draft',
    color: '#495057',
    actions: [
      'entry / initCartSession()',
      'do / updateLineItems()',
      'exit / freezeCartPrices()'
    ],
    seed: generateSeed()
  });

  // Draft -> Under Review Arrow
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 400,
    y: 240,
    width: 90,
    height: 0,
    label: 'checkout_submitted()',
    direction: 'forward',
    strokeColor: '#f08c00',
    isAnimated: true,
    seed: generateSeed()
  });

  // State 2: Under Review
  elements.push({
    id: generateId(),
    type: 'state-node',
    stateType: 'state',
    x: 490,
    y: 190,
    width: 210,
    height: 105,
    title: 'Under Review',
    color: '#f08c00',
    actions: [
      'entry / placeInventoryHold()',
      'do / calculateFraudRisk()',
      'exit / logAuditTrail()'
    ],
    seed: generateSeed()
  });

  // Under Review -> Decision Diamond
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 700,
    y: 242,
    width: 50,
    height: 0,
    direction: 'forward',
    strokeColor: '#f08c00',
    isAnimated: true,
    seed: generateSeed()
  });

  // Decision Choice Point (Diamond)
  elements.push({
    id: generateId(),
    type: 'diamond',
    x: 750,
    y: 222,
    width: 44,
    height: 44,
    label: '',
    strokeColor: '#f08c00',
    backgroundColor: '#fff9db',
    fillStyle: 'solid',
    seed: generateSeed()
  });

  // Diamond -> Approved / Processing
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 772,
    y: 222,
    width: 68,
    height: -82,
    label: '[risk < 0.20] / approve()',
    direction: 'forward',
    strokeColor: '#2b8a3e',
    isAnimated: true,
    seed: generateSeed()
  });

  // State 3: Processing (Approved)
  elements.push({
    id: generateId(),
    type: 'state-node',
    stateType: 'state',
    x: 840,
    y: 90,
    width: 210,
    height: 100,
    title: 'Processing',
    color: '#2b8a3e',
    actions: [
      'entry / capturePayment()',
      'do / routeToWarehouse()',
      'exit / printShippingLabel()'
    ],
    seed: generateSeed()
  });

  // Diamond -> Rejected / Void
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 772,
    y: 266,
    width: 68,
    height: 84,
    label: '[risk >= 0.20] / reject()',
    direction: 'forward',
    strokeColor: '#e03131',
    isAnimated: true,
    seed: generateSeed()
  });

  // State 4: Rejected / Void
  elements.push({
    id: generateId(),
    type: 'state-node',
    stateType: 'state',
    x: 840,
    y: 300,
    width: 210,
    height: 100,
    title: 'Rejected',
    color: '#e03131',
    actions: [
      'entry / releaseInventoryHold()',
      'do / notifyCustomerEmail()',
      'exit / archiveRecord()'
    ],
    seed: generateSeed()
  });

  // Processing -> Delivered Arrow
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 945,
    y: 190,
    width: 0,
    height: 250,
    label: 'delivered_signed()',
    direction: 'forward',
    strokeColor: '#1971c2',
    isAnimated: true,
    seed: generateSeed()
  });

  // Final State ◉ (Delivered / Fulfilled)
  elements.push({
    id: generateId(),
    type: 'state-node',
    stateType: 'final',
    x: 931,
    y: 440,
    width: 28,
    height: 28,
    color: '#1971c2',
    seed: generateSeed()
  });

  return elements;
}

// ============================================================================
// 4. DATABASE: Relational Schema (ERD)
// ============================================================================

/**
 * Database Schema (ERD) Template
 */
export function getErdTemplate() {
  const elements = [];

  // Group: Database Schema Boundary
  elements.push({
    id: generateId(),
    type: 'group-boundary',
    x: 40,
    y: 50,
    width: 1100,
    height: 560,
    title: 'PostgreSQL Relational Schema (Commerce Domain)',
    strokeColor: '#336791',
    backgroundColor: 'rgba(235, 245, 255, 0.35)',
    strokeStyle: 'solid',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // Table 1: users (PK: id)
  elements.push({
    id: generateId(),
    type: 'erd-table',
    x: 80,
    y: 110,
    width: 270,
    height: 190,
    tableName: 'users',
    tableType: 'TABLE',
    themeColor: '#336791',
    columns: [
      { key: 'PK', name: 'id', type: 'uuid' },
      { key: null, name: 'email', type: 'varchar(255)' },
      { key: null, name: 'full_name', type: 'varchar(100)' },
      { key: null, name: 'password_hash', type: 'varchar(255)' },
      { key: null, name: 'role', type: 'varchar(50)' },
      { key: null, name: 'created_at', type: 'timestamp' }
    ],
    seed: generateSeed()
  });

  // Table 2: orders (PK: id, FK: user_id)
  elements.push({
    id: generateId(),
    type: 'erd-table',
    x: 450,
    y: 110,
    width: 280,
    height: 190,
    tableName: 'orders',
    tableType: 'TABLE',
    themeColor: '#1971c2',
    columns: [
      { key: 'PK', name: 'id', type: 'uuid' },
      { key: 'FK', name: 'user_id', type: 'uuid' },
      { key: null, name: 'order_status', type: 'varchar(30)' },
      { key: null, name: 'total_cents', type: 'integer' },
      { key: null, name: 'currency', type: 'varchar(3)' },
      { key: null, name: 'created_at', type: 'timestamp' }
    ],
    seed: generateSeed()
  });

  // Table 3: payments (PK: id, FK: order_id)
  elements.push({
    id: generateId(),
    type: 'erd-table',
    x: 820,
    y: 110,
    width: 280,
    height: 190,
    tableName: 'payments',
    tableType: 'TABLE',
    themeColor: '#f08c00',
    columns: [
      { key: 'PK', name: 'id', type: 'uuid' },
      { key: 'FK', name: 'order_id', type: 'uuid' },
      { key: null, name: 'provider', type: 'varchar(40)' },
      { key: null, name: 'charge_id', type: 'varchar(120)' },
      { key: null, name: 'amount_cents', type: 'integer' },
      { key: null, name: 'status', type: 'varchar(30)' }
    ],
    seed: generateSeed()
  });

  // Table 4: products (PK: id)
  elements.push({
    id: generateId(),
    type: 'erd-table',
    x: 80,
    y: 360,
    width: 270,
    height: 190,
    tableName: 'products',
    tableType: 'TABLE',
    themeColor: '#0ca678',
    columns: [
      { key: 'PK', name: 'id', type: 'uuid' },
      { key: null, name: 'sku', type: 'varchar(60)' },
      { key: null, name: 'title', type: 'varchar(200)' },
      { key: null, name: 'price_cents', type: 'integer' },
      { key: null, name: 'stock_quantity', type: 'integer' },
      { key: null, name: 'is_active', type: 'boolean' }
    ],
    seed: generateSeed()
  });

  // Table 5: order_items (PK: id, FK: order_id, product_id)
  elements.push({
    id: generateId(),
    type: 'erd-table',
    x: 450,
    y: 360,
    width: 280,
    height: 190,
    tableName: 'order_items',
    tableType: 'TABLE',
    themeColor: '#7950f2',
    columns: [
      { key: 'PK', name: 'id', type: 'uuid' },
      { key: 'FK', name: 'order_id', type: 'uuid' },
      { key: 'FK', name: 'product_id', type: 'uuid' },
      { key: null, name: 'quantity', type: 'integer' },
      { key: null, name: 'unit_price', type: 'integer' },
      { key: null, name: 'created_at', type: 'timestamp' }
    ],
    seed: generateSeed()
  });

  // Cardinality Connectors:
  // users -> orders (1 : N)
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 350,
    y: 190,
    width: 100,
    height: 0,
    label: '1 : N (user_id)',
    direction: 'forward',
    strokeColor: '#336791',
    isAnimated: true,
    seed: generateSeed()
  });

  // orders -> payments (1 : 1)
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 730,
    y: 190,
    width: 90,
    height: 0,
    label: '1 : 1 (order_id)',
    direction: 'forward',
    strokeColor: '#f08c00',
    isAnimated: true,
    seed: generateSeed()
  });

  // orders -> order_items (1 : N)
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 590,
    y: 300,
    width: 0,
    height: 60,
    label: '1 : N (order_id)',
    direction: 'forward',
    strokeColor: '#1971c2',
    isAnimated: true,
    seed: generateSeed()
  });

  // products -> order_items (1 : N)
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 350,
    y: 440,
    width: 100,
    height: 0,
    label: '1 : N (product_id)',
    direction: 'forward',
    strokeColor: '#0ca678',
    isAnimated: true,
    seed: generateSeed()
  });

  return elements;
}

// ============================================================================
// Sprint 3 System Design & Quantitative Modeling Templates
// ============================================================================

/**
 * E-Commerce Flash Sale Architecture with Quantitative Telemetry & SPOF
 */
export function getFlashSaleTemplate() {
  const elements = [];

  // Cloud VPC Boundary
  elements.push({
    id: 'vpc-flash-sale',
    type: 'group-boundary',
    boundaryType: 'vpc',
    subtype: 'vpc',
    x: 260,
    y: 80,
    width: 900,
    height: 520,
    title: 'AWS Production VPC (us-east-1)',
    cidr: '10.0.0.0/16',
    strokeColor: '#1971c2',
    backgroundColor: 'rgba(231, 245, 255, 0.4)',
    strokeStyle: 'solid',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // Client Node
  elements.push({
    id: 'node-client',
    type: 'node',
    x: 30,
    y: 280,
    width: 190,
    height: 85,
    title: 'Mobile / Web Shoppers',
    subtitle: 'Flash Sale Flash Crowd',
    badge: 'CLIENT',
    icon: 'Smartphone',
    themeColor: '#f08c00',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // CloudFront CDN Edge
  elements.push({
    id: 'node-cdn',
    type: 'node',
    c4Level: 'container',
    x: 290,
    y: 280,
    width: 200,
    height: 85,
    title: 'CloudFront Edge CDN',
    subtitle: 'Static Assets & DDoS Shield',
    badge: 'EDGE',
    icon: 'Globe',
    latencyMs: 5,
    maxCapacityQps: 100000,
    themeColor: '#1971c2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Kong API Gateway
  elements.push({
    id: 'node-gw',
    type: 'node',
    c4Level: 'container',
    x: 540,
    y: 280,
    width: 200,
    height: 85,
    title: 'API Gateway Cluster',
    subtitle: 'Kong · Rate Limiting · Auth',
    badge: 'GATEWAY',
    icon: 'Shield',
    latencyMs: 8,
    maxCapacityQps: 60000,
    themeColor: '#0ca678',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Order Ingestion Microservice
  elements.push({
    id: 'node-order-svc',
    type: 'node',
    c4Level: 'component',
    x: 790,
    y: 200,
    width: 210,
    height: 85,
    title: 'Order Processing Service',
    subtitle: 'Go Microservice (30 Pods)',
    badge: 'SERVICE',
    icon: 'Cpu',
    latencyMs: 22,
    maxCapacityQps: 20000,
    themeColor: '#7950f2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Redis Inventory Cache
  elements.push({
    id: 'node-redis',
    type: 'node',
    c4Level: 'container',
    x: 790,
    y: 360,
    width: 210,
    height: 85,
    title: 'Redis Cluster (Memory)',
    subtitle: 'Atomic Stock Decrement',
    badge: 'CACHE',
    icon: 'Zap',
    latencyMs: 2,
    maxCapacityQps: 80000,
    themeColor: '#e03131',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Aurora Postgres DB (Single Point of Failure!)
  elements.push({
    id: 'node-db-primary',
    type: 'node',
    c4Level: 'container',
    x: 1040,
    y: 280,
    width: 200,
    height: 85,
    title: 'Aurora PostgreSQL Primary',
    subtitle: 'Write Master (Un-replicated SPOF)',
    badge: 'DATABASE',
    icon: 'Database',
    latencyMs: 38,
    maxCapacityQps: 8000,
    themeColor: '#1971c2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Connectors
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 220,
    y: 322,
    width: 70,
    height: 0,
    label: 'HTTPS / TLS',
    qps: 50000,
    latencyMs: 15,
    startBinding: { elementId: 'node-client' },
    endBinding: { elementId: 'node-cdn' },
    strokeColor: '#f08c00',
    strokeWidth: 2,
    direction: 'forward',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 490,
    y: 322,
    width: 50,
    height: 0,
    label: 'VPC Peering',
    qps: 50000,
    latencyMs: 3,
    startBinding: { elementId: 'node-cdn' },
    endBinding: { elementId: 'node-gw' },
    strokeColor: '#1971c2',
    strokeWidth: 2,
    direction: 'forward',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 740,
    y: 300,
    width: 50,
    height: -55,
    label: 'gRPC',
    qps: 35000,
    latencyMs: 2,
    startBinding: { elementId: 'node-gw' },
    endBinding: { elementId: 'node-order-svc' },
    strokeColor: '#0ca678',
    strokeWidth: 2,
    direction: 'forward',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 740,
    y: 345,
    width: 50,
    height: 55,
    label: 'RESP Protocol',
    qps: 15000,
    latencyMs: 1,
    startBinding: { elementId: 'node-gw' },
    endBinding: { elementId: 'node-redis' },
    strokeColor: '#e03131',
    strokeWidth: 2,
    direction: 'forward',
    isAnimated: true,
    seed: generateSeed()
  });

  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 1000,
    y: 260,
    width: 40,
    height: 40,
    label: 'SQL Write Tx',
    qps: 14000,
    latencyMs: 12,
    startBinding: { elementId: 'node-order-svc' },
    endBinding: { elementId: 'node-db-primary' },
    strokeColor: '#1971c2',
    strokeWidth: 2,
    direction: 'forward',
    isAnimated: true,
    seed: generateSeed()
  });

  return elements;
}

/**
 * Global Microservices with Multi-Region High Availability
 */
export function getGlobalHaTemplate() {
  const elements = [];

  // Global DNS
  elements.push({
    id: 'node-r53',
    type: 'node',
    c4Level: 'context',
    x: 520,
    y: 30,
    width: 240,
    height: 85,
    title: 'AWS Route53 Global DNS',
    subtitle: 'Latency-Based Geo Routing',
    badge: 'DNS',
    icon: 'Globe',
    latencyMs: 4,
    themeColor: '#ff9900',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Region 1: us-east-1 VPC
  elements.push({
    id: 'vpc-us-east',
    type: 'group-boundary',
    boundaryType: 'vpc',
    subtype: 'vpc',
    x: 60,
    y: 160,
    width: 540,
    height: 440,
    title: 'AWS Primary VPC (us-east-1)',
    cidr: '10.1.0.0/16',
    strokeColor: '#1971c2',
    backgroundColor: 'rgba(231, 245, 255, 0.4)',
    strokeStyle: 'solid',
    strokeWidth: 2,
    seed: generateSeed()
  });

  elements.push({
    id: 'node-alb-east',
    type: 'node',
    c4Level: 'container',
    x: 90,
    y: 240,
    width: 200,
    height: 85,
    title: 'Application Load Balancer',
    subtitle: 'Multi-AZ Active Ingress',
    badge: 'ALB',
    icon: 'Network',
    latencyMs: 6,
    maxCapacityQps: 50000,
    themeColor: '#1971c2',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: 'node-order-east',
    type: 'node',
    c4Level: 'component',
    x: 350,
    y: 240,
    width: 210,
    height: 85,
    title: 'Order Core Service',
    subtitle: 'ECS Fargate (Active us-east-1)',
    badge: 'SERVICE',
    icon: 'Cpu',
    latencyMs: 18,
    maxCapacityQps: 30000,
    themeColor: '#2b8a3e',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: 'node-db-east',
    type: 'node',
    c4Level: 'container',
    x: 220,
    y: 420,
    width: 220,
    height: 85,
    title: 'Aurora Global Database',
    subtitle: 'Primary Read/Write Cluster',
    badge: 'DATABASE',
    icon: 'Database',
    latencyMs: 15,
    maxCapacityQps: 40000,
    themeColor: '#1971c2',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Region 2: eu-central-1 VPC
  elements.push({
    id: 'vpc-eu-central',
    type: 'group-boundary',
    boundaryType: 'vpc',
    subtype: 'vpc',
    x: 680,
    y: 160,
    width: 540,
    height: 440,
    title: 'AWS Secondary VPC (eu-central-1)',
    cidr: '10.2.0.0/16',
    strokeColor: '#2b8a3e',
    backgroundColor: 'rgba(235, 251, 238, 0.4)',
    strokeStyle: 'solid',
    strokeWidth: 2,
    seed: generateSeed()
  });

  elements.push({
    id: 'node-alb-eu',
    type: 'node',
    c4Level: 'container',
    x: 710,
    y: 240,
    width: 200,
    height: 85,
    title: 'Application Load Balancer',
    subtitle: 'Multi-AZ Active Ingress',
    badge: 'ALB',
    icon: 'Network',
    latencyMs: 6,
    maxCapacityQps: 50000,
    themeColor: '#2b8a3e',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: 'node-order-eu',
    type: 'node',
    c4Level: 'component',
    x: 970,
    y: 240,
    width: 210,
    height: 85,
    title: 'Order Core Service',
    subtitle: 'ECS Fargate (Active eu-central)',
    badge: 'SERVICE',
    icon: 'Cpu',
    latencyMs: 18,
    maxCapacityQps: 30000,
    themeColor: '#2b8a3e',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: 'node-db-eu',
    type: 'node',
    c4Level: 'container',
    x: 840,
    y: 420,
    width: 220,
    height: 85,
    title: 'Aurora Read Replica',
    subtitle: 'Sub-second Cross-Region Sync',
    badge: 'DATABASE',
    icon: 'Database',
    latencyMs: 15,
    maxCapacityQps: 40000,
    themeColor: '#2b8a3e',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Cross-Region Replication Connector
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 440,
    y: 462,
    width: 400,
    height: 0,
    label: 'AWS Backbone Async Replication',
    qps: 8000,
    latencyMs: 45,
    startBinding: { elementId: 'node-db-east' },
    endBinding: { elementId: 'node-db-eu' },
    strokeColor: '#7950f2',
    strokeWidth: 2,
    direction: 'bidirectional',
    isAnimated: true,
    seed: generateSeed()
  });

  return elements;
}

/**
 * Fintech Payment Gateway with PCI DSS Network Subnets
 */
export function getFintechPciTemplate() {
  const elements = [];

  // VPC Boundary
  elements.push({
    id: 'vpc-fintech',
    type: 'group-boundary',
    boundaryType: 'vpc',
    subtype: 'vpc',
    x: 80,
    y: 60,
    width: 1080,
    height: 560,
    title: 'AWS PCI Compliant Production VPC',
    cidr: '10.0.0.0/16',
    strokeColor: '#1971c2',
    backgroundColor: 'rgba(231, 245, 255, 0.3)',
    strokeStyle: 'solid',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // 1. Public DMZ Subnet
  elements.push({
    id: 'subnet-dmz',
    type: 'group-boundary',
    boundaryType: 'public-subnet',
    subtype: 'public-subnet',
    x: 110,
    y: 120,
    width: 300,
    height: 460,
    title: 'Public Ingress DMZ Subnet',
    cidr: '10.0.1.0/24',
    strokeColor: '#2b8a3e',
    backgroundColor: 'rgba(235, 251, 238, 0.45)',
    strokeStyle: 'dashed',
    seed: generateSeed()
  });

  elements.push({
    id: 'node-waf',
    type: 'node',
    c4Level: 'container',
    x: 140,
    y: 180,
    width: 240,
    height: 85,
    title: 'AWS WAF & Shield',
    subtitle: 'OWASP Top 10 Filter · DDoS',
    badge: 'SECURITY',
    icon: 'Shield',
    latencyMs: 3,
    maxCapacityQps: 40000,
    themeColor: '#2b8a3e',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: 'node-nlb',
    type: 'node',
    c4Level: 'container',
    x: 140,
    y: 340,
    width: 240,
    height: 85,
    title: 'Network Load Balancer',
    subtitle: 'mTLS Handshake & Static IP',
    badge: 'NLB',
    icon: 'Network',
    latencyMs: 2,
    maxCapacityQps: 60000,
    themeColor: '#2b8a3e',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // 2. Private App Subnet
  elements.push({
    id: 'subnet-app',
    type: 'group-boundary',
    boundaryType: 'private-subnet',
    subtype: 'private-subnet',
    x: 460,
    y: 120,
    width: 320,
    height: 460,
    title: 'Private Application Subnet',
    cidr: '10.0.2.0/24',
    strokeColor: '#4c6ef5',
    backgroundColor: 'rgba(237, 242, 255, 0.45)',
    strokeStyle: 'solid',
    seed: generateSeed()
  });

  elements.push({
    id: 'node-token-svc',
    type: 'node',
    c4Level: 'component',
    x: 490,
    y: 220,
    width: 260,
    height: 85,
    title: 'Card Tokenization Service',
    subtitle: 'One-Time PAN Generator',
    badge: 'SERVICE',
    icon: 'Key',
    latencyMs: 28,
    maxCapacityQps: 15000,
    themeColor: '#4c6ef5',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: 'node-audit-worker',
    type: 'node',
    c4Level: 'component',
    x: 490,
    y: 380,
    width: 260,
    height: 85,
    title: 'PCI Compliance Auditor',
    subtitle: 'Immutable Audit Logging',
    badge: 'WORKER',
    icon: 'FileText',
    latencyMs: 12,
    maxCapacityQps: 20000,
    themeColor: '#4c6ef5',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // 3. Isolated HSM Subnet
  elements.push({
    id: 'subnet-hsm',
    type: 'group-boundary',
    boundaryType: 'private-subnet',
    subtype: 'private-subnet',
    x: 830,
    y: 120,
    width: 300,
    height: 460,
    title: 'Isolated Cardholder Data (CDE)',
    cidr: '10.0.3.0/24',
    strokeColor: '#e03131',
    backgroundColor: 'rgba(255, 243, 205, 0.45)',
    strokeStyle: 'solid',
    seed: generateSeed()
  });

  elements.push({
    id: 'node-hsm',
    type: 'node',
    c4Level: 'component',
    x: 860,
    y: 220,
    width: 240,
    height: 85,
    title: 'AWS CloudHSM Cluster',
    subtitle: 'FIPS 140-2 Level 3 Cryptography',
    badge: 'HSM',
    icon: 'Lock',
    latencyMs: 40,
    maxCapacityQps: 5000,
    themeColor: '#e03131',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  elements.push({
    id: 'node-vault-db',
    type: 'node',
    c4Level: 'container',
    x: 860,
    y: 380,
    width: 240,
    height: 85,
    title: 'PCI Encrypted Vault DB',
    subtitle: 'AES-256 GCM Isolated Store',
    badge: 'DATABASE',
    icon: 'Database',
    latencyMs: 32,
    maxCapacityQps: 8000,
    themeColor: '#e03131',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  return elements;
}

// ============================================================================
// C4 Model Architecture Templates (Context, Container, Component)
// ============================================================================

/**
 * C4 Model: Container Architecture Diagram
 * Demonstrates Simon Brown's C4 Architecture Container Level
 */
export function getC4ContainerDiagramTemplate() {
  const elements = [];

  // Person: Customer
  elements.push({
    id: 'c4-customer',
    type: 'node',
    c4Level: 'person',
    x: 40,
    y: 260,
    width: 220,
    height: 90,
    title: 'Personal Banking Customer',
    subtitle: 'Bank customer with personal accounts',
    badge: 'PERSON',
    icon: 'User',
    themeColor: '#08427b',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // System Boundary: Internet Banking System
  elements.push({
    id: 'c4-sys-boundary',
    type: 'group-boundary',
    boundaryType: 'system',
    c4BoundaryType: 'System_Boundary',
    c4BoundaryTag: '[SYSTEM]',
    x: 340,
    y: 80,
    width: 600,
    height: 520,
    title: 'Internet Banking System',
    strokeColor: '#868e96',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    strokeStyle: 'dashed',
    strokeWidth: 1.5,
    seed: generateSeed()
  });

  // Container 1: Single-Page Application
  elements.push({
    id: 'c4-spa',
    type: 'node',
    c4Level: 'container',
    x: 380,
    y: 150,
    width: 230,
    height: 85,
    title: 'Single-Page Application',
    subtitle: 'JavaScript & React · Browser UI',
    badge: 'CONTAINER',
    icon: 'Globe',
    latencyMs: 12,
    maxCapacityQps: 25000,
    themeColor: '#1168bd',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Container 2: Mobile App
  elements.push({
    id: 'c4-mobile',
    type: 'node',
    c4Level: 'container',
    x: 380,
    y: 380,
    width: 230,
    height: 85,
    title: 'Mobile Banking App',
    subtitle: 'Flutter & Dart · iOS / Android',
    badge: 'CONTAINER',
    icon: 'Smartphone',
    latencyMs: 18,
    maxCapacityQps: 20000,
    themeColor: '#1168bd',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Container 3 (Central SPOF): API Application
  elements.push({
    id: 'c4-api',
    type: 'node',
    c4Level: 'container',
    isSpof: true,
    x: 680,
    y: 200,
    width: 220,
    height: 85,
    title: 'API Application',
    subtitle: 'Java & Spring Boot · Core REST API',
    badge: 'CONTAINER',
    icon: 'Server',
    latencyMs: 25,
    maxCapacityQps: 15000,
    themeColor: '#1168bd',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Container 4 (Stateful SPOF): Database
  elements.push({
    id: 'c4-db',
    type: 'node',
    c4Level: 'container',
    isSpof: true,
    x: 680,
    y: 400,
    width: 220,
    height: 85,
    title: 'Relational Database',
    subtitle: 'Oracle / PostgreSQL · Master DB',
    badge: 'DATABASE',
    icon: 'Database',
    latencyMs: 35,
    maxCapacityQps: 10000,
    themeColor: '#1168bd',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // External System 1: Mainframe Core
  elements.push({
    id: 'c4-mainframe',
    type: 'node',
    c4Level: 'context',
    x: 1020,
    y: 180,
    width: 230,
    height: 85,
    title: 'Mainframe Banking System',
    subtitle: 'Core Banking · Accounts & Ledger',
    badge: 'EXTERNAL SYSTEM',
    icon: 'Cpu',
    latencyMs: 50,
    themeColor: '#495057',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // External System 2: E-mail System
  elements.push({
    id: 'c4-email',
    type: 'node',
    c4Level: 'context',
    x: 1020,
    y: 380,
    width: 230,
    height: 85,
    title: 'E-mail Notification System',
    subtitle: 'Microsoft Exchange · SMTP',
    badge: 'EXTERNAL SYSTEM',
    icon: 'Mail',
    latencyMs: 40,
    themeColor: '#495057',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    seed: generateSeed()
  });

  // Connectors
  // Customer -> SPA
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 260,
    y: 280,
    width: 120,
    height: -80,
    label: 'Visits [HTTPS]',
    qps: 12000,
    latencyMs: 15,
    startBinding: { elementId: 'c4-customer' },
    endBinding: { elementId: 'c4-spa' },
    strokeColor: '#08427b',
    strokeWidth: 2,
    direction: 'forward',
    isAnimated: true,
    seed: generateSeed()
  });

  // Customer -> Mobile App
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 260,
    y: 320,
    width: 120,
    height: 90,
    label: 'Uses [HTTPS]',
    qps: 8000,
    latencyMs: 22,
    startBinding: { elementId: 'c4-customer' },
    endBinding: { elementId: 'c4-mobile' },
    strokeColor: '#08427b',
    strokeWidth: 2,
    direction: 'forward',
    isAnimated: true,
    seed: generateSeed()
  });

  // SPA -> API
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 610,
    y: 200,
    width: 70,
    height: 30,
    label: 'Delivers JSON [HTTPS]',
    qps: 12000,
    latencyMs: 10,
    startBinding: { elementId: 'c4-spa' },
    endBinding: { elementId: 'c4-api' },
    strokeColor: '#1168bd',
    strokeWidth: 2,
    direction: 'forward',
    isAnimated: true,
    seed: generateSeed()
  });

  // Mobile -> API
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 610,
    y: 410,
    width: 70,
    height: -150,
    label: 'Makes API calls [HTTPS]',
    qps: 8000,
    latencyMs: 12,
    startBinding: { elementId: 'c4-mobile' },
    endBinding: { elementId: 'c4-api' },
    strokeColor: '#1168bd',
    strokeWidth: 2,
    direction: 'forward',
    isAnimated: true,
    seed: generateSeed()
  });

  // API -> Database (Overloads 10,000 capacity with 20,000 QPS!)
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 790,
    y: 285,
    width: 0,
    height: 115,
    label: 'Reads & Writes [JDBC/TLS]',
    qps: 20000,
    latencyMs: 8,
    startBinding: { elementId: 'c4-api' },
    endBinding: { elementId: 'c4-db' },
    strokeColor: '#e03131',
    strokeWidth: 2,
    direction: 'forward',
    isAnimated: true,
    seed: generateSeed()
  });

  // API -> Mainframe
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 900,
    y: 235,
    width: 120,
    height: -10,
    label: 'Queries Ledger [XML/HTTPS]',
    qps: 5000,
    latencyMs: 35,
    startBinding: { elementId: 'c4-api' },
    endBinding: { elementId: 'c4-mainframe' },
    strokeColor: '#495057',
    strokeWidth: 2,
    direction: 'forward',
    isAnimated: true,
    seed: generateSeed()
  });

  // API -> Email
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 900,
    y: 260,
    width: 120,
    height: 140,
    label: 'Sends alerts [SMTP]',
    qps: 1500,
    latencyMs: 45,
    startBinding: { elementId: 'c4-api' },
    endBinding: { elementId: 'c4-email' },
    strokeColor: '#495057',
    strokeWidth: 2,
    direction: 'forward',
    isAnimated: true,
    seed: generateSeed()
  });

  return elements;
}

/**
 * C4 Model: System Context Diagram
 */
export function getC4ContextDiagramTemplate() {
  const elements = [];

  // Title Element
  elements.push({
    id: generateId(),
    type: 'text',
    x: 330,
    y: 35,
    width: 600,
    height: 30,
    text: 'System Context diagram for Internet Banking System',
    fontSize: 15,
    fontFamily: 2,
    seed: generateSeed()
  });

  // Outermost Boundary: Enterprise_Boundary(b0, "BankBoundary0")
  elements.push({
    id: 'b0',
    c4Id: 'b0',
    type: 'group-boundary',
    boundaryType: 'enterprise',
    c4BoundaryType: 'Enterprise_Boundary',
    c4BoundaryTag: '[ENTERPRISE]',
    title: 'BankBoundary0',
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

  // Top Row: 4 Person Elements
  elements.push({
    id: 'customerA',
    c4Id: 'customerA',
    type: 'c4-element',
    c4Type: 'Person',
    c4Shape: 'person',
    c4Tag: '[Person]',
    title: 'Banking Customer A',
    subtitle: 'A customer of the bank, with personal bank accounts.',
    themeColor: '#08427b',
    x: 80,
    y: 160,
    width: 170,
    height: 110,
    seed: generateSeed()
  });

  elements.push({
    id: 'customerB',
    c4Id: 'customerB',
    type: 'c4-element',
    c4Type: 'Person',
    c4Shape: 'person',
    c4Tag: '[Person]',
    title: 'Banking Customer B',
    themeColor: '#08427b',
    x: 290,
    y: 160,
    width: 170,
    height: 110,
    seed: generateSeed()
  });

  elements.push({
    id: 'customerC',
    c4Id: 'customerC',
    type: 'c4-element',
    c4Type: 'Person_Ext',
    c4Shape: 'person',
    c4Tag: '[Person]',
    title: 'Banking Customer C',
    subtitle: 'desc',
    isExt: true,
    themeColor: '#6c757d',
    x: 500,
    y: 160,
    width: 170,
    height: 110,
    seed: generateSeed()
  });

  elements.push({
    id: 'customerD',
    c4Id: 'customerD',
    type: 'c4-element',
    c4Type: 'Person',
    c4Shape: 'person',
    c4Tag: '[Person]',
    title: 'Banking Customer D',
    subtitle: 'A customer of the bank, <br/> with personal bank accounts.',
    themeColor: '#08427b',
    x: 710,
    y: 160,
    width: 170,
    height: 110,
    seed: generateSeed()
  });

  // Next Row: System(SystemAA, "Internet Banking System")
  elements.push({
    id: 'SystemAA',
    c4Id: 'SystemAA',
    type: 'c4-element',
    c4Type: 'System',
    c4Shape: 'system',
    c4Tag: '[Software System]',
    title: 'Internet Banking System',
    subtitle: 'Allows customers to view information about their bank accounts, and make payments.',
    themeColor: '#1168bd',
    x: 80,
    y: 330,
    width: 170,
    height: 90,
    seed: generateSeed()
  });

  // Inner Boundary: Enterprise_Boundary(b1, "BankBoundary")
  elements.push({
    id: 'b1',
    c4Id: 'b1',
    type: 'group-boundary',
    boundaryType: 'enterprise',
    c4BoundaryType: 'Enterprise_Boundary',
    c4BoundaryTag: '[ENTERPRISE]',
    title: 'BankBoundary',
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

  // Inside b1 - Row 1: SystemE, SystemC, SystemD
  elements.push({
    id: 'SystemE',
    c4Id: 'SystemE',
    type: 'c4-element',
    c4Type: 'SystemDb_Ext',
    c4Shape: 'database',
    c4Tag: '[Software System]',
    title: 'Mainframe Banking System',
    subtitle: 'Stores all of the core banking information about customers, accounts, transactions, etc.',
    isExt: true,
    themeColor: '#6c757d',
    x: 110,
    y: 510,
    width: 170,
    height: 95,
    seed: generateSeed()
  });

  elements.push({
    id: 'SystemC',
    c4Id: 'SystemC',
    type: 'c4-element',
    c4Type: 'System_Ext',
    c4Shape: 'system',
    c4Tag: '[Software System]',
    title: 'E-mail system',
    subtitle: 'The internal Microsoft Exchange e-mail system.',
    isExt: true,
    themeColor: '#6c757d',
    x: 320,
    y: 510,
    width: 160,
    height: 85,
    seed: generateSeed()
  });

  elements.push({
    id: 'SystemD',
    c4Id: 'SystemD',
    type: 'c4-element',
    c4Type: 'SystemDb',
    c4Shape: 'database',
    c4Tag: '[Software System]',
    title: 'Banking System D Database',
    subtitle: 'A system of the bank, with personal bank accounts.',
    themeColor: '#1168bd',
    x: 540,
    y: 510,
    width: 170,
    height: 95,
    seed: generateSeed()
  });

  // Inside b1 - Row 2: System_Boundary(b2, "BankBoundary2")
  elements.push({
    id: 'b2',
    c4Id: 'b2',
    type: 'group-boundary',
    boundaryType: 'system',
    c4BoundaryType: 'System_Boundary',
    c4BoundaryTag: '[SYSTEM]',
    title: 'BankBoundary2',
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

  elements.push({
    id: 'SystemA',
    c4Id: 'SystemA',
    type: 'c4-element',
    c4Type: 'System',
    c4Shape: 'system',
    c4Tag: '[Software System]',
    title: 'Banking System A',
    themeColor: '#1168bd',
    x: 130,
    y: 720,
    width: 160,
    height: 75,
    seed: generateSeed()
  });

  elements.push({
    id: 'SystemB',
    c4Id: 'SystemB',
    type: 'c4-element',
    c4Type: 'System',
    c4Shape: 'system',
    c4Tag: '[Software System]',
    title: 'Banking System B',
    subtitle: 'A system of the bank, with personal bank accounts. next line.',
    themeColor: '#1168bd',
    x: 310,
    y: 720,
    width: 165,
    height: 75,
    seed: generateSeed()
  });

  // Inside b1 - Row 2: Boundary(b3, "BankBoundary3", "boundary")
  elements.push({
    id: 'b3',
    c4Id: 'b3',
    type: 'group-boundary',
    boundaryType: 'boundary',
    c4BoundaryType: 'Boundary',
    c4BoundaryTag: '[boundary]',
    c4TypeArg: 'boundary',
    title: 'BankBoundary3',
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

  elements.push({
    id: 'SystemF',
    c4Id: 'SystemF',
    type: 'c4-element',
    c4Type: 'SystemQueue',
    c4Shape: 'queue',
    c4Tag: '[Software System]',
    title: 'Banking System F Queue',
    subtitle: 'A system of the bank.',
    themeColor: '#1168bd',
    x: 555,
    y: 720,
    width: 180,
    height: 65,
    seed: generateSeed()
  });

  elements.push({
    id: 'SystemG',
    c4Id: 'SystemG',
    type: 'c4-element',
    c4Type: 'SystemQueue_Ext',
    c4Shape: 'queue',
    c4Tag: '[Software System]',
    title: 'Banking System G Queue',
    subtitle: 'A system of the bank, with personal bank accounts.',
    isExt: true,
    themeColor: '#6c757d',
    x: 555,
    y: 810,
    width: 180,
    height: 65,
    seed: generateSeed()
  });

  // Relationships (Arrows) matching Image 2 and Mermaid specification
  // 1. BiRel(customerA, SystemAA, "Uses")
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 165,
    y: 270,
    width: 0,
    height: 60,
    label: 'Uses',
    startBinding: { elementId: 'customerA' },
    endBinding: { elementId: 'SystemAA' },
    direction: 'both',
    c4RelType: 'BiRel',
    strokeColor: '#495057',
    strokeWidth: 1.5,
    strokeStyle: 'solid',
    seed: generateSeed()
  });

  // 2. BiRel(SystemAA, SystemE, "Uses")
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 165,
    y: 420,
    width: 30,
    height: 90,
    label: 'Uses',
    startBinding: { elementId: 'SystemAA' },
    endBinding: { elementId: 'SystemE' },
    direction: 'both',
    c4RelType: 'BiRel',
    strokeColor: '#495057',
    strokeWidth: 1.5,
    strokeStyle: 'solid',
    seed: generateSeed()
  });

  // 3. Rel(SystemAA, SystemC, "Sends e-mails", "SMTP")
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 250,
    y: 375,
    width: 150,
    height: 135,
    label: 'Sends e-mails [SMTP]',
    techn: 'SMTP',
    startBinding: { elementId: 'SystemAA' },
    endBinding: { elementId: 'SystemC' },
    direction: 'forward',
    c4RelType: 'Rel',
    strokeColor: '#495057',
    strokeWidth: 1.5,
    strokeStyle: 'solid',
    seed: generateSeed()
  });

  // 4. Rel(SystemC, customerA, "Sends e-mails to")
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 370,
    y: 510,
    width: -190,
    height: -240,
    label: 'Sends e-mails to',
    startBinding: { elementId: 'SystemC' },
    endBinding: { elementId: 'customerA' },
    direction: 'forward',
    c4RelType: 'Rel',
    strokeColor: '#495057',
    strokeWidth: 1.5,
    strokeStyle: 'solid',
    seed: generateSeed()
  });

  return elements;
}

/**
 * Sprint 8: Microservices Architecture with ADR Decision Cards & Component Sticky Notes
 */
export function getArchitectureWithNotesTemplate() {
  const elements = [];

  const vpcId = generateId();
  const clientId = generateId();
  const cdnId = generateId();
  const gatewayId = generateId();
  const ordersSvcId = generateId();
  const paymentsSvcId = generateId();
  const kafkaId = generateId();
  const dbId = generateId();

  // 1. Cloud Boundary
  elements.push({
    id: vpcId,
    type: 'group-boundary',
    x: 270,
    y: 100,
    width: 1140,
    height: 620,
    title: 'AWS Production (us-east-1) · VPC 10.0.0.0/16',
    strokeColor: '#339af0',
    backgroundColor: 'rgba(231, 245, 255, 0.25)',
    strokeStyle: 'dashed',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // 2. Client Node
  elements.push({
    id: clientId,
    type: 'node',
    x: 40,
    y: 270,
    width: 190,
    height: 80,
    title: 'Web & Mobile Client',
    subtitle: 'Next.js 15 · iOS · Android',
    badge: 'CLIENT',
    icon: 'Smartphone',
    themeColor: '#495057',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    role: 'entry',
    qps: 12000,
    latency: 5,
    seed: generateSeed()
  });

  // 3. CloudFront Edge & WAF
  elements.push({
    id: cdnId,
    type: 'node',
    x: 310,
    y: 270,
    width: 200,
    height: 80,
    title: 'CloudFront & WAF',
    subtitle: 'Edge Shield · TLS 1.3',
    badge: 'CDN',
    icon: 'Shield',
    themeColor: '#ff9900',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    role: 'service',
    qps: 12000,
    latency: 12,
    seed: generateSeed()
  });

  // 4. API Gateway
  elements.push({
    id: gatewayId,
    type: 'node',
    x: 570,
    y: 270,
    width: 210,
    height: 80,
    title: 'Envoy API Gateway',
    subtitle: 'JWT · Rate Limiter · Ingress',
    badge: 'GATEWAY',
    icon: 'Network',
    themeColor: '#1971c2',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    role: 'service',
    qps: 12000,
    capacity: 20000,
    latency: 8,
    seed: generateSeed()
  });

  // 5. Sticky Note: Gateway Policies (Attached to API Gateway)
  elements.push({
    id: generateId(),
    type: 'note',
    cardStyle: 'sticky',
    x: 570,
    y: 110,
    width: 220,
    height: 135,
    title: 'Gateway Routing Specs',
    content: '# Edge Protection\n- [x] TLS 1.3 SNI validation\n- [x] JWT claims verification\n- [x] Token bucket: 15,000 req/s\n- [ ] Geo-blocking for legacy APIs',
    themeColor: '#fff9db',
    backgroundColor: '#fff9db',
    strokeColor: '#fab005',
    seed: generateSeed()
  });

  // 6. Orders Service
  elements.push({
    id: ordersSvcId,
    type: 'node',
    x: 840,
    y: 190,
    width: 210,
    height: 80,
    title: 'Orders Service',
    subtitle: 'Go 1.23 · gRPC · Docker',
    badge: 'MICROSERVICE',
    icon: 'Server',
    themeColor: '#2b8a3e',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    role: 'service',
    qps: 8500,
    capacity: 15000,
    latency: 18,
    seed: generateSeed()
  });

  // 7. Payments Service
  elements.push({
    id: paymentsSvcId,
    type: 'node',
    x: 840,
    y: 330,
    width: 210,
    height: 80,
    title: 'Payments Service',
    subtitle: 'Rust · Tokio · Stripe API',
    badge: 'MICROSERVICE',
    icon: 'CreditCard',
    themeColor: '#e03131',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    role: 'service',
    qps: 3500,
    capacity: 10000,
    latency: 25,
    seed: generateSeed()
  });

  // 8. Event Bus (Kafka)
  elements.push({
    id: kafkaId,
    type: 'node',
    x: 1120,
    y: 190,
    width: 210,
    height: 80,
    title: 'Apache Kafka Bus',
    subtitle: 'orders.events · 32 partitions',
    badge: 'EVENT STREAM',
    icon: 'Layers',
    themeColor: '#e8590c',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    role: 'queue',
    qps: 8500,
    capacity: 50000,
    latency: 4,
    seed: generateSeed()
  });

  // 9. Sticky Note: Event Streaming Specs (Attached to Kafka)
  elements.push({
    id: generateId(),
    type: 'note',
    cardStyle: 'sticky',
    x: 1120,
    y: 40,
    width: 220,
    height: 125,
    title: 'Kafka Topic Policy',
    content: '# Partition Key Spec\n- Key: `order_id` (murmur3)\n- Retention: 7 days immutable\n- Min In-Sync Replicas: 2\n- Compression: zstd',
    themeColor: '#ffe8cc',
    backgroundColor: '#ffe8cc',
    strokeColor: '#fd7e14',
    seed: generateSeed()
  });

  // 10. Database Cluster (Aurora PostgreSQL)
  elements.push({
    id: dbId,
    type: 'node',
    x: 1120,
    y: 320,
    width: 210,
    height: 85,
    title: 'Orders Aurora DB',
    subtitle: 'PostgreSQL 16 · Multi-AZ',
    badge: 'DATASTORE',
    icon: 'Database',
    themeColor: '#1098ad',
    backgroundColor: '#ffffff',
    cardStyle: 'modern',
    role: 'datastore',
    isReplicated: true,
    qps: 8500,
    capacity: 18000,
    latency: 6,
    seed: generateSeed()
  });

  // 11. Sticky Note: Database Specs (Attached to DB)
  elements.push({
    id: generateId(),
    type: 'note',
    cardStyle: 'sticky',
    x: 1120,
    y: 430,
    width: 220,
    height: 125,
    title: 'Storage & Cluster Specs',
    content: '# PostgreSQL Cluster\n- Primary: db.r6g.2xlarge\n- Read Replicas: 3x Multi-AZ\n- Pool: pgBouncer (max 400)\n- Auto-failover: < 15s RTO',
    themeColor: '#e3fafc',
    backgroundColor: '#e3fafc',
    strokeColor: '#15aabf',
    seed: generateSeed()
  });

  // 12. First-Class Architecture Decision Record (ADR) Card
  elements.push({
    id: generateId(),
    type: 'note',
    cardStyle: 'adr',
    status: 'ACCEPTED',
    x: 310,
    y: 420,
    width: 470,
    height: 270,
    title: 'ADR-008: CQRS & Transactional Outbox Pattern',
    content: '## Context\nPeak checkout spikes create database row-lock contention and write-thread starvation.\n\n## Decision\nAdopt CQRS with Transactional Outbox pattern. Orders service commits to local DB; CDC relays events to Kafka for async read projections.\n\n## Consequences\n- 10x throughput scaling (zero 2PC distributed locks)\n- Query models isolated from primary write bottleneck\n- Downstream consumers require idempotent processing',
    themeColor: '#2b8a3e',
    backgroundColor: '#ffffff',
    strokeColor: '#2b8a3e',
    seed: generateSeed()
  });

  // 13. Relational / Flow Arrows
  // Client -> CloudFront
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 230,
    y: 310,
    width: 80,
    height: 0,
    label: 'HTTPS · 12k QPS',
    startBinding: { elementId: clientId },
    endBinding: { elementId: cdnId },
    direction: 'forward',
    strokeColor: '#495057',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // CloudFront -> Gateway
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 510,
    y: 310,
    width: 60,
    height: 0,
    label: 'gRPC · 12k QPS',
    startBinding: { elementId: cdnId },
    endBinding: { elementId: gatewayId },
    direction: 'forward',
    strokeColor: '#ff9900',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // Gateway -> Orders
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 780,
    y: 290,
    width: 60,
    height: -60,
    label: '8.5k QPS',
    startBinding: { elementId: gatewayId },
    endBinding: { elementId: ordersSvcId },
    direction: 'forward',
    strokeColor: '#1971c2',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // Gateway -> Payments
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 780,
    y: 330,
    width: 60,
    height: 40,
    label: '3.5k QPS',
    startBinding: { elementId: gatewayId },
    endBinding: { elementId: paymentsSvcId },
    direction: 'forward',
    strokeColor: '#1971c2',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // Orders -> Kafka
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 1050,
    y: 230,
    width: 70,
    height: 0,
    label: 'Publish Event',
    startBinding: { elementId: ordersSvcId },
    endBinding: { elementId: kafkaId },
    direction: 'forward',
    strokeColor: '#2b8a3e',
    strokeWidth: 2,
    seed: generateSeed()
  });

  // Orders -> DB
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: 1050,
    y: 250,
    width: 70,
    height: 90,
    label: 'SQL Write',
    startBinding: { elementId: ordersSvcId },
    endBinding: { elementId: dbId },
    direction: 'forward',
    strokeColor: '#2b8a3e',
    strokeWidth: 2,
    seed: generateSeed()
  });

  return elements;
}

// ============================================================================
// Master Template Dispatcher
// ============================================================================

/**
 * Returns element array by template key
 */
export function getTemplateElements(templateKey) {
  switch (templateKey) {
    // Sprint 8: Architecture Decision Records (ADR) & Markdown Sticky Notes
    case 'architecture-notes':
    case 'adr-notes':
    case 'notes-adr':
      return getArchitectureWithNotesTemplate();

    // C4 Architecture Models
    case 'c4':
    case 'c4-model':
    case 'c4-container':
      return getC4ContainerDiagramTemplate();
    case 'c4-context':
      return getC4ContextDiagramTemplate();

    // Sprint 3: System Design & Quantitative Telemetry
    case 'flash-sale':
      return getFlashSaleTemplate();
    case 'global-ha':
      return getGlobalHaTemplate();
    case 'fintech-pci':
      return getFintechPciTemplate();

    // Cloud
    case 'aws':
      return getAwsArchitectureTemplate();
    case 'google':
    case 'gcp':
      return getGcpArchitectureTemplate();
    case 'azure':
      return getAzureArchitectureTemplate();

    // Patterns
    case 'monolithic':
      return getMonolithicTemplate();
    case 'modular-monolith':
      return getModularMonolithTemplate();
    case 'microservices':
      return getMicroservicesTemplate();

    // UML
    case 'activity':
    case 'activity-diagram':
      return getActivityDiagramTemplate();
    case 'flowchart':
    case 'logic-flowchart':
    case 'flow-chart':
      return getLogicFlowchartTemplate();
    case 'sequence':
      return getSequenceTemplate();
    case 'state-machine':
      return getStateMachineTemplate();

    // Database
    case 'erd':
      return getErdTemplate();

    default:
      return [];
  }
}

