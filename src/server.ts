import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

// Mock data for resellers
const mockResellers = [
  {
    id: '1',
    name: 'Tech Solutions Brasil',
    email: 'contact@techsol.com.br',
    phone: '(11) 98765-4321',
    status: 'active',
    commissionRate: 15,
    totalSales: 45000,
    totalCommission: 6750,
    createdAt: '2025-06-15',
    updatedAt: '2026-04-20',
  },
  {
    id: '2',
    name: 'Digital Partners',
    email: 'sales@digitalpartners.com.br',
    phone: '(21) 99876-5432',
    status: 'active',
    commissionRate: 12,
    totalSales: 32000,
    totalCommission: 3840,
    createdAt: '2025-08-22',
    updatedAt: '2026-04-18',
  },
  {
    id: '3',
    name: 'Web Solutions LLC',
    email: 'info@websolutions.com.br',
    phone: '(31) 98765-1234',
    status: 'inactive',
    commissionRate: 10,
    totalSales: 15000,
    totalCommission: 1500,
    createdAt: '2025-09-10',
    updatedAt: '2026-02-14',
  },
  {
    id: '4',
    name: 'Marketing Masters',
    email: 'team@marketingmasters.com.br',
    phone: '(85) 99123-4567',
    status: 'active',
    commissionRate: 18,
    totalSales: 67000,
    totalCommission: 12060,
    createdAt: '2025-05-03',
    updatedAt: '2026-04-19',
  },
  {
    id: '5',
    name: 'Enterprise Distribuidora',
    email: 'contato@enterprise.com.br',
    phone: '(41) 98765-9876',
    status: 'suspended',
    commissionRate: 20,
    totalSales: 89000,
    totalCommission: 17800,
    createdAt: '2025-03-25',
    updatedAt: '2026-01-30',
  },
];

// API Routes
app.get('/v1/resellers', (req, res) => {
  res.json(mockResellers);
});

app.get('/v1/resellers/:id', (req, res): void => {
  const reseller = mockResellers.find((r) => r.id === req.params.id);
  if (!reseller) {
    res.status(404).json({ error: 'Reseller not found' });
    return;
  }
  res.json(reseller);
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
