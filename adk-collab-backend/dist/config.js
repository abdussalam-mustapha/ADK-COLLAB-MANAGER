import * as dotenv from "dotenv";
dotenv.config();
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "";
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gpt-oss:120b-cloud";
export const IQAI_API_KEY = process.env.IQAI_API_KEY || "";
