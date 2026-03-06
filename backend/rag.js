const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

let portfolioContext = "";
let initialized = false;
let genAI = null;

async function initRag() {
    try {
        if (!process.env.GOOGLE_API_KEY) {
            console.error("GOOGLE_API_KEY is not set. RAG initialization skipped.");
            return;
        }

        console.log("Initializing RAG Pipeline...");

        genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

        // 1. Read portfolio documents
        const docsPath = path.join(__dirname, '..', 'resume (1).pdf');
        const indexPath = path.join(__dirname, '..', 'index.html');

        let portfolioText = "";

        if (fs.existsSync(docsPath)) {
            const dataBuffer = fs.readFileSync(docsPath);
            const pdfData = await pdfParse(dataBuffer);
            portfolioText += "--- Vaibhav's Resume ---\n" + pdfData.text + "\n\n";
        }

        if (fs.existsSync(indexPath)) {
            const htmlContent = fs.readFileSync(indexPath, "utf8");
            const cleanText = htmlContent.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
            portfolioText += "--- Vaibhav's Website Details ---\n" + cleanText;
        }

        if (!portfolioText) {
            portfolioText = "Vaibhav Ghoshi is a Full Stack Developer skilled in C++, JavaScript, React, Node.js, and more.";
        }

        portfolioContext = portfolioText;
        initialized = true;
        console.log("RAG Pipeline initialized successfully!");

    } catch (err) {
        console.error("Error initializing RAG:", err);
    }
}

// Simple retry with exponential backoff
async function callWithRetry(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (err) {
            const isRateLimit = err.status === 429 || (err.message && err.message.includes("Resource has been exhausted"));
            if (isRateLimit && i < maxRetries - 1) {
                const delay = Math.pow(2, i + 1) * 1000; // 2s, 4s, 8s
                console.log(`Rate limited, retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw err;
            }
        }
    }
}

async function handleChat(query) {
    if (!initialized || !genAI) {
        return "I'm currently offline or missing API keys. Please try again later or contact Vaibhav directly!";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are Vaibhav Ghoshi's personal portfolio AI assistant.
Your job is to answer questions about Vaibhav, his skills, experience, projects, and website based ONLY on the following context.
If you do not know the answer based on the context, say so politely. Be friendly, energetic, and professional. Keep your answers concise unless asked for details.

Context:
${portfolioContext}

User Question: ${query}
Answer:`;

        const result = await callWithRetry(() => model.generateContent(prompt));
        const response = result.response;
        return response.text();
    } catch (err) {
        console.error("Error during chat:", err.message || err);
        if (err.message && err.message.includes("Resource has been exhausted")) {
            return "I'm a bit overwhelmed right now (rate limit reached). Please wait a minute and try again! 🙏";
        }
        return "Oops! I encountered an error while trying to answer that. Please try again.";
    }
}

module.exports = { initRag, handleChat };
