let currentQuestion = "";
let currentTopic = "";

// Load topics when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadTopics();
});

function loadTopics() {
    fetch('/get_topics')
        .then(response => response.json())
        .then(data => {
            const topicSelect = document.getElementById('topic-select');
            // Clear existing options except the default
            while (topicSelect.options.length > 1) {
                topicSelect.remove(1);
            }
            
            // Add topics from the server
            data.topics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic;
                option.textContent = topic;
                topicSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading topics:', error));
}

function loadSelectedTopic() {
    const topicSelect = document.getElementById('topic-select');
    const selectedTopic = topicSelect.value;
    
    if (!selectedTopic) {
        showTopicMessage('Please select a topic', 'error');
        return;
    }
    
    currentTopic = selectedTopic;
    updateTopicDisplays();
    showTopicMessage(`Topic "${selectedTopic}" loaded successfully`, 'success');
}

function createNewTopic() {
    const newTopicInput = document.getElementById('new-topic-input');
    const newTopic = newTopicInput.value.trim();
    
    if (!newTopic) {
        showTopicMessage('Please enter a topic name', 'error');
        return;
    }
    
    fetch('/create_topic', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            topic: newTopic
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showTopicMessage(data.error, 'error');
            return;
        }
        
        showTopicMessage(`Topic "${newTopic}" created successfully`, 'success');
        newTopicInput.value = '';
        loadTopics();
        
        // Set the new topic as current
        setTimeout(() => {
            const topicSelect = document.getElementById('topic-select');
            topicSelect.value = newTopic;
            currentTopic = newTopic;
            updateTopicDisplays();
        }, 500);
    })
    .catch(error => {
        console.error('Error creating topic:', error);
        showTopicMessage('Error creating topic', 'error');
    });
}

function showTopicMessage(message, type) {
    const messageElement = document.getElementById('topic-message');
    messageElement.textContent = message;
    messageElement.className = type === 'error' ? 'message error-message' : 'message success-message';
    messageElement.style.display = 'block';
    
    // Hide message after 3 seconds
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000);
}

function updateTopicDisplays() {
    const displays = [
        document.getElementById('current-topic-display'),
        document.getElementById('add-topic-display'),
        document.getElementById('view-topic-display')
    ];
    
    displays.forEach(display => {
        if (currentTopic) {
            display.innerHTML = `Current Topic: <span class="topic-badge">${currentTopic}</span>`;
        } else {
            display.textContent = 'No topic selected';
        }
    });
}

function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }
    
    const tabs = document.getElementsByClassName("tab");
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }
    
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
    
    if (tabName === "view" && currentTopic) {
        refreshFlashcards();
    }
}

function getNewQuestion() {
    if (!currentTopic) {
        document.getElementById('current-question').textContent = "Please select a topic first";
        return;
    }
    
    fetch('/get_flashcard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            topic: currentTopic
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('current-question').textContent = data.error;
            return;
        }
        currentQuestion = data.question;
        document.getElementById('current-question').textContent = data.question;
        document.getElementById('answer-input').value = '';
        document.getElementById('result').style.display = 'none';
    })
    .catch(error => console.error('Error:', error));
}

function checkAnswer() {
    const userAnswer = document.getElementById('answer-input').value;
    
    if (!currentTopic) {
        alert("Please select a topic first!");
        return;
    }
    
    if (!currentQuestion) {
        alert("Please get a question first!");
        return;
    }
    
    fetch('/check_answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            topic: currentTopic,
            question: currentQuestion,
            answer: userAnswer
        })
    })
    .then(response => response.json())
    .then(data => {
        const resultElement = document.getElementById('result');
        resultElement.style.display = 'block';
        
        if (data.error) {
            resultElement.textContent = data.error;
            resultElement.className = 'result incorrect';
            return;
        }
        
        if (data.is_correct) {
            resultElement.innerHTML = `<p>Correct!</p>`;
            resultElement.className = 'result correct';
        } else {
            resultElement.innerHTML = `
                <p>Similarity: ${data.similarity}%</p>
                <p>The correct answer is: ${data.correct_answer}</p>
            `;
            resultElement.className = 'result incorrect';
        }
    })
    .catch(error => console.error('Error:', error));
}

function addFlashcard() {
    const question = document.getElementById('new-question').value;
    const answer = document.getElementById('new-answer').value;
    
    if (!currentTopic) {
        document.getElementById('add-result').textContent = "Please select a topic first!";
        document.getElementById('add-result').className = "message error-message";
        setTimeout(() => {
            document.getElementById('add-result').textContent = "";
            document.getElementById('add-result').className = "message";
        }, 3000);
        return;
    }
    
    if (!question || !answer) {
        document.getElementById('add-result').textContent = "Question and answer cannot be empty!";
        document.getElementById('add-result').className = "message error-message";
        setTimeout(() => {
            document.getElementById('add-result').textContent = "";
            document.getElementById('add-result').className = "message";
        }, 3000);
        return;
    }
    
    fetch('/add_flashcard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            topic: currentTopic,
            question: question,
            answer: answer
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('add-result').textContent = data.error;
            document.getElementById('add-result').className = "message error-message";
            return;
        }
        
        document.getElementById('new-question').value = '';
        document.getElementById('new-answer').value = '';
        document.getElementById('add-result').textContent = "Flashcard added successfully!";
        document.getElementById('add-result').className = "message success-message";
        setTimeout(() => {
            document.getElementById('add-result').textContent = "";
            document.getElementById('add-result').className = "message";
        }, 3000);
    })
    .catch(error => console.error('Error:', error));
}

function refreshFlashcards() {
    if (!currentTopic) {
        return;
    }
    
    fetch('/get_all_flashcards', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            topic: currentTopic
        })
    })
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('flashcards-tbody');
        tbody.innerHTML = '';
        
        if (data.error) {
            return;
        }
        
        for (const question in data) {
            const row = document.createElement('tr');
            
            const questionCell = document.createElement('td');
            questionCell.textContent = question;
            row.appendChild(questionCell);
            
            const answerCell = document.createElement('td');
            answerCell.textContent = data[question];
            row.appendChild(answerCell);
            
            tbody.appendChild(row);
        }
    })
    .catch(error => console.error('Error:', error));
}