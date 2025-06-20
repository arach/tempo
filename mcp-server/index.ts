#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

const TEMPO_API_BASE = 'http://localhost:3000/api';

class TempoMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'tempo-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
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
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async getActivities(args: any) {
    const { date, startDate, endDate } = args;
    
    let url = `${TEMPO_API_BASE}/activities`;
    const params = new URLSearchParams();
    
    if (date) params.append('date', date);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  }

  private async createActivity(args: any) {
    const { date, activity } = args;

    const response = await fetch(`${TEMPO_API_BASE}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, activity })
    });

    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  }

  private async updateActivity(args: any) {
    const { date, activityId, updates } = args;

    const response = await fetch(`${TEMPO_API_BASE}/activities`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, activityId, updates })
    });

    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  }

  private async deleteActivity(args: any) {
    const { date, activityId } = args;

    const response = await fetch(`${TEMPO_API_BASE}/activities?date=${date}&activityId=${activityId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  }

  private async getDayTemplates(args: any) {
    const { category, search } = args;
    
    let url = `${TEMPO_API_BASE}/day-templates`;
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  }

  private async createDayTemplate(args: any) {
    const response = await fetch(`${TEMPO_API_BASE}/day-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });

    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  }

  private async applyDayTemplate(args: any) {
    const response = await fetch(`${TEMPO_API_BASE}/day-templates/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });

    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  }

  private async deleteDayTemplate(args: any) {
    const { id } = args;

    const response = await fetch(`${TEMPO_API_BASE}/day-templates?id=${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Tempo MCP server running on stdio');
  }
}

const server = new TempoMCPServer();
server.run().catch(console.error);