# Glyph Development Streams

This file serves as the source of truth for the 4 parallel development streams for Glyph.
Agents working in different sessions should refer to this file to understand their specific scope and boundaries.

## 1. Unified Dashboard & Integrations
**Focus**: Central hub for Calendar, Tasks, Emails, and Social Feeds.
**Key Files**:
- Client: `src/components/Dashboard.tsx`, `src/components/GoogleCalendar.tsx`, `src/components/GoogleTasks.tsx`, `src/components/ChatInterface.tsx`
- Server: `src/services/google.ts` (To be created), `src/routes/google.ts` (To be created)
**Current Goals**:
- Implement robust server-side Google API integration (OAuth, Token Refresh).
- Connect client components to server endpoints.
- Add "Social Media Newsfeed" placeholder/integration.

## 2. System Optimization & Performance
**Focus**: Desktop performance tools (Razer Cortex/PC Manager style).
**Key Files**:
- Client: `src/components/SystemHealthCard.tsx`
- Server: `src/services/system.ts`, `src/index.ts` (health/boost endpoints)
**Current Goals**:
- Enhance `system.ts` to provide real-time CPU/RAM/GPU metrics.
- Implement "Boost" logic (killing background procs, clearing cache - *Requires User Approval*).
- Create a dedicated "Performance" view in the client.

## 3. Knowledge Base & Explorer
**Focus**: Obsidian-like graph, File Explorer, Notion-like experience.
**Key Files**:
- Client: `src/components/KnowledgeGraph.tsx`, `src/components/KnowledgePanel.tsx`, `src/components/FileExplorer.tsx`, `src/components/FileTree.tsx`
- Server: `src/services/ingestion.ts`, `src/services/vectorStore.ts`, `src/services/embedding.ts`
**Current Goals**:
- Improve Graph visualization (interactive nodes, filtering).
- Enhance File Explorer (drag-and-drop, preview).
- Refine Ingestion pipeline for better "Notion-like" structured data.

## 4. Configuration & Personalization
**Focus**: App settings, Model selection, Drive access, Display options.
**Key Files**:
- Client: `src/components/Settings.tsx`, `src/components/Layout.tsx`
- Server: `src/index.ts` (model-info), `src/config.ts` (To be created)
**Current Goals**:
- Expand `Settings.tsx` to include:
    - Model Selection (Ollama vs Gemini vs Vertex).
    - Theme/Display options.
    - Watched Folders configuration.
- Persist settings to a local config file or DB.
