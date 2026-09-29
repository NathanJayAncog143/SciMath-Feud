import { createServer } from 'node:http';
import { config, assertConfig } from './config.js';
import {
  addTeamStrike,
  createGame,
  createGameWithCustomNames,
  getAnswerById,
  getAllGameSets,
  getGameById,
  getGameEvents,
  getGameSetByCode,
  getLatestGameByGameSet,
  getQuestions,
  getRevealedAnswers,
  getTeams,
  revealAnswer,
  saveGameSet,
  tryRecordGameEvent,
  triggerGameSound,
  updateGame
} from './db.js';

assertConfig();

const clients = new Set();
const buzzerLocks = new Map();

function corsHeaders(extra = {}) {
  return {
    'Access-Control-Allow-Origin': config.clientOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...extra
  };
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, corsHeaders({
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }));
  res.end(body);
}

function sendError(res, error) {
  console.error(error);
  sendJson(res, 500, { error: error.message || 'Unexpected server error' });
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
}

function broadcast(payload) {
  const event = `data: ${JSON.stringify(payload)}\n\n`;
  for (const client of clients) {
    client.write(event);
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/events') {
      res.writeHead(200, corsHeaders({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }));
      res.write(': connected\n\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/teams') {
      sendJson(res, 200, await getTeams());
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/game-sets') {
      sendJson(res, 200, { gameSets: await getAllGameSets(), success: true });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/game-sets') {
      const body = await readJsonBody(req);
      const gameSet = await saveGameSet(body);
      sendJson(res, 201, { code: gameSet.code, gameSet, success: true });
      return;
    }

    const gameSetCodeMatch = url.pathname.match(/^\/api\/game-sets\/([^/]+)$/);
    if (req.method === 'GET' && gameSetCodeMatch) {
      const gameSet = await getGameSetByCode(decodeURIComponent(gameSetCodeMatch[1]));
      if (!gameSet) {
        sendJson(res, 404, { gameSet: null, success: false, error: 'Game set not found' });
        return;
      }

      sendJson(res, 200, { gameSet, success: true });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/questions') {
      sendJson(res, 200, await getQuestions());
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/games') {
      const body = await readJsonBody(req);
      const game = await createGame(body);
      broadcast({ type: 'game-created', game });
      sendJson(res, 201, { game, success: true });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/games/custom') {
      const body = await readJsonBody(req);
      const game = await createGameWithCustomNames(body);
      broadcast({ type: 'game-created', game });
      sendJson(res, 201, { game, success: true });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/games/latest') {
      const gameSetId = url.searchParams.get('gameSetId');
      const game = gameSetId ? await getLatestGameByGameSet(gameSetId) : null;
      if (!game) {
        sendJson(res, 404, { game: null, success: false, error: 'Game not found' });
        return;
      }

      sendJson(res, 200, { game, success: true });
      return;
    }

    const gameMatch = url.pathname.match(/^\/api\/games\/([^/]+)$/);
    if (gameMatch) {
      const gameId = decodeURIComponent(gameMatch[1]);

      if (req.method === 'GET') {
        const game = await getGameById(gameId);
        if (!game) {
          sendJson(res, 404, { game: null, success: false, error: 'Game not found' });
          return;
        }

        sendJson(res, 200, { game, success: true });
        return;
      }

      if (req.method === 'PATCH') {
        const body = await readJsonBody(req);
        const game = await updateGame(gameId, body);
        if (Object.prototype.hasOwnProperty.call(body, 'current_question_index')) {
          buzzerLocks.delete(gameId);
        }
        broadcast({ type: 'game-updated', game });
        sendJson(res, 200, { game, success: true });
        return;
      }
    }

    const strikeMatch = url.pathname.match(/^\/api\/games\/([^/]+)\/team-strikes$/);
    if (req.method === 'POST' && strikeMatch) {
      const body = await readJsonBody(req);
      const gameId = decodeURIComponent(strikeMatch[1]);
      const teamId = Number(body.teamId);
      const game = await addTeamStrike(gameId, teamId);
      await tryRecordGameEvent(gameId, 'strike', { teamId });
      broadcast({ type: 'game-updated', game });
      sendJson(res, 200, { game, success: true });
      return;
    }

    const historyMatch = url.pathname.match(/^\/api\/games\/([^/]+)\/history$/);
    if (req.method === 'GET' && historyMatch) {
      const gameId = decodeURIComponent(historyMatch[1]);
      const game = await getGameById(gameId);
      if (!game) {
        sendJson(res, 404, { events: [], success: false, error: 'Game not found' });
        return;
      }
      sendJson(res, 200, { events: await getGameEvents(gameId), success: true });
      return;
    }

    const buzzerMatch = url.pathname.match(/^\/api\/games\/([^/]+)\/buzzer$/);
    if (buzzerMatch) {
      const gameId = decodeURIComponent(buzzerMatch[1]);

      if (req.method === 'GET') {
        sendJson(res, 200, {
          buzzer: buzzerLocks.get(gameId) || { teamId: null, lockedAt: null },
          success: true
        });
        return;
      }

      if (req.method === 'POST') {
        const body = await readJsonBody(req);
        const teamId = body.teamId === null ? null : Number(body.teamId);
        let winnerRecorded = false;

        if (teamId === null) {
          buzzerLocks.delete(gameId);
        } else if (Number.isInteger(teamId) && teamId >= 1 && teamId <= 5 && !buzzerLocks.has(gameId)) {
          buzzerLocks.set(gameId, { teamId, lockedAt: new Date().toISOString() });
          winnerRecorded = true;
        }

        const buzzer = buzzerLocks.get(gameId) || { teamId: null, lockedAt: null };
        if (winnerRecorded) await tryRecordGameEvent(gameId, 'buzz', { teamId });
        broadcast({ type: 'buzzer-updated', gameId, buzzer });
        sendJson(res, 200, { buzzer, success: true });
        return;
      }
    }

    const soundMatch = url.pathname.match(/^\/api\/games\/([^/]+)\/sounds$/);
    if (req.method === 'POST' && soundMatch) {
      const body = await readJsonBody(req);
      const game = await triggerGameSound(decodeURIComponent(soundMatch[1]), body.sound);
      if (body.sound === 'stop') buzzerLocks.delete(decodeURIComponent(soundMatch[1]));
      broadcast({ type: 'game-updated', game, sound: body.sound });
      sendJson(res, 200, { game, success: true });
      return;
    }

    const revealedMatch = url.pathname.match(/^\/api\/games\/([^/]+)\/revealed-answers$/);
    if (req.method === 'GET' && revealedMatch) {
      const revealedAnswers = await getRevealedAnswers(decodeURIComponent(revealedMatch[1]));
      sendJson(res, 200, {
        answerIds: revealedAnswers.map((answer) => answer.answer_id),
        revealedAnswers,
        success: true
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/game-answers') {
      const body = await readJsonBody(req);
      const teamId = Number(body.revealed_by_team || 0);
      const revealed = await revealAnswer(body.game_id, body.answer_id, teamId);
      let answer = null;
      try {
        answer = await getAnswerById(body.answer_id);
      } catch (error) {
        console.error('Unable to load answer details for game history:', error);
      }
      await tryRecordGameEvent(body.game_id, teamId > 0 ? 'answer_scored' : 'answer_revealed', {
        teamId: teamId > 0 ? teamId : null,
        points: teamId > 0 ? Number(answer?.points || 0) : null,
        details: answer?.text || null
      });
      broadcast({ type: 'answer-revealed', revealed });
      sendJson(res, 201, { revealed, success: true });
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    sendError(res, error);
  }
});

const port = config.port || 3001;

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Use a different PORT or stop the process currently listening on ${port}.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

server.listen(port, () => {
  console.log(`SciMath Feud backend listening on http://localhost:${port}`);
});
