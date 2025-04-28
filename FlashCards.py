import os
import random
import json
from difflib import SequenceMatcher

# File to store flashcards
FLASHCARD_FILE = "text_classification.txt"

def load_flashcards():
    """Load flashcards from a file into a dictionary."""
    if os.path.exists(FLASHCARD_FILE):
        with open(FLASHCARD_FILE, "r") as file:
            return json.load(file)
    return {}

def save_flashcards(flashcards):
    """Save flashcards dictionary to a file."""
    with open(FLASHCARD_FILE, "w") as file:
        json.dump(flashcards, file, indent=4)

def add_flashcards():
    """Prompt user to add flashcards."""
    flashcards = load_flashcards()
    print("\nAdding new flashcards. Type 'done' to finish.")
    while True:
        question = input("Enter a question (or type 'done' to finish): ")
        if question.lower() == "done":
            break
        answer = input("Enter the answer: ")
        flashcards[question] = answer
        print(f"Added: '{question}' -> '{answer}'")
    save_flashcards(flashcards)
    print("Flashcards saved successfully!")

def calculate_similarity(answer1, answer2):
    """Calculate the similarity between two strings as a percentage."""
    return SequenceMatcher(None, answer1.lower(), answer2.lower()).ratio() * 100

def quiz_flashcards():
    """Quiz the user with a random flashcard."""
    flashcards = load_flashcards()
    if not flashcards:
        print("No flashcards available. Add some first!")
        return

    question = random.choice(list(flashcards.keys()))
    print(f"\nQuestion: {question}")
    user_answer = input("Your answer: ")

    correct_answer = flashcards[question]

    similarity = calculate_similarity(user_answer.strip(), correct_answer.strip())

    if similarity == 100:
        print("Correct!")
    else:
        print(f"Similarity: {similarity:.2f}%")
        print(f"The correct answer is: {correct_answer}")

def main():
    print("\nFlashcard Study Tool")
    while True:
        print("\nChoose an option:")
        print("1. Add flashcards")
        print("2. Quiz yourself")
        print("3. Exit")

        choice = input("Enter your choice: ")

        if choice == "1":
            add_flashcards()
        elif choice == "2":
            quiz_flashcards()
        elif choice == "3":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please choose 1, 2, or 3.")

if __name__ == "__main__":
    main()
