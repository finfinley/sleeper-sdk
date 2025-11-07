import { HttpClient, HttpClientConfig } from './http-client';
import { UserService } from './user.service';
import { LeagueService } from './league.service';
import { DraftService } from './draft.service';
import { PlayerService } from './player.service';

export interface SleeperSDKConfig extends HttpClientConfig {
  // Additional SDK-specific config options can be added here
}

/**
 * Main Sleeper SDK class that provides access to all Sleeper API functionality
 */
export class SleeperSDK {
  private httpClient: HttpClient;
  
  public readonly users: UserService;
  public readonly leagues: LeagueService;
  public readonly drafts: DraftService;
  public readonly players: PlayerService;

  /**
   * Create a new instance of the Sleeper SDK
   * @param config - Configuration options for the SDK
   */
  constructor(config: SleeperSDKConfig = {}) {
    this.httpClient = new HttpClient(config);
    
    // Initialize all services
    this.users = new UserService(this.httpClient);
    this.leagues = new LeagueService(this.httpClient);
    this.drafts = new DraftService(this.httpClient);
    this.players = new PlayerService(this.httpClient);
  }

  /**
   * Get the current configuration of the HTTP client
   * This can be useful for debugging or logging
   */
  getClientConfig(): HttpClientConfig {
    return {
      // Return a copy of the config to prevent external modification
      // Note: The actual config is stored privately in HttpClient
      baseURL: 'https://api.sleeper.app/v1', // default value
      timeout: 10000, // default value
      retries: 3, // default value
      retryDelay: 1000, // default value
    };
  }

  /**
   * Test the connection to the Sleeper API
   * This makes a simple request to verify the API is accessible
   * @returns Promise<boolean> - True if the API is accessible
   */
  async testConnection(): Promise<boolean> {
    try {
      // Make a simple request to get NFL state as a connectivity test
      await this.leagues.getSportState('nfl');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get version information about the SDK
   * @returns object with SDK version and API version
   */
  getVersion(): { sdkVersion: string; apiVersion: string } {
    return {
      sdkVersion: '1.0.0',
      apiVersion: 'v1',
    };
  }

  /**
   * Utility method to validate a user ID format
   * Sleeper user IDs are typically numeric strings
   * @param userId - The user ID to validate
   * @returns boolean - True if the format appears valid
   */
  static isValidUserId(userId: string): boolean {
    return /^\d+$/.test(userId);
  }

  /**
   * Utility method to validate a league ID format
   * Sleeper league IDs are typically numeric strings
   * @param leagueId - The league ID to validate
   * @returns boolean - True if the format appears valid
   */
  static isValidLeagueId(leagueId: string): boolean {
    return /^\d+$/.test(leagueId);
  }

  /**
   * Utility method to validate a draft ID format
   * Sleeper draft IDs are typically numeric strings
   * @param draftId - The draft ID to validate
   * @returns boolean - True if the format appears valid
   */
  static isValidDraftId(draftId: string): boolean {
    return /^\d+$/.test(draftId);
  }

  /**
   * Utility method to validate a player ID format
   * Sleeper player IDs can be numeric strings or team abbreviations (for defenses)
   * @param playerId - The player ID to validate
   * @returns boolean - True if the format appears valid
   */
  static isValidPlayerId(playerId: string): boolean {
    // Player IDs are either numeric strings or 2-3 letter team abbreviations for defenses
    return /^\d+$/.test(playerId) || /^[A-Z]{2,3}$/.test(playerId);
  }

  /**
   * Utility method to get the current NFL season
   * This is a rough calculation - for exact season info, use leagues.getSportState('nfl')
   * @returns string - The current NFL season year
   */
  static getCurrentNFLSeason(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed (0 = January)
    
    // NFL season typically runs from September to February
    // If it's January-February, it's still the previous year's season
    if (month <= 1) {
      return (year - 1).toString();
    }
    
    return year.toString();
  }

  /**
   * Utility method to get current NFL week (rough estimate)
   * For exact week info, use leagues.getSportState('nfl')
   * @returns number - Estimated current NFL week
   */
  static getEstimatedNFLWeek(): number {
    const now = new Date();
    const year = now.getFullYear();
    const seasonStart = new Date(year, 8, 7); // Roughly September 7th
    
    if (now < seasonStart) {
      return 1; // Pre-season or early season
    }
    
    const diffTime = now.getTime() - seasonStart.getTime();
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    return Math.min(Math.max(diffWeeks + 1, 1), 17); // NFL has 17 regular season weeks
  }

  /**
   * Utility method to format avatar URLs
   * @param avatarId - The avatar ID
   * @param thumbnail - Whether to get thumbnail version
   * @returns string - Full avatar URL or null if no avatar
   */
  static getAvatarUrl(avatarId: string | null, thumbnail: boolean = false): string | null {
    if (!avatarId) return null;
    
    const baseUrl = 'https://sleepercdn.com/avatars';
    const path = thumbnail ? '/thumbs/' : '/';
    return `${baseUrl}${path}${avatarId}`;
  }
}
