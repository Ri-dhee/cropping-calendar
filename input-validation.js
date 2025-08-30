// Input Validation and Guardrail System
// Provides real-time validation, suggestions, and contextual alerts

import { getLocationSuggestions, getCropSuggestions, validateInputCombination } from './validation.js';

export class InputValidationSystem {
    constructor() {
        this.selectedSuggestionIndex = -1;
        this.validationTimeout = null;
        this.suggestionsVisible = false;
    }

    initialize() {
        this.setupLocationInput();
        this.setupCropInput();
        this.setupValidationHandlers();
        this.setupKeyboardNavigation();
    }

    setupLocationInput() {
        const locationInput = document.getElementById('locationInput');
        const suggestionsContainer = document.getElementById('locationSuggestions');

        locationInput.addEventListener('input', (e) => {
            this.handleLocationInput(e.target.value, suggestionsContainer);
        });

        locationInput.addEventListener('focus', (e) => {
            if (e.target.value.length >= 2) {
                this.handleLocationInput(e.target.value, suggestionsContainer);
            }
        });

        locationInput.addEventListener('blur', (e) => {
            // Delay hiding to allow click on suggestions
            setTimeout(() => {
                this.hideSuggestions(suggestionsContainer);
            }, 150);
        });
    }

    setupCropInput() {
        const cropInput = document.getElementById('queryInput');
        const suggestionsContainer = document.getElementById('cropSuggestions');

        cropInput.addEventListener('input', (e) => {
            this.handleCropInput(e.target.value, suggestionsContainer);
        });

        cropInput.addEventListener('focus', (e) => {
            if (e.target.value.length >= 2) {
                this.handleCropInput(e.target.value, suggestionsContainer);
            }
        });

        cropInput.addEventListener('blur', (e) => {
            // Delay hiding to allow click on suggestions
            setTimeout(() => {
                this.hideSuggestions(suggestionsContainer);
            }, 150);
        });
    }

    setupValidationHandlers() {
        const locationInput = document.getElementById('locationInput');
        const cropInput = document.getElementById('queryInput');

        const validateCombination = () => {
            if (this.validationTimeout) {
                clearTimeout(this.validationTimeout);
            }
            
            this.validationTimeout = setTimeout(() => {
                this.performValidation(locationInput.value, cropInput.value);
            }, 500);
        };

        locationInput.addEventListener('input', validateCombination);
        cropInput.addEventListener('input', validateCombination);
    }

    setupKeyboardNavigation() {
        const locationInput = document.getElementById('locationInput');
        const cropInput = document.getElementById('queryInput');

        locationInput.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e, 'locationSuggestions');
        });

        cropInput.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e, 'cropSuggestions');
        });
    }

    handleLocationInput(value, container) {
        if (value.length < 2) {
            this.hideSuggestions(container);
            return;
        }

        const suggestions = getLocationSuggestions(value);
        this.displayLocationSuggestions(suggestions, container);
    }

    handleCropInput(value, container) {
        if (value.length < 2) {
            this.hideSuggestions(container);
            return;
        }

        const suggestions = getCropSuggestions(value);
        this.displayCropSuggestions(suggestions, container);
    }

    displayLocationSuggestions(suggestions, container) {
        if (suggestions.length === 0) {
            this.hideSuggestions(container);
            return;
        }

        container.innerHTML = suggestions.map((suggestion, index) => `
            <div class="suggestion-item" data-index="${index}" data-value="${suggestion.name}">
                <div class="font-medium">${suggestion.displayName}</div>
                <div class="text-xs text-gray-500">Altitude: ${suggestion.altitude}m</div>
            </div>
        `).join('');

        this.attachSuggestionHandlers(container, 'locationInput');
        this.showSuggestions(container);
    }

    displayCropSuggestions(suggestions, container) {
        if (suggestions.length === 0) {
            this.hideSuggestions(container);
            return;
        }

        container.innerHTML = suggestions.map((suggestion, index) => `
            <div class="suggestion-item" data-index="${index}" data-value="${suggestion.name}">
                <div class="font-medium">${suggestion.displayName}</div>
                <div class="text-xs text-gray-500">Zone: ${suggestion.zone}</div>
            </div>
        `).join('');

        this.attachSuggestionHandlers(container, 'queryInput');
        this.showSuggestions(container);
    }

    attachSuggestionHandlers(container, inputId) {
        const items = container.querySelectorAll('.suggestion-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const input = document.getElementById(inputId);
                input.value = item.dataset.value;
                this.hideSuggestions(container);
                input.focus();
                
                // Trigger validation after selection
                this.performValidation(
                    document.getElementById('locationInput').value,
                    document.getElementById('queryInput').value
                );
            });
        });
    }

    handleKeyNavigation(event, containerId) {
        const container = document.getElementById(containerId);
        if (container.classList.contains('hidden')) return;

        const items = container.querySelectorAll('.suggestion-item');
        if (items.length === 0) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.selectedSuggestionIndex = Math.min(this.selectedSuggestionIndex + 1, items.length - 1);
                this.highlightSuggestion(items);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
                this.highlightSuggestion(items);
                break;
            case 'Enter':
                if (this.selectedSuggestionIndex >= 0) {
                    event.preventDefault();
                    items[this.selectedSuggestionIndex].click();
                }
                break;
            case 'Escape':
                this.hideSuggestions(container);
                this.selectedSuggestionIndex = -1;
                break;
        }
    }

    highlightSuggestion(items) {
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedSuggestionIndex);
        });
    }

    showSuggestions(container) {
        container.classList.remove('hidden');
        this.suggestionsVisible = true;
        this.selectedSuggestionIndex = -1;
    }

    hideSuggestions(container) {
        container.classList.add('hidden');
        this.suggestionsVisible = false;
        this.selectedSuggestionIndex = -1;
    }

    performValidation(location, crop) {
        const alertsContainer = document.getElementById('validationAlerts');
        
        if (!location || !crop) {
            alertsContainer.classList.add('hidden');
            return;
        }

        const validation = validateInputCombination(crop, location);
        
        if (validation.alerts.length > 0) {
            this.displayValidationAlerts(validation.alerts, alertsContainer);
        } else {
            alertsContainer.classList.add('hidden');
        }
    }

    displayValidationAlerts(alerts, container) {
        const alertsHtml = alerts.map(alert => {
            const suggestionsHtml = alert.suggestions && alert.suggestions.length > 0 ? `
                <div class="alert-suggestions">
                    ${alert.alternativeMessage ? `<div class="text-sm font-medium mb-2">${alert.alternativeMessage}</div>` : ''}
                    <div class="suggestion-chips">
                        ${alert.suggestions.map(suggestion => 
                            `<span class="suggestion-chip" onclick="inputValidation.applySuggestion('${suggestion}')">${suggestion}</span>`
                        ).join('')}
                    </div>
                </div>
            ` : '';

            return `
                <div class="validation-alert ${alert.type}">
                    <div class="font-semibold">${alert.title}</div>
                    <div class="text-sm mt-1">${alert.message}</div>
                    ${suggestionsHtml}
                </div>
            `;
        }).join('');

        container.innerHTML = alertsHtml;
        container.classList.remove('hidden');
    }

    applySuggestion(suggestion) {
        const cropInput = document.getElementById('queryInput');
        cropInput.value = suggestion;
        
        // Trigger validation after applying suggestion
        this.performValidation(
            document.getElementById('locationInput').value,
            cropInput.value
        );
        
        cropInput.focus();
    }
}

// Global instance for onclick handlers
window.inputValidation = null;