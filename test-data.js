// Mock test data for demonstrating enhanced research-driven features
// This simulates the improved AI response format

export const mockEnhancedResponse = {
    "title": "Research-Based Rice Cultivation Calendar for Paro, Bhutan",
    "description": "Evidence-based agricultural calendar for rice cultivation in Paro district, considering local climate conditions, altitude (2200m), and traditional farming practices validated against scientific research.",
    "confidence": 0.85,
    "sources": [
        "Ministry of Agriculture and Livestock, Bhutan - Rice Production Guidelines",
        "Royal University of Bhutan - CNR Agricultural Research",
        "Traditional Bhutanese Farming Calendar (validated)",
        "FAO - Climate-Smart Agriculture for Bhutan"
    ],
    "climate_zone": "Temperate (2000-4000m altitude)",
    "calendar": [
        {
            "month": "January",
            "tasks": [
                "Plan rice variety selection based on altitude and climate",
                "Prepare nursery beds with proper drainage",
                "Collect and treat seeds for disease prevention",
                "Maintenance of irrigation channels and water sources"
            ],
            "confidence": 0.9,
            "notes": "Winter preparation phase - critical for successful cultivation at 2200m altitude"
        },
        {
            "month": "February", 
            "tasks": [
                "Continue nursery preparation and soil testing",
                "Apply organic compost to nursery beds",
                "Repair agricultural tools and equipment",
                "Attend agricultural extension training sessions"
            ],
            "confidence": 0.85,
            "notes": "Pre-planting preparation continues - soil temperature still too low for direct seeding"
        },
        {
            "month": "March",
            "tasks": [
                "Begin land preparation - plowing and leveling",
                "Apply base fertilizers and organic matter",
                "Prepare main field irrigation systems",
                "Start seed soaking and germination testing"
            ],
            "confidence": 0.9,
            "notes": "Critical month for field preparation in temperate zones"
        },
        {
            "month": "April",
            "tasks": [
                "Sow rice seeds in prepared nursery beds",
                "Continue field preparation and puddling",
                "Monitor soil temperature and moisture",
                "Apply pre-emergence fertilizers"
            ],
            "confidence": 0.95,
            "notes": "Optimal nursery establishment period for Paro's climate conditions"
        },
        {
            "month": "May",
            "tasks": [
                "Transplant rice seedlings to main fields",
                "Maintain proper water levels (2-5cm depth)",
                "Begin regular weeding and monitoring",
                "Apply first split of nitrogen fertilizer"
            ],
            "confidence": 0.95,
            "notes": "Peak transplanting season - timing critical for yield optimization"
        },
        {
            "month": "June",
            "tasks": [
                "Continue transplanting (early varieties)",
                "Implement integrated pest management",
                "Regular field monitoring for diseases",
                "Maintain irrigation water management"
            ],
            "confidence": 0.9,
            "notes": "Monsoon onset - drainage management becomes crucial"
        },
        {
            "month": "July",
            "tasks": [
                "Active growth stage - monitor plant health",
                "Apply second nitrogen fertilizer split",
                "Manage water levels during heavy rains",
                "Control weeds and apply organic matter"
            ],
            "confidence": 0.85,
            "notes": "Monsoon peak - disease pressure high, drainage critical"
        },
        {
            "month": "August",
            "tasks": [
                "Monitor for flowering stage initiation",
                "Continue pest and disease management",
                "Adjust water levels for panicle development",
                "Apply final fertilizer application if needed"
            ],
            "confidence": 0.9,
            "notes": "Pre-flowering stage - critical for grain formation"
        },
        {
            "month": "September",
            "tasks": [
                "Begin harvest preparation for early varieties",
                "Monitor grain filling and maturity",
                "Reduce water levels gradually",
                "Prepare harvesting equipment and storage"
            ],
            "confidence": 0.95,
            "notes": "Harvest begins - timing crucial to prevent post-monsoon losses"
        },
        {
            "month": "October",
            "tasks": [
                "Active harvesting of main crop",
                "Proper drying and storage of grains",
                "Field cleanup and residue management",
                "Market preparation and quality assessment"
            ],
            "confidence": 0.95,
            "notes": "Peak harvest period - quality preservation essential"
        },
        {
            "month": "November",
            "tasks": [
                "Complete harvest and post-harvest processing",
                "Store grains in proper moisture-proof containers",
                "Plan for next season crop rotation",
                "Conduct soil health assessment"
            ],
            "confidence": 0.9,
            "notes": "Post-harvest management and planning for next cycle"
        },
        {
            "month": "December",
            "tasks": [
                "Final grain processing and storage checks",
                "Plan improvements for next season",
                "Participate in farmer group meetings",
                "Maintain agricultural records and accounts"
            ],
            "confidence": 0.8,
            "notes": "Season closure and planning phase"
        }
    ],
    "disclaimers": [
        "Recommendations are based on general climatic conditions for Paro district at 2200m altitude",
        "Local microclimate variations may require adjustments to timing and practices",
        "Soil conditions, water availability, and specific variety selection can significantly impact success",
        "Climate change may be altering traditional patterns - monitor local conditions closely",
        "Always consult with local agricultural extension officers for site-specific guidance",
        "Market conditions and food security needs should influence variety and quantity decisions"
    ],
    "quality_score": 0.88,
    "generated_date": "2024-01-15",
    "uncertainty_factors": [
        "Climate change impacts on traditional patterns",
        "Local microclimate variations",
        "Soil fertility and drainage conditions", 
        "Market prices and demand fluctuations",
        "Water availability and irrigation access"
    ]
};

export function getMockResponse(crop, location) {
    // Simulate API call delay
    return new Promise(resolve => {
        setTimeout(() => {
            const response = { ...mockEnhancedResponse };
            response.title = `Research-Based ${crop.charAt(0).toUpperCase() + crop.slice(1)} Cultivation Calendar for ${location}, Bhutan`;
            response.description = response.description.replace('rice', crop).replace('Paro', location);
            resolve(response);
        }, 2000);
    });
}