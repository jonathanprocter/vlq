/**
 * Valued Living Questionnaires - Main JavaScript
 * Handles core application logic, form validation, and data processing
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initNavigation();
    
    // Initialize form validation and event listeners
    initForms();

    // Initialize range input displays
    initRangeInputs();

    // Initialize checkbox validation for prioritization
    initPrioritizationValidation();
    
    // Initialize export buttons
    initExportButtons();
});

/**
 * Initialize navigation between questionnaires and landing page
 */
function initNavigation() {
    // Start VLQ-1 button
    const startVLQ1Button = document.getElementById('start-vlq1');
    if (startVLQ1Button) {
        startVLQ1Button.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('vlq1-section').style.display = 'block';
            document.getElementById('vlq2-section').style.display = 'none';
            document.getElementById('results-section').style.display = 'none';
            
            // Scroll to form
            document.getElementById('vlq1-section').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    // Start VLQ-2 button
    const startVLQ2Button = document.getElementById('start-vlq2');
    if (startVLQ2Button) {
        startVLQ2Button.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('vlq1-section').style.display = 'none';
            document.getElementById('vlq2-section').style.display = 'block';
            document.getElementById('results-section').style.display = 'none';
            
            // Scroll to form
            document.getElementById('vlq2-section').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Initialize form validation and submission handling
 */
function initForms() {
    // VLQ-1 Form
    const vlq1Form = document.getElementById('vlq1-form');
    if (vlq1Form) {
        vlq1Form.addEventListener('submit', function(e) {
            e.preventDefault();

            if (validateVLQ1Form()) {
                const formData = processVLQ1FormData();
                saveFormData('vlq1', formData);
                showResults('vlq1', formData);
            }
        });
    }

    // VLQ-2 Form
    const vlq2Form = document.getElementById('vlq2-form');
    if (vlq2Form) {
        vlq2Form.addEventListener('submit', function(e) {
            e.preventDefault();

            if (validateVLQ2Form()) {
                const formData = processVLQ2FormData();
                saveFormData('vlq2', formData);
                showResults('vlq2', formData);
            }
        });
    }
}

/**
 * Initialize range input displays to show current value
 */
function initRangeInputs() {
    const rangeInputs = document.querySelectorAll('input[type="range"]');

    rangeInputs.forEach(input => {
        // Set initial value display
        const valueDisplay = input.parentElement.querySelector('.value-display');
        if (valueDisplay) {
            valueDisplay.textContent = input.value;
        }

        // Update value display on input change
        input.addEventListener('input', function() {
            if (valueDisplay) {
                valueDisplay.textContent = this.value;
            }
        });
    });
}

/**
 * Initialize validation for prioritization checkboxes
 */
function initPrioritizationValidation() {
    // Limit selection to 5 checkboxes for priority_five
    const priorityFiveCheckboxes = document.querySelectorAll('input[name="priority_five"]');
    if (priorityFiveCheckboxes.length > 0) {
        priorityFiveCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const checked = document.querySelectorAll('input[name="priority_five"]:checked');
                if (checked.length > 5) {
                    this.checked = false;
                    alert('Please select only 5 areas to work on.');
                }
            });
        });
    }

    // Limit selection to 3 checkboxes for priority_three
    const priorityThreeCheckboxes = document.querySelectorAll('input[name="priority_three"]');
    if (priorityThreeCheckboxes.length > 0) {
        priorityThreeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const checked = document.querySelectorAll('input[name="priority_three"]:checked');
                if (checked.length > 3) {
                    this.checked = false;
                    alert('Please select only 3 areas to work on.');
                }
            });
        });
    }
}

/**
 * Initialize export buttons functionality
 */
function initExportButtons() {
    const saveResultsButton = document.getElementById('save-results');
    if (saveResultsButton) {
        saveResultsButton.addEventListener('click', function() {
            alert('Results saved successfully!');
        });
    }
    
    const printResultsButton = document.getElementById('print-results');
    if (printResultsButton) {
        printResultsButton.addEventListener('click', function() {
            window.print();
        });
    }
    
    const emailResultsButton = document.getElementById('email-results');
    if (emailResultsButton) {
        emailResultsButton.addEventListener('click', function() {
            alert('Email feature coming soon!');
        });
    }
}

