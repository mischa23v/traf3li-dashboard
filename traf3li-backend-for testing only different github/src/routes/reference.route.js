/**
 * Reference Data Routes
 * Provides reference data for Saudi legal case management
 */

const express = require('express');
const {
    getCourts,
    getCommittees,
    getRegions,
    getCitiesByRegionCode,
    getRegionsWithCities,
    getCategories,
    getSubCategories,
    getCategoriesWithSubCategories,
    getClaimTypes,
    getPOAScopes,
    getPartyTypes,
    getDocumentCategories,
    getAllReferenceData
} = require('../controllers/reference.controller');

const router = express.Router();

// Courts
router.get('/courts', getCourts);

// Committees
router.get('/committees', getCommittees);

// Regions
router.get('/regions', getRegions);
router.get('/regions-with-cities', getRegionsWithCities);
router.get('/regions/:code/cities', getCitiesByRegionCode);

// Categories
router.get('/categories', getCategories);
router.get('/categories-full', getCategoriesWithSubCategories);
router.get('/categories/:code/sub-categories', getSubCategories);

// Claim Types
router.get('/claim-types', getClaimTypes);

// Power of Attorney Scopes
router.get('/poa-scopes', getPOAScopes);

// Party Types
router.get('/party-types', getPartyTypes);

// Document Categories
router.get('/document-categories', getDocumentCategories);

// All reference data in one call
router.get('/all', getAllReferenceData);

module.exports = router;
