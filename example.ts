import { SleeperSDK } from './src/index';

async function main(): Promise<void> {
  // Initialize the SDK
  const sleeper = new SleeperSDK();

  try {
    // Test connection
    console.log('Testing connection to Sleeper API...');
    const isConnected = await sleeper.testConnection();
    console.log('Connection status:', isConnected ? 'Connected' : 'Failed');

    if (!isConnected) return;

    // Get current NFL state
    console.log('\nGetting current NFL state...');
    const nflState = await sleeper.leagues.getSportState('nfl');
    console.log('Current NFL season:', nflState.season);
    console.log('Current week:', nflState.week);
    console.log('Season type:', nflState.season_type);

    // Example: Get a user (you'll need to replace with a real username)
    console.log('\nTrying to get user info...');
    try {
      const user = await sleeper.users.getUser('sleeperuser'); // This might not exist
      console.log('User found:', user.display_name);
    } catch (error) {
      console.log('User not found or error occurred');
    }

    // Get trending players
    console.log('\nGetting trending players (adds)...');
    const trendingAdds = await sleeper.players.getTrendingPlayers('nfl', 'add', 24, 5);
    console.log('Top 5 trending adds:', trendingAdds.map(p => `Player ${p.player_id}: ${p.count} adds`));

    console.log('\nSDK example completed successfully!');
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
