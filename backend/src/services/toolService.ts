import { prisma } from '../config/database';
import { NotFoundError, ConflictError } from '../middleware/error';
import { auditLogger } from '../config/logger';
import { Tool, ToolStatus, ToolCondition } from '@prisma/client';

export interface ToolFilters {
  categoryId?: string;
  status?: ToolStatus;
  condition?: ToolCondition;
  available?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ToolService {
  /**
   * Get all tools with filtering and pagination
   */
  static async getTools(filters: ToolFilters, pagination: PaginationOptions) {
    const { page, limit, sortBy = 'name', sortOrder = 'asc' } = pagination;
    const { categoryId, status, condition, available, search } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (condition) {
      where.condition = condition;
    }

    if (available) {
      where.status = 'AVAILABLE';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { brand: { contains: search, mode: 'insensitive' as const } },
        { model: { contains: search, mode: 'insensitive' as const } }
      ];
    }

    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.tool.count({ where })
    ]);

    return {
      tools,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get tool by ID
   */
  static async getToolById(id: string) {
    const tool = await prisma.tool.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            parent: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        loans: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        reservations: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] }
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            startDate: 'asc'
          }
        },
        maintenanceRecords: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Latest 5 maintenance records
        }
      }
    });

    if (!tool) {
      throw new NotFoundError('Tool not found');
    }

    return tool;
  }

  /**
   * Create new tool
   */
  static async createTool(data: any, createdBy: string) {
    // Check if barcode is unique (if provided)
    if (data.barcode) {
      const existingTool = await prisma.tool.findUnique({
        where: { barcode: data.barcode }
      });
      
      if (existingTool) {
        throw new ConflictError('Tool with this barcode already exists');
      }
    }

    // Check if serial number is unique (if provided)
    if (data.serialNumber) {
      const existingTool = await prisma.tool.findUnique({
        where: { serialNumber: data.serialNumber }
      });
      
      if (existingTool) {
        throw new ConflictError('Tool with this serial number already exists');
      }
    }

    // Verify category exists
    await this.verifyCategoryExists(data.categoryId);

    const tool = await prisma.tool.create({
      data: {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    auditLogger.info('Tool Created', {
      toolId: tool.id,
      toolName: tool.name,
      createdBy
    });

    return tool;
  }

  /**
   * Update tool
   */
  static async updateTool(id: string, data: any, updatedBy: string) {
    // Verify tool exists
    const existingTool = await prisma.tool.findUnique({
      where: { id }
    });

    if (!existingTool) {
      throw new NotFoundError('Tool not found');
    }

    // Check barcode uniqueness if being updated
    if (data.barcode && data.barcode !== existingTool.barcode) {
      const barcodeExists = await prisma.tool.findUnique({
        where: { barcode: data.barcode }
      });
      
      if (barcodeExists) {
        throw new ConflictError('Tool with this barcode already exists');
      }
    }

    // Check serial number uniqueness if being updated
    if (data.serialNumber && data.serialNumber !== existingTool.serialNumber) {
      const serialExists = await prisma.tool.findUnique({
        where: { serialNumber: data.serialNumber }
      });
      
      if (serialExists) {
        throw new ConflictError('Tool with this serial number already exists');
      }
    }

    // Verify category exists if being updated
    if (data.categoryId && data.categoryId !== existingTool.categoryId) {
      await this.verifyCategoryExists(data.categoryId);
    }

    const tool = await prisma.tool.update({
      where: { id },
      data: {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    auditLogger.info('Tool Updated', {
      toolId: tool.id,
      toolName: tool.name,
      updatedBy,
      changes: Object.keys(data)
    });

    return tool;
  }

  /**
   * Delete tool (soft delete)
   */
  static async deleteTool(id: string, deletedBy: string) {
    const tool = await prisma.tool.findUnique({
      where: { id },
      include: {
        loans: {
          where: {
            status: 'ACTIVE'
          }
        },
        reservations: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] }
          }
        }
      }
    });

    if (!tool) {
      throw new NotFoundError('Tool not found');
    }

    // Check if tool has active loans or reservations
    if (tool.loans.length > 0) {
      throw new ConflictError('Cannot delete tool with active loans');
    }

    if (tool.reservations.length > 0) {
      throw new ConflictError('Cannot delete tool with active reservations');
    }

    // Soft delete by setting isActive to false
    await prisma.tool.update({
      where: { id },
      data: { isActive: false }
    });

    auditLogger.info('Tool Deleted', {
      toolId: tool.id,
      toolName: tool.name,
      deletedBy
    });
  }

  /**
   * Check tool availability
   */
  static async checkAvailability(toolId: string, startDate: Date, endDate: Date) {
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      include: {
        loans: {
          where: {
            status: 'ACTIVE',
            OR: [
              {
                AND: [
                  { loanedAt: { lte: endDate } },
                  { dueDate: { gte: startDate } }
                ]
              }
            ]
          }
        },
        reservations: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
            OR: [
              {
                AND: [
                  { startDate: { lte: endDate } },
                  { endDate: { gte: startDate } }
                ]
              }
            ]
          }
        }
      }
    });

    if (!tool) {
      throw new NotFoundError('Tool not found');
    }

    const isAvailable = tool.status === 'AVAILABLE' && 
                       tool.loans.length === 0 && 
                       tool.reservations.length === 0;

    return {
      available: isAvailable,
      conflicts: {
        loans: tool.loans,
        reservations: tool.reservations
      }
    };
  }

  /**
   * Get tool categories
   */
  static async getCategories() {
    return prisma.toolCategory.findMany({
      where: { isActive: true },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        _count: {
          select: {
            tools: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Helper method to verify category exists
   */
  private static async verifyCategoryExists(categoryId: string) {
    const category = await prisma.toolCategory.findUnique({
      where: { id: categoryId, isActive: true }
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }
}