// Bhutan Agricultural Research Data
// This file contains research-based data for Bhutan's agricultural zones and practices

export const bhutanAgroZones = {
    'temperate': {
        altitudeRange: '2000-4000m',
        climate: 'Cool temperate climate with distinct seasons',
        majorCrops: ['barley', 'buckwheat', 'potato', 'turnip', 'mustard'],
        districts: ['Thimphu', 'Paro', 'Haa', 'Bumthang', 'Wangdue']
    },
    'subtropical': {
        altitudeRange: '600-2000m',
        climate: 'Warm subtropical with monsoon influence',
        majorCrops: ['rice', 'maize', 'millet', 'wheat', 'vegetables'],
        districts: ['Samtse', 'Chhukha', 'Sarpang', 'Dagana', 'Tsirang']
    },
    'alpine': {
        altitudeRange: '4000m+',
        climate: 'Cold alpine climate with short growing season',
        majorCrops: ['yak herding', 'cordyceps', 'medicinal plants'],
        districts: ['Gasa', 'Laya', 'upper Bumthang']
    }
};

export const researchSources = {
    'ministry': {
        name: 'Ministry of Agriculture and Livestock, Bhutan',
        url: 'https://www.moal.gov.bt/',
        reliability: 'high',
        type: 'official government source'
    },
    'nbc': {
        name: 'National Biodiversity Centre, Bhutan',
        url: 'https://www.nbc.gov.bt/',
        reliability: 'high',
        type: 'scientific research institution'
    },
    'rcb': {
        name: 'Royal University of Bhutan - College of Natural Resources',
        url: 'https://www.cnr.edu.bt/',
        reliability: 'high',
        type: 'academic research'
    },
    'fao': {
        name: 'FAO Country Profile - Bhutan',
        url: 'https://www.fao.org/countryprofiles/index/en/?iso3=BTN',
        reliability: 'high',
        type: 'international organization'
    }
};

export const climaticFactors = {
    monsoon: {
        period: 'June-September',
        impact: 'Heavy rainfall affects planting and harvesting schedules',
        considerations: 'Drainage, disease management, delayed harvest'
    },
    winter: {
        period: 'December-February',
        impact: 'Cold temperatures limit crop growth',
        considerations: 'Frost protection, greenhouse cultivation, storage'
    },
    dryseason: {
        period: 'October-March',
        impact: 'Limited rainfall requires irrigation planning',
        considerations: 'Water management, drought-resistant varieties'
    }
};

export const traditionalKnowledge = {
    'lunar_calendar': {
        description: 'Traditional Bhutanese lunar calendar influences planting decisions',
        source: 'Indigenous agricultural practices',
        reliability: 'medium-high',
        integration: 'Combines with modern scientific methods'
    },
    'crop_rotation': {
        description: 'Traditional three-field system and fallow practices',
        source: 'Centuries of agricultural experience',
        reliability: 'high',
        integration: 'Scientifically validated sustainable practice'
    },
    'indigenous_varieties': {
        description: 'Local crop varieties adapted to specific microclimates',
        source: 'Traditional seed conservation',
        reliability: 'high',
        integration: 'Genetic diversity conservation'
    }
};

export const validationCriteria = {
    'altitude_compatibility': (crop, altitude) => {
        // Validation logic for crop-altitude compatibility
        const cropAltitudeMap = {
            'rice': { min: 200, max: 2800, optimal: [600, 2000] },
            'barley': { min: 2000, max: 4500, optimal: [2500, 4000] },
            'potato': { min: 1500, max: 4000, optimal: [2000, 3500] },
            'maize': { min: 300, max: 2500, optimal: [600, 2000] },
            'wheat': { min: 1000, max: 3500, optimal: [1500, 3000] }
        };
        return cropAltitudeMap[crop.toLowerCase()] || null;
    },
    'seasonal_compatibility': (crop, month) => {
        // Validation for seasonal appropriateness
        const cropSeasons = {
            'rice': { planting: [5, 6], harvesting: [9, 10] },
            'barley': { planting: [10, 11], harvesting: [6, 7] },
            'potato': { planting: [3, 4, 8], harvesting: [6, 7, 11] },
            'maize': { planting: [4, 5], harvesting: [8, 9] },
            'wheat': { planting: [10, 11], harvesting: [5, 6] }
        };
        return cropSeasons[crop.toLowerCase()] || null;
    }
};

export const uncertaintyFactors = [
    'Climate change impacts on traditional patterns',
    'Microclimate variations within districts',
    'Soil type and fertility variations',
    'Access to irrigation and water sources',
    'Market demands and crop pricing',
    'Pest and disease pressure variations'
];