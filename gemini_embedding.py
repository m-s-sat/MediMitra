# %%
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from pymongo import MongoClient
from langchain_mongodb import MongoDBAtlasVectorSearch
import os
from dotenv import load_dotenv
load_dotenv()
# %%
embedding_model = GoogleGenerativeAIEmbeddings(model="gemini-embedding-001")


# %%
MONGODB_ATLAS_CLUSTER_URI = os.environ["MONGOURI"]
client = MongoClient(MONGODB_ATLAS_CLUSTER_URI)

DB_NAME = "test"
COLLECTION_NAME = "vectorsearches"
ATLAS_VECTOR_SEARCH_INDEX_NAME = "vector_index"

MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]

vector_store = MongoDBAtlasVectorSearch(
    collection=MONGODB_COLLECTION,
    embedding=embedding_model,
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
    relevance_score_fn="cosine",
)
retriver = vector_store.as_retriever(
        search_kwargs={'k': 5}
)

# %%
def disease_data_search_from_database(query: str):
    results = retriver.invoke(query)
    out = "\n".join(result.page_content for result in results)
    return out

    
    

