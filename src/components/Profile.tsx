import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  deleteUserAccount,
  getUserProfile,
  updateUserProfile,
} from '../services/authService';

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setLoading(true);
      setError('');

      try {
        const profile = await getUserProfile(user.uid);
        if (!isMounted) {
          return;
        }

        setName(profile?.name ?? '');
        setAddress(profile?.address ?? '');
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Failed to load profile.';
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user.uid]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await updateUserProfile(user.uid, { name: name.trim(), address: address.trim() });
      setSuccess('Profile updated successfully.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Delete your account permanently? This cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setSuccess('');
    setDeleting(true);

    try {
      await deleteUserAccount(user.uid);
      sessionStorage.setItem('auth_notice', 'Your account has been deleted successfully.');
      navigate('/', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account.';
      setError(message);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5" style={{ maxWidth: '640px' }}>
      <div className="card shadow-sm">
        <div className="card-body p-4 p-md-5">
          <h1 className="h3 mb-3">My Profile</h1>
          <p className="text-muted mb-4">Manage your account information stored in Firestore.</p>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label htmlFor="profileEmail" className="form-label">
                Email
              </label>
              <input
                id="profileEmail"
                type="email"
                className="form-control"
                value={user.email ?? ''}
                readOnly
              />
            </div>

            <div className="mb-3">
              <label htmlFor="profileName" className="form-label">
                Name
              </label>
              <input
                id="profileName"
                type="text"
                className="form-control"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="profileAddress" className="form-label">
                Address
              </label>
              <textarea
                id="profileAddress"
                className="form-control"
                rows={3}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Enter your shipping address"
              />
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving || deleting}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => void handleDeleteAccount()}
                disabled={saving || deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
