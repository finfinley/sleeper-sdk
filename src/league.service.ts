import { HttpClient } from './http-client';
import {
  League,
  Roster,
  LeagueUser,
  Matchup,
  PlayoffMatchup,
  Transaction,
  TradedPick,
  NFLState,
  Sport,
} from './types';

export class LeagueService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get a specific league by ID
   * @param leagueId - The ID of the league to retrieve
   * @returns Promise<League> - The league object
   */
  async getLeague(leagueId: string): Promise<League> {
    return this.httpClient.get<League>(`/league/${leagueId}`);
  }

  /**
   * Get all rosters in a league
   * @param leagueId - The ID of the league
   * @returns Promise<Roster[]> - Array of rosters in the league
   */
  async getLeagueRosters(leagueId: string): Promise<Roster[]> {
    return this.httpClient.get<Roster[]>(`/league/${leagueId}/rosters`);
  }

  /**
   * Get all users in a league
   * @param leagueId - The ID of the league
   * @returns Promise<LeagueUser[]> - Array of users in the league
   */
  async getLeagueUsers(leagueId: string): Promise<LeagueUser[]> {
    return this.httpClient.get<LeagueUser[]>(`/league/${leagueId}/users`);
  }

  /**
   * Get matchups for a specific week in a league
   * @param leagueId - The ID of the league
   * @param week - The week number
   * @returns Promise<Matchup[]> - Array of matchups for the specified week
   */
  async getLeagueMatchups(leagueId: string, week: number): Promise<Matchup[]> {
    return this.httpClient.get<Matchup[]>(`/league/${leagueId}/matchups/${week}`);
  }

  /**
   * Get the winners bracket for a league
   * @param leagueId - The ID of the league
   * @returns Promise<PlayoffMatchup[]> - Array of playoff matchups in winners bracket
   */
  async getWinnersBracket(leagueId: string): Promise<PlayoffMatchup[]> {
    return this.httpClient.get<PlayoffMatchup[]>(`/league/${leagueId}/winners_bracket`);
  }

  /**
   * Get the losers bracket for a league
   * @param leagueId - The ID of the league  
   * @returns Promise<PlayoffMatchup[]> - Array of playoff matchups in losers bracket
   */
  async getLosersBracket(leagueId: string): Promise<PlayoffMatchup[]> {
    return this.httpClient.get<PlayoffMatchup[]>(`/league/${leagueId}/losers_bracket`);
  }

  /**
   * Get transactions for a specific week/round in a league
   * @param leagueId - The ID of the league
   * @param round - The week/round number
   * @returns Promise<Transaction[]> - Array of transactions for the specified round
   */
  async getLeagueTransactions(leagueId: string, round: number): Promise<Transaction[]> {
    return this.httpClient.get<Transaction[]>(`/league/${leagueId}/transactions/${round}`);
  }

  /**
   * Get all traded picks in a league
   * @param leagueId - The ID of the league
   * @returns Promise<TradedPick[]> - Array of traded picks in the league
   */
  async getLeagueTradedPicks(leagueId: string): Promise<TradedPick[]> {
    return this.httpClient.get<TradedPick[]>(`/league/${leagueId}/traded_picks`);
  }

  /**
   * Get the current state for a sport (e.g., current week, season)
   * @param sport - The sport to get state for
   * @returns Promise<NFLState> - The current state object
   */
  async getSportState(sport: Sport): Promise<NFLState> {
    return this.httpClient.get<NFLState>(`/state/${sport}`);
  }

  /**
   * Helper method to get league avatar URL
   * @param avatarId - The avatar ID from league object
   * @param thumbnail - Whether to get thumbnail version (default: false)
   * @returns string - The full avatar URL
   */
  getLeagueAvatarUrl(avatarId: string | null, thumbnail: boolean = false): string | null {
    if (!avatarId) return null;
    
    const baseUrl = 'https://sleepercdn.com/avatars';
    const path = thumbnail ? '/thumbs/' : '/';
    return `${baseUrl}${path}${avatarId}`;
  }

  /**
   * Get comprehensive league data including rosters, users, and basic info
   * @param leagueId - The ID of the league
   * @returns Promise<{league: League, rosters: Roster[], users: LeagueUser[]}> - Complete league data
   */
  async getLeagueData(leagueId: string): Promise<{
    league: League;
    rosters: Roster[];
    users: LeagueUser[];
  }> {
    const [league, rosters, users] = await Promise.all([
      this.getLeague(leagueId),
      this.getLeagueRosters(leagueId),
      this.getLeagueUsers(leagueId),
    ]);

    return { league, rosters, users };
  }

  /**
   * Get all matchups for a range of weeks
   * @param leagueId - The ID of the league
   * @param startWeek - Starting week number
   * @param endWeek - Ending week number
   * @returns Promise<{[week: number]: Matchup[]}> - Object with week numbers as keys and matchup arrays as values
   */
  async getMatchupsForWeekRange(
    leagueId: string,
    startWeek: number,
    endWeek: number
  ): Promise<{ [week: number]: Matchup[] }> {
    const weeks = Array.from(
      { length: endWeek - startWeek + 1 },
      (_, i) => startWeek + i
    );

    const matchupPromises = weeks.map((week) =>
      this.getLeagueMatchups(leagueId, week).then((matchups) => ({ week, matchups }))
    );

    const results = await Promise.all(matchupPromises);
    
    return results.reduce((acc, { week, matchups }) => {
      acc[week] = matchups;
      return acc;
    }, {} as { [week: number]: Matchup[] });
  }

  /**
   * Get a specific roster by roster ID
   * @param leagueId - The ID of the league
   * @param rosterId - The roster ID to find
   * @returns Promise<Roster | null> - The roster object or null if not found
   */
  async getRosterById(leagueId: string, rosterId: number): Promise<Roster | null> {
    const rosters = await this.getLeagueRosters(leagueId);
    return rosters.find((roster) => roster.roster_id === rosterId) || null;
  }

  /**
   * Get a roster by owner ID
   * @param leagueId - The ID of the league
   * @param ownerId - The user ID of the owner
   * @returns Promise<Roster | null> - The roster object or null if not found
   */
  async getRosterByOwnerId(leagueId: string, ownerId: string): Promise<Roster | null> {
    const rosters = await this.getLeagueRosters(leagueId);
    return rosters.find((roster) => roster.owner_id === ownerId) || null;
  }
}
