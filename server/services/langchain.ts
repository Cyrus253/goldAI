import { Ollama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Runnable } from "@langchain/core/runnables";

export class GoldAIService {
  private llm: Runnable<any, string>; // enforce string output
  private analysisChain: any;
  private responseChain: any;
  private useOpenAI: boolean;

  constructor() {
    this.useOpenAI = !!process.env.OPENAI_API_KEY;

    if (this.useOpenAI) {
      // OpenAI → Chat model → parsed to string
      this.llm = new ChatOpenAI({
        modelName: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        temperature: 0.7,
        openAIApiKey: process.env.OPENAI_API_KEY,
      }).pipe(new StringOutputParser());

      console.log("🤖 GoldAI initialized with OpenAI");
    } else {
      // Ollama → parsed to string for consistency
      this.llm = new Ollama({
        baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
        model: process.env.OLLAMA_MODEL || "llama3.2:3b",
        temperature: 0.7,
      }).pipe(new StringOutputParser());

      console.log("🤖 GoldAI initialized with Ollama");
    }

    this.setupChains();
  }

  private setupChains() {
    const intentPrompt = PromptTemplate.fromTemplate(`
      Analyze the following user message about gold investment and determine if they are expressing investment intent.
      
      User message: "{message}"
      
      Respond with only "YES" if they want to buy/invest in gold, or "NO" otherwise.
    `);

    this.analysisChain = intentPrompt.pipe(this.llm);

    const responsePrompt = PromptTemplate.fromTemplate(`
      You are GoldAI, an intelligent digital gold investment assistant. 
      Current gold price: ₹10,400 per gram
      
      User message: "{message}"
      Investment intent detected: {hasIntent}
      
      Guidelines:
      - If intent detected → encourage buying
      - Otherwise → give educational/helpful response
    `);

    this.responseChain = responsePrompt.pipe(this.llm);
  }

  async analyzeInvestmentIntent(message: string): Promise<boolean> {
    const result = await this.analysisChain.invoke({ message });
    return result.trim().toUpperCase().includes("YES");
  }

  async generateResponse(message: string, hasIntent: boolean): Promise<string> {
    const result = await this.responseChain.invoke({
      message,
      hasIntent: hasIntent ? "YES" : "NO",
    });

    if (hasIntent) {
      return (
        result +
        "\n\n💡 Would you like to purchase digital gold now? Current price: ₹10,400/gram"
      );
    }
    return result;
  }

  async processMessage(
    message: string
  ): Promise<{ response: string; hasInvestmentIntent: boolean }> {
    const hasInvestmentIntent = await this.analyzeInvestmentIntent(message);
    const response = await this.generateResponse(message, hasInvestmentIntent);

    return { response, hasInvestmentIntent };
  }
}

export const goldAI = new GoldAIService();
