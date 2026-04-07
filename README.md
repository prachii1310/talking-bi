# Talking-BI — Agentic Workflow (5 Agents)

## Architecture

```
User Question
      │
      ▼
┌─────────────────────────┐
│  Agent 1                │  QueryUnderstandingAgent
│  Parse & classify query │  → intent, entities, clarification check
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Agent 2                │  SQLGeneratorAgent
│  Generate SQL           │  → optimised SQL + explanation
└────────────┬────────────┘
             │
          [DB Query]
             │
             ▼
┌─────────────────────────┐
│  Agent 3                │  DataAnalystAgent
│  Analyse results        │  → insights, key metrics, anomalies
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Agent 4                │  VisualizationAgent
│  Choose & config chart  │  → chart_config (Recharts / Chart.js ready)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Agent 5                │  NarratorAgent
│  Generate narration     │  → spoken text + TTS-ready string
└─────────────────────────┘
