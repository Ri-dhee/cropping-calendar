// assets/main.js

document.addEventListener('DOMContentLoaded', () => {
    const ui = {
        locationInput: document.getElementById('locationInput'),
        queryInput: document.getElementById('queryInput'),
        generateBtn: document.getElementById('generateBtn'),
        clearBtn: document.getElementById('clearBtn'),
        loadingDiv: document.getElementById('loading'),
        responseContainer: document.getElementById('responseContainer'),
        outputDiv: document.getElementById('output'),
        planTitle: document.getElementById('planTitle'),
        planForm: document.getElementById('planForm'),
        themeSwitcher: document.getElementById('themeSwitcher'),
        copyBtn: document.getElementById('copyBtn'),
        planDescription: document.getElementById('planDescription')
    };

    const state = {
        apiKey: "", // IMPORTANT: User must fill this in
        currentTheme: localStorage.getItem('theme') || 'light-mode'
    };

    function init() {
        loadState();
        applyTheme(state.currentTheme);
        addEventListeners();
        checkApiKey();
    }

    function loadState() {
        if (localStorage.getItem('location')) ui.locationInput.value = localStorage.getItem('location');
        if (localStorage.getItem('query')) ui.queryInput.value = localStorage.getItem('query');
    }

    function applyTheme(theme) {
        document.body.className = theme;
        ui.themeSwitcher.innerHTML = theme === 'light-mode' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', theme);
    }

    function checkApiKey() {
        if (!state.apiKey) {
            renderErrorMessage("API Key is not set. Please add your API key in `assets/main.js` to use the app.", "Configuration Error");
        }
    }

    function addEventListeners() {
        ui.planForm.addEventListener('submit', e => {
            e.preventDefault();
            generatePlan();
        });

        ui.clearBtn.addEventListener('click', () => {
            ui.locationInput.value = '';
            ui.queryInput.value = '';
            ui.responseContainer.classList.add('hidden');
            localStorage.removeItem('location');
            localStorage.removeItem('query');
        });

        ui.themeSwitcher.addEventListener('click', () => {
            state.currentTheme = state.currentTheme === 'light-mode' ? 'dark-mode' : 'light-mode';
            applyTheme(state.currentTheme);
        });

        ui.copyBtn.addEventListener('click', copyPlanToClipboard);
    }

    async function generatePlan() {
        if (!state.apiKey) {
            checkApiKey();
            return;
        }

        const location = ui.locationInput.value.trim();
        const query = ui.queryInput.value.trim();

        if (!location || !query) {
            renderErrorMessage("Please provide both a location and a crop/livestock.", "Input Required");
            return;
        }

        localStorage.setItem('location', location);
        localStorage.setItem('query', query);

        setLoading(true);

        const systemPrompt = `You are a research-driven agricultural consultant specializing in Bhutan's agro-ecological systems. Base your recommendations on:

SCIENTIFIC SOURCES & AUTHORITY:
- Ministry of Agriculture and Livestock, Bhutan guidelines
- National Biodiversity Centre research
- Royal University of Bhutan agricultural studies
- FAO Bhutan country profiles
- Traditional Bhutanese agricultural knowledge systems

AGRO-ECOLOGICAL ZONES (validate against altitude/climate):
- Subtropical (600-2000m): rice, maize, millet, vegetables
- Temperate (2000-4000m): barley, buckwheat, potato, mustard
- Alpine (4000m+): yak herding, medicinal plants

CLIMATIC CONSIDERATIONS:
- Monsoon period (June-September): heavy rainfall impacts
- Winter (December-February): frost and cold limitations
- Dry season (October-March): irrigation requirements

RELIABILITY REQUIREMENTS:
- Include confidence levels for each recommendation
- Cite relevant sources when possible
- Note variations due to microclimate, soil, and altitude
- Include traditional and scientific approaches
- Acknowledge uncertainty factors

The response must be a JSON object with:
- "title": Clear descriptive title
- "description": Brief overview with reliability notes
- "confidence": Overall confidence score (0.0-1.0)
- "sources": Array of key sources referenced
- "climate_zone": Identified agro-ecological zone
- "calendar": Array with "month", "tasks", "confidence", "notes"
- "disclaimers": Important limitations and consultation advice

Ensure recommendations are scientifically sound and acknowledge limitations.`;
        const userQuery = `Generate a research-backed farming calendar for ${query} in ${location}, Bhutan. Include confidence levels, cite relevant sources, identify the appropriate agro-ecological zone, and provide disclaimers about limitations. Consider altitude, climate patterns, traditional practices, and modern agricultural research.`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                responseMimeType: "application/json",
            }
        };

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${state.apiKey}`;

        try {
            const response = await fetchWithExponentialBackoff(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                const data = JSON.parse(result.candidates[0].content.parts[0].text);
                renderPlan(data);
            } else {
                throw new Error("Invalid API response structure.");
            }
        } catch (error) {
            console.error("API call failed:", error);
            renderErrorMessage(`Failed to generate plan. ${error.message}. Please check your API key and network.`, "API Error");
        } finally {
            setLoading(false);
        }
    }

    function renderPlan(data) {
        ui.planTitle.textContent = data.title;
        ui.planDescription.textContent = data.description;
        
        // Create confidence indicator
        const confidencePercentage = Math.round((data.confidence || 0.8) * 100);
        const confidenceColor = data.confidence >= 0.8 ? 'text-green-600' : data.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600';
        
        ui.outputDiv.innerHTML = `
            <div class="mb-6">
                <div class="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm font-semibold text-blue-800">Research-Based Information</p>
                            <p class="text-xs text-blue-600">Climate Zone: ${data.climate_zone || 'Not specified'}</p>
                        </div>
                        <span class="text-sm font-bold ${confidenceColor}">
                            Confidence: ${confidencePercentage}%
                        </span>
                    </div>
                </div>

                ${data.sources && data.sources.length > 0 ? `
                    <div class="mb-4">
                        <p class="text-xs font-semibold text-gray-700 mb-1">Sources Referenced:</p>
                        <ul class="text-xs text-gray-600 list-disc list-inside">
                            ${data.sources.map(source => `<li>${source}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>

            <div class="calendar-grid">
                ${data.calendar.map(monthData => {
                    const monthConfidence = Math.round((monthData.confidence || 0.8) * 100);
                    const monthConfidenceColor = monthData.confidence >= 0.8 ? 'text-green-600' : 
                                               monthData.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600';
                    
                    return `
                        <div class="month-card">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="month-header">${monthData.month}</h3>
                                <span class="text-xs font-semibold ${monthConfidenceColor}">
                                    ${monthConfidence}%
                                </span>
                            </div>
                            <ul class="task-list">
                                ${monthData.tasks.map(task => `<li class="task-item">${task}</li>`).join('')}
                            </ul>
                            ${monthData.notes ? `
                                <div class="mt-3 pt-2 border-t border-gray-200">
                                    <p class="text-xs text-gray-500 italic">${monthData.notes}</p>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>

            ${data.disclaimers && data.disclaimers.length > 0 ? `
                <div class="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <h4 class="text-sm font-semibold text-yellow-800 mb-2">Important Disclaimers:</h4>
                    <ul class="text-sm text-yellow-700 list-disc list-inside space-y-1">
                        ${data.disclaimers.map(disclaimer => `<li>${disclaimer}</li>`).join('')}
                    </ul>
                    <p class="text-xs text-yellow-600 mt-2 font-medium">
                        Always consult with local agricultural extension officers and experienced farmers in your area.
                    </p>
                </div>
            ` : ''}
        `;
        ui.responseContainer.classList.remove('hidden');
        ui.responseContainer.focus();
    }

    function renderErrorMessage(message, title = "Oops!") {
        ui.planTitle.textContent = title;
        ui.planDescription.textContent = '';
        ui.outputDiv.innerHTML = `<div class="error-message">${message}</div>`;
        ui.responseContainer.classList.remove('hidden');
        ui.responseContainer.focus();
    }

    function setLoading(isLoading) {
        ui.loadingDiv.classList.toggle('hidden', !isLoading);
        ui.responseContainer.classList.add('hidden');
        ui.generateBtn.disabled = isLoading;
    }

    async function copyPlanToClipboard() {
        const title = ui.planTitle.textContent;
        const description = ui.planDescription.textContent;
        const tasks = Array.from(document.querySelectorAll('.month-card')).map(card => {
            const month = card.querySelector('.month-header').textContent;
            const taskItems = Array.from(card.querySelectorAll('.task-item')).map(li => `  - ${li.textContent}`).join('\n');
            return `${month}:\n${taskItems}`;
        }).join('\n\n');

        const textToCopy = `${title}\n${description}\n\n${tasks}`;

        try {
            await navigator.clipboard.writeText(textToCopy);
            ui.copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                ui.copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Plan';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }

    async function fetchWithExponentialBackoff(url, options, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(url, options);
                if (response.ok) return response;
                if (response.status === 429) {
                    const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    init();
});
