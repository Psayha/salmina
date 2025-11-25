/**
 * @file stats.controller.ts
 * @description Stats controller
 */

import { Request, Response } from 'express';
import { prisma } from '../../database/prisma.service.js';
import { logger } from '../../utils/logger.js';

/**
 * Get admin statistics
 */
export async function getStats(_req: Request, res: Response) {
  try {
    // Run queries in parallel for performance
    const [totalOrders, totalRevenueResult, totalUsers, totalProducts, recentOrders, topProducts] = await Promise.all([
      // Total orders count
      prisma.order.count(),

      // Total revenue (sum of paid orders)
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          status: {
            in: ['PAID', 'SHIPPED'],
          },
        },
      }),

      // Total users count
      prisma.user.count(),

      // Total products count
      prisma.product.count({
        where: {
          isActive: true,
        },
      }),

      // Recent orders (last 5)
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          items: true,
        },
      }),

      // Top products (by quantity sold - simplified for now, just taking 5 random active)
      // In a real app, this would be an aggregation on OrderItem
      prisma.product.findMany({
        take: 5,
        where: {
          isActive: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
    ]);

    // Calculate revenue by day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueByDay = await prisma.order.groupBy({
      by: ['createdAt'],
      _sum: {
        total: true,
      },
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
        status: {
          in: ['PAID', 'SHIPPED'],
        },
      },
    });

    // Format revenue data for chart (simplified)
    // In a real app, we'd fill in missing days with 0
    const revenueChart = revenueByDay.map((item: { createdAt: Date; _sum: { total: number | null } }) => ({
      date: item.createdAt.toISOString().split('T')[0],
      revenue: item._sum.total || 0,
    }));

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenueResult._sum.total || 0,
        totalUsers,
        totalProducts,
        recentOrders,
        topProducts,
        revenueChart,
      },
    });
  } catch (error) {
    logger.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
}
