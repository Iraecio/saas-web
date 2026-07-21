import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const RESELLER_CREDITS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'purchases' },
  { path: 'pricing', canActivate: [roleGuard(['RESELLER', 'RESELLER_MANAGER'])], loadComponent: () => import('./pages/pricing/pricing').then(m => m.ResellerPricingPage) },
  { path: 'purchases', canActivate: [roleGuard(['RESELLER', 'RESELLER_MANAGER'])], loadComponent: () => import('./pages/purchases/purchases').then(m => m.CreditPurchasesPage) },
  { path: 'stock', canActivate: [roleGuard(['RESELLER', 'RESELLER_MANAGER'])], loadComponent: () => import('./pages/stock/stock').then(m => m.CreditStockPage) },
  { path: 'sales', canActivate: [roleGuard(['RESELLER', 'RESELLER_MANAGER'])], loadComponent: () => import('./pages/sales/sales').then(m => m.CreditSalesPage) },
  { path: 'admin-purchases', canActivate: [roleGuard(['ADMIN', 'SUPER_ADMIN'])], loadComponent: () => import('./pages/admin-purchases/admin-purchases').then(m => m.AdminCreditPurchasesPage) },
];
