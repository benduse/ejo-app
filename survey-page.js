// survey-page.js

class SurveyPage {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.surveyStorageKey = 'polyglot_survey_responses';
        this.init();
    }

    init() {
        this.form = document.getElementById('survey-form');
        this.progressBar = document.getElementById('survey-progress-bar');
        this.prevBtn = document.getElementById('survey-prev');
        this.nextBtn = document.getElementById('survey-next');
        this.submitBtn = document.getElementById('survey-submit');
        this.thankYouSection = document.getElementById('thank-you-section');

        // Bind events
        this.prevBtn.addEventListener('click', () => this.previousStep());
        this.nextBtn.addEventListener('click', () => this.nextStep());
        this.form.addEventListener('submit', (e) => this.submitSurvey(e));

        // Initialize components
        this.initStarRatings();
        this.initSliders();
        this.updateNavigation();
    }

    initStarRatings() {
        document.querySelectorAll('.star-rating').forEach(container => {
            const stars = container.querySelectorAll('.star');
            const input = container.nextElementSibling;
            
            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    const rating = index + 1;
                    container.setAttribute('data-rating', rating);
                    if (input) input.value = rating;
                    
                    stars.forEach((s, i) => {
                        s.textContent = i < rating ? '★' : '☆';
                        s.classList.toggle('filled', i < rating);
                    });
                });
            });
        });
    }

    initSliders() {
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            const valueDisplay = slider.nextElementSibling;
            slider.addEventListener('input', (e) => {
                if (valueDisplay) valueDisplay.textContent = e.target.value;
            });
        });
    }

    showStep(stepNumber) {
        document.querySelectorAll('.survey-step').forEach(step => {
            step.classList.remove('active');
        });

        const currentStepElement = document.querySelector(`[data-step="${stepNumber}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Update progress
        const progress = (stepNumber / this.totalSteps) * 100;
        this.progressBar.style.width = `${progress}%`;

        this.currentStep = stepNumber;
        this.updateNavigation();
    }

    updateNavigation() {
        this.prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
        this.nextBtn.style.display = this.currentStep === this.totalSteps ? 'none' : 'block';
        this.submitBtn.classList.toggle('hide', this.currentStep !== this.totalSteps);
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.showStep(this.currentStep + 1);
        }
    }

    submitSurvey(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = {};
        
        // Collect all form data
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (checkboxes)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        // Add metadata
        data.timestamp = new Date().toISOString();
        data.playerName = localStorage.getItem('polyglot_player_name') || 'Anonymous';
        data.surveyId = this.generateSurveyId();
        
        // Save to localStorage
        this.saveSurveyToLocalStorage(data);
        
        // Show thank you message
        this.showThankYou();
        
        // Mark survey as completed
        localStorage.setItem('polyglot_survey_completed', 'true');
        localStorage.setItem('polyglot_survey_completion_date', new Date().toISOString());
    }

    saveSurveyToLocalStorage(data) {
        try {
            // Get existing surveys or initialize empty array
            const existingSurveys = JSON.parse(localStorage.getItem(this.surveyStorageKey) || '[]');
            
            // Add new survey response
            existingSurveys.push(data);
            
            // Save back to localStorage
            localStorage.setItem(this.surveyStorageKey, JSON.stringify(existingSurveys));
            
            console.log('Survey saved successfully:', data);
            
        } catch (error) {
            console.error('Error saving survey:', error);
            alert('There was an error saving your feedback. Please try again.');
        }
    }

    generateSurveyId() {
        return `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    showThankYou() {
        this.form.style.display = 'none';
        this.thankYouSection.classList.remove('hide');
        
        // Optional: Redirect back to quiz after delay
        setTimeout(() => {
            // window.location.href = 'index.html';
        }, 5000);
    }

    // Utility method to export survey data (for admin use)
    exportSurveyData() {
        const surveys = localStorage.getItem(this.surveyStorageKey);
        if (!surveys) {
            console.log('No survey data found');
            return;
        }

        const blob = new Blob([surveys], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `survey_responses_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Utility method to view all surveys (for debugging)
    viewAllSurveys() {
        const surveys = JSON.parse(localStorage.getItem(this.surveyStorageKey) || '[]');
        console.table(surveys);
        return surveys;
    }

    // Clear all survey data (admin function)
    clearAllSurveys() {
        if (confirm('Are you sure you want to delete all survey responses?')) {
            localStorage.removeItem(this.surveyStorageKey);
            console.log('All survey data cleared');
        }
    }
}

// Initialize survey page when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    const surveyPage = new SurveyPage();
    
    // Make utility functions available in console for admin use
    window.surveyAdmin = {
        exportData: () => surveyPage.exportSurveyData(),
        viewAll: () => surveyPage.viewAllSurveys(),
        clearAll: () => surveyPage.clearAllSurveys()
    };
});