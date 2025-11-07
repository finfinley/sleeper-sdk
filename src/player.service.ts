import { HttpClient } from './http-client';
import {
  PlayersResponse,
  Player,
  TrendingPlayer,
  Sport,
  TrendingType,
} from './types';

export class PlayerService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Fetch all players for a sport
   * WARNING: This returns ~5MB of data. Use sparingly - ideally once per day at most.
   * @param sport - The sport to fetch players for
   * @returns Promise<PlayersResponse> - Object with player IDs as keys and player objects as values
   */
  async getAllPlayers(sport: Sport): Promise<PlayersResponse> {
    return this.httpClient.get<PlayersResponse>(`/players/${sport}`);
  }

  /**
   * Get trending players based on add/drop activity
   * @param sport - The sport to get trending players for
   * @param type - Either 'add' or 'drop'
   * @param lookbackHours - Number of hours to look back (default: 24)
   * @param limit - Number of results to return (default: 25)
   * @returns Promise<TrendingPlayer[]> - Array of trending players with their activity count
   */
  async getTrendingPlayers(
    sport: Sport,
    type: TrendingType,
    lookbackHours: number = 24,
    limit: number = 25
  ): Promise<TrendingPlayer[]> {
    const query = this.httpClient.buildQueryString({
      lookback_hours: lookbackHours,
      limit,
    });
    
    return this.httpClient.get<TrendingPlayer[]>(`/players/${sport}/trending/${type}${query}`);
  }

  /**
   * Get a specific player by ID from the all players response
   * Note: This requires calling getAllPlayers first to get the full player data
   * @param sport - The sport the player belongs to
   * @param playerId - The player ID to find
   * @returns Promise<Player | null> - The player object or null if not found
   */
  async getPlayerById(sport: Sport, playerId: string): Promise<Player | null> {
    const allPlayers = await this.getAllPlayers(sport);
    return allPlayers[playerId] || null;
  }

  /**
   * Search for players by name
   * Note: This requires calling getAllPlayers first to get the full player data
   * @param sport - The sport to search in
   * @param searchTerm - The name or partial name to search for
   * @param limit - Maximum number of results to return (default: 10)
   * @returns Promise<Player[]> - Array of matching players
   */
  async searchPlayersByName(
    sport: Sport,
    searchTerm: string,
    limit: number = 10
  ): Promise<Player[]> {
    const allPlayers = await this.getAllPlayers(sport);
    const searchLower = searchTerm.toLowerCase();
    
    const matches: Player[] = [];
    
    for (const player of Object.values(allPlayers)) {
      if (matches.length >= limit) break;
      
      const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
      const searchFullName = player.search_full_name?.toLowerCase() || '';
      
      if (
        fullName.includes(searchLower) ||
        searchFullName.includes(searchLower) ||
        player.first_name.toLowerCase().includes(searchLower) ||
        player.last_name.toLowerCase().includes(searchLower)
      ) {
        matches.push(player);
      }
    }
    
    // Sort by search rank if available
    return matches.sort((a, b) => {
      if (a.search_rank && b.search_rank) {
        return a.search_rank - b.search_rank;
      }
      if (a.search_rank) return -1;
      if (b.search_rank) return 1;
      return 0;
    });
  }

  /**
   * Get players by position
   * Note: This requires calling getAllPlayers first to get the full player data
   * @param sport - The sport to search in
   * @param position - The position to filter by (e.g., 'QB', 'RB', 'WR', etc.)
   * @param limit - Maximum number of results to return (default: 50)
   * @returns Promise<Player[]> - Array of players at the specified position
   */
  async getPlayersByPosition(
    sport: Sport,
    position: string,
    limit: number = 50
  ): Promise<Player[]> {
    const allPlayers = await this.getAllPlayers(sport);
    
    const matches: Player[] = [];
    
    for (const player of Object.values(allPlayers)) {
      if (matches.length >= limit) break;
      
      if (
        player.position === position ||
        player.fantasy_positions.includes(position)
      ) {
        matches.push(player);
      }
    }
    
    // Sort by search rank if available
    return matches.sort((a, b) => {
      if (a.search_rank && b.search_rank) {
        return a.search_rank - b.search_rank;
      }
      if (a.search_rank) return -1;
      if (b.search_rank) return 1;
      return 0;
    });
  }

  /**
   * Get players by team
   * Note: This requires calling getAllPlayers first to get the full player data
   * @param sport - The sport to search in
   * @param team - The team abbreviation (e.g., 'NE', 'DAL', etc.)
   * @param limit - Maximum number of results to return (default: 100)
   * @returns Promise<Player[]> - Array of players on the specified team
   */
  async getPlayersByTeam(
    sport: Sport,
    team: string,
    limit: number = 100
  ): Promise<Player[]> {
    const allPlayers = await this.getAllPlayers(sport);
    
    const matches: Player[] = [];
    
    for (const player of Object.values(allPlayers)) {
      if (matches.length >= limit) break;
      
      if (player.team === team) {
        matches.push(player);
      }
    }
    
    // Sort by search rank if available, then by position
    return matches.sort((a, b) => {
      if (a.search_rank && b.search_rank) {
        return a.search_rank - b.search_rank;
      }
      if (a.search_rank) return -1;
      if (b.search_rank) return 1;
      
      // Secondary sort by position priority (QB, RB, WR, TE, K, DEF)
      const positionPriority: { [key: string]: number } = {
        QB: 1,
        RB: 2,
        WR: 3,
        TE: 4,
        K: 5,
        DEF: 6,
      };
      
      const aPriority = positionPriority[a.position] || 999;
      const bPriority = positionPriority[b.position] || 999;
      
      return aPriority - bPriority;
    });
  }

  /**
   * Get active players (not on IR, suspended, etc.)
   * Note: This requires calling getAllPlayers first to get the full player data
   * @param sport - The sport to search in
   * @param limit - Maximum number of results to return (default: 1000)
   * @returns Promise<Player[]> - Array of active players
   */
  async getActivePlayers(sport: Sport, limit: number = 1000): Promise<Player[]> {
    const allPlayers = await this.getAllPlayers(sport);
    
    const matches: Player[] = [];
    
    for (const player of Object.values(allPlayers)) {
      if (matches.length >= limit) break;
      
      if (player.status === 'Active' && player.team) {
        matches.push(player);
      }
    }
    
    return matches.sort((a, b) => {
      if (a.search_rank && b.search_rank) {
        return a.search_rank - b.search_rank;
      }
      if (a.search_rank) return -1;
      if (b.search_rank) return 1;
      return 0;
    });
  }

  /**
   * Get multiple players by their IDs
   * Note: This requires calling getAllPlayers first to get the full player data
   * @param sport - The sport the players belong to
   * @param playerIds - Array of player IDs to fetch
   * @returns Promise<Player[]> - Array of found players (may be fewer than requested if some IDs are invalid)
   */
  async getPlayersByIds(sport: Sport, playerIds: string[]): Promise<Player[]> {
    const allPlayers = await this.getAllPlayers(sport);
    
    return playerIds
      .map((id) => allPlayers[id])
      .filter((player): player is Player => player !== undefined);
  }

  /**
   * Get rookie players (players with 0 years experience)
   * Note: This requires calling getAllPlayers first to get the full player data
   * @param sport - The sport to search in
   * @param limit - Maximum number of results to return (default: 100)
   * @returns Promise<Player[]> - Array of rookie players
   */
  async getRookiePlayers(sport: Sport, limit: number = 100): Promise<Player[]> {
    const allPlayers = await this.getAllPlayers(sport);
    
    const matches: Player[] = [];
    
    for (const player of Object.values(allPlayers)) {
      if (matches.length >= limit) break;
      
      if (player.years_exp === 0 && player.status === 'Active') {
        matches.push(player);
      }
    }
    
    return matches.sort((a, b) => {
      if (a.search_rank && b.search_rank) {
        return a.search_rank - b.search_rank;
      }
      if (a.search_rank) return -1;
      if (b.search_rank) return 1;
      return 0;
    });
  }
}
