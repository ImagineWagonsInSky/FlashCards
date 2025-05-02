# Flashcards

This is a current web app that i run locally from my phone or laptop to review for exams.

## 🌟 Features

- **Flashcard Quizzing**: Quiz yourself with your own made flashcards.
- **Similarity Evaluation**: I currently use a word embedding conversion (sentence_transformers) to evaluate the similarity between your predefined answer and the answer you put on.

> **Note**: This project is in its initial development phase, and while core features are functional, more enhancements are on the way!

## 🚀 Getting Started

### Installation & Setup

#### 1. Clone the repository

#### 2. Start a Virtual Environment and Install Dependencies
```bash
cd FlashCardApp
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
This will install all necessary Python packages for use.

#### 3. Run App
```bash
python3 app.py
```
You can go to the specified URL in your browser to use!

> **Note:**
You can either add Flashcards from the UI or directly make your own txt and add it to `templates/`.

## ⚠️ License

This project is open-source under the MIT License.