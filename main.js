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

        const systemPrompt = `You are a world-class agricultural consultant for Bhutan, providing elite, data-driven advice. Generate a comprehensive, month-by-month farming calendar. The response must be a single, minified JSON object with "title", "description", and a "calendar" array. Each calendar item must have "month" and an array of "tasks". Tasks should be professional, actionable, and specific to Bhutan's unique agro-ecological zones. Do not include any text outside the JSON object.`;
        const userQuery = `Generate a professional farming calendar for ${query} in ${location}, Bhutan.`;

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
        ui.outputDiv.innerHTML = `
            <div class="calendar-grid">
                ${data.calendar.map(monthData => `
                    <div class="month-card">
                        <h3 class="month-header">${monthData.month}</h3>
                        <ul class="task-list">
                            ${monthData.tasks.map(task => `<li class="task-item">${task}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
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
