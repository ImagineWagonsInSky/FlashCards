from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')

correct_answer = "The mitochondria is the powerhouse of the cell."
user_answer = "Cells get energy from mitochondria."

embeddings = model.encode([correct_answer, user_answer], convert_to_tensor=True)
similarity = util.cos_sim(embeddings[0], embeddings[1]).item()

print(f"Similarity Score: {similarity:.2f}")

