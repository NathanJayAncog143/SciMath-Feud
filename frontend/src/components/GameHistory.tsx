import React, { useEffect, useMemo, useState } from 'react';
import { getGameHistory } from '../lib/supabase';
import type { Game, GameHistoryEvent } from '../lib/supabase';

interface GameHistoryProps {
  game: Game;
  gameCode: string;
  onBack: () => void;
}

type HistoryFilter = 'all' | 'buzz' | 'score' | 'game';

const eventGroup = (event: GameHistoryEvent): HistoryFilter => {
  if (event.event_type === 'buzz') return 'buzz';
  if (event.event_type === 'answer_scored' || event.event_type === 'answer_revealed') return 'score';
  return 'game';
};

const eventPresentation = (event: GameHistoryEvent) => {
  switch (event.event_type) {
    case 'buzz':
      return { icon: '⚡', title: 'Buzzed first', color: 'border-yellow-400/60 bg-yellow-500/10' };
    case 'answer_scored':
      return { icon: '✓', title: `Earned ${event.points || 0} points`, color: 'border-green-400/60 bg-green-500/10' };
    case 'answer_revealed':
      return { icon: '👁', title: 'Answer revealed without points', color: 'border-cyan-400/60 bg-cyan-500/10' };
    case 'strike':
      return { icon: '✕', title: 'Received a strike', color: 'border-red-400/60 bg-red-500/10' };
    case 'question_changed':
      return { icon: '→', title: event.details || 'Moved to the next question', color: 'border-purple-400/60 bg-purple-500/10' };
    case 'status_changed':
      return { icon: '●', title: `Game ${event.details || 'status changed'}`, color: 'border-blue-400/60 bg-blue-500/10' };
    default:
      return { icon: '•', title: event.event_type, color: 'border-gray-400/60 bg-gray-500/10' };
  }
};

const formatTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const GameHistory: React.FC<GameHistoryProps> = ({ game, gameCode, onBack }) => {
  const [events, setEvents] = useState<GameHistoryEvent[]>([]);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let requestInFlight = false;

    const loadHistory = async () => {
      if (requestInFlight) return;
      requestInFlight = true;
      try {
        const history = await getGameHistory(game.id);
        if (active) {
          setEvents(history);
          setError(null);
        }
      } catch (loadError) {
        console.error('Failed to load game history:', loadError);
        if (active) setError('Game history could not be loaded. The game controls are not affected.');
      } finally {
        requestInFlight = false;
        if (active) setLoading(false);
      }
    };

    void loadHistory();
    const interval = setInterval(() => { void loadHistory(); }, 1000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [game.id]);

  const visibleEvents = useMemo(
    () => filter === 'all' ? events : events.filter(event => eventGroup(event) === filter),
    [events, filter]
  );
  const teams = [
    { name: game.team1_custom_name || game.team1?.name || 'Team 1', score: game.team1_score },
    { name: game.team2_custom_name || game.team2?.name || 'Team 2', score: game.team2_score },
    { name: game.team3_custom_name || game.team3?.name, score: game.team3_score },
    { name: game.team4_custom_name || game.team4?.name, score: game.team4_score },
    { name: game.team5_custom_name || game.team5?.name, score: game.team5_score },
  ].filter(team => team.name);

  return (
    <div className="fixed inset-0 overflow-y-auto bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white">
      <div className="max-w-6xl mx-auto px-5 py-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 font-bold">
              ← Host Control
            </button>
            <div>
              <h1 className="text-3xl font-black">Game History</h1>
              <p className="text-blue-200">Code {gameCode} · Live activity for this game only</p>
            </div>
          </div>
          <div className="rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-bold">
            {events.length} {events.length === 1 ? 'record' : 'records'}
          </div>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6" aria-label="Current team scores">
          {teams.map(team => (
            <div key={team.name} className="rounded-xl bg-white/10 border border-white/15 p-4">
              <div className="text-sm text-blue-200 truncate" title={team.name}>{team.name}</div>
              <div className="text-2xl font-black text-yellow-300">{team.score || 0}</div>
            </div>
          ))}
        </section>

        <div className="flex flex-wrap gap-2 mb-5">
          {([
            ['all', 'All Activity'],
            ['buzz', 'Buzzes'],
            ['score', 'Scores'],
            ['game', 'Game Events'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                filter === value ? 'bg-yellow-400 border-yellow-300 text-blue-950' : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <div className="mb-5 rounded-xl border border-red-400/50 bg-red-500/10 p-4 text-red-200">{error}</div>}

        <section className="space-y-3" aria-live="polite">
          {loading && events.length === 0 && <div className="text-center py-16 text-blue-200">Loading history…</div>}
          {!loading && visibleEvents.length === 0 && (
            <div className="text-center py-16 rounded-2xl border border-dashed border-white/20 bg-white/5">
              <div className="text-4xl mb-3">📋</div>
              <p className="font-bold">No activity recorded yet</p>
              <p className="text-sm text-blue-200 mt-1">Buzzes, scored answers, strikes, questions, and game status changes will appear here.</p>
            </div>
          )}
          {visibleEvents.map(event => {
            const presentation = eventPresentation(event);
            return (
              <article key={event.id} className={`rounded-xl border p-4 flex items-center gap-4 ${presentation.color}`}>
                <div className="w-11 h-11 shrink-0 rounded-full bg-black/20 flex items-center justify-center text-xl font-black">
                  {presentation.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-lg">{event.team_name || 'Game'}</div>
                  <div className="text-white/90">{presentation.title}</div>
                  {event.details && event.event_type.startsWith('answer_') && (
                    <div className="text-sm text-white/60 truncate" title={event.details}>Answer: {event.details}</div>
                  )}
                </div>
                <time className="shrink-0 text-sm font-mono text-blue-100" dateTime={event.created_at}>
                  {formatTime(event.created_at)}
                </time>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default GameHistory;
