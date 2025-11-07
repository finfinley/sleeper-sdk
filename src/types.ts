// Base types
export type Sport = 'nfl' | 'nba' | 'lcs';
export type SeasonType = 'regular' | 'pre' | 'post';
export type LeagueStatus = 'pre_draft' | 'drafting' | 'in_season' | 'complete';
export type DraftStatus = 'pre_draft' | 'drafting' | 'complete';
export type DraftType = 'snake' | 'linear' | 'auction';
export type TransactionType = 'free_agent' | 'waiver' | 'trade';
export type TrendingType = 'add' | 'drop';

// User types
export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string | null;
}

export interface LeagueUser extends SleeperUser {
  metadata?: {
    team_name?: string;
    [key: string]: any;
  };
  is_owner?: boolean;
}

// League types
export interface League {
  total_rosters: number;
  status: LeagueStatus;
  sport: Sport;
  settings: LeagueSettings;
  season_type: SeasonType;
  season: string;
  scoring_settings: ScoringSettings;
  roster_positions: string[];
  previous_league_id?: string;
  name: string;
  league_id: string;
  draft_id: string;
  avatar: string | null;
}

export interface LeagueSettings {
  max_keepers?: number;
  draft_rounds?: number;
  trade_review_days?: number;
  squads?: number;
  reserve_allow_cov?: number;
  capacity_override?: number;
  pick_trading?: number;
  taxi_years?: number;
  taxi_allow_vets?: number;
  taxi_slots?: number;
  league_average_match?: number;
  waiver_type?: number;
  waiver_clear_days?: number;
  waiver_day_of_week?: number;
  start_week?: number;
  playoff_teams?: number;
  num_teams?: number;
  veto_votes_needed?: number;
  playoff_week_start?: number;
  daily_waivers?: number;
  taxi_deadline?: number;
  waiver_budget?: number;
  reserve_slots?: number;
  playoff_round_type?: number;
  daily_waivers_last_ran?: number;
  playoff_seed_type?: number;
  daily_waivers_days?: number;
  playoff_type?: number;
  best_ball?: number;
  [key: string]: any;
}

export interface ScoringSettings {
  pass_yd?: number;
  pass_td?: number;
  pass_int?: number;
  rush_yd?: number;
  rush_td?: number;
  rec?: number;
  rec_yd?: number;
  rec_td?: number;
  fum_lost?: number;
  fum_rec_td?: number;
  def_td?: number;
  def_int?: number;
  def_sack?: number;
  def_safety?: number;
  def_block_kick?: number;
  def_pass_def?: number;
  def_fum_rec?: number;
  def_kr_td?: number;
  def_pr_td?: number;
  def_st_td?: number;
  def_pts_allow?: {
    [key: string]: number;
  };
  def_yds_allow?: {
    [key: string]: number;
  };
  [key: string]: any;
}

// Roster types
export interface Roster {
  starters: string[];
  settings: RosterSettings;
  roster_id: number;
  reserve?: string[];
  players: string[];
  owner_id: string;
  league_id: string;
  co_owners?: string[];
  taxi?: string[];
}

export interface RosterSettings {
  wins: number;
  waiver_position: number;
  waiver_budget_used: number;
  total_moves: number;
  ties: number;
  losses: number;
  fpts_decimal: number;
  fpts_against_decimal: number;
  fpts_against: number;
  fpts: number;
  ppts?: number;
  ppts_decimal?: number;
  [key: string]: any;
}

// Matchup types
export interface Matchup {
  starters: string[];
  roster_id: number;
  players: string[];
  matchup_id: number;
  points: number;
  custom_points?: number | null;
  starters_points?: number[];
  players_points?: { [playerId: string]: number };
}

// Playoff bracket types
export interface PlayoffMatchup {
  r: number; // round
  m: number; // match id
  t1: number | null; // team 1 roster_id
  t2: number | null; // team 2 roster_id
  w: number | null; // winner roster_id
  l: number | null; // loser roster_id
  t1_from?: { w?: number; l?: number };
  t2_from?: { w?: number; l?: number };
  p?: number; // final position
}

