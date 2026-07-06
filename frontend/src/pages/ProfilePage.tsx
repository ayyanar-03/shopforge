import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';

interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user: authUser, token, login } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Name form
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    authService
      .getProfile()
      .then((data) => {
        setProfile(data as ProfileData);
        setName(data.name);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleNameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    setNameMsg('');
    try {
      const data = await authService.updateProfile({ name });
      setProfile((p) => (p ? { ...p, name: data.name } : p));
      // Update auth context so navbar shows new name
      if (authUser) login({ ...authUser, name: data.name }, token ?? '', localStorage.getItem('refreshToken') ?? '');
      setNameMsg('Name updated successfully.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setNameMsg(msg ?? 'Failed to update name.');
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwMsg('');
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    setSavingPw(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwMsg('Password changed successfully.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPwError(msg ?? 'Failed to change password.');
    } finally {
      setSavingPw(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );

  const ROLE_BADGE: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    seller: 'bg-amber-100 text-amber-700',
    buyer: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      {/* Account info card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold select-none">
            {profile?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile?.name}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize mt-1 inline-block ${ROLE_BADGE[profile?.role ?? 'buyer']}`}
            >
              {profile?.role}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Member since{' '}
          {profile
            ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })
            : ''}
        </p>
      </div>

      {/* Update name */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Display Name</h2>
        <form onSubmit={handleNameSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={1}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {nameMsg && (
            <p
              className={`text-sm ${nameMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}
            >
              {nameMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={savingName || name === profile?.name}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {savingName ? 'Saving...' : 'Save Name'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {pwError && <p className="text-sm text-red-600">{pwError}</p>}
          {pwMsg && <p className="text-sm text-green-600">{pwMsg}</p>}
          <button
            type="submit"
            disabled={savingPw}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {savingPw ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
