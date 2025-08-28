# GoldAI - Digital Gold Investment Platform

## Overview

GoldAI is a digital gold investment platform that combines AI-powered chat assistance with real-time gold trading capabilities. The application allows users to interact with an intelligent chatbot that provides investment advice and facilitates gold purchases, while offering comprehensive portfolio management and market data visualization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client application is built using React with TypeScript and follows a modern component-based architecture:

- **UI Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

The frontend implements a responsive design with a dashboard layout featuring real-time gold price displays, portfolio summaries, market trends, and an integrated AI chat interface.

### Backend Architecture
The server follows a RESTful API design pattern built on Express.js:

- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for chat interactions, purchases, and data retrieval
- **Error Handling**: Centralized error middleware with structured error responses
- **Logging**: Custom request/response logging middleware for API monitoring

### Database and Storage
The application uses a hybrid storage approach:

- **Production Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Development Storage**: In-memory storage implementation for rapid development
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment

The database schema includes tables for users, gold purchases, and chat message history with proper foreign key relationships.

### AI Integration
The platform integrates LangChain for AI-powered conversational interfaces:

- **LLM Provider**: Ollama for local language model execution
- **Chat Processing**: Dual-chain approach for intent analysis and response generation
- **Investment Detection**: Specialized prompts to identify purchase intent from user messages
- **Conversation Flow**: Contextual responses that guide users through investment decisions

### External Dependencies

- **Database**: Neon Database (PostgreSQL) for persistent data storage
- **AI Models**: Ollama for local LLM hosting (llama2 or compatible models)
- **UI Components**: Radix UI primitives for accessible component foundations
- **Payment Processing**: Ready for integration with payment gateways (infrastructure prepared)
- **Real-time Updates**: Built-in support for WebSocket connections (via Express server)
- **Development Tools**: Replit integration for cloud development environment

The architecture supports both development and production environments with environment-specific configurations and graceful fallbacks for missing services.