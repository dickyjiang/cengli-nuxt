-- "Rumah Tangga" sering dibaca sebagai kehidupan pernikahan dan bentrok dengan "Suami Istri".
-- Ganti nama tampilannya. Slug tetap 'rumah-tangga' supaya tautan lama tidak rusak.
UPDATE categories SET name = 'Urusan Rumah' WHERE slug = 'rumah-tangga';
