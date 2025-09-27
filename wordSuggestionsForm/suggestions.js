let recommendations = JSON.parse(localStorage.getItem('recommendations') || '[]');

const charLimit = 50;
const textarea = document.getElementById('sentence');
const charCounter = document.getElementById('char-counter');
const errorMessage = document.createElement('div');
errorMessage.style.color = 'red';
errorMessage.style.marginTop = '5px';
textarea.parentNode.insertBefore(errorMessage, textarea.nextSibling);

// Add event listener for character counting
textarea.addEventListener('input', function() {
    const remaining = this.value.length;
    charCounter.textContent = `${remaining}/${charLimit} characters`;
    
    if (remaining > charLimit) {
        errorMessage.textContent = 'Characters exceeded the limit';
        this.style.borderColor = 'red';
    } else {
        errorMessage.textContent = '';
        this.style.borderColor = '#bdc3c7';
    }
});

document.getElementById('recommendation-form').addEventListener('submit', (e) => {
    e.preventDefault();

    // Get the form data
    const word = document.getElementById('word').value.trim();
    const category = document.getElementById('category').value;
    const sentence = document.getElementById('sentence').value.trim();

    // Add character limit validation
    if (sentence.length > charLimit) {
        errorMessage.textContent = 'Characters exceeded the limit';
        return;
    }

    // Validate the form data
    if (word === '' || category === '' || sentence === '') {
        alert('Please fill in all fields.');
        return;
    }

    // Create a recommendation object
    const recommendation = {
        word,
        category,
        sentence,
        timestamp: new Date().toLocaleString() 
    };

    // Add the new recommendation to the array
    recommendations.push(recommendation);
    
    // Save to localStorage
    localStorage.setItem('recommendations', JSON.stringify(recommendations));

    // Process the recommendation (e.g., send it to a server or store it locally)
    console.log(recommendation);
    displayResults(); // Changed to display all recommendations

    // Clear the form fields
    document.getElementById('word').value = '';
    document.getElementById('category').value = '';
    document.getElementById('sentence').value = '';
});

// Updated display function to show all recommendations
function displayResults() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<h2>Submitted Recommendations:</h2>';
    
    // Display recommendations in reverse order (newest first)
    recommendations.slice().reverse().forEach((rec, index) => {
        resultDiv.innerHTML += `
            <div class="recommendation-card">
                <h3>Recommendation ${recommendations.length - index}</h3>
                <p><strong>Word:</strong> ${rec.word}</p>
                <p><strong>Category:</strong> ${rec.category}</p>
                <p><strong>Example Sentence:</strong> ${rec.sentence}</p>
                <small>Submitted: ${rec.timestamp}</small>
            </div>
        `;
    });
}

// Add a clear function (optional)
function clearAllRecommendations() {
    recommendations = [];
    localStorage.removeItem('recommendations');
    displayResults();
}

document.getElementById('clear-recommendations').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all recommendations?')) {
        clearAllRecommendations();
    }
});