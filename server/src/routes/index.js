import { Router } from 'express';
import { protect, allow } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';
import * as users from '../controllers/userController.js';
import * as clients from '../controllers/clientController.js';
import * as products from '../controllers/productController.js';
import * as loans from '../controllers/loanController.js';
import * as payments from '../controllers/paymentController.js';
import * as dash from '../controllers/dashboardController.js';
import * as reports from '../controllers/reportController.js';

const r = Router();

r.post('/auth/login', auth.login);
r.get('/auth/me', protect, auth.me);

r.use(protect);

// Users (admin only)
r.get('/users', allow('admin'), users.list);
r.post('/users', allow('admin'), users.create);
r.patch('/users/:id', allow('admin'), users.update);

// Clients
r.get('/clients', clients.list);
r.get('/clients/:id', clients.get);
r.post('/clients', allow('admin', 'officer'), clients.create);
r.patch('/clients/:id', allow('admin', 'officer'), clients.update);

// Products
r.get('/products', products.list);
r.post('/products', allow('admin'), products.create);
r.patch('/products/:id', allow('admin'), products.update);

// Loans
r.get('/loans', loans.list);
r.get('/loans/:id', loans.get);
r.post('/loans', allow('admin', 'officer'), loans.create);
r.patch('/loans/:id/approve', allow('admin'), loans.approve);
r.patch('/loans/:id/reject', allow('admin'), loans.reject);
r.patch('/loans/:id/disburse', allow('admin', 'officer'), loans.disburse);

// Payments
r.get('/payments', payments.list);
r.post('/payments', allow('admin', 'officer', 'collector'), payments.create);

// Dashboard & Reports
r.get('/dashboard/summary', dash.summary);
r.get('/reports/aging', reports.agingBuckets);
r.get('/reports/collections', reports.collectionsByDay);
r.get('/reports/portfolio', reports.portfolioBySegment);

export default r;
