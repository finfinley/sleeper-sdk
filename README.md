# Sleeper SDK

A comprehensive TypeScript SDK for the Sleeper Fantasy Football API. This SDK provides type-safe access to all Sleeper API endpoints with built-in rate limiting, error handling, and retry logic.

## Features

- 🏈 **Complete API Coverage** - All Sleeper API endpoints supported
- 🔒 **Type Safety** - Full TypeScript support with comprehensive type definitions
- 🚦 **Rate Limiting** - Built-in rate limiting to stay within API limits (< 1000 requests/minute)
- 🔄 **Retry Logic** - Automatic retry with exponential backoff for failed requests
- 🎯 **Easy to Use** - Simple, intuitive API design
- 📚 **Well Documented** - Comprehensive JSDoc comments and examples
- 🧪 **Tested** - Unit tests for core functionality

## Installation

```bash
npm install sleeper-sdk
```

## Quick Start

```typescript
import { SleeperSDK } from 'sleeper-sdk';

const sleeper = new SleeperSDK();

// Get a user
const user = await sleeper.users.getUser('username');
console.log(user.display_name);

// Get user's leagues for current season
const leagues = await sleeper.users.getUserLeagues(user.user_id, {
  sport: 'nfl',
  season: '2023'
});

// Get league rosters
const rosters = await sleeper.leagues.getLeagueRosters(leagues[0].league_id);

// Get trending players
const trending = await sleeper.players.getTrendingPlayers('nfl', 'add');
```

## API Reference

### SleeperSDK

The main SDK class that provides access to all services.

```typescript
const sleeper = new SleeperSDK({
  timeout: 10000,    // Request timeout in ms (default: 10000)
  retries: 3,        // Number of retries (default: 3)
  retryDelay: 1000   // Base retry delay in ms (default: 1000)
});
```

### Services

The SDK is organized into four main services:

#### Users Service (`sleeper.users`)

```typescript
// Get user by username or user ID
const user = await sleeper.users.getUser('username');

// Get user's leagues
const leagues = await sleeper.users.getUserLeagues(user.user_id, {
  sport: 'nfl',
  season: '2023'
});

// Get user's drafts
const drafts = await sleeper.users.getUserDrafts(user.user_id, {
  sport: 'nfl',
  season: '2023'
});

// Get user with avatar URL
const userWithAvatar = await sleeper.users.getUserWithAvatar('username');
console.log(userWithAvatar.avatarUrl);
```

#### Leagues Service (`sleeper.leagues`)

```typescript
// Get league info
const league = await sleeper.leagues.getLeague('league_id');

// Get league rosters
const rosters = await sleeper.leagues.getLeagueRosters('league_id');

// Get league users
const users = await sleeper.leagues.getLeagueUsers('league_id');

// Get matchups for a specific week
const matchups = await sleeper.leagues.getLeagueMatchups('league_id', 1);

// Get playoff brackets
const winnersBracket = await sleeper.leagues.getWinnersBracket('league_id');
const losersBracket = await sleeper.leagues.getLosersBracket('league_id');

// Get transactions
const transactions = await sleeper.leagues.getLeagueTransactions('league_id', 1);

// Get traded picks
const tradedPicks = await sleeper.leagues.getLeagueTradedPicks('league_id');

// Get current NFL state
const nflState = await sleeper.leagues.getSportState('nfl');

// Get comprehensive league data
const leagueData = await sleeper.leagues.getLeagueData('league_id');
console.log(leagueData.league, leagueData.rosters, leagueData.users);
```

#### Drafts Service (`sleeper.drafts`)

```typescript
// Get league drafts
const drafts = await sleeper.drafts.getLeagueDrafts('league_id');

// Get specific draft
const draft = await sleeper.drafts.getDraft('draft_id');

// Get draft picks
const picks = await sleeper.drafts.getDraftPicks('draft_id');

// Get traded picks in draft
const tradedPicks = await sleeper.drafts.getDraftTradedPicks('draft_id');

// Get picks by round
const firstRoundPicks = await sleeper.drafts.getPicksByRound('draft_id', 1);

// Get picks by team
const teamPicks = await sleeper.drafts.getPicksByRoster('draft_id', 1);

// Get picks by position
const qbPicks = await sleeper.drafts.getPicksByPosition('draft_id', 'QB');

// Get draft statistics
const stats = await sleeper.drafts.getDraftStats('draft_id');
console.log(stats.totalPicks, stats.picksByRound, stats.picksByPosition);

// Get current pick info for ongoing draft
const currentPick = await sleeper.drafts.getCurrentPick('draft_id');
if (currentPick) {
  console.log(`Round ${currentPick.round}, Pick ${currentPick.pick}`);
}
```

#### Players Service (`sleeper.players`)

⚠️ **Note**: The `getAllPlayers()` method returns ~5MB of data. Use sparingly (at most once per day) and consider caching the results.

```typescript
// Get all players (use sparingly!)
const allPlayers = await sleeper.players.getAllPlayers('nfl');

// Get trending players
const trendingAdds = await sleeper.players.getTrendingPlayers('nfl', 'add', 24, 25);
const trendingDrops = await sleeper.players.getTrendingPlayers('nfl', 'drop');

// Search players by name
const players = await sleeper.players.searchPlayersByName('nfl', 'Tom Brady');

// Get players by position
const quarterbacks = await sleeper.players.getPlayersByPosition('nfl', 'QB');

// Get players by team
const patriotsPlayers = await sleeper.players.getPlayersByTeam('nfl', 'NE');

// Get active players only
const activePlayers = await sleeper.players.getActivePlayers('nfl');

// Get rookie players
const rookies = await sleeper.players.getRookiePlayers('nfl');

// Get specific player by ID
const player = await sleeper.players.getPlayerById('nfl', '4035');

// Get multiple players by IDs
const players = await sleeper.players.getPlayersByIds('nfl', ['4035', '2307', '147']);
```

## Utility Methods

The SDK includes several utility methods:

```typescript
// Validate ID formats
SleeperSDK.isValidUserId('12345678');     // true
SleeperSDK.isValidLeagueId('123456789');  // true
SleeperSDK.isValidDraftId('123456789');   // true
SleeperSDK.isValidPlayerId('4035');       // true
SleeperSDK.isValidPlayerId('NE');         // true (defense)

// Get current NFL season
const season = SleeperSDK.getCurrentNFLSeason(); // '2023'

// Get estimated current NFL week
const week = SleeperSDK.getEstimatedNFLWeek(); // 12

// Format avatar URLs
const avatarUrl = SleeperSDK.getAvatarUrl('avatar_id');
const thumbnailUrl = SleeperSDK.getAvatarUrl('avatar_id', true);

// Test connection
const isConnected = await sleeper.testConnection();
```

## Error Handling

The SDK includes comprehensive error handling:

```typescript
import { SleeperError } from 'sleeper-sdk';

try {
  const user = await sleeper.users.getUser('nonexistent');
} catch (error) {
  if (error instanceof SleeperError) {
    console.log('Status:', error.status);
    console.log('Message:', error.message);
    console.log('Details:', error.details);
  }
}
```

Common error status codes:
- `429` - Rate limit exceeded
- `404` - Resource not found
- `500+` - Server errors (will be retried automatically)

## Rate Limiting

The SDK automatically handles rate limiting to stay under Sleeper's limit of 1000 requests per minute:

- Enforces minimum 60ms between requests
- Automatic exponential backoff retry for rate limit errors
- Configurable retry settings

## Types

The SDK includes comprehensive TypeScript types for all API responses:

```typescript
import {
  SleeperUser,
  League,
  Roster,
  Draft,
  DraftPick,
  Player,
  Matchup,
  Transaction,
  // ... and many more
} from 'sleeper-sdk';
```

## Examples

### Get League Standings

```typescript
async function getLeagueStandings(leagueId: string) {
  const rosters = await sleeper.leagues.getLeagueRosters(leagueId);
  
  // Sort by wins, then by points scored
  const standings = rosters
    .sort((a, b) => {
      if (b.settings.wins !== a.settings.wins) {
        return b.settings.wins - a.settings.wins;
      }
      return b.settings.fpts - a.settings.fpts;
    })
    .map((roster, index) => ({
      rank: index + 1,
      rosterId: roster.roster_id,
      wins: roster.settings.wins,
      losses: roster.settings.losses,
      ties: roster.settings.ties,
      pointsFor: roster.settings.fpts,
      pointsAgainst: roster.settings.fpts_against,
    }));
  
  return standings;
}
```

### Get Player Performance in League

```typescript
async function getPlayerPerformance(leagueId: string, playerId: string, week: number) {
  const matchups = await sleeper.leagues.getLeagueMatchups(leagueId, week);
  
  for (const matchup of matchups) {
    if (matchup.players_points && matchup.players_points[playerId]) {
      return {
        points: matchup.players_points[playerId],
        wasStarter: matchup.starters.includes(playerId),
        rosterId: matchup.roster_id,
      };
    }
  }
  
  return null; // Player not found in any matchup
}
```

### Track Draft Progress

```typescript
async function trackDraftProgress(draftId: string) {
  const [draft, picks] = await Promise.all([
    sleeper.drafts.getDraft(draftId),
    sleeper.drafts.getDraftPicks(draftId),
  ]);
  
  const totalPicks = draft.settings.teams * draft.settings.rounds;
  const progress = (picks.length / totalPicks) * 100;
  
  console.log(`Draft is ${progress.toFixed(1)}% complete`);
  console.log(`${picks.length} of ${totalPicks} picks made`);
  
  if (draft.status === 'drafting') {
    const currentPick = await sleeper.drafts.getCurrentPick(draftId);
    if (currentPick) {
      console.log(`Currently on Round ${currentPick.round}, Pick ${currentPick.pick}`);
    }
  }
}
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

## License

MIT License - see LICENSE file for details.

## Support

- 📚 [Sleeper API Documentation](https://docs.sleeper.app/)
- 🐛 [Report Issues](https://github.com/yourusername/sleeper-sdk/issues)
- 💬 [Discussions](https://github.com/yourusername/sleeper-sdk/discussions)

## Changelog

### v1.0.0
- Initial release
- Complete Sleeper API coverage
- TypeScript support
- Rate limiting and error handling
- Comprehensive documentation
