import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
  Button,
  Card,
  ConfirmationModal,
  Input,
  Pagination,
} from "../../components/ui";
import { deleteUser, getUsers } from "../../services/users";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function ListUsers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  const page = Math.max(Number(searchParams.get("page")) || DEFAULT_PAGE, 1);
  const limit = Math.max(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 1);
  const search = searchParams.get("search") || "";

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const trimmedValue = searchInput.trim();
    const normalizedSearch = search.trim();

    const timeoutId = setTimeout(() => {
      if (trimmedValue === normalizedSearch) {
        return;
      }

      updateParams({
        page: DEFAULT_PAGE,
        search: trimmedValue || null,
      });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const totalPages = useMemo(() => {
    const total = Number(meta.total) || 0;
    const currentLimit = Number(meta.limit) || limit;
    return Math.max(1, Math.ceil(total / currentLimit));
  }, [meta.total, meta.limit, limit]);

  const updateParams = (nextValues) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(nextValues).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    setSearchParams(next);
  };

  const loadUsers = async () => {
    setLoading(true);

    try {
      const res = await getUsers({
        page,
        limit,
        search: search || undefined,
      });

      setUsers(Array.isArray(res?.data) ? res.data : []);
      setMeta({
        page: res?.meta?.page || page,
        limit: res?.meta?.limit || limit,
        total: res?.meta?.total || 0,
      });
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to load users";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, limit, search]);

  const handleDelete = async (id) => {
    setDeletingId(id);

    try {
      await deleteUser(id);
      toast.success("User deleted successfully");

      const shouldGoBack = users.length === 1 && page > 1;
      if (shouldGoBack) {
        updateParams({ page: page - 1 });
      } else {
        await loadUsers();
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to delete user";
      toast.error(message);
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage users with persistent pagination and search.
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-[240px]">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Search
              </label>
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by user name or email"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearchInput("");
                updateParams({
                  page: DEFAULT_PAGE,
                  search: null,
                });
              }}
            >
              Clear
            </Button>
          </div>

          <div className="flex items-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={loadUsers}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => {
                  const userId = user._id || user.id;
                  const roleLabel = user.role?.name || "No role";

                  return (
                    <tr key={userId} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {user.name || "Unnamed User"}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {user.email || "No email"}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-md bg-gray-100 px-3 py-1 text-gray-700">
                          {roleLabel}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-md px-3 py-1 ${
                            user.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            className="inline-flex items-center gap-2 px-3 py-1.5"
                            onClick={() =>
                              navigate(
                                `/users/${userId}/edit?page=${page}&limit=${limit}${
                                  search
                                    ? `&search=${encodeURIComponent(search)}`
                                    : ""
                                }`,
                              )
                            }
                            disabled={deletingId === userId}
                          >
                            <FaEdit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="inline-flex items-center gap-2 px-3 py-1.5"
                            onClick={() =>
                              setConfirmDeleteUser({
                                id: userId,
                                name: user.name || "this user",
                              })
                            }
                            disabled={deletingId === userId}
                          >
                            <FaTrash className="h-3.5 w-3.5" />
                            {deletingId === userId ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          className="mt-6"
          page={page}
          totalPages={totalPages}
          totalItems={meta.total}
          loading={loading}
          perPage={limit}
          onPerPageChange={(nextLimit) =>
            updateParams({
              page: DEFAULT_PAGE,
              limit: nextLimit,
            })
          }
          onPageChange={(nextPage) => updateParams({ page: nextPage })}
        />
      </Card>

      <ConfirmationModal
        isOpen={Boolean(confirmDeleteUser)}
        onClose={() => setConfirmDeleteUser(null)}
        onConfirm={async () => {
          if (!confirmDeleteUser) return;
          await handleDelete(confirmDeleteUser.id);
          setConfirmDeleteUser(null);
        }}
        title="Delete User"
        message={`Are you sure you want to delete ${confirmDeleteUser?.name}?`}
        confirmText="Delete"
        loading={Boolean(confirmDeleteUser && deletingId === confirmDeleteUser.id)}
      />
    </div>
  );
}

export default ListUsers;
