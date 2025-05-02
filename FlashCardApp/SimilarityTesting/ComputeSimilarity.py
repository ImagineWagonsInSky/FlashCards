from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')

def calculate_similarity(user_answer, defined_answer):
    print("Calculating Similarity Score")
    embeddings = model.encode([user_answer, defined_answer], convert_to_tensor=True)
    similarity = util.cos_sim(embeddings[0], embeddings[1]).item()

    return float(similarity)