import mysql from 'mysql2/promise';
import { config } from './config.js';

const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  multipleStatements: false
});

let gameEventsTablePromise;

function ensureGameEventsTable() {
  if (!gameEventsTablePromise) {
    gameEventsTablePromise = pool.query(`
      CREATE TABLE IF NOT EXISTS sf_game_events (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        game_id CHAR(36) NOT NULL,
        event_type VARCHAR(40) NOT NULL,
        team_id TINYINT UNSIGNED NULL,
        points INT NULL,
        details VARCHAR(255) NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY idx_game_events_game_created (game_id, created_at),
        CONSTRAINT fk_game_events_game FOREIGN KEY (game_id)
          REFERENCES sf_games (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `).catch((error) => {
      gameEventsTablePromise = undefined;
      throw error;
    });
  }
  return gameEventsTablePromise;
}

export async function recordGameEvent(gameId, eventType, { teamId = null, points = null, details = null } = {}) {
  await ensureGameEventsTable();
  await pool.query(
    'INSERT INTO sf_game_events (game_id, event_type, team_id, points, details) VALUES (?, ?, ?, ?, ?)',
    [gameId, eventType, teamId, points, details]
  );
}

export async function tryRecordGameEvent(gameId, eventType, event = {}) {
  try {
    await recordGameEvent(gameId, eventType, event);
  } catch (error) {
    console.error('Unable to record game history:', error);
  }
}

export async function getGameEvents(gameId) {
  await ensureGameEventsTable();
  const [rows] = await pool.query(
    `SELECT
       e.id, e.game_id, e.event_type, e.team_id, e.points, e.details, e.created_at,
       CASE e.team_id
         WHEN 1 THEN COALESCE(g.team1_custom_name, t1.name, 'Team 1')
         WHEN 2 THEN COALESCE(g.team2_custom_name, t2.name, 'Team 2')
         WHEN 3 THEN COALESCE(g.team3_custom_name, t3.name, 'Team 3')
         WHEN 4 THEN COALESCE(g.team4_custom_name, t4.name, 'Team 4')
         WHEN 5 THEN COALESCE(g.team5_custom_name, t5.name, 'Team 5')
         ELSE NULL
       END AS team_name
     FROM sf_game_events e
     JOIN sf_games g ON g.id = e.game_id
     LEFT JOIN sf_teams t1 ON t1.id = g.team1_id
     LEFT JOIN sf_teams t2 ON t2.id = g.team2_id
     LEFT JOIN sf_teams t3 ON t3.id = g.team3_id
     LEFT JOIN sf_teams t4 ON t4.id = g.team4_id
     LEFT JOIN sf_teams t5 ON t5.id = g.team5_id
     WHERE e.game_id = ?
     ORDER BY e.created_at DESC, e.id DESC
     LIMIT 500`,
    [gameId]
  );
  return rows;
}

function rowsFromCall(resultSets, index = 0) {
  return resultSets?.[index] || [];
}

function normalizeGameSet(gameSetRow, questionRows) {
  if (!gameSetRow) return null;

  const questionsById = new Map();
  for (const row of questionRows) {
    if (!row.question_id) continue;

    if (!questionsById.has(row.question_id)) {
      questionsById.set(row.question_id, {
        id: row.question_id,
        game_set_id: row.game_set_id,
        question: row.question,
        order_index: row.question_order_index,
        created_at: row.question_created_at,
        answers: []
      });
    }

    if (row.answer_id) {
      questionsById.get(row.question_id).answers.push({
        id: row.answer_id,
        question_id: row.question_id,
        text: row.answer_text,
        points: row.points,
        order_index: row.answer_order_index,
        created_at: row.answer_created_at
      });
    }
  }

  return {
    ...gameSetRow,
    is_active: Boolean(gameSetRow.is_active),
    questions: Array.from(questionsById.values())
  };
}

export async function getTeams() {
  const [resultSets] = await pool.query('CALL sp_get_teams()');
  return rowsFromCall(resultSets).map((team) => ({
    ...team,
    created_at: team.created_at
  }));
}

export async function getAllGameSets() {
  const [resultSets] = await pool.query('CALL sp_get_all_game_sets()');
  return rowsFromCall(resultSets).map((gameSet) => ({
    ...gameSet,
    is_active: Boolean(gameSet.is_active)
  }));
}

export async function getGameSetByCode(code) {
  const [resultSets] = await pool.query('CALL sp_get_game_set_by_code(?)', [code]);
  return normalizeGameSet(rowsFromCall(resultSets, 0)[0], rowsFromCall(resultSets, 1));
}

export async function getQuestions() {
  const [resultSets] = await pool.query('CALL sp_get_questions()');
  const rows = rowsFromCall(resultSets);
  const questionsById = new Map();

  for (const row of rows) {
    if (!questionsById.has(row.question_id)) {
      questionsById.set(row.question_id, {
        id: row.question_id,
        game_set_id: row.game_set_id,
        question: row.question,
        order_index: row.question_order_index,
        created_at: row.question_created_at,
        answers: []
      });
    }

    if (row.answer_id) {
      questionsById.get(row.question_id).answers.push({
        id: row.answer_id,
        question_id: row.question_id,
        text: row.answer_text,
        points: row.points,
        order_index: row.answer_order_index,
        created_at: row.answer_created_at
      });
    }
  }

  return Array.from(questionsById.values());
}

