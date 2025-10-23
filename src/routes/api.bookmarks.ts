/**
 * Bookmarks API Route
 *
 * GET /api/bookmarks - Get user's bookmarked investments
 * POST /api/bookmarks - Add bookmark
 * DELETE /api/bookmarks - Remove bookmark
 */

import type { Route } from "./+types/api.bookmarks";
import { getDb } from '../lib/db.js';
import { getInvestmentById } from '../lib/queries.js';

// For now, we'll use a mock user ID. In production, this would come from authentication
const MOCK_USER_ID = 'user-123';

/**
 * Get user's bookmarked investments
 */
export async function loader({ request }: Route.LoaderArgs) {
  try {
    const db = getDb();
    
    const stmt = db.prepare(`
      SELECT b.*, i.*
      FROM bookmarks b
      JOIN investments i ON b.investment_id = i.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `);
    
    const bookmarks = stmt.all(MOCK_USER_ID) as Array<{
      id: string;
      user_id: string;
      investment_id: string;
      created_at: string;
      name: string;
      sponsor: string;
      target_raise: number;
      amount_raised: number;
      image_url: string;
      type: string;
      location: string;
      min_investment: number;
      projected_return: number;
      term: string;
      featured: number;
    }>;
    
    return Response.json({
      bookmarks: bookmarks.map(bookmark => ({
        id: bookmark.id,
        investmentId: bookmark.investment_id,
        createdAt: bookmark.created_at,
        investment: {
          id: bookmark.investment_id,
          name: bookmark.name,
          sponsor: bookmark.sponsor,
          targetRaise: bookmark.target_raise,
          amountRaised: bookmark.amount_raised,
          imageUrl: bookmark.image_url,
          type: bookmark.type,
          location: bookmark.location,
          minInvestment: bookmark.min_investment,
          projectedReturn: bookmark.projected_return,
          term: bookmark.term,
          featured: bookmark.featured === 1,
        }
      }))
    });
    
  } catch (error: any) {
    console.error('Error fetching bookmarks:', error);
    return Response.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

/**
 * Add or remove bookmark
 */
export async function action({ request }: Route.ActionArgs) {
  try {
    const body = await request.json();
    const { investmentId, action: bookmarkAction } = body;
    
    if (!investmentId) {
      return Response.json(
        { error: 'Investment ID is required' },
        { status: 400 }
      );
    }
    
    if (!bookmarkAction || !['add', 'remove'].includes(bookmarkAction)) {
      return Response.json(
        { error: 'Action must be "add" or "remove"' },
        { status: 400 }
      );
    }
    
    // Check if investment exists
    const investment = getInvestmentById(investmentId);
    if (!investment) {
      return Response.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }
    
    const db = getDb();
    
    if (bookmarkAction === 'add') {
      // Add bookmark
      const bookmarkId = `bookmark-${MOCK_USER_ID}-${investmentId}-${Date.now()}`;
      
      const insertStmt = db.prepare(`
        INSERT INTO bookmarks (id, user_id, investment_id)
        VALUES (?, ?, ?)
      `);
      
      try {
        insertStmt.run(bookmarkId, MOCK_USER_ID, investmentId);
        
        return Response.json({
          success: true,
          message: 'Bookmark added successfully',
          bookmarkId,
          investmentId
        });
      } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
          return Response.json(
            { error: 'Investment is already bookmarked' },
            { status: 409 }
          );
        }
        throw error;
      }
      
    } else if (bookmarkAction === 'remove') {
      // Remove bookmark
      const deleteStmt = db.prepare(`
        DELETE FROM bookmarks 
        WHERE user_id = ? AND investment_id = ?
      `);
      
      const result = deleteStmt.run(MOCK_USER_ID, investmentId);
      
      if (result.changes === 0) {
        return Response.json(
          { error: 'Bookmark not found' },
          { status: 404 }
        );
      }
      
      return Response.json({
        success: true,
        message: 'Bookmark removed successfully',
        investmentId
      });
    }
    
  } catch (error: any) {
    console.error('Error managing bookmark:', error);
    return Response.json(
      { error: 'Failed to manage bookmark' },
      { status: 500 }
    );
  }
}
