// Character limits
const wordLimit = 10;
const sentenceLimit = 50;

// Inputs
const wordInput = document.getElementById('word');
const sentenceInput = document.getElementById('sentence');

// Counters
const wordCounter = document.getElementById('word-counter');
const sentenceCounter = document.getElementById('sentence-counter');

// Error messages
const sentenceErrorMessage = document.createElement('div');
sentenceErrorMessage.style.color = 'red';
sentenceErrorMessage.style.marginTop = '5px';
sentenceInput.parentNode.insertBefore(sentenceErrorMessage, sentenceInput.nextSibling);

// 🔹 Update word counter
wordInput.addEventListener('input', function () {
  const length = this.value.length;
  wordCounter.textContent = `${length}/${wordLimit} characters`;

  if (length > wordLimit) {
    this.style.borderColor = 'red';
  } else {
    this.style.borderColor = '#bdc3c7';
  }
});

// 🔹 Update sentence counter
sentenceInput.addEventListener('input', function () {
  const length = this.value.length;
  sentenceCounter.textContent = `${length}/${sentenceLimit} characters`;

  if (length > sentenceLimit) {
    sentenceErrorMessage.textContent = 'Characters exceeded the limit';
    this.style.borderColor = 'red';
  } else {
    sentenceErrorMessage.textContent = '';
    this.style.borderColor = '#bdc3c7';
  }
});

// 🔹 Local recommendations (preview only)
let recommendations = JSON.parse(localStorage.getItem('recommendations') || '[]');

function displayResults() {
  const resultDiv = document.getElementById('result');
  if (recommendations.length === 0) {
    resultDiv.innerHTML = '';
    return;
  }

  resultDiv.innerHTML = '<h2>Submitted Recommendations (local preview):</h2>';

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

displayResults();

// 🔹 Handle form submission
document.getElementById('recommendation-form').addEventListener('submit', (e) => {
  // Don't fully preventDefault (we still want Netlify to get submission!)
  // Instead, we let Netlify handle the actual POST.

  // Validate manually
  const word = wordInput.value.trim();
  const category = document.getElementById('category').value;
  const sentence = sentenceInput.value.trim();

  if (!word || !category || !sentence) {
    e.preventDefault();
    alert('Please fill in all fields.');
    return;
  }

  if (sentence.length > sentenceLimit) {
    e.preventDefault();
    sentenceErrorMessage.textContent = 'Characters exceeded the limit';
    return;
  }

  // Save a copy in localStorage for preview
  const recommendation = {
    word,
    category,
    sentence,
    timestamp: new Date().toLocaleString()
  };

  recommendations.push(recommendation);
  localStorage.setItem('recommendations', JSON.stringify(recommendations));

  displayResults();

  // ✅ Don't call preventDefault, so submission goes to Netlify
});

// 🔹 Clear local recommendations
document.getElementById('clear-recommendations').addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all recommendations?')) {
    recommendations = [];
    localStorage.removeItem('recommendations');
    displayResults();
  }
});