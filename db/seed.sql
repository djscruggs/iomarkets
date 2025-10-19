-- Seed data for IOMarkets MVP
-- Populated from mock data in src/data/

-- Note: This is a sample of the data. You would generate the full seed data
-- by running a script that converts the TypeScript mock data to SQL INSERT statements.

-- Sample investments (first 5 from mockInvestments)
INSERT INTO investments (id, name, sponsor, target_raise, amount_raised, image_url, type, location, min_investment, projected_return, term) VALUES
('1', 'Downtown Austin Mixed-Use Development', 'Urban Capital Partners', 5000000, 3750000, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop', 'real-estate', 'Austin, TX', 50000, 18.5, '5 years'),
('2', 'SaaS Growth Fund III', 'TechVentures Capital', 10000000, 8500000, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop', 'private-equity', NULL, 100000, 25.0, '7 years'),
('3', 'Miami Waterfront Residential Tower', 'Coastal Development Group', 15000000, 12000000, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop', 'real-estate', 'Miami, FL', 75000, 16.0, '4 years'),
('4', 'Healthcare Innovation Portfolio', 'LifeScience Ventures', 8000000, 5600000, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop', 'private-equity', NULL, 50000, 22.0, '6 years'),
('5', 'Denver Industrial Park', 'Midwest Industrial REIT', 12000000, 9000000, 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&auto=format&fit=crop', 'real-estate', 'Denver, CO', 100000, 14.5, '10 years');

-- Sample sponsors
INSERT INTO sponsors (id, name, email, phone, linkedin_url, photo_url, total_deals, total_value) VALUES
('s1', 'Michael Rodriguez', 'mrodriguez@urbancapital.com', '+1 (512) 555-0123', 'https://linkedin.com/in/michael-rodriguez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop', 23, 450000000),
('s2', 'Sarah Chen', 'schen@urbancapital.com', '+1 (512) 555-0124', 'https://linkedin.com/in/sarah-chen', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop', 18, 320000000),
('s3', 'David Park', 'dpark@techventures.com', '+1 (650) 555-0200', 'https://linkedin.com/in/david-park', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop', 31, 890000000),
('s4', 'James Thompson', 'jthompson@urbancapital.com', '+1 (512) 555-0125', 'https://linkedin.com/in/james-thompson', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop', 27, 580000000),
('s5', 'Emily Martinez', 'emartinez@urbancapital.com', '+1 (512) 555-0126', 'https://linkedin.com/in/emily-martinez', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop', 21, 410000000);

-- Investment-Sponsor relationships
INSERT INTO investment_sponsors (investment_id, sponsor_id) VALUES
('1', 's1'),
('1', 's2'),
('1', 's4'),
('1', 's5'),
('2', 's3');

-- Sample due diligence assets for investment 1
INSERT INTO due_diligence_assets (id, investment_id, name, type, url, thumbnail_url, uploaded_date, size) VALUES
('a1', '1', 'Investment Memorandum', 'pdf', 'https://example.com/memo.pdf', NULL, '2024-01-15', '2.4 MB'),
('a2', '1', 'Financial Projections', 'pdf', 'https://example.com/projections.pdf', NULL, '2024-01-20', '1.8 MB'),
('a3', '1', 'Property Survey', 'pdf', 'https://example.com/survey.pdf', NULL, '2024-01-22', '5.2 MB'),
('a4', '1', 'Site Photos - Exterior', 'image', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop', '2024-01-25', '3.1 MB'),
('a5', '1', 'Site Photos - Interior', 'image', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&auto=format&fit=crop', '2024-01-25', '2.8 MB'),
('a6', '1', 'Property Walkthrough Video', 'video', 'https://www.youtube.com/watch?v=5ZDBnjgQCtA', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop', '2024-01-28', '45 MB'),
('a7', '1', 'Market Analysis Report', 'pdf', 'https://example.com/market-analysis.pdf', NULL, '2024-02-01', '3.6 MB'),
('a8', '1', 'Legal Documents', 'pdf', 'https://example.com/legal.pdf', NULL, '2024-02-03', '4.2 MB');

-- Sample due diligence assets for investment 2
INSERT INTO due_diligence_assets (id, investment_id, name, type, url, uploaded_date, size) VALUES
('a9', '2', 'Investment Thesis', 'pdf', 'https://example.com/thesis.pdf', '2024-01-10', '1.9 MB'),
('a10', '2', 'Company Financials', 'pdf', 'https://example.com/financials.pdf', '2024-01-12', '2.1 MB'),
('a11', '2', 'Pitch Deck', 'pdf', 'https://example.com/deck.pdf', '2024-01-18', '8.5 MB');
