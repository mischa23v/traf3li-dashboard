/**
 * Reference Data Controller
 * Provides reference data for Saudi legal case management
 */

const {
    SAUDI_COURTS,
    SAUDI_COMMITTEES,
    SAUDI_REGIONS,
    CASE_CATEGORIES,
    CLAIM_TYPES,
    POA_SCOPES,
    PARTY_TYPES,
    DOCUMENT_CATEGORIES,
    getCitiesByRegion,
    getSubCategoriesByCategory
} = require('../constants/saudi-legal.constants');

/**
 * Get all Saudi courts
 * GET /api/reference/courts
 */
const getCourts = async (req, res) => {
    try {
        res.json({
            success: true,
            data: SAUDI_COURTS
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching courts',
            error: error.message
        });
    }
};

/**
 * Get all Saudi committees
 * GET /api/reference/committees
 */
const getCommittees = async (req, res) => {
    try {
        res.json({
            success: true,
            data: SAUDI_COMMITTEES
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching committees',
            error: error.message
        });
    }
};

/**
 * Get all Saudi regions
 * GET /api/reference/regions
 */
const getRegions = async (req, res) => {
    try {
        res.json({
            success: true,
            data: SAUDI_REGIONS.map(region => ({
                code: region.code,
                nameAr: region.nameAr,
                nameEn: region.nameEn
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching regions',
            error: error.message
        });
    }
};

/**
 * Get cities by region code
 * GET /api/reference/regions/:code/cities
 */
const getCitiesByRegionCode = async (req, res) => {
    try {
        const { code } = req.params;
        const cities = getCitiesByRegion(code);

        if (!cities || cities.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Region not found or has no cities'
            });
        }

        res.json({
            success: true,
            data: cities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching cities',
            error: error.message
        });
    }
};

/**
 * Get all regions with their cities
 * GET /api/reference/regions-with-cities
 */
const getRegionsWithCities = async (req, res) => {
    try {
        res.json({
            success: true,
            data: SAUDI_REGIONS
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching regions with cities',
            error: error.message
        });
    }
};

/**
 * Get all case categories
 * GET /api/reference/categories
 */
const getCategories = async (req, res) => {
    try {
        const categories = Object.values(CASE_CATEGORIES).map(cat => ({
            code: cat.code,
            nameAr: cat.nameAr,
            nameEn: cat.nameEn
        }));

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

/**
 * Get sub-categories by category code
 * GET /api/reference/categories/:code/sub-categories
 */
const getSubCategories = async (req, res) => {
    try {
        const { code } = req.params;
        const subCategories = getSubCategoriesByCategory(code);

        if (!subCategories || subCategories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found or has no sub-categories'
            });
        }

        res.json({
            success: true,
            data: subCategories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sub-categories',
            error: error.message
        });
    }
};

/**
 * Get all categories with their sub-categories
 * GET /api/reference/categories-full
 */
const getCategoriesWithSubCategories = async (req, res) => {
    try {
        res.json({
            success: true,
            data: CASE_CATEGORIES
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories with sub-categories',
            error: error.message
        });
    }
};

/**
 * Get all claim types
 * GET /api/reference/claim-types
 */
const getClaimTypes = async (req, res) => {
    try {
        res.json({
            success: true,
            data: CLAIM_TYPES
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching claim types',
            error: error.message
        });
    }
};

/**
 * Get power of attorney scopes
 * GET /api/reference/poa-scopes
 */
const getPOAScopes = async (req, res) => {
    try {
        res.json({
            success: true,
            data: POA_SCOPES
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching POA scopes',
            error: error.message
        });
    }
};

/**
 * Get party types
 * GET /api/reference/party-types
 */
const getPartyTypes = async (req, res) => {
    try {
        res.json({
            success: true,
            data: PARTY_TYPES
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching party types',
            error: error.message
        });
    }
};

/**
 * Get document categories
 * GET /api/reference/document-categories
 */
const getDocumentCategories = async (req, res) => {
    try {
        res.json({
            success: true,
            data: DOCUMENT_CATEGORIES
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching document categories',
            error: error.message
        });
    }
};

/**
 * Get all reference data in one call
 * GET /api/reference/all
 */
const getAllReferenceData = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                courts: SAUDI_COURTS,
                committees: SAUDI_COMMITTEES,
                regions: SAUDI_REGIONS,
                categories: CASE_CATEGORIES,
                claimTypes: CLAIM_TYPES,
                poaScopes: POA_SCOPES,
                partyTypes: PARTY_TYPES,
                documentCategories: DOCUMENT_CATEGORIES
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching reference data',
            error: error.message
        });
    }
};

module.exports = {
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
};
