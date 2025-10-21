| # | Rule | Scope | Description |
|---|-------|-------------|
| R1 | Follow the Service Chain | System Architecture | All AI tasks must respect the microservice chain: Node.js subgraph → FastAPI AI service → MySQL/Neo4j. Never shortcut the flow. |
| R2 | Consistency Between Layers | Schema & API | If a field or function changes in Python service, update GraphQL subgraph types accordingly. |
| R3 | Document Every Endpoint | API Design | Each FastAPI route must have an example curl and response schema in Markdown under /docs/ai_manual. |
| R4 | Preserve Idempotency | Task Automation | AI-triggered tasks (like suggestTitleImprovements) must be repeatable without duplication or conflict. |
| R5 | Central Configuration Source | Config Management | All credentials and DB URIs must come from .env and never be hardcoded. |
| R6 | Trace Every AI Decision | AI Output | Each AI-generated improvement (title, description, etc.) should be logged in MySQL under ai_suggestions for audit. |
| R7 | Respect Project Goals First | AI Priorities | Prioritize listing quality improvement tasks over secondary or experimental features. |
| R8 | Mermaid for Architecture, Markdown for Docs | Documentation | All system diagrams must use Mermaid syntax inside Markdown. |
| R9 | Fail Gracefully | Error Handling | When AI calls fail, fallback to cached suggestion or emit a clear error event for Node.js to handle. |
| R10 | Version Your Prompts | AI Tasks | Store prompt templates (for title, description, etc.) in /prompts/vX/ folders for reproducibility. |