/**
 * Validate VLQ-1 form
 * @returns {boolean} True if form is valid, false otherwise
 */
function validateVLQ1Form() {
    const form = document.getElementById('vlq1-form');
    if (!form) return false;

    // Check if all required fields are filled
    // Instead of only selecting radios marked as required, which
    // can miss the user's actual selection, gather all radios and
    // validate each group by name.
    const allRadios = form.querySelectorAll('input[type="radio"]');
    const radioGroups = {};

    // Group radios by name
    allRadios.forEach(radio => {
        if (!radioGroups[radio.name]) {
            radioGroups[radio.name] = [];
        }
        radioGroups[radio.name].push(radio);
    });

    // Check if at least one radio in each group is checked
    let isValid = true;
    for (const groupName in radioGroups) {
        const isChecked = [...radioGroups[groupName]].some(radio => radio.checked);
        if (!isChecked) {
            isValid = false;
            // Find the closest table row to highlight
            const row = radioGroups[groupName][0].closest('tr');
            if (row) {
                row.classList.add('error');
                setTimeout(() => {
                    row.classList.remove('error');
                }, 3000);
            }
        }
    }

    if (!isValid) {
        alert('Please rate all areas before submitting.');
    }

    return isValid;
}

/**
 * Validate VLQ-2 form
 * @returns {boolean} True if form is valid, false otherwise
 */
function validateVLQ2Form() {
    const form = document.getElementById('vlq2-form');
    if (!form) return false;

    // Check prioritization
    // Check if exactly 5 checkboxes are selected for priority_five
    const priorityFiveChecked = document.querySelectorAll('input[name="priority_five"]:checked');
    let isValid = priorityFiveChecked.length === 5;
    
    if (priorityFiveChecked.length !== 5) {
        isValid = false;
        const checkboxGroup = document.querySelector('input[name="priority_five"]').closest('.checkbox-group');
        if (checkboxGroup) {
            checkboxGroup.classList.add('error');
            setTimeout(() => {
                checkboxGroup.classList.remove('error');
            }, 3000);
        }
    }

    // Check if exactly 3 checkboxes are selected for priority_three
    const priorityThreeChecked = document.querySelectorAll('input[name="priority_three"]:checked');
    if (priorityThreeChecked.length !== 3) {
        isValid = false;
        const checkboxGroup = document.querySelector('input[name="priority_three"]').closest('.checkbox-group');
        if (checkboxGroup) {
            checkboxGroup.classList.add('error');
            setTimeout(() => {
                checkboxGroup.classList.remove('error');
            }, 3000);
        }
    }

    if (!isValid) {
        alert('Please complete all required fields before submitting:' + 
              '\n- Select exactly 5 areas to work on' + 
              '\n- Select exactly 3 areas to prioritize');
    }

    return isValid;
}

/**
 * Process VLQ-1 form data
 * @returns {Object} Processed form data
 */
function processVLQ1FormData() {
    const form = document.getElementById('vlq1-form');
    if (!form) return {};

    const formData = {
        importance: {},
        consistency: {},
        timestamp: new Date().toISOString()
    };

    // Process importance ratings
    const importanceRadios = form.querySelectorAll('input[name^="importance_"]:checked');
    importanceRadios.forEach(radio => {
        const domain = radio.name.replace('importance_', '');
        formData.importance[domain] = parseInt(radio.value);
    });

    // Process consistency ratings
    const consistencyRadios = form.querySelectorAll('input[name^="consistency_"]:checked');
    consistencyRadios.forEach(radio => {
        const domain = radio.name.replace('consistency_', '');
        formData.consistency[domain] = parseInt(radio.value);
    });

    return formData;
}

/**
 * Process VLQ-2 form data
 * @returns {Object} Processed form data
 */
function processVLQ2FormData() {
    const form = document.getElementById('vlq2-form');
    if (!form) return {};

    const domains = [
        'family', 'marriage'
    ];

    const aspects = [
        'possibility', 'current_importance', 'overall_importance'
    ];

    const formData = {
        domains: {},
        priorities: {
            five: [],
            three: []
        },
        timestamp: new Date().toISOString()
    };

    // Process domain ratings
    domains.forEach(domain => {
        formData.domains[domain] = {};

        aspects.forEach(aspect => {
            const input = form.querySelector(`input[name="${domain}_${aspect}"]`);
            if (input) {
                formData.domains[domain][aspect] = parseInt(input.value);
            }
        });
    });

    // Process priorities
    const priorityFiveChecked = form.querySelectorAll('input[name="priority_five"]:checked');
    priorityFiveChecked.forEach(checkbox => {
        formData.priorities.five.push(checkbox.value);
    });

    const priorityThreeChecked = form.querySelectorAll('input[name="priority_three"]:checked');
    priorityThreeChecked.forEach(checkbox => {
        formData.priorities.three.push(checkbox.value);
    });

    return formData;
}

/**
 * Save form data to localStorage
 * @param {string} formType - Type of form ('vlq1' or 'vlq2')
 * @param {Object} formData - Form data to save
 */
function saveFormData(formType, formData) {
    try {
        localStorage.setItem(`${formType}_data`, JSON.stringify(formData));
        console.log(`${formType} data saved to localStorage`);
    } catch (error) {
        console.error('Error saving form data:', error);
    }
}

/**
 * Load form data from localStorage
 * @param {string} formType - Type of form ('vlq1' or 'vlq2')
 * @returns {Object|null} Form data or null if not found
 */
function loadFormData(formType) {
    try {
        const data = localStorage.getItem(`${formType}_data`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading form data:', error);
        return null;
    }
}

/**
 * Show results section and generate visualizations
 * @param {string} formType - Type of form ('vlq1' or 'vlq2')
 * @param {Object} formData - Form data to visualize
 */
function showResults(formType, formData) {
    const resultsSection = document.getElementById('results-section');
    if (!resultsSection) return;

    // Hide form sections
    document.getElementById('vlq1-section').style.display = 'none';
    document.getElementById('vlq2-section').style.display = 'none';
    
    // Show results section
    resultsSection.style.display = 'block';

    // Scroll to results section
    resultsSection.scrollIntoView({
        behavior: 'smooth'
    });

    // Generate visualizations based on form type
    if (formType === 'vlq1') {
        generateVLQ1Visualizations(formData);
    } else if (formType === 'vlq2') {
        generateVLQ2Visualizations(formData);
    }

    // Update narrative summary combining both questionnaires
    const narrativeText = generateCombinedNarrative();
    const narrativeEl = document.getElementById('narrative');
    if (narrativeEl) {
        narrativeEl.textContent = narrativeText;
    }
}

/**
 * Generate visualizations for VLQ-1 results
 * @param {Object} formData - VLQ-1 form data
 */
function generateVLQ1Visualizations(formData) {
    // Get domain labels
    const domains = Object.keys(formData.importance);
    const labels = domains.map(domain => {
        return domain.charAt(0).toUpperCase() + domain.slice(1);
    });
    
    // Extract importance and consistency values
    const importanceValues = domains.map(domain => formData.importance[domain]);
    const consistencyValues = domains.map(domain => formData.consistency[domain]);
    
    // Create radar chart
    const radarCtx = document.getElementById('radar-chart').getContext('2d');
    new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Importance',
                    data: importanceValues,
                    backgroundColor: 'rgba(74, 111, 165, 0.2)',
                    borderColor: 'rgba(74, 111, 165, 1)',
                    pointBackgroundColor: 'rgba(74, 111, 165, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(74, 111, 165, 1)'
                },
                {
                    label: 'Consistency',
                    data: consistencyValues,
                    backgroundColor: 'rgba(77, 170, 87, 0.2)',
                    borderColor: 'rgba(77, 170, 87, 1)',
                    pointBackgroundColor: 'rgba(77, 170, 87, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(77, 170, 87, 1)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 10
                }
            }
        }
    });
    
    // Create bar chart for comparison
    const barCtx = document.getElementById('bar-chart').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Importance',
                    data: importanceValues,
                    backgroundColor: 'rgba(74, 111, 165, 0.7)',
                    borderColor: 'rgba(74, 111, 165, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Consistency',
                    data: consistencyValues,
                    backgroundColor: 'rgba(77, 170, 87, 0.7)',
                    borderColor: 'rgba(77, 170, 87, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });
}

/**
 * Generate visualizations for VLQ-2 results
 * @param {Object} formData - VLQ-2 form data
 */
function generateVLQ2Visualizations(formData) {
    // Extract domains and their values
    const domains = Object.keys(formData.domains);
    const labels = domains.map(domain => {
        return domain.charAt(0).toUpperCase() + domain.slice(1);
    });
    
    // Extract aspect values for each domain
    const aspects = ['possibility', 'current_importance', 'overall_importance'];
    const datasets = aspects.map((aspect, index) => {
        const label = aspect.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const data = domains.map(domain => formData.domains[domain][aspect] || 0);
        
        // Different colors for each aspect
        const colors = [
            'rgba(74, 111, 165, 0.7)',  // blue
            'rgba(77, 170, 87, 0.7)',   // green
            'rgba(245, 130, 49, 0.7)'   // orange
        ];
        
        return {
            label: label,
            data: data,
            backgroundColor: colors[index],
            borderColor: colors[index].replace('0.7', '1'),
            borderWidth: 1
        };
    });
    
    // Create radar chart
    const radarCtx = document.getElementById('radar-chart').getContext('2d');
    new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 10
                }
            }
        }
    });
    
    // Create bar chart for priorities
    const barCtx = document.getElementById('bar-chart').getContext('2d');
    
    // Create data for priorities
    const priorityLabels = ['Top 5 Areas', 'Top 3 Areas'];
    const priorityData = [
        formData.priorities.five.length, 
        formData.priorities.three.length
    ];
    
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: priorityLabels,
            datasets: [{
                label: 'Number of Selected Priorities',
                data: priorityData,
                backgroundColor: [
                    'rgba(74, 111, 165, 0.7)',
                    'rgba(77, 170, 87, 0.7)'
                ],
                borderColor: [
                    'rgba(74, 111, 165, 1)',
                    'rgba(77, 170, 87, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 5
                }
            }
        }
    });
}

/**
 * Generate a combined narrative summary for VLQ-1 and VLQ-2
 * @returns {string} Narrative text
 */
function generateCombinedNarrative() {
    const vlq1 = loadFormData('vlq1');
    const vlq2 = loadFormData('vlq2');

    let parts = [];

    if (vlq1) {
        const highImportance = [];
        const highConsistency = [];
        const largeGaps = [];

        Object.keys(vlq1.importance).forEach(domain => {
            const imp = vlq1.importance[domain];
            const con = vlq1.consistency[domain];
            const cap = domain.charAt(0).toUpperCase() + domain.slice(1);
            if (imp >= 8) highImportance.push(cap);
            if (con >= 8) highConsistency.push(cap);
            if (imp - con >= 3) largeGaps.push(cap);
        });

        let text = '';
        if (highImportance.length > 0) {
            text += `Your most valued areas are ${highImportance.join(', ')}.`;
        }
        if (highConsistency.length > 0) {
            text += ` You show high consistency in ${highConsistency.join(', ')}.`;
        }
        if (largeGaps.length > 0) {
            text += ` Consider focusing on ${largeGaps.join(', ')} to better align actions with values.`;
        }
        parts.push(text);
    }

    if (vlq2) {
        const topFive = vlq2.priorities.five.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
        const topThree = vlq2.priorities.three.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');

        let text = `VLQ-2 shows interest in working on ${topFive}. Your top three priorities are ${topThree}.`;
        parts.push(text);
    }

    if (parts.length === 0) {
        return '';
    }

    return parts.join(' ');
}
