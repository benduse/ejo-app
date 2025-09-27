// ==========================
// Ejo Survey Page JS
// ==========================

document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".survey-step");
    const progressBar = document.getElementById("survey-progress-bar");
    const btnPrev = document.getElementById("survey-prev");
    const btnNext = document.getElementById("survey-next");
    const btnSubmit = document.getElementById("survey-submit");
    const surveyForm = document.getElementById("survey-form");
    const thankYouSection = document.getElementById("thank-you-section");
    const totalSteps = steps.length;
    
    let currentStep = 0;

    // ==========================
    // Step Navigation
    // ==========================
    function updateStep() {
        steps.forEach((step, index) => {
            step.classList.toggle("active", index === currentStep);
        });

        // Update Progress Bar
        const progressPercent = ((currentStep) / (totalSteps - 1)) * 100;
        progressBar.style.width = progressPercent + "%";

        // Button visibility
        btnPrev.style.display = currentStep === 0 ? "none" : "inline-block";
        btnNext.classList.toggle("hide", currentStep === totalSteps - 1);
        btnSubmit.classList.toggle("hide", currentStep !== totalSteps - 1);
    }

    btnPrev.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            updateStep();
        }
    });

    btnNext.addEventListener("click", () => {
        if (currentStep < totalSteps - 1) {
            currentStep++;
            updateStep();
        }
    });

    updateStep();

    // ==========================
    // Star Rating Logic
    // ==========================
    document.querySelectorAll(".star-rating").forEach(ratingContainer => {
        const stars = ratingContainer.querySelectorAll(".star");
        const hiddenInput = ratingContainer.nextElementSibling; // hidden input after stars

        stars.forEach(star => {
            star.addEventListener("click", () => {
                const value = parseInt(star.dataset.value);

                hiddenInput.value = value;

                stars.forEach(s => {
                    s.classList.toggle("active", parseInt(s.dataset.value) <= value);
                });
            });
        });
    });

    // ==========================
    // Slider Value Update
    // ==========================
    document.querySelectorAll(".slider").forEach(slider => {
        const output = slider.nextElementSibling;
        slider.addEventListener("input", () => {
            output.textContent = slider.value;
        });
    });

    // ==========================
    // Form Submission
    // ==========================
    surveyForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Example: Collect form data (could send to backend via fetch)
        const formData = new FormData(surveyForm);
        const results = {};
        formData.forEach((val, key) => {
            if (results[key]) {
                if (Array.isArray(results[key])) {
                    results[key].push(val);
                } else {
                    results[key] = [results[key], val];
                }
            } else {
                results[key] = val;
            }
        });
        console.log("Survey Results:", results);

        // Show Thank You Section
        surveyForm.style.display = "none";
        thankYouSection.classList.remove("hide");
    });
});