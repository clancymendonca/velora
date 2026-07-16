-- Enable Row Level Security (RLS) for user-owned tables
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bankroll_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE clv_records ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- Row Level Security Policies for 'bets'
-- ----------------------------------------------------
CREATE POLICY select_user_bets ON bets
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY insert_user_bets ON bets
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY update_user_bets ON bets
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- ----------------------------------------------------
-- Row Level Security Policies for 'bankroll_ledger'
-- ----------------------------------------------------
CREATE POLICY select_user_ledger ON bankroll_ledger
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY insert_user_ledger ON bankroll_ledger
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- ----------------------------------------------------
-- Row Level Security Policies for 'clv_records'
-- ----------------------------------------------------
CREATE POLICY select_user_clv ON clv_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bets
      WHERE bets.id = clv_records.bet_id
      AND bets.user_id = auth.uid()::text
    )
  );
