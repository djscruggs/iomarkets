// Database queries
import { getDb } from "./db";
import type { Investment } from "../types/investment";
import type { Sponsor, DueDiligenceAsset } from "../types/dueDiligence";

// Investment queries
export function getAllInvestments(): Investment[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      id, name, sponsor,
      target_raise as targetRaise,
      amount_raised as amountRaised,
      image_url as imageUrl,
      type, location,
      min_investment as minInvestment,
      projected_return as projectedReturn,
      term,
      featured
    FROM investments
    ORDER BY featured DESC, created_at DESC
  `);

  return stmt.all() as Investment[];
}

export function getInvestmentById(id: string): Investment | undefined {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      id, name, sponsor,
      target_raise as targetRaise,
      amount_raised as amountRaised,
      image_url as imageUrl,
      type, location,
      min_investment as minInvestment,
      projected_return as projectedReturn,
      term,
      featured
    FROM investments
    WHERE id = ?
  `);

  return stmt.get(id) as Investment | undefined;
}

export function getInvestmentsByType(
  type: "real-estate" | "private-equity"
): Investment[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      id, name, sponsor,
      target_raise as targetRaise,
      amount_raised as amountRaised,
      image_url as imageUrl,
      type, location,
      min_investment as minInvestment,
      projected_return as projectedReturn,
      term,
      featured
    FROM investments
    WHERE type = ?
    ORDER BY featured DESC, created_at DESC
  `);

  return stmt.all(type) as Investment[];
}

// Sponsor queries
export function getSponsorsForInvestment(investmentId: string): Sponsor[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      s.id, s.name, s.email, s.phone,
      s.linkedin_url as linkedInUrl,
      s.photo_url as photoUrl,
      s.total_deals as totalDeals,
      s.total_value as totalValue
    FROM sponsors s
    JOIN investment_sponsors isp ON s.id = isp.sponsor_id
    WHERE isp.investment_id = ?
  `);

  return stmt.all(investmentId) as Sponsor[];
}

export function getSponsorById(id: string): Sponsor | undefined {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      id, name, email, phone,
      linkedin_url as linkedInUrl,
      photo_url as photoUrl,
      total_deals as totalDeals,
      total_value as totalValue
    FROM sponsors
    WHERE id = ?
  `);

  return stmt.get(id) as Sponsor | undefined;
}

// Due diligence asset queries
export function getAssetsForInvestment(
  investmentId: string
): DueDiligenceAsset[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      id, name, type, url,
      thumbnail_url as thumbnailUrl,
      uploaded_date as uploadedDate,
      size
    FROM due_diligence_assets
    WHERE investment_id = ?
    ORDER BY uploaded_date DESC
  `);

  return stmt.all(investmentId) as DueDiligenceAsset[];
}

export function getAssetById(id: string): DueDiligenceAsset | undefined {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      id, name, type, url,
      thumbnail_url as thumbnailUrl,
      uploaded_date as uploadedDate,
      size
    FROM due_diligence_assets
    WHERE id = ?
  `);

  return stmt.get(id) as DueDiligenceAsset | undefined;
}

// Search and filter queries
export function searchInvestments(searchTerm: string): Investment[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      id, name, sponsor,
      target_raise as targetRaise,
      amount_raised as amountRaised,
      image_url as imageUrl,
      type, location,
      min_investment as minInvestment,
      projected_return as projectedReturn,
      term,
      featured
    FROM investments
    WHERE name LIKE ? OR sponsor LIKE ? OR location LIKE ?
    ORDER BY featured DESC, created_at DESC
  `);

  const searchPattern = `%${searchTerm}%`;
  return stmt.all(searchPattern, searchPattern, searchPattern) as Investment[];
}

export function getTopPerformingInvestments(limit: number = 10): Investment[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT
      id, name, sponsor,
      target_raise as targetRaise,
      amount_raised as amountRaised,
      image_url as imageUrl,
      type, location,
      min_investment as minInvestment,
      projected_return as projectedReturn,
      term,
      featured
    FROM investments
    ORDER BY featured DESC, projected_return DESC
    LIMIT ?
  `);

  return stmt.all(limit) as Investment[];
}
