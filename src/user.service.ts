import { HttpClient } from './http-client';
import {
  SleeperUser,
  League,
  Draft,
  GetLeaguesOptions,
  GetDraftsOptions,
} from './types';

export class UserService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get a user by username or user ID
   * @param usernameOrId - The username or user_id of the user
   * @returns Promise<SleeperUser> - The user object
   */
  async getUser(usernameOrId: string): Promise<SleeperUser> {
    return this.httpClient.get<SleeperUser>(`/user/${usernameOrId}`);
  }

  /**
   * Get all leagues for a user in a specific sport and season
   * @param userId - The user_id of the user
   * @param options - Options containing sport and season
   * @returns Promise<League[]> - Array of leagues for the user
   */
  async getUserLeagues(
    userId: string,
    options: GetLeaguesOptions
  ): Promise<League[]> {
    const { sport, season } = options;
    return this.httpClient.get<League[]>(`/user/${userId}/leagues/${sport}/${season}`);
  }

  /**
   * Get all drafts for a user in a specific sport and season
   * @param userId - The user_id of the user
   * @param options - Options containing sport and season
   * @returns Promise<Draft[]> - Array of drafts for the user
   */
  async getUserDrafts(
    userId: string,
    options: GetDraftsOptions
  ): Promise<Draft[]> {
    const { sport, season } = options;
    return this.httpClient.get<Draft[]>(`/user/${userId}/drafts/${sport}/${season}`);
  }

  /**
   * Utility method to get user avatar URL
   * @param avatarId - The avatar ID from user object
   * @param thumbnail - Whether to get thumbnail version (default: false)
   * @returns string - The full avatar URL
   */
  getAvatarUrl(avatarId: string | null, thumbnail: boolean = false): string | null {
    if (!avatarId) return null;
    
    const baseUrl = 'https://sleepercdn.com/avatars';
    const path = thumbnail ? '/thumbs/' : '/';
    return `${baseUrl}${path}${avatarId}`;
  }

  /**
   * Get a user and their avatar URL in one call
   * @param usernameOrId - The username or user_id of the user
   * @param thumbnail - Whether to get thumbnail avatar (default: false)
   * @returns Promise<SleeperUser & { avatarUrl: string | null }> - User with avatar URL
   */
  async getUserWithAvatar(
    usernameOrId: string,
    thumbnail: boolean = false
  ): Promise<SleeperUser & { avatarUrl: string | null }> {
    const user = await this.getUser(usernameOrId);
    const avatarUrl = this.getAvatarUrl(user.avatar, thumbnail);
    
    return {
      ...user,
      avatarUrl,
    };
  }
}
