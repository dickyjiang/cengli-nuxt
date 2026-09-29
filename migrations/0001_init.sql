-- status: published (tayang), pending (menunggu persetujuan), flagged (disembunyikan karena laporan), rejected
CREATE TABLE scenarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('published', 'pending', 'flagged', 'rejected')),
  author_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_scenarios_status_id ON scenarios (status, id DESC);
CREATE INDEX idx_scenarios_author_time ON scenarios (author_id, created_at);

-- Satu orang satu suara per kasus.
CREATE TABLE votes (
  scenario_id INTEGER NOT NULL REFERENCES scenarios (id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,
  choice TEXT NOT NULL CHECK (choice IN ('fair', 'unfair')),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (scenario_id, voter_id)
);
CREATE INDEX idx_votes_voter ON votes (voter_id);

CREATE TABLE reports (
  scenario_id INTEGER NOT NULL REFERENCES scenarios (id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (scenario_id, voter_id)
);
