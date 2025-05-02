# app.py
from flask import Flask, render_template, request, jsonify
import os
import random
import json
from difflib import SequenceMatcher
from SimilarityTesting import ComputeSimilarity

app = Flask(__name__)

# Directory to store flashcard files
FLASHCARD_DIR = "FlashcardFiles"

def get_available_topics():
    """Get a list of available flashcard topics from the FlashcardFiles directory."""
    if not os.path.exists(FLASHCARD_DIR):
        os.makedirs(FLASHCARD_DIR, exist_ok=True)
        return []
    
    # Get all .txt files in the directory and remove the extension
    topics = [f[:-4] for f in os.listdir(FLASHCARD_DIR) if f.endswith(".txt")]
    return topics

def get_flashcard_path(topic):
    """Get the full path to a flashcard file based on the topic."""
    return os.path.join(FLASHCARD_DIR, f"{topic}.txt")

def load_flashcards(topic):
    """Load flashcards from a file into a dictionary."""
    file_path = get_flashcard_path(topic)
    if os.path.exists(file_path):
        with open(file_path, "r") as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                # If the file is empty or not valid JSON
                return {}
    return {}

def save_flashcards(topic, flashcards):
    """Save flashcards dictionary to a file."""
    # Ensure the directory exists
    if not os.path.exists(FLASHCARD_DIR):
        os.makedirs(FLASHCARD_DIR, exist_ok=True)
        
    file_path = get_flashcard_path(topic)
    with open(file_path, "w") as file:
        json.dump(flashcards, file, indent=4)

def calculate_similarity(answer1, answer2):
    """Calculate the similarity between two strings as a percentage."""
    return SequenceMatcher(None, answer1.lower(), answer2.lower()).ratio() * 100

def calculate_similarity_with_embeddings(answer1, answer2):
    return ComputeSimilarity.calculate_similarity(answer1, answer2) * 100

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_topics', methods=['GET'])
def get_topics():
    topics = get_available_topics()
    return jsonify({"topics": topics})

@app.route('/create_topic', methods=['POST'])
def create_topic():
    data = request.json
    topic = data.get('topic')
    
    if not topic:
        return jsonify({"error": "Topic name is required"})
    
    # Sanitize topic name to avoid file system issues
    topic = topic.replace('/', '').replace('\\', '').strip()
    
    if not topic:
        return jsonify({"error": "Invalid topic name"})
    
    # Create an empty flashcard file for the topic
    save_flashcards(topic, {})
    
    return jsonify({"success": True, "topic": topic})

@app.route('/get_flashcard', methods=['POST'])
def get_flashcard():
    data = request.json
    topic = data.get('topic')
    
    if not topic:
        return jsonify({"error": "Topic is required"})
    
    flashcards = load_flashcards(topic)
    if not flashcards:
        return jsonify({"error": "No flashcards available for this topic"})
    
    question = random.choice(list(flashcards.keys()))
    return jsonify({"question": question})

@app.route('/check_answer', methods=['POST'])
def check_answer():
    data = request.json
    topic = data.get('topic')
    question = data.get('question')
    user_answer = data.get('answer')
    
    if not topic:
        return jsonify({"error": "Topic is required"})
    
    flashcards = load_flashcards(topic)
    
    if question in flashcards:
        correct_answer = flashcards[question]
        similarity = calculate_similarity_with_embeddings(user_answer.strip(), correct_answer.strip())
        
        result = {
            "correct_answer": correct_answer,
            "similarity": round(similarity, 2),
            "is_correct": similarity >= 90
        }
        return jsonify(result)
    
    return jsonify({"error": "Question not found"})

@app.route('/add_flashcard', methods=['POST'])
def add_flashcard():
    data = request.json
    topic = data.get('topic')
    question = data.get('question')
    answer = data.get('answer')
    
    if not topic:
        return jsonify({"error": "Topic is required"})
    
    if question and answer:
        flashcards = load_flashcards(topic)
        flashcards[question] = answer
        save_flashcards(topic, flashcards)
        return jsonify({"success": True})
    
    return jsonify({"error": "Question or answer missing"})

@app.route('/get_all_flashcards', methods=['POST'])
def get_all_flashcards():
    data = request.json
    topic = data.get('topic')
    
    if not topic:
        return jsonify({"error": "Topic is required"})
    
    flashcards = load_flashcards(topic)
    return jsonify(flashcards)

if __name__ == '__main__':
    print("Starting the Flashcard Web App with topic selection...")
    print("Open your browser and go to http://127.0.0.1:5000")
    app.run(debug=True)