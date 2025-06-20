import { Request, Response } from 'express';
import { ToolService } from '../services/toolService';
import { asyncHandler } from '../middleware/error';
import { logger } from '../config/logger';

export class ToolController {
  /**
   * Get all tools with filtering and pagination
   * GET /api/v1/tools
   */
  static getTools = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      categoryId: req.query.categoryId as string,
      status: req.query.status as any,
      condition: req.query.condition as any,
      available: req.query.available === 'true',
      search: req.query.search as string
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
    };

    const result = await ToolService.getTools(filters, pagination);

    res.json({
      success: true,
      message: 'Tools retrieved successfully',
      data: result
    });
  });

  /**
   * Get tool by ID
   * GET /api/v1/tools/:id
   */
  static getToolById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tool = await ToolService.getToolById(id);

    res.json({
      success: true,
      message: 'Tool retrieved successfully',
      data: { tool }
    });
  });

  /**
   * Create new tool
   * POST /api/v1/tools
   */
  static createTool = asyncHandler(async (req: Request, res: Response) => {
    const tool = await ToolService.createTool(req.body, req.user!.id);

    logger.info('Tool created successfully', {
      toolId: tool.id,
      toolName: tool.name,
      createdBy: req.user!.id
    });

    res.status(201).json({
      success: true,
      message: 'Tool created successfully',
      data: { tool }
    });
  });

  /**
   * Update tool
   * PUT /api/v1/tools/:id
   */
  static updateTool = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tool = await ToolService.updateTool(id, req.body, req.user!.id);

    logger.info('Tool updated successfully', {
      toolId: tool.id,
      toolName: tool.name,
      updatedBy: req.user!.id
    });

    res.json({
      success: true,
      message: 'Tool updated successfully',
      data: { tool }
    });
  });

  /**
   * Delete tool
   * DELETE /api/v1/tools/:id
   */
  static deleteTool = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await ToolService.deleteTool(id, req.user!.id);

    logger.info('Tool deleted successfully', {
      toolId: id,
      deletedBy: req.user!.id
    });

    res.json({
      success: true,
      message: 'Tool deleted successfully'
    });
  });

  /**
   * Check tool availability
   * GET /api/v1/tools/:id/availability
   */
  static checkAvailability = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const availability = await ToolService.checkAvailability(
      id,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({
      success: true,
      message: 'Availability checked successfully',
      data: availability
    });
  });

  /**
   * Get tool categories
   * GET /api/v1/tools/categories
   */
  static getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await ToolService.getCategories();

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: { categories }
    });
  });
}