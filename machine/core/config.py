import os
import google.generativeai as genai
import dotenv

dotenv.load_dotenv()

# Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set.")

# 初始化 Gemini
genai.configure(api_key=GEMINI_API_KEY)
