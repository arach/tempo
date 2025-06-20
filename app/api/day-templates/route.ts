import { NextRequest, NextResponse } from 'next/server';
import { TemplatesService } from '@/lib/db/services';

// GET /api/day-templates - Get all day templates or a specific template by ID
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const search = searchParams.get('search');

  try {
    const templatesService = new TemplatesService();
    
    // If ID is provided, fetch single template
    if (id) {
      const template = await templatesService.getTemplate(id);
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ template });
    }
    
    // Otherwise, fetch multiple templates
    let templates;
    
    if (search) {
      templates = await templatesService.searchTemplates(search);
    } else {
      templates = await templatesService.getAllTemplates();
    }

    return NextResponse.json({ templates });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/day-templates - Create a new day template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, activities, tags } = body;

    if (!name || !activities) {
      return NextResponse.json(
        { error: 'Name and activities are required' },
        { status: 400 }
      );
    }

    const templatesService = new TemplatesService();
    
    const newTemplate = await templatesService.createTemplate({
      name,
      description,
      activities,
      tags
    });

    return NextResponse.json({
      message: 'Template created successfully',
      template: newTemplate
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

// PUT /api/day-templates - Update an existing template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { error: 'ID and updates are required' },
        { status: 400 }
      );
    }

    const templatesService = new TemplatesService();
    
    const updatedTemplate = await templatesService.updateTemplate(id, updates);
    
    if (!updatedTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Template updated successfully',
      template: updatedTemplate
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE /api/day-templates - Delete a template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const templatesService = new TemplatesService();
    
    const deleted = await templatesService.deleteTemplate(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Template deleted successfully',
      id
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}