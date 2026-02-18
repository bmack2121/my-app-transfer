const express = require('express');
const router = express.Router();
const { calculateLease, compareLeaseTerms } = require('../controllers/leaseController');
const auth = require('../middleware/auth'); // ✅ Protect your financial logic

// All finance routes require a valid Sales/Manager login
router.use(auth);

// ⭐ Single Quote Calculation
// POST /api/lease/calculate
router.post('/calculate', calculateLease);

// ⭐ Side-by-Side Comparison (24/36/48 months)
// POST /api/lease/compare
router.post('/compare', compareLeaseTerms);

module.exports = router;