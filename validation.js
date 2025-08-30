// Validation and Quality Assurance for Agricultural Recommendations
// This module provides validation functions to ensure data reliability and accuracy

export class AgriculturalValidator {
    constructor() {
        this.altitudeRanges = {
            'subtropical': { min: 600, max: 2000 },
            'temperate': { min: 2000, max: 4000 },
            'alpine': { min: 4000, max: 6000 }
        };

        this.cropAltitudeMap = {
            'rice': { min: 200, max: 2800, optimal: [600, 2000], zone: 'subtropical' },
            'paddy': { min: 200, max: 2800, optimal: [600, 2000], zone: 'subtropical' },
            'barley': { min: 2000, max: 4500, optimal: [2500, 4000], zone: 'temperate' },
            'potato': { min: 1500, max: 4000, optimal: [2000, 3500], zone: 'temperate' },
            'maize': { min: 300, max: 2500, optimal: [600, 2000], zone: 'subtropical' },
            'wheat': { min: 1000, max: 3500, optimal: [1500, 3000], zone: 'temperate' },
            'buckwheat': { min: 2000, max: 4200, optimal: [2200, 3800], zone: 'temperate' },
            'millet': { min: 400, max: 2200, optimal: [600, 1800], zone: 'subtropical' },
            'yak': { min: 3500, max: 5500, optimal: [4000, 5000], zone: 'alpine' },
            'cattle': { min: 200, max: 3000, optimal: [600, 2500], zone: 'subtropical' }
        };

        this.seasonalPatterns = {
            'rice': { planting: [5, 6], harvesting: [9, 10] },
            'paddy': { planting: [5, 6], harvesting: [9, 10] },
            'barley': { planting: [10, 11], harvesting: [6, 7] },
            'potato': { planting: [3, 4, 8], harvesting: [6, 7, 11] },
            'maize': { planting: [4, 5], harvesting: [8, 9] },
            'wheat': { planting: [10, 11], harvesting: [5, 6] }
        };

        this.locationAltitudes = {
            'thimphu': 2320,
            'paro': 2200,
            'punakha': 1200,
            'wangdue': 1300,
            'bumthang': 2600,
            'mongar': 1600,
            'trashigang': 1070,
            'samtse': 300,
            'chhukha': 300,
            'haa': 2670,
            'gasa': 2800,
            'lhuentse': 800,
            'pemagatshel': 1000,
            'samdrup jongkhar': 200,
            'sarpang': 300,
            'tashiyangtse': 1200,
            'dagana': 1400,
            'trongsa': 2200,
            'zhemgang': 1800,
            'tsirang': 600
        };
    }

    validateCropLocationCompatibility(crop, location) {
        const normalizedCrop = crop.toLowerCase().trim();
        const normalizedLocation = location.toLowerCase().trim();
        
        const cropData = this.cropAltitudeMap[normalizedCrop];
        const locationAltitude = this.locationAltitudes[normalizedLocation];

        if (!cropData) {
            return {
                valid: false,
                confidence: 0.3,
                message: `Limited data available for ${crop}. Recommendations are general and may not be optimal.`,
                suggestions: ['Consult local agricultural extension services', 'Consider traditional varieties']
            };
        }

        if (!locationAltitude) {
            return {
                valid: true,
                confidence: 0.6,
                message: `Altitude data not available for ${location}. Recommendations are based on general regional patterns.`,
                suggestions: ['Verify local altitude and microclimate conditions']
            };
        }

        const isInRange = locationAltitude >= cropData.min && locationAltitude <= cropData.max;
        const isOptimal = locationAltitude >= cropData.optimal[0] && locationAltitude <= cropData.optimal[1];

        if (!isInRange) {
            return {
                valid: false,
                confidence: 0.2,
                message: `${crop} may not be suitable for ${location} (${locationAltitude}m altitude). Outside recommended range of ${cropData.min}-${cropData.max}m.`,
                suggestions: ['Consider alternative crops suitable for this altitude', 'Explore protected cultivation methods']
            };
        }

        if (isOptimal) {
            return {
                valid: true,
                confidence: 0.9,
                message: `Excellent compatibility: ${crop} is well-suited for ${location}'s altitude (${locationAltitude}m).`,
                suggestions: []
            };
        }

        return {
            valid: true,
            confidence: 0.7,
            message: `Good compatibility: ${crop} can be grown in ${location} (${locationAltitude}m) with proper management.`,
            suggestions: ['Monitor for altitude-related stress', 'Consider improved varieties']
        };
    }

    validateSeasonalTiming(crop, month) {
        const normalizedCrop = crop.toLowerCase().trim();
        const monthNum = typeof month === 'string' ? this.getMonthNumber(month) : month;
        
        const seasonalData = this.seasonalPatterns[normalizedCrop];
        if (!seasonalData) {
            return {
                valid: true,
                confidence: 0.5,
                message: 'Limited seasonal data available for this crop.'
            };
        }

        const isPlantingSeason = seasonalData.planting.includes(monthNum);
        const isHarvestSeason = seasonalData.harvesting.includes(monthNum);

        if (isPlantingSeason || isHarvestSeason) {
            return {
                valid: true,
                confidence: 0.9,
                message: 'Optimal timing for this crop.'
            };
        }

        return {
            valid: true,
            confidence: 0.6,
            message: 'Not peak season for this crop, but may be suitable for other activities.'
        };
    }

    getMonthNumber(monthName) {
        const months = {
            'january': 1, 'february': 2, 'march': 3, 'april': 4,
            'may': 5, 'june': 6, 'july': 7, 'august': 8,
            'september': 9, 'october': 10, 'november': 11, 'december': 12
        };
        return months[monthName.toLowerCase()] || 0;
    }

    generateQualityScore(data) {
        let score = 0.7; // Base score
        
        // Check for presence of key research elements
        if (data.sources && data.sources.length > 0) score += 0.1;
        if (data.climate_zone) score += 0.1;
        if (data.disclaimers && data.disclaimers.length > 0) score += 0.05;
        
        // Check calendar completeness
        if (data.calendar && data.calendar.length >= 12) score += 0.05;
        
        // Ensure score doesn't exceed 1.0
        return Math.min(score, 1.0);
    }

    addReliabilityIndicators(data) {
        const enhancedData = { ...data };
        
        // Add overall quality score
        enhancedData.quality_score = this.generateQualityScore(data);
        
        // Add data freshness indicator
        enhancedData.generated_date = new Date().toISOString().split('T')[0];
        
        // Add uncertainty factors
        enhancedData.uncertainty_factors = [
            'Climate change impacts on traditional patterns',
            'Local microclimate variations',
            'Soil fertility and drainage conditions',
            'Market prices and demand fluctuations',
            'Water availability and irrigation access'
        ];

        return enhancedData;
    }
}

// Export validation functions for use in main application
export function validateAgriculturalData(crop, location) {
    const validator = new AgriculturalValidator();
    return validator.validateCropLocationCompatibility(crop, location);
}

export function enhanceDataReliability(data) {
    const validator = new AgriculturalValidator();
    return validator.addReliabilityIndicators(data);
}