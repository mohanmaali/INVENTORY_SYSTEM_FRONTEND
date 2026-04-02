import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button, Card, Input } from '../../components/ui';
import { getRoles } from '../../services/roles';
import { getUserById, updateUser, updateUserRole } from '../../services/users';

function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    avatar: '',
    isActive: true,
    roleId: '',
  });

  const backTarget = `/users?page=${searchParams.get('page') || '1'}&limit=${searchParams.get('limit') || '10'}${
    searchParams.get('search') ? `&search=${encodeURIComponent(searchParams.get('search'))}` : ''
  }`;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const [user, roleList] = await Promise.all([getUserById(id), getRoles()]);

        setRoles(Array.isArray(roleList) ? roleList : []);
        setForm({
          name: user.name || '',
          email: user.email || '',
          avatar: user.avatar || '',
          isActive: Boolean(user.isActive),
          roleId: user.roleId || user.role?._id || user.role?.id || '',
        });
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || 'Failed to load user details';
        toast.error(message);
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      await updateUser(id, {
        name: form.name.trim(),
        email: form.email.trim(),
        avatar: form.avatar.trim(),
        isActive: form.isActive,
      });

      if (form.roleId) {
        await updateUserRole(id, form.roleId);
      }

      toast.success('User updated successfully');
      navigate(backTarget);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to update user';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Update User</h1>
          <p className="mt-1 text-sm text-gray-600">
            Edit user details and assign a role.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => navigate(backTarget)}>
          Back to Users
        </Button>
      </div>

      <Card className="p-6">
        {loading ? (
          <p className="text-sm text-gray-500">Loading user details...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar
                </label>
                <Input
                  name="avatar"
                  value={form.avatar}
                  onChange={handleChange}
                  placeholder="Avatar URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="roleId"
                  value={form.roleId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors bg-white"
                >
                  <option value="">Select role</option>
                  {roles.map((role) => {
                    const roleId = role._id || role.id;
                    return (
                      <option key={roleId} value={roleId}>
                        {role.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <label className="inline-flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-700">Active User</span>
            </label>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() => navigate(backTarget)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

export default EditUser;
