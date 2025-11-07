import { SleeperSDK } from '../index';

describe('SleeperSDK', () => {
  let sdk: SleeperSDK;

  beforeEach(() => {
    sdk = new SleeperSDK();
  });

  describe('Initialization', () => {
    it('should create SDK instance successfully', () => {
      expect(sdk).toBeInstanceOf(SleeperSDK);
      expect(sdk.users).toBeDefined();
      expect(sdk.leagues).toBeDefined();
      expect(sdk.drafts).toBeDefined();
      expect(sdk.players).toBeDefined();
    });

    it('should provide version information', () => {
      const version = sdk.getVersion();
      expect(version.sdkVersion).toBe('1.0.0');
      expect(version.apiVersion).toBe('v1');
    });
  });

  describe('Utility Methods', () => {
    it('should validate user IDs correctly', () => {
      expect(SleeperSDK.isValidUserId('12345678')).toBe(true);
      expect(SleeperSDK.isValidUserId('abc123')).toBe(false);
      expect(SleeperSDK.isValidUserId('')).toBe(false);
    });

    it('should validate league IDs correctly', () => {
      expect(SleeperSDK.isValidLeagueId('123456789')).toBe(true);
      expect(SleeperSDK.isValidLeagueId('abc123')).toBe(false);
      expect(SleeperSDK.isValidLeagueId('')).toBe(false);
    });

    it('should validate draft IDs correctly', () => {
      expect(SleeperSDK.isValidDraftId('123456789')).toBe(true);
      expect(SleeperSDK.isValidDraftId('abc123')).toBe(false);
      expect(SleeperSDK.isValidDraftId('')).toBe(false);
    });

    it('should validate player IDs correctly', () => {
      expect(SleeperSDK.isValidPlayerId('4035')).toBe(true);
      expect(SleeperSDK.isValidPlayerId('NE')).toBe(true);
      expect(SleeperSDK.isValidPlayerId('LAR')).toBe(true);
      expect(SleeperSDK.isValidPlayerId('abc123')).toBe(false);
      expect(SleeperSDK.isValidPlayerId('')).toBe(false);
    });

    it('should get current NFL season', () => {
      const season = SleeperSDK.getCurrentNFLSeason();
      expect(season).toMatch(/^\d{4}$/);
      expect(parseInt(season)).toBeGreaterThan(2020);
    });

    it('should get estimated NFL week', () => {
      const week = SleeperSDK.getEstimatedNFLWeek();
      expect(week).toBeGreaterThanOrEqual(1);
      expect(week).toBeLessThanOrEqual(17);
    });

    it('should format avatar URLs correctly', () => {
      const fullUrl = SleeperSDK.getAvatarUrl('test123');
      expect(fullUrl).toBe('https://sleepercdn.com/avatars/test123');

      const thumbUrl = SleeperSDK.getAvatarUrl('test123', true);
      expect(thumbUrl).toBe('https://sleepercdn.com/avatars/thumbs/test123');

      const nullUrl = SleeperSDK.getAvatarUrl(null);
      expect(nullUrl).toBeNull();
    });
  });

  // Note: Integration tests would require actual API calls
  // These should be run sparingly and possibly mocked for CI/CD
  describe('Integration Tests', () => {
    it('should be able to test connection', async () => {
      // This makes an actual API call - use sparingly
      const result = await sdk.testConnection();
      expect(typeof result).toBe('boolean');
    }, 10000); // 10 second timeout for network request
  });
});
