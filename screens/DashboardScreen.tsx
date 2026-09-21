import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { createTeam, listMyTeams, deleteTeam } from '../services/teamService';
import { Team } from '../types';

export function DashboardScreen() {
  const { user, signOutUser } = useAuth();
  const navigate = useNavigate();
  const uid = user?.uid ?? '';

  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  const loadTeams = async () => {
    if (!uid) return;
    setIsLoading(true);
    try {
      const myTeams = await listMyTeams(uid);
      setTeams(myTeams);
    } catch (err) {
      console.error('Error loading teams:', err);
      setError('Failed to load teams. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [uid]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !uid) return;
    setIsCreating(true);
    setError(null);
    try {
      const teamId = await createTeam(uid, newTeamName.trim());
      setNewTeamName('');
      navigate(`/team/${teamId}`);
    } catch (err) {
      console.error('Error creating team:', err);
      setError('Failed to create team. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    const confirmed = window.confirm(
      `Delete "${team.name}"? This permanently removes its roster, games, and favorites.`
    );
    if (!confirmed) return;

    setDeletingTeamId(team.id);
    try {
      await deleteTeam(team.id);
      await loadTeams();
    } catch (err) {
      console.error('Error deleting team:', err);
      setError('Failed to delete team. Please try again.');
    } finally {
      setDeletingTeamId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-500 text-white shadow-brand-200 shadow-md">
              <img src="/icon.svg" alt="" className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-slate-800 hidden sm:block">Coach YBL App</h1>
          </div>
          <div className="flex items-center gap-3">
            {user?.photoURL && !avatarError ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User avatar'}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-semibold flex items-center justify-center">
                {(user?.displayName || user?.email || '?').trim().charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-slate-600 hidden sm:inline">{user?.displayName}</span>
            <button
              onClick={() => signOutUser()}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600 transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Your Teams</h2>
          <p className="text-sm text-slate-500 mt-1">
            Select a team to manage its rotation, or create a new one.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="New team name (e.g., Bucks 5th Grade)"
            className="h-10 px-3 flex-1 text-sm rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateTeam();
              }
            }}
          />
          <button
            onClick={handleCreateTeam}
            disabled={isCreating || !newTeamName.trim()}
            className="h-10 flex items-center justify-center gap-1.5 px-4 text-sm font-semibold rounded-lg text-white bg-brand-500 hover:bg-brand-600 shadow-sm active:scale-95 disabled:opacity-50 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreating ? 'Creating...' : 'Create Team'}</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-sm text-slate-500 text-center py-8">Loading your teams...</div>
        ) : teams.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-8 bg-white rounded-xl border border-gray-200">
            No teams yet. Create your first team above to get started.
          </div>
        ) : (
          <ul className="space-y-2">
            {teams.map((team) => (
              <li
                key={team.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between gap-3 hover:border-brand-300 transition-colors"
              >
                <button onClick={() => navigate(`/team/${team.id}`)} className="flex-1 text-left">
                  <span className="font-semibold text-slate-800">{team.name}</span>
                </button>
                <button
                  onClick={() => handleDeleteTeam(team)}
                  disabled={deletingTeamId === team.id}
                  title="Delete team"
                  aria-label={`Delete ${team.name}`}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
