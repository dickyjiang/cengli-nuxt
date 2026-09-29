-- Batas laporan per pengunjung per jam butuh pencarian cepat berdasarkan voter_id.
CREATE INDEX IF NOT EXISTS idx_reports_voter ON reports (voter_id, created_at);
