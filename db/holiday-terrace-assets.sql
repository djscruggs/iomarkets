-- Holiday Terrace Due Diligence Assets
-- This file contains the assets for investment ID 51 (Holiday Terrace)

-- Investment-sponsor relationships for Holiday Terrace
INSERT OR REPLACE INTO investment_sponsors (investment_id, sponsor_id) VALUES
('51', 's51'),
('51', 's52');

-- PDF Documents
INSERT OR REPLACE INTO due_diligence_assets (id, investment_id, name, type, url, thumbnail_url, uploaded_date, size) VALUES
('ht-ex-1-cert-of-lp-holiday-terrace-pdf', '51', 'Ex 1 Cert of LP Holiday Terrace', 'pdf', '/duediligence/holidayterrace/Ex 1 Cert of LP Holiday Terrace.pdf', NULL, '2022-02-22', '242 KB'),
('ht-ex-2-lpa-holiday-terrace-04182018-pdf', '51', 'Ex 2 LPA Holiday Terrace 04182018', 'pdf', '/duediligence/holidayterrace/Ex 2 LPA Holiday Terrace 04182018.pdf', NULL, '2022-02-22', '780 KB'),
('ht-ex-3-sa-holiday-terrace-pdf', '51', 'Ex 3 SA Holiday Terrace', 'pdf', '/duediligence/holidayterrace/Ex 3 SA Holiday Terrace.pdf', NULL, '2022-02-22', '299 KB'),
('ht-ex-3-sa-receipt-pdf', '51', 'Ex 3 SA receipt', 'pdf', '/duediligence/holidayterrace/Ex 3 SA receipt.pdf', NULL, '2022-02-22', '89 KB'),
('ht-ppm-holiday-terrace-04182018-pdf', '51', 'PPM Holiday Terrace 04182018', 'pdf', '/duediligence/holidayterrace/PPM Holiday Terrace 04182018.pdf', NULL, '2022-02-22', '712 KB'),
('ht-supp-sa-holiday-terrace-pdf', '51', 'Supp SA Holiday Terrace', 'pdf', '/duediligence/holidayterrace/Supp SA Holiday Terrace.pdf', NULL, '2022-02-22', '205 KB'),

-- Property Photos
('ht-photo-1b-bedrm-jpg', '51', '1B Bedrm', 'image', '/duediligence/holidayterrace/photos/1B_Bedrm.jpg', '/duediligence/holidayterrace/photos/1B_Bedrm.jpg', '2022-02-22', '157 KB'),
('ht-photo-1b-kitchen-jpg', '51', '1B Kitchen', 'image', '/duediligence/holidayterrace/photos/1B_Kitchen.jpg', '/duediligence/holidayterrace/photos/1B_Kitchen.jpg', '2022-02-22', '177 KB'),
('ht-photo-1b-liv-rm-jpg', '51', '1B Liv Rm', 'image', '/duediligence/holidayterrace/photos/1B_Liv_Rm.jpg', '/duediligence/holidayterrace/photos/1B_Liv_Rm.jpg', '2022-02-22', '194 KB'),
('ht-photo-bath-vanity-jpg', '51', 'Bath Vanity', 'image', '/duediligence/holidayterrace/photos/Bath_Vanity.jpg', '/duediligence/holidayterrace/photos/Bath_Vanity.jpg', '2022-02-22', '200 KB'),
('ht-photo-clubhouse-jpg', '51', 'Clubhouse', 'image', '/duediligence/holidayterrace/photos/Clubhouse.JPG', '/duediligence/holidayterrace/photos/Clubhouse.JPG', '2022-02-22', '2.0 MB'),
('ht-photo-exercise-rm-jpg', '51', 'Exercise Rm', 'image', '/duediligence/holidayterrace/photos/Exercise_Rm.jpg', '/duediligence/holidayterrace/photos/Exercise_Rm.jpg', '2022-02-22', '150 KB'),
('ht-photo-exterior-on-schaefer-jpg', '51', 'Exterior On Schaefer', 'image', '/duediligence/holidayterrace/photos/Exterior_On_Schaefer.jpg', '/duediligence/holidayterrace/photos/Exterior_On_Schaefer.jpg', '2022-02-22', '253 KB'),
('ht-photo-indoor-pool-jpg', '51', 'Indoor Pool', 'image', '/duediligence/holidayterrace/photos/Indoor_Pool.jpg', '/duediligence/holidayterrace/photos/Indoor_Pool.jpg', '2022-02-22', '192 KB'),
('ht-photo-laundry-jpg', '51', 'Laundry', 'image', '/duediligence/holidayterrace/photos/Laundry.jpg', '/duediligence/holidayterrace/photos/Laundry.jpg', '2022-02-22', '141 KB'),
('ht-photo-map-1-png', '51', 'Map 1', 'image', '/duediligence/holidayterrace/photos/Map_1.png', '/duediligence/holidayterrace/photos/Map_1.png', '2022-02-22', '115 KB');
