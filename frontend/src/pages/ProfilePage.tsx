import { useCallback, useEffect, useState } from 'react';
import { User, Mail, Calendar, Shield, KeyRound, HardDrive, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { userService } from '@/services/userService';
import type { UserProfile, StorageUsageResponse } from '@/services/types';
import { formatBytes, formatDate } from '@/lib/format';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { notify } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [storage, setStorage] = useState<StorageUsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [p, s] = await Promise.all([userService.getProfile(), userService.getStorage()]);
      setProfile(p);
      setStorage(s);
      setFullName(p.full_name || '');
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSavingProfile(true);
    try {
      const updated = await userService.updateProfile({ full_name: fullName.trim() });
      setProfile(updated);
      await refreshUser();
      notify('Profile updated', 'success');
    } catch {
      notify('Could not update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      notify('Password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify('Passwords do not match', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await userService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      notify('Password changed successfully', 'success');
    } catch {
      notify('Could not change password. Check your current password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = (profile?.full_name || user?.full_name || user?.email || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const used = storage?.storage_used ?? 0;
  const total = storage?.storage_limit ?? 0;
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-100 bg-white">
          <ErrorState onRetry={load} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-800">Profile</h1>
      <p className="mt-1.5 text-sm text-slate-500">Manage your account and security settings.</p>

      {loading ? (
        <div className="mt-8 space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Profile card */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-900/[0.02]">
            <div className="flex flex-col items-center gap-5 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/40 px-6 py-8 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white shadow-lg shadow-blue-600/20">
                {initials}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-lg font-bold text-slate-800">{profile?.full_name || user?.full_name || 'CloudVault user'}</p>
                <p className="text-sm text-slate-500">{profile?.email || user?.email}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    <Shield className="h-3 w-3" /> {profile?.role || 'Member'}
                  </span>
                  {profile?.created_at && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                      <Calendar className="h-3 w-3" /> Joined {formatDate(profile.created_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><User className="h-4 w-4" /></div>
                <div><p className="text-xs text-slate-400">Full name</p><p className="text-sm font-medium text-slate-700">{profile?.full_name || '—'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Mail className="h-4 w-4" /></div>
                <div><p className="text-xs text-slate-400">Email</p><p className="text-sm font-medium text-slate-700">{profile?.email || user?.email}</p></div>
              </div>
            </div>
          </div>

          {/* Edit profile */}
          <form onSubmit={saveProfile} className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-900/[0.02]">
            <h2 className="text-base font-semibold text-slate-800">Edit profile</h2>
            <p className="mt-1 text-xs text-slate-400">Update your display name.</p>
            <div className="mt-5 max-w-md">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
            </div>
            <button type="submit" disabled={savingProfile || !fullName.trim()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">
              {savingProfile ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Save className="h-4 w-4" />}
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
          </form>

          {/* Change password */}
          <form onSubmit={changePassword} className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-900/[0.02]">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-slate-400" />
              <h2 className="text-base font-semibold text-slate-800">Change password</h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">Keep your account secure with a strong password.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Current password</label>
                <div className="relative max-w-md">
                  <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                  <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">{showCurrent ? 'Hide' : 'Show'}</button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">New password</label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                  <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">{showNew ? 'Hide' : 'Show'}</button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm new password</label>
                <input type={showNew ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
              </div>
            </div>
            <button type="submit" disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-50">
              {savingPassword ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <CheckCircle2 className="h-4 w-4" />}
              {savingPassword ? 'Updating…' : 'Update password'}
            </button>
          </form>

          {/* Storage */}
          <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-900/[0.02]">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-slate-400" />
              <h2 className="text-base font-semibold text-slate-800">Storage usage</h2>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{formatBytes(used)} used</span>
                <span className="text-slate-400">{formatBytes(total)} total</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-400">{Math.round(pct)}% of your storage used</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