// Transaction types
export interface Transaction {
  type: TransactionType;
  transaction_id: string;
  status_updated: number;
  status: 'complete' | 'failed';
  settings?: {
    waiver_bid?: number;
    [key: string]: any;
  };
  roster_ids: number[];
  metadata?: {
    notes?: string;
    [key: string]: any;
  };
  leg: number; // week
  drops?: { [playerId: string]: number };
  draft_picks: TradedPick[];
  creator: string;
  created: number;
  consenter_ids: number[];
  adds?: { [playerId: string]: number };
  waiver_budget: WaiverBudget[];
}

export interface WaiverBudget {
  sender: number;
  receiver: number;
  amount: number;
}

export interface TradedPick {
  season: string;
  round: number;
  roster_id: number;
  previous_owner_id: number;
  owner_id: number;
}

// Draft types
export interface Draft {
  type: DraftType;
  status: DraftStatus;
  start_time: number;
  sport: Sport;
  settings: DraftSettings;
  season_type: SeasonType;
  season: string;
  metadata: DraftMetadata;
  league_id: string;
  last_picked?: number;
  last_message_time?: number;
  last_message_id?: string;
  draft_order?: { [userId: string]: number };
  slot_to_roster_id?: { [slot: string]: number };
  draft_id: string;
  creators?: string[] | null;
  created: number;
}

export interface DraftSettings {
  teams: number;
  slots_wr: number;
  slots_te: number;
  slots_rb: number;
  slots_qb: number;
  slots_k: number;
  slots_flex: number;
  slots_def: number;
  slots_bn: number;
  rounds: number;
  pick_timer: number;
  slots_super_flex?: number;
  reversal_round?: number;
  alpha_sort?: number;
  [key: string]: any;
}

export interface DraftMetadata {
  scoring_type: string;
  name: string;
  description: string;
  [key: string]: any;
}

export interface DraftPick {
  player_id: string;
  picked_by: string;
  roster_id: number;
  round: number;
  draft_slot: number;
  pick_no: number;
  metadata: PlayerMetadata;
  is_keeper?: boolean | null;
  draft_id: string;
}

// Player types
export interface Player {
  hashtag?: string;
  depth_chart_position?: number | null;
  status: string;
  sport: Sport;
  fantasy_positions: string[];
  number?: number | null;
  search_last_name: string;
  injury_start_date?: string | null;
  weight?: string;
  position: string;
  practice_participation?: string | null;
  sportradar_id?: string;
  team?: string | null;
  last_name: string;
  college?: string;
  fantasy_data_id?: number;
  injury_status?: string | null;
  player_id: string;
  height?: string;
  search_full_name: string;
  age?: number | null;
  stats_id?: string;
  birth_country?: string;
  espn_id?: string;
  search_rank?: number;
  first_name: string;
  depth_chart_order?: number | null;
  years_exp?: number | null;
  rotowire_id?: number | null;
  rotoworld_id?: number | null;
  search_first_name: string;
  yahoo_id?: number | null;
  full_name?: string;
  [key: string]: any;
}

export interface PlayerMetadata {
  team?: string;
  status?: string;
  sport?: Sport;
  position?: string;
  player_id?: string;
  number?: string;
  news_updated?: string;
  last_name?: string;
  injury_status?: string;
  first_name?: string;
  [key: string]: any;
}

export interface TrendingPlayer {
  player_id: string;
  count: number;
}

// State types
export interface NFLState {
  week: number;
  season_type: SeasonType;
  season_start_date: string;
  season: string;
  previous_season: string;
  leg: number;
  league_season: string;
  league_create_season: string;
  display_week: number;
}

// API Response types
export type PlayersResponse = { [playerId: string]: Player };

// Error types
export interface SleeperError {
  status: number;
  message: string;
  details?: any;
}

// Utility types for optional parameters
export interface GetLeaguesOptions {
  sport: Sport;
  season: string;
}

export interface GetMatchupsOptions {
  league_id: string;
  week: number;
}

export interface GetTransactionsOptions {
  league_id: string;
  round: number;
}

export interface GetTrendingPlayersOptions {
  sport: Sport;
  type: TrendingType;
  lookback_hours?: number;
  limit?: number;
}

export interface GetDraftsOptions {
  sport: Sport;
  season: string;
}