export async function createGame(payload) {
  const [resultSets] = await pool.query(
    'CALL sp_create_game(?, ?, ?, ?, ?, ?)',
    [
      payload.game_set_id,
      payload.team1_id || null,
      payload.team2_id || null,
      payload.team3_id || null,
      payload.team4_id || null,
      payload.team5_id || null
    ]
  );

  return rowsFromCall(resultSets)[0] || null;
}

export async function createGameWithCustomNames(payload) {
  const [resultSets] = await pool.query(
    'CALL sp_create_game_with_custom_names(?, ?, ?, ?, ?, ?)',
    [
      payload.game_set_id,
      payload.team1_custom_name || null,
      payload.team2_custom_name || null,
      payload.team3_custom_name || null,
      payload.team4_custom_name || null,
      payload.team5_custom_name || null
    ]
  );

  return rowsFromCall(resultSets)[0] || null;
}

export async function getGameById(id) {
  const [resultSets] = await pool.query('CALL sp_get_game_by_id(?)', [id]);
  return rowsFromCall(resultSets)[0] || null;
}

export async function getLatestGameByGameSet(gameSetId) {
  const [resultSets] = await pool.query('CALL sp_get_latest_game_by_game_set(?)', [gameSetId]);
  return rowsFromCall(resultSets)[0] || null;
}

export async function updateGame(id, updates) {
  const current = await getGameById(id);
  if (!current) return null;

  const merged = { ...current, ...updates };
  await pool.query(
    'CALL sp_update_game(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      merged.team1_score,
      merged.team2_score,
      merged.team3_score,
      merged.team4_score,
      merged.team5_score,
      merged.team1_strikes,
      merged.team2_strikes,
      merged.team3_strikes,
      merged.team4_strikes,
      merged.team5_strikes,
      merged.current_question_index,
      merged.strikes,
      merged.game_status,
      merged.show_strike_animation_at,
      merged.play_intense_sound_at,
      merged.play_winning_sound_at,
      merged.stop_sounds_at,
      merged.game_status === 'playing' ? merged.started_at || new Date() : merged.started_at
    ]
  );

  if (updates.game_status === 'finished') {
    await pool.query('CALL sp_finish_game(?)', [id]);
  }

  if (updates.current_question_index !== undefined
    && Number(updates.current_question_index) !== Number(current.current_question_index)) {
    await tryRecordGameEvent(id, 'question_changed', {
      details: `Question ${Number(updates.current_question_index) + 1}`
    });
  }
  if (updates.game_status && updates.game_status !== current.game_status) {
    await tryRecordGameEvent(id, 'status_changed', { details: updates.game_status });
  }

  return getGameById(id);
}

export async function triggerGameSound(gameId, sound) {
  const columns = {
    intense: 'play_intense_sound_at',
    winning: 'play_winning_sound_at',
    stop: 'stop_sounds_at'
  };
  const column = columns[sound];

  if (!column) {
    throw new Error(`Unsupported sound trigger: ${sound}`);
  }

  await pool.query(`UPDATE sf_games SET \`${column}\` = NOW(3) WHERE id = ?`, [gameId]);
  return getGameById(gameId);
}

export async function addTeamStrike(gameId, teamId) {
  const [resultSets] = await pool.query('CALL sp_add_team_strike(?, ?)', [gameId, teamId]);
  return rowsFromCall(resultSets)[0] || null;
}

export async function revealAnswer(gameId, answerId, revealedByTeam) {
  const [resultSets] = await pool.query('CALL sp_reveal_answer(?, ?, ?)', [
    gameId,
    answerId,
    revealedByTeam
  ]);
  return rowsFromCall(resultSets)[0] || null;
}

export async function getAnswerById(answerId) {
  const [rows] = await pool.query(
    'SELECT id, text, points FROM sf_answers WHERE id = ? LIMIT 1',
    [answerId]
  );
  return rows[0] || null;
}

export async function getRevealedAnswers(gameId) {
  const [rows] = await pool.query(
    'SELECT answer_id, revealed_by_team, revealed_at FROM sf_game_answers WHERE game_id = ? ORDER BY revealed_at ASC',
    [gameId]
  );
  return rows;
}

export async function saveGameSet(gameSet) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [gameSetResultSets] = await connection.query('CALL sp_create_game_set(?, ?, ?)', [
      gameSet.code,
      gameSet.title,
      gameSet.description || null
    ]);
    const createdGameSet = rowsFromCall(gameSetResultSets)[0];

    for (let i = 0; i < gameSet.questions.length; i += 1) {
      const question = gameSet.questions[i];
      const [questionResultSets] = await connection.query('CALL sp_create_question(?, ?, ?)', [
        createdGameSet.id,
        question.question,
        i + 1
      ]);
      const createdQuestion = rowsFromCall(questionResultSets)[0];

      const answers = question.answers.filter((answer) => answer.text?.trim());
      for (let j = 0; j < answers.length; j += 1) {
        const answer = answers[j];
        await connection.query('CALL sp_create_answer(?, ?, ?, ?)', [
          createdQuestion.id,
          answer.text,
          Number(answer.points || 0),
          j + 1
        ]);
      }
    }

    await connection.commit();
    return createdGameSet;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
