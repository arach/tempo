# Example MCP Server Responses with Context-Aware URLs

## Create Activity Response
```json
{
  "result": {
    "id": "abc123",
    "date": "2025-01-25",
    "title": "Morning Meditation",
    "type": "growth",
    "duration": "30 min"
  },
  "viewUrl": "http://localhost:3000/tempo/day/2025-01-25"
}
```

## Get Activities for Date Range Response
```json
{
  "result": {
    "activities": [
      { "id": "abc123", "title": "Morning Meditation", "date": "2025-01-20" },
      { "id": "def456", "title": "Call Mom", "date": "2025-01-21" }
    ]
  },
  "viewUrl": "http://localhost:3000/tempo/week/2025-01-20"
}
```

## Create Day Template Response
```json
{
  "result": {
    "id": "template-123",
    "name": "Productive Morning",
    "activities": [
      { "title": "Meditation", "type": "growth", "duration": "20 min" },
      { "title": "Journal", "type": "growth", "duration": "15 min" }
    ]
  },
  "viewUrl": "http://localhost:3000/tempo/templates/template-123"
}
```

## Apply Template Response
```json
{
  "result": {
    "message": "Template applied successfully",
    "activitiesCreated": 3
  },
  "viewUrl": "http://localhost:3000/tempo/day/2025-01-25"
}
```

## Configuration

The MCP server now supports environment variables for flexible deployment:

```bash
# Set custom API and web URLs
export TEMPO_API_URL=http://tempo-api.local:3000/api
export TEMPO_WEB_URL=http://tempo.local:3000

# Run the MCP server
node dist/index.js
```