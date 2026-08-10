const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface ApiResult<T> {
  data: T | null;
  error: Error | null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`API request failed (${response.status}): ${detail}`);
  }

  return response.json();
}

function normalizeGame(game: any): Game | null {
  if (!game) return null;

  return {
    ...game,
    team1: game.team1_id ? { id: game.team1_id, name: game.team1_name, color: game.team1_color } : undefined,
    team2: game.team2_id ? { id: game.team2_id, name: game.team2_name, color: game.team2_color } : undefined,
    team3: game.team3_id ? { id: game.team3_id, name: game.team3_name, color: game.team3_color } : undefined,
    team4: game.team4_id ? { id: game.team4_id, name: game.team4_name, color: game.team4_color } : undefined,
    team5: game.team5_id ? { id: game.team5_id, name: game.team5_name, color: game.team5_color } : undefined
  };
}

class LocalQuery {
  private filters = new Map<string, any>();
  private orderBy: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private mode: 'select' | 'insert' | 'update' = 'select';
  private table: string;
  private payload?: any;

  constructor(table: string, payload?: any) {
    this.table = table;
    this.payload = payload;
  }

  select(_columns?: string) {
    this.mode = this.mode === 'insert' || this.mode === 'update' ? this.mode : 'select';
    return this;
  }

  insert(payload: any) {
    this.mode = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload: any) {
    this.mode = 'update';
    this.payload = payload;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.set(column, value);
    return this;
  }

  ilike(column: string, value: any) {
    this.filters.set(column, value);
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    this.orderBy = { column, ascending: options.ascending !== false };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    return this.execute(true);
  }

  then<TResult1 = ApiResult<any>, TResult2 = never>(
    onfulfilled?: ((value: ApiResult<any>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return this.execute(false).then(onfulfilled, onrejected);
  }

  private async execute(single: boolean): Promise<ApiResult<any>> {
    try {
      const data = await this.resolve(single);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  private async resolve(single: boolean): Promise<any> {
    if (this.mode === 'insert') return this.resolveInsert(single);
    if (this.mode === 'update') return this.resolveUpdate();
    return this.resolveSelect(single);
  }

  private async resolveInsert(_single: boolean): Promise<any> {
    const rows = Array.isArray(this.payload) ? this.payload : [this.payload];

    if (this.table === 'games') {
      const row = rows[0];
      const hasCustomNames = Object.keys(row).some((key) => key.endsWith('_custom_name'));
      const response = await request<{ game: Game }>('/api/games' + (hasCustomNames ? '/custom' : ''), {
        method: 'POST',
        body: JSON.stringify(row)
      });
      return normalizeGame(response.game);
    }

    if (this.table === 'game_answers') {
      const response = await request<{ revealed: any }>('/api/game-answers', {
        method: 'POST',
        body: JSON.stringify(rows[0])
      });
      return response.revealed;
    }

    throw new Error(`Insert is not supported for ${this.table}; use the exported API helper instead.`);
  }

  private async resolveUpdate(): Promise<any> {
    if (this.table === 'games') {
      const id = this.filters.get('id');
      if (!id) throw new Error('Updating games requires an id filter.');

      const response = await request<{ game: Game }>(`/api/games/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(this.payload)
      });
      return normalizeGame(response.game);
    }

    throw new Error(`Update is not supported for ${this.table}.`);
  }

  private async resolveSelect(single: boolean): Promise<any> {
    if (this.table === 'teams') {
      return request<Team[]>('/api/teams');
    }

    if (this.table === 'game_sets') {
      const code = this.filters.get('code');
      if (single && code) {
        const response = await request<{ gameSet: GameSet }>(`/api/game-sets/${encodeURIComponent(code)}`);
        return response.gameSet;
      }

      const response = await request<{ gameSets: GameSet[] }>('/api/game-sets');
      return single ? response.gameSets[0] || null : response.gameSets;
    }

    if (this.table === 'questions') {
      return request<Question[]>('/api/questions');
    }

    if (this.table === 'game_answers') {
      const gameId = this.filters.get('game_id');
      if (!gameId) throw new Error('Reading game_answers requires a game_id filter.');

      const response = await request<{ answerIds: string[] }>(`/api/games/${encodeURIComponent(gameId)}/revealed-answers`);
      return response.answerIds.map((answer_id) => ({ answer_id }));
    }

    if (this.table === 'games') {
      const id = this.filters.get('id');
      if (id) {
        const response = await request<{ game: Game }>(`/api/games/${encodeURIComponent(id)}`);
        return normalizeGame(response.game);
      }

      const gameSetId = this.filters.get('game_set_id');
      if (gameSetId && this.limitCount === 1 && this.orderBy?.column === 'created_at') {
        const response = await request<{ game: Game }>(`/api/games/latest?gameSetId=${encodeURIComponent(gameSetId)}`);
        return normalizeGame(response.game);
      }
    }

    throw new Error(`Select is not supported for ${this.table}.`);
  }
}

export const supabase = {
  from(table: string) {
    return new LocalQuery(table);
  }
};

export interface Team {
  id: string;
  name: string;
  color: string;
  created_at?: string;
}

export interface Question {
  id: string;
  game_set_id: string;
  question: string;
  order_index: number;
  answers: Answer[];
  created_at?: string;
}

export interface Answer {
  id: string;
  question_id: string;
  text: string;
  points: number;
  order_index: number;
  revealed?: boolean;
  created_at?: string;
}

export interface GameSet {
  id: string;
  code: string;
  title: string;
  description?: string;
  questions?: Question[];
  created_at?: string;
  created_by?: string;
  is_active?: boolean;
}

export interface Game {
  id: string;
  game_set_id: string;
  team1_id?: string;
  team2_id?: string;
  team3_id?: string;
  team4_id?: string;
  team5_id?: string;
  team1_custom_name?: string;
  team2_custom_name?: string;
  team3_custom_name?: string;
  team4_custom_name?: string;
  team5_custom_name?: string;
  team1_score: number;
  team2_score: number;
  team3_score: number;
  team4_score: number;
  team5_score: number;
  team1_strikes: number;
  team2_strikes: number;
  team3_strikes: number;
  team4_strikes: number;
  team5_strikes: number;
  current_question_index: number;
  strikes: number;
  show_strike_animation_at?: string;
  play_intense_sound_at?: string;
  play_winning_sound_at?: string;
  stop_sounds_at?: string;
  game_status: 'waiting' | 'playing' | 'paused' | 'finished';
  started_at?: string;
  finished_at?: string;
  created_at?: string;
  team1?: Team;
  team2?: Team;
  team3?: Team;
  team4?: Team;
  team5?: Team;
  game_set?: GameSet;
}

export interface GameState {
  currentQuestionIndex: number;
  team1Score: number;
  team2Score: number;
  team3Score: number;
  team4Score: number;
  team5Score: number;
  strikes: number;
  gameStarted: boolean;
}

export interface GameSetQuestion {
  id?: string;
  question: string;
  answers: GameSetAnswer[];
  order_index: number;
}

export interface GameSetAnswer {
  text: string;
  points: number;
  revealed?: boolean;
}

export const getTeams = async (): Promise<Team[]> => {
  try {
    return await request<Team[]>('/api/teams');
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
};

export const getGameSetByCode = async (code: string): Promise<{ gameSet: GameSet | null; success: boolean; error?: string }> => {
  try {
    const response = await request<{ gameSet: GameSet; success: boolean }>(`/api/game-sets/${encodeURIComponent(code.trim())}`);
    return { gameSet: response.gameSet, success: true };
  } catch (error) {
    console.error('Error fetching game set:', error);
    return { gameSet: null, success: false, error: 'Game set not found' };
  }
};

export const createGame = async (
  gameSetId: string,
  team1Id?: string,
  team2Id?: string,
  team3Id?: string,
  team4Id?: string,
  team5Id?: string
): Promise<{ game: Game | null; success: boolean; error?: string }> => {
  try {
    const response = await request<{ game: Game }>('/api/games', {
      method: 'POST',
      body: JSON.stringify({
        game_set_id: gameSetId,
        team1_id: team1Id,
        team2_id: team2Id,
        team3_id: team3Id,
        team4_id: team4Id,
        team5_id: team5Id
      })
    });
    return { game: normalizeGame(response.game), success: true };
  } catch (error) {
    console.error('Error creating game:', error);
    return { game: null, success: false, error: 'Failed to create game' };
  }
};

export const createGameWithCustomNames = async (
  gameSetId: string,
  customTeam1Name?: string,
  customTeam2Name?: string,
  customTeam3Name?: string,
  customTeam4Name?: string,
  customTeam5Name?: string
): Promise<{ game: Game | null; success: boolean; error?: string }> => {
  try {
    const response = await request<{ game: Game }>('/api/games/custom', {
      method: 'POST',
      body: JSON.stringify({
        game_set_id: gameSetId,
        team1_custom_name: customTeam1Name,
        team2_custom_name: customTeam2Name,
        team3_custom_name: customTeam3Name,
        team4_custom_name: customTeam4Name,
        team5_custom_name: customTeam5Name
      })
    });
    return { game: normalizeGame(response.game), success: true };
  } catch (error) {
    console.error('Error creating game with custom names:', error);
    return { game: null, success: false, error: 'Failed to create game' };
  }
};

export const updateGameScore = async (
  gameId: string,
  team1Score: number,
  team2Score: number,
  team3Score: number,
  team4Score: number,
  team5Score: number,
  strikes: number,
  currentQuestionIndex: number,
  team1Strikes?: number,
  team2Strikes?: number,
  team3Strikes?: number,
  team4Strikes?: number,
  team5Strikes?: number
): Promise<boolean> => {
  try {
    const updateData: any = {
      team1_score: team1Score,
      team2_score: team2Score,
      team3_score: team3Score,
      team4_score: team4Score,
      team5_score: team5Score,
      strikes,
      current_question_index: currentQuestionIndex
    };

    if (team1Strikes !== undefined) updateData.team1_strikes = team1Strikes;
    if (team2Strikes !== undefined) updateData.team2_strikes = team2Strikes;
    if (team3Strikes !== undefined) updateData.team3_strikes = team3Strikes;
    if (team4Strikes !== undefined) updateData.team4_strikes = team4Strikes;
    if (team5Strikes !== undefined) updateData.team5_strikes = team5Strikes;

    await request(`/api/games/${encodeURIComponent(gameId)}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
    return true;
  } catch (error) {
    console.error('Error updating game score:', error);
    return false;
  }
};

export const addTeamStrike = async (gameId: string, teamId: number): Promise<boolean> => {
  try {
    await request(`/api/games/${encodeURIComponent(gameId)}/team-strikes`, {
      method: 'POST',
      body: JSON.stringify({ teamId })
    });
    return true;
  } catch (error) {
    console.error('Error adding team strike:', error);
    return false;
  }
};

export const revealAnswerInGame = async (gameId: string, answerId: string, revealedByTeam: number): Promise<boolean> => {
  try {
    await request('/api/game-answers', {
      method: 'POST',
      body: JSON.stringify({
        game_id: gameId,
        answer_id: answerId,
        revealed_by_team: revealedByTeam
      })
    });
    return true;
  } catch (error) {
    console.error('Error revealing answer:', error);
    return false;
  }
};

export const getRevealedAnswers = async (gameId: string): Promise<string[]> => {
  try {
    const response = await request<{ answerIds: string[] }>(`/api/games/${encodeURIComponent(gameId)}/revealed-answers`);
    return response.answerIds;
  } catch (error) {
    console.error('Error fetching revealed answers:', error);
    return [];
  }
};

export const updateGameStatus = async (
  gameId: string,
  status: 'waiting' | 'playing' | 'paused' | 'finished'
): Promise<boolean> => {
  try {
    await request(`/api/games/${encodeURIComponent(gameId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ game_status: status })
    });
    return true;
  } catch (error) {
    console.error('Error updating game status:', error);
    return false;
  }
};

export const getGameStatus = async (code: string): Promise<{ status: string | null; success: boolean; error?: string }> => {
  try {
    const response = await request<{ game: Game }>(`/api/games/${encodeURIComponent(code)}`);
    return { status: response.game?.game_status || null, success: !!response.game?.game_status };
  } catch (error) {
    console.error('Error fetching game status:', error);
    return { status: null, success: false, error: 'Failed to fetch game status' };
  }
};

export const getQuestions = async (): Promise<Question[]> => {
  try {
    return await request<Question[]>('/api/questions');
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
};

export const generateGameCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const saveGameSet = async (gameSet: { code: string; title: string; description?: string; questions: GameSetQuestion[] }): Promise<{ code: string; success: boolean; error?: string }> => {
  try {
    const response = await request<{ code: string }>('/api/game-sets', {
      method: 'POST',
      body: JSON.stringify(gameSet)
    });
    return { code: response.code, success: true };
  } catch (error) {
    console.error('Error saving game set:', error);
    return { code: gameSet.code, success: false, error: 'Failed to save game set' };
  }
};

export const getAllGameSets = async (): Promise<{ gameSets: GameSet[]; success: boolean; error?: string }> => {
  try {
    const response = await request<{ gameSets: GameSet[] }>('/api/game-sets');
    return { gameSets: response.gameSets, success: true };
  } catch (error) {
    console.error('Error fetching game sets:', error);
    return { gameSets: [], success: false, error: 'Failed to fetch game sets' };
  }
};
