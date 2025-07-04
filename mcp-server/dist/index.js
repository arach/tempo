#!/usr/bin/env node
import { config } from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
// Load environment variables
// Priority: .env.local > .env.development > .env.production > .env
// This follows Next.js/Vercel conventions
config({ path: '.env.local' });
config({ path: '.env.development' });
config({ path: '.env.production' });
config({ path: '.env' });
const TEMPO_API_BASE = process.env.TEMPO_API_URL || 'http://localhost:3000/api';
const TEMPO_WEB_BASE = process.env.TEMPO_WEB_URL || 'http://localhost:3000';
class TempoMCPServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'tempo-mcp-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
    }
    formatResponse(data, viewUrl) {
        const response = { result: data };
        if (viewUrl) {
            response.viewUrl = `${TEMPO_WEB_BASE}${viewUrl}`;
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response, null, 2)
                }
            ]
        };
    }
    setupToolHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'get_activities',
                        description: 'Retrieve activities for a specific date or date range',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                date: {
                                    type: 'string',
                                    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                                    description: 'Specific date in YYYY-MM-DD format'
                                },
                                startDate: {
                                    type: 'string',
                                    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                                    description: 'Start date for range query in YYYY-MM-DD format'
                                },
                                endDate: {
                                    type: 'string',
                                    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                                    description: 'End date for range query in YYYY-MM-DD format'
                                }
                            }
                        }
                    },
                    {
                        name: 'create_activity',
                        description: 'Create a new activity for a specific date',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                date: {
                                    type: 'string',
                                    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                                    description: 'Date in YYYY-MM-DD format'
                                },
                                activity: {
                                    type: 'object',
                                    properties: {
                                        title: { type: 'string', description: 'Activity title' },
                                        type: {
                                            type: 'string',
                                            enum: ['enrichment', 'connection', 'growth', 'creative'],
                                            description: 'Activity type'
                                        },
                                        description: { type: 'string', description: 'Optional activity description' },
                                        duration: { type: 'string', description: 'Human-readable duration (e.g., "30 min", "1 hour")' }
                                    },
                                    required: ['title', 'type']
                                }
                            },
                            required: ['date', 'activity']
                        }
                    },
                    {
                        name: 'update_activity',
                        description: 'Update an existing activity',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                date: {
                                    type: 'string',
                                    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                                    description: 'Date in YYYY-MM-DD format'
                                },
                                activityId: { type: 'string', description: 'Activity ID to update' },
                                updates: {
                                    type: 'object',
                                    properties: {
                                        title: { type: 'string' },
                                        type: { type: 'string', enum: ['enrichment', 'connection', 'growth', 'creative'] },
                                        description: { type: 'string' },
                                        duration: { type: 'string' }
                                    }
                                }
                            },
                            required: ['date', 'activityId', 'updates']
                        }
                    },
                    {
                        name: 'delete_activity',
                        description: 'Delete an activity',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                date: {
                                    type: 'string',
                                    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                                    description: 'Date in YYYY-MM-DD format'
                                },
                                activityId: { type: 'string', description: 'Activity ID to delete' }
                            },
                            required: ['date', 'activityId']
                        }
                    },
                    {
                        name: 'get_day_templates',
                        description: 'Retrieve day templates with optional filtering',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                category: { type: 'string', description: 'Filter by category' },
                                search: { type: 'string', description: 'Search in name and description' }
                            }
                        }
                    },
                    {
                        name: 'create_day_template',
                        description: 'Create a new day template',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                name: { type: 'string', description: 'Template name' },
                                description: { type: 'string', description: 'Template description' },
                                category: { type: 'string', description: 'Template category' },
                                activities: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            title: { type: 'string' },
                                            type: { type: 'string', enum: ['enrichment', 'connection', 'growth', 'creative'] },
                                            description: { type: 'string' },
                                            duration: { type: 'string' }
                                        },
                                        required: ['title', 'type']
                                    }
                                },
                                tags: { type: 'array', items: { type: 'string' } }
                            },
                            required: ['name', 'activities']
                        }
                    },
                    {
                        name: 'apply_day_template',
                        description: 'Apply a day template to a specific date',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                templateId: { type: 'string', description: 'Template ID to apply' },
                                date: {
                                    type: 'string',
                                    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                                    description: 'Target date in YYYY-MM-DD format'
                                },
                                overwrite: {
                                    type: 'boolean',
                                    default: false,
                                    description: 'Whether to overwrite existing activities'
                                }
                            },
                            required: ['templateId', 'date']
                        }
                    },
                    {
                        name: 'delete_day_template',
                        description: 'Delete a day template',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', description: 'Template ID to delete' }
                            },
                            required: ['id']
                        }
                    },
                    {
                        name: 'complete_activity',
                        description: 'Mark an activity as complete or incomplete',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                date: {
                                    type: 'string',
                                    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                                    description: 'Date in YYYY-MM-DD format'
                                },
                                activityId: {
                                    type: 'string',
                                    description: 'Activity ID to mark as complete'
                                }
                            },
                            required: ['date', 'activityId']
                        }
                    }
                ]
            };
        });
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'get_activities':
                        return await this.getActivities(args);
                    case 'create_activity':
                        return await this.createActivity(args);
                    case 'update_activity':
                        return await this.updateActivity(args);
                    case 'delete_activity':
                        return await this.deleteActivity(args);
                    case 'get_day_templates':
                        return await this.getDayTemplates(args);
                    case 'create_day_template':
                        return await this.createDayTemplate(args);
                    case 'apply_day_template':
                        return await this.applyDayTemplate(args);
                    case 'delete_day_template':
                        return await this.deleteDayTemplate(args);
                    case 'complete_activity':
                        return await this.completeActivity(args);
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            }
            catch (error) {
                if (error instanceof McpError) {
                    throw error;
                }
                throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    async getActivities(args) {
        const { date, startDate, endDate } = args;
        let url = `${TEMPO_API_BASE}/activities`;
        const params = new URLSearchParams();
        if (date)
            params.append('date', date);
        if (startDate)
            params.append('startDate', startDate);
        if (endDate)
            params.append('endDate', endDate);
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        // Determine the appropriate view URL
        let viewUrl;
        if (date) {
            viewUrl = `/tempo/day/${date}`;
        }
        else if (startDate) {
            viewUrl = `/tempo/week/${startDate}`;
        }
        return this.formatResponse(data, viewUrl);
    }
    async createActivity(args) {
        const { date, activity } = args;
        const response = await fetch(`${TEMPO_API_BASE}/activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, activity })
        });
        const data = await response.json();
        // View URL for the day where activity was created
        const viewUrl = `/tempo/day/${date}`;
        return this.formatResponse(data, viewUrl);
    }
    async updateActivity(args) {
        const { date, activityId, updates } = args;
        const response = await fetch(`${TEMPO_API_BASE}/activities`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, activityId, updates })
        });
        const data = await response.json();
        // View URL for the day where activity was updated
        const viewUrl = `/tempo/day/${date}`;
        return this.formatResponse(data, viewUrl);
    }
    async deleteActivity(args) {
        const { date, activityId } = args;
        const response = await fetch(`${TEMPO_API_BASE}/activities?date=${date}&activityId=${activityId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        // View URL for the day where activity was deleted
        const viewUrl = `/tempo/day/${date}`;
        return this.formatResponse(data, viewUrl);
    }
    async getDayTemplates(args) {
        const { category, search } = args;
        let url = `${TEMPO_API_BASE}/day-templates`;
        const params = new URLSearchParams();
        if (category)
            params.append('category', category);
        if (search)
            params.append('search', search);
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        // View URL for templates list
        const viewUrl = `/tempo/templates`;
        return this.formatResponse(data, viewUrl);
    }
    async createDayTemplate(args) {
        const response = await fetch(`${TEMPO_API_BASE}/day-templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args)
        });
        const data = await response.json();
        // View URL for the created template (if ID is available) or templates list
        const viewUrl = data.id ? `/tempo/templates/${data.id}` : `/tempo/templates`;
        return this.formatResponse(data, viewUrl);
    }
    async applyDayTemplate(args) {
        const { date } = args; // Extract date from args
        const response = await fetch(`${TEMPO_API_BASE}/day-templates/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args)
        });
        const data = await response.json();
        // View URL for the day where template was applied
        const viewUrl = `/tempo/day/${date}`;
        return this.formatResponse(data, viewUrl);
    }
    async deleteDayTemplate(args) {
        const { id } = args;
        const response = await fetch(`${TEMPO_API_BASE}/day-templates?id=${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        // View URL for templates list after deletion
        const viewUrl = `/tempo/templates`;
        return this.formatResponse(data, viewUrl);
    }
    async completeActivity(args) {
        const { date, activityId } = args;
        const response = await fetch(`${TEMPO_API_BASE}/activities/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, activityId })
        });
        const data = await response.json();
        // View URL for the day where activity was completed
        const viewUrl = `/tempo/day/${date}`;
        return this.formatResponse(data, viewUrl);
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Tempo MCP server running on stdio');
    }
}
const server = new TempoMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map