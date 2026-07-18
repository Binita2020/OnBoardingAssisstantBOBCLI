AI & Generative AI Knowledge Repository
Purpose

This document defines the core concepts, engineering practices, architectural patterns, and implementation knowledge expected of professionals working with Artificial Intelligence (AI), Generative AI (GenAI), Retrieval-Augmented Generation (RAG), and LangChain.

It is intended to serve as a knowledge base for an AI Interview Assistant that generates personalized interview questions based on:

Job Description (JD)
Candidate Resume
Years of Experience
Target Role
Required Skills

The assistant should generate conceptual, implementation, debugging, architecture, optimization, security, and scenario-based questions while adapting the depth according to the candidate's experience.

1. Artificial Intelligence Fundamentals
Candidate should understand
Artificial Intelligence (AI)
Machine Learning (ML)
Deep Learning (DL)
Natural Language Processing (NLP)
Computer Vision (high level)
Generative AI
Large Language Models (LLMs)
Foundation Models
Evaluate
Understanding of AI terminology.
Differences between AI, ML, DL, and GenAI.
Appropriate use cases for each.
2. Generative AI Fundamentals

Candidate should understand

What is Generative AI?
Types of foundation models
Large Language Models (LLMs)
Prompt-based generation
Context windows
Tokens
Temperature
Top-p sampling
Hallucinations
Deterministic vs creative responses

Evaluate

Appropriate parameter selection.
Prompt design considerations.
Model limitations.
3. Prompt Engineering

Candidate should know

Zero-shot prompting
One-shot prompting
Few-shot prompting
Role prompting
Instruction prompting
Chain-of-thought prompting (high level)
Structured output prompting
Prompt templates
Prompt optimization

Evaluate

Ability to design effective prompts.
Improving answer quality.
Reducing hallucinations.
4. Large Language Models (LLMs)

Candidate should understand

Transformer architecture (high level)
Tokens
Embeddings
Attention mechanism (conceptual)
Fine-tuning
In-context learning
Context length
Model inference

Examples

GPT
Llama
Claude
Gemini
Mistral

Evaluate

Model selection.
Trade-offs.
Cost vs performance.
5. Retrieval-Augmented Generation (RAG)
Fundamentals

Candidate should understand

Why RAG is needed
Hallucination reduction
Knowledge grounding
Retrieval process
Augmentation
Generation
RAG Pipeline

Knowledge of

Document ingestion
Chunking
Embedding generation
Vector storage
Similarity search
Context retrieval
Prompt construction
Response generation

Evaluate

Designing RAG pipelines.
Improving retrieval quality.
Chunking

Candidate should know

Fixed-size chunking
Semantic chunking
Recursive chunking
Overlapping chunks

Evaluate

Chunk size trade-offs.
Retrieval accuracy.
Embeddings

Knowledge of

Embedding models
Semantic similarity
Cosine similarity
Dense vectors

Evaluate

Embedding selection.
Search effectiveness.
Vector Databases

Examples

ChromaDB
Pinecone
FAISS
Weaviate
Milvus
Azure AI Search (vector capabilities)

Evaluate

Vector storage.
Similarity search.
Scalability.
6. LangChain
Core Concepts

Candidate should understand

LangChain architecture
Chains
Prompt Templates
LLM wrappers
Output Parsers
Retrievers
Memory
Tools
Agents
Components

Knowledge of

Document Loaders
Text Splitters
Embeddings
Vector Stores
Chains
Agents
Memory
Callbacks

Evaluate

Component integration.
Pipeline construction.
Agents

Candidate should understand

Agent architecture
Tool calling
Agent reasoning
Multi-step execution
Planning

Evaluate

Appropriate agent selection.
Tool orchestration.
Memory

Knowledge of

Conversation memory
Buffer memory
Summary memory
Window memory

Evaluate

Conversation management.
Context retention.
7. AI Agents

Candidate should understand

Agentic AI
Planning
Tool usage
Reflection
Multi-agent systems
Human-in-the-loop

Evaluate

Agent design.
Task decomposition.
Decision-making.
8. Document Processing

Knowledge of

PDF ingestion
DOCX ingestion
OCR (high level)
HTML parsing
Web scraping (authorized use)
Metadata extraction
Chunking strategies

Evaluate

Data preparation.
Knowledge base quality.
9. AI Application Architecture

Candidate should understand

Typical architecture

User

↓

Application

↓

LLM

↓

RAG

↓

Vector Database

↓

Knowledge Repository

↓

Response

Evaluate

End-to-end system design.
Component interactions.
Scalability.
10. Responsible AI

Candidate should know

Hallucinations
Bias
Fairness
Privacy
Data protection
Copyright awareness
Explainability
Transparency
Human oversight
Prompt injection
Jailbreak attempts

Evaluate

Safe AI development.
Risk mitigation.
11. Model Evaluation

Knowledge of

Accuracy
Precision
Recall (high level)
BLEU (high level)
ROUGE (high level)
Human evaluation
Groundedness
Relevance
Faithfulness

Evaluate

AI quality measurement.
Response evaluation.
12. AI Security

Candidate should understand

Prompt Injection
Data Leakage
Model Abuse
Secure API usage
Authentication
Authorization
Secret management
Rate limiting

Evaluate

Secure AI application development.
13. AI Performance Optimization

Knowledge of

Context optimization
Prompt optimization
Embedding optimization
Chunk optimization
Caching
Response latency
Cost optimization
Token optimization

Evaluate

Efficient AI application design.
14. AI Deployment

Candidate should know

REST APIs
Model hosting
Cloud deployment
Containerization
Monitoring
Logging
Versioning
CI/CD for AI

Evaluate

Production readiness.
Operational considerations.
15. Integration

Candidate should understand

Integration with

Databases
APIs
Search systems
Enterprise applications
Document repositories
Chatbots
Workflow automation
Business applications

Evaluate

Enterprise integration.
16. Enterprise AI Use Cases

Candidate should understand

Examples

AI Chatbots
Interview Assistants
Knowledge Assistants
Code Assistants
Customer Support
Document Search
Report Generation
Contract Analysis
Resume Screening
Recommendation Systems

Evaluate

Use case selection.
Business value.
17. Debugging & Troubleshooting

Evaluate ability to diagnose

Poor retrieval results
Hallucinations
Missing context
Prompt failures
Slow responses
Duplicate retrieval
Empty vector search
Incorrect chunking
Token limit issues
18. Leadership & AI Architecture (Senior Candidates)

Evaluate

Enterprise AI strategy
Model selection
Buy vs build decisions
AI governance
Responsible AI implementation
Cost optimization
Security architecture
Team mentoring
AI roadmap planning
Stakeholder communication
Experience Mapping
0–2 Years

Evaluate

AI fundamentals
GenAI basics
Prompt engineering
LLM concepts
Simple LangChain workflows
Basic RAG understanding
3–5 Years

Evaluate

Building RAG pipelines
LangChain components
Vector databases
Prompt optimization
API integration
AI debugging
Enterprise use cases
6–8 Years

Evaluate

AI architecture
Multi-agent workflows
Retrieval optimization
Performance tuning
Security
Monitoring
Production deployment
8+ Years

Evaluate

Enterprise AI architecture
AI governance
Platform selection
Cost optimization
Responsible AI strategy
Multi-agent systems
Scalability
Leadership
AI transformation initiatives
Guidance for the AI Interview Assistant

When using this repository:

Prioritize the AI technologies explicitly required by the JD and reflected in the candidate's resume. For example, if the role emphasizes RAG and LangChain, focus on retrieval pipelines, vector databases, prompt engineering, and orchestration while still validating core GenAI concepts.
Adapt the interview to the candidate's experience level. Junior candidates should be assessed on AI fundamentals, prompt engineering, and simple workflows, while senior candidates should be challenged with architecture, governance, optimization, security, and enterprise-scale AI systems.
Emphasize practical implementation over theory. Ask candidates to design RAG architectures, optimize retrieval quality, select appropriate models, troubleshoot hallucinations, secure AI applications, or justify architectural decisions instead of recalling definitions.
Assess responsible AI practices. Evaluate understanding of hallucination mitigation, bias, privacy, prompt injection, access control, and human oversight alongside technical implementation skills.
Personalize questions using the resume and projects. Reference the candidate's AI applications, frameworks, models, or enterprise use cases to validate hands-on experience and encourage discussion of real-world design decisions.