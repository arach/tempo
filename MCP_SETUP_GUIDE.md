# Tempo MCP Setup Guide

## 🚀 Getting Started with Tempo's MCP Server

### Prerequisites
- Node.js 18+ installed
- Claude Desktop application
- Tempo development server running

### 1. Start Tempo Development Server
```bash
# In the main tempo directory
pnpm dev
```
This runs Tempo on `http://localhost:3000`

### 2. Build and Start MCP Server
```bash
# In the mcp-server directory
cd mcp-server
pnpm install
pnpm build
```

### 3. Configure Claude Desktop

Add this configuration to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tempo": {
      "command": "node",
      "args": ["/path/to/tempo/mcp-server/dist/index.js"],
      "env": {
        "TEMPO_API_BASE": "http://localhost:3000/api"
      }
    }
  }
}
```

Replace `/path/to/tempo` with your actual project path.

### 4. Test the Integration

Once Claude Desktop is restarted with the new configuration, you can test:

```
Hey Claude, can you help me create a "Deep Work Day" template in Tempo with activities like focused coding, reading, and planning?
```

## 🛠 Available MCP Tools

### Activity Management
- `get_activities` - Retrieve activities for specific dates or ranges
- `create_activity` - Add new activities to any date
- `update_activity` - Modify existing activities
- `delete_activity` - Remove activities

### Day Template Management  
- `get_day_templates` - Browse saved templates with filtering
- `create_day_template` - Generate new prototypical days
- `apply_day_template` - Copy template activities to calendar dates
- `delete_day_template` - Remove templates

### Example Use Cases

**Creating a Template:**
```
Create a "Creative Sunday" template with these activities:
- Morning journaling (Growth, 30 min)
- Painting session (Creative, 2 hours) 
- Call a friend (Connection, 45 min)
- Read poetry (Enrichment, 1 hour)
```

**Applying Templates:**
```
Apply my "Productive Monday" template to next Monday (2024-01-15)
```

**Managing Activities:**
```
What activities do I have planned for this week? Can you suggest improvements?
```

## 🔧 Troubleshooting

### MCP Server Not Connecting
1. Ensure Tempo dev server is running on port 3000
2. Check that the MCP server built successfully (`dist/index.js` exists)
3. Verify the path in Claude Desktop config is correct
4. Restart Claude Desktop after config changes

### API Calls Failing
- The MCP server expects localStorage data to be passed via request headers
- This is a limitation of the current implementation - in production you'd use a proper database

### Data Not Persisting
- Currently data only persists in the browser's localStorage
- MCP operations read from headers, they don't update the browser storage
- This is intended for read/analysis operations primarily

## 🚀 Future Enhancements

- **Real Database**: Replace localStorage with proper backend storage
- **Webhooks**: Real-time updates between MCP and web interface  
- **Advanced AI Features**: Pattern recognition, smart suggestions
- **Multi-user Support**: Shared templates and collaboration
- **Calendar Integration**: Sync with external calendar systems

## 💡 AI Agent Prompts

The MCP server includes these built-in prompts:

### `create_meaningful_day`
Help design a day based on focus area, available time, and energy level

### `suggest_activities` 
Get activity recommendations by type with duration and context

Use these with Claude like:
```
@create_meaningful_day focus_area="creative" energy_level="high" available_time="weekend morning"
```