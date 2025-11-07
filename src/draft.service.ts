import { HttpClient } from './http-client';
import {
  Draft,
  DraftPick,
  TradedPick,
} from './types';

export class DraftService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get all drafts for a league
   * @param leagueId - The ID of the league
   * @returns Promise<Draft[]> - Array of drafts for the league
   */
  async getLeagueDrafts(leagueId: string): Promise<Draft[]> {
    return this.httpClient.get<Draft[]>(`/league/${leagueId}/drafts`);
  }

  /**
   * Get a specific draft by ID
   * @param draftId - The ID of the draft
   * @returns Promise<Draft> - The draft object
   */
  async getDraft(draftId: string): Promise<Draft> {
    return this.httpClient.get<Draft>(`/draft/${draftId}`);
  }

  /**
   * Get all picks in a draft
   * @param draftId - The ID of the draft
   * @returns Promise<DraftPick[]> - Array of all picks in the draft
   */
  async getDraftPicks(draftId: string): Promise<DraftPick[]> {
    return this.httpClient.get<DraftPick[]>(`/draft/${draftId}/picks`);
  }

  /**
   * Get traded picks in a draft
   * @param draftId - The ID of the draft
   * @returns Promise<TradedPick[]> - Array of traded picks in the draft
   */
  async getDraftTradedPicks(draftId: string): Promise<TradedPick[]> {
    return this.httpClient.get<TradedPick[]>(`/draft/${draftId}/traded_picks`);
  }

  /**
   * Get comprehensive draft data including picks and traded picks
   * @param draftId - The ID of the draft
   * @returns Promise<{draft: Draft, picks: DraftPick[], tradedPicks: TradedPick[]}> - Complete draft data
   */
  async getDraftData(draftId: string): Promise<{
    draft: Draft;
    picks: DraftPick[];
    tradedPicks: TradedPick[];
  }> {
    const [draft, picks, tradedPicks] = await Promise.all([
      this.getDraft(draftId),
      this.getDraftPicks(draftId),
      this.getDraftTradedPicks(draftId),
    ]);

    return { draft, picks, tradedPicks };
  }

  /**
   * Get picks for a specific round
   * @param draftId - The ID of the draft
   * @param round - The round number
   * @returns Promise<DraftPick[]> - Array of picks for the specified round
   */
  async getPicksByRound(draftId: string, round: number): Promise<DraftPick[]> {
    const picks = await this.getDraftPicks(draftId);
    return picks.filter((pick) => pick.round === round);
  }

  /**
   * Get picks for a specific roster/team
   * @param draftId - The ID of the draft
   * @param rosterId - The roster ID
   * @returns Promise<DraftPick[]> - Array of picks made by the specified roster
   */
  async getPicksByRoster(draftId: string, rosterId: number): Promise<DraftPick[]> {
    const picks = await this.getDraftPicks(draftId);
    return picks.filter((pick) => pick.roster_id === rosterId);
  }

  /**
   * Get picks for a specific user
   * @param draftId - The ID of the draft
   * @param userId - The user ID
   * @returns Promise<DraftPick[]> - Array of picks made by the specified user
   */
  async getPicksByUser(draftId: string, userId: string): Promise<DraftPick[]> {
    const picks = await this.getDraftPicks(draftId);
    return picks.filter((pick) => pick.picked_by === userId);
  }

  /**
   * Get a specific pick by pick number
   * @param draftId - The ID of the draft
   * @param pickNumber - The pick number (overall pick in draft)
   * @returns Promise<DraftPick | null> - The draft pick or null if not found
   */
  async getPickByNumber(draftId: string, pickNumber: number): Promise<DraftPick | null> {
    const picks = await this.getDraftPicks(draftId);
    return picks.find((pick) => pick.pick_no === pickNumber) || null;
  }

  /**
   * Get picks by position
   * @param draftId - The ID of the draft
   * @param position - The position to filter by (e.g., 'QB', 'RB', 'WR', etc.)
   * @returns Promise<DraftPick[]> - Array of picks for the specified position
   */
  async getPicksByPosition(draftId: string, position: string): Promise<DraftPick[]> {
    const picks = await this.getDraftPicks(draftId);
    return picks.filter((pick) => pick.metadata?.position === position);
  }

  /**
   * Get keeper picks in a draft
   * @param draftId - The ID of the draft
   * @returns Promise<DraftPick[]> - Array of keeper picks
   */
  async getKeeperPicks(draftId: string): Promise<DraftPick[]> {
    const picks = await this.getDraftPicks(draftId);
    return picks.filter((pick) => pick.is_keeper === true);
  }

  /**
   * Get draft pick statistics
   * @param draftId - The ID of the draft
   * @returns Promise<{totalPicks: number, picksByRound: {[round: number]: number}, picksByPosition: {[position: string]: number}}> - Draft statistics
   */
  async getDraftStats(draftId: string): Promise<{
    totalPicks: number;
    picksByRound: { [round: number]: number };
    picksByPosition: { [position: string]: number };
  }> {
    const picks = await this.getDraftPicks(draftId);
    
    const picksByRound: { [round: number]: number } = {};
    const picksByPosition: { [position: string]: number } = {};

    picks.forEach((pick) => {
      // Count by round
      picksByRound[pick.round] = (picksByRound[pick.round] || 0) + 1;
      
      // Count by position
      const position = pick.metadata?.position;
      if (position) {
        picksByPosition[position] = (picksByPosition[position] || 0) + 1;
      }
    });

    return {
      totalPicks: picks.length,
      picksByRound,
      picksByPosition,
    };
  }

  /**
   * Check if a draft is complete
   * @param draftId - The ID of the draft
   * @returns Promise<boolean> - True if the draft is complete
   */
  async isDraftComplete(draftId: string): Promise<boolean> {
    const draft = await this.getDraft(draftId);
    return draft.status === 'complete';
  }

  /**
   * Get the current pick information for an ongoing draft
   * @param draftId - The ID of the draft
   * @returns Promise<{round: number, pick: number, rosterId?: number} | null> - Current pick info or null if draft is complete
   */
  async getCurrentPick(draftId: string): Promise<{
    round: number;
    pick: number;
    rosterId?: number;
  } | null> {
    const [draft, picks] = await Promise.all([
      this.getDraft(draftId),
      this.getDraftPicks(draftId),
    ]);

    if (draft.status === 'complete') {
      return null;
    }

    const totalTeams = draft.settings.teams;
    const totalRounds = draft.settings.rounds;
    const totalPicks = picks.length;
    const nextPickNumber = totalPicks + 1;

    if (nextPickNumber > totalTeams * totalRounds) {
      return null; // Draft should be complete
    }

    const round = Math.ceil(nextPickNumber / totalTeams);
    const pickInRound = ((nextPickNumber - 1) % totalTeams) + 1;
    
    // For snake draft, reverse the pick order on even rounds
    let adjustedPickInRound = pickInRound;
    if (draft.type === 'snake' && round % 2 === 0) {
      adjustedPickInRound = totalTeams - pickInRound + 1;
    }

    // Try to determine roster ID from slot_to_roster_id mapping
    let rosterId: number | undefined;
    if (draft.slot_to_roster_id) {
      rosterId = draft.slot_to_roster_id[adjustedPickInRound.toString()];
    }

    const result: { round: number; pick: number; rosterId?: number } = {
      round,
      pick: adjustedPickInRound,
    };

    if (rosterId !== undefined) {
      result.rosterId = rosterId;
    }

    return result;
  }
}
