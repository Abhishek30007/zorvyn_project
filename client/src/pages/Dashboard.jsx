import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clock3,
  DollarSign,
  Edit2,
  Globe2,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserCog,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  APP_ROLES,
  canManageTransactions,
  canManageUsers,
  canViewTransactions,
  getRoleLabel,
  hasGlobalAccess,
  normalizeRole,
} from '../utils/roles';

const CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Food',
  'Transport',
  'Housing',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Education',
  'Other',
];

const initialForm = {
  amount: '',
  type: 'expense',
  category: CATEGORIES[4],
  date: new Date().toISOString().split('T')[0],
  notes: '',
  userId: '',
};

const formatCurrency = (value) =>
  `$${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const getStatusMeta = (status) => {
  if (status === 'approved') {
    return {
      label: 'Approved',
      className: 'bg-emerald-500/10 text-emerald-300',
      icon: CheckCircle2,
    };
  }

  if (status === 'rejected') {
    return {
      label: 'Rejected',
      className: 'bg-red-500/10 text-red-300',
      icon: XCircle,
    };
  }

  return {
    label: 'Pending',
    className: 'bg-amber-500/10 text-amber-300',
    icon: Clock3,
  };
};

function StatCard({ title, value, icon: Icon, tone = 'neutral', loading }) {
  if (loading) {
    return <div className="h-[110px] rounded-xl border border-zinc-800 bg-zinc-900 animate-pulse" />;
  }

  const toneClass =
    tone === 'positive'
      ? 'bg-emerald-500/10 text-emerald-400'
      : tone === 'negative'
      ? 'bg-red-500/10 text-red-400'
      : 'bg-zinc-800 text-zinc-300';

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      </div>
      <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

function ExpenseFormModal({ mode, selectedTransaction, users, isAdmin, actorRole, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    if (mode === 'edit' && selectedTransaction) {
      return {
        amount: String(selectedTransaction.amount ?? ''),
        type: selectedTransaction.type || 'expense',
        category: selectedTransaction.category || CATEGORIES[4],
        date: (selectedTransaction.date || '').split('T')[0] || new Date().toISOString().split('T')[0],
        notes: selectedTransaction.notes || '',
        userId: selectedTransaction.userId?._id || selectedTransaction.userId?.id || '',
      };
    }

    return {
      ...initialForm,
      userId: users[0]?._id || '',
    };
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    const amount = Number(form.amount);

    if (!form.amount || Number.isNaN(amount)) nextErrors.amount = 'Amount is required.';
    else if (amount <= 0) nextErrors.amount = 'Amount must be a positive number.';

    if (!form.category) nextErrors.category = 'Category is required.';
    if (!form.date) nextErrors.date = 'Date is required.';
    if (isAdmin && !form.userId) nextErrors.userId = 'Please select a user for this transaction.';

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);

    const payload = {
      amount: Number(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
      notes: form.notes,
      userId: form.userId,
    };

    try {
      if (mode === 'edit' && selectedTransaction?._id) {
        await api.put(`/transactions/${selectedTransaction._id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      await onSaved();
      onClose();
    } catch (error) {
      setServerError(error.response?.data?.message || 'Unable to save transaction.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-zinc-800 p-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{mode === 'edit' ? 'Edit Expense' : 'Add Expense'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="p-5 space-y-4" onSubmit={handleSubmit}>
          {!isAdmin && mode === 'add' ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              New viewer transactions are submitted for admin approval before they affect dashboard totals.
            </div>
          ) : null}

          {serverError ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-3 py-2 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              {serverError}
            </div>
          ) : null}

          {isAdmin ? (
            <div>
              <label className="block text-xs tracking-wide uppercase text-zinc-500 mb-1.5">User</label>
              <select
                value={form.userId}
                onChange={(event) => updateField('userId', event.target.value)}
                className={`w-full rounded-lg border bg-zinc-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white ${
                  errors.userId ? 'border-red-500' : 'border-zinc-700'
                }`}
              >
                <option value="">Select user</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.username} ({getRoleLabel(u.role)})
                  </option>
                ))}
              </select>
              {errors.userId ? <p className="text-xs text-red-400 mt-1">{errors.userId}</p> : null}
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wide uppercase text-zinc-500 mb-1.5">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={(event) => updateField('amount', event.target.value)}
                className={`w-full rounded-lg border bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white ${
                  errors.amount ? 'border-red-500' : 'border-zinc-700'
                }`}
                placeholder="0.00"
              />
              {errors.amount ? <p className="text-xs text-red-400 mt-1">{errors.amount}</p> : null}
            </div>

            <div>
              <label className="block text-xs tracking-wide uppercase text-zinc-500 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(event) => updateField('type', event.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wide uppercase text-zinc-500 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(event) => updateField('category', event.target.value)}
                className={`w-full rounded-lg border bg-zinc-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white ${
                  errors.category ? 'border-red-500' : 'border-zinc-700'
                }`}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category ? <p className="text-xs text-red-400 mt-1">{errors.category}</p> : null}
            </div>

            <div>
              <label className="block text-xs tracking-wide uppercase text-zinc-500 mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(event) => updateField('date', event.target.value)}
                className={`w-full rounded-lg border bg-zinc-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white ${
                  errors.date ? 'border-red-500' : 'border-zinc-700'
                }`}
              />
              {errors.date ? <p className="text-xs text-red-400 mt-1">{errors.date}</p> : null}
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-wide uppercase text-zinc-500 mb-1.5">Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white"
              placeholder="Optional context"
            />
          </div>

          <div className="pt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-100 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <div className="h-4 w-4 rounded-full border-2 border-zinc-400 border-t-black animate-spin" /> : <Check className="h-4 w-4" />}
              {mode === 'edit' ? 'Update Expense' : actorRole === APP_ROLES.USER ? 'Submit Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SystemUsersPanel({ currentUserId, users, loading, onRoleToggle, onStatusToggle, pendingUserId }) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-200">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">System Users</h2>
          <p className="text-sm text-zinc-400">Assign Viewer or Analyst access, and activate or deactivate accounts.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-5 py-3 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">Username</th>
              <th className="px-5 py-3 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">Role</th>
              <th className="px-5 py-3 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">Status</th>
              <th className="px-5 py-3 text-right text-xs uppercase tracking-[0.14em] text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="border-b border-zinc-800/70">
                  <td className="px-5 py-4" colSpan={4}>
                    <div className="h-4 rounded bg-zinc-800 animate-pulse" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-14 text-center text-sm text-zinc-500">
                  No system users found.
                </td>
              </tr>
            ) : (
              users.map((managedUser) => {
                const isSelf = String(managedUser._id) === String(currentUserId);
                const isAdmin = normalizeRole(managedUser.role) === APP_ROLES.ADMIN;
                const isBusy = pendingUserId === managedUser._id;
                const nextRole = normalizeRole(managedUser.role) === APP_ROLES.ANALYST ? APP_ROLES.USER : APP_ROLES.ANALYST;

                return (
                  <tr key={managedUser._id} className="border-b border-zinc-800/70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 text-zinc-200 flex items-center justify-center">
                          <UserCog className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{managedUser.username}</p>
                          {isSelf ? <p className="text-xs text-zinc-500">Current session</p> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-200">{getRoleLabel(managedUser.role)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${managedUser.isActive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                        {managedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button
                          type="button"
                          disabled={isSelf || isAdmin || isBusy}
                          onClick={() => onRoleToggle(managedUser._id, nextRole)}
                          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-100 hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {normalizeRole(managedUser.role) === APP_ROLES.ANALYST ? 'Make Viewer' : 'Make Analyst'}
                        </button>
                        <button
                          type="button"
                          disabled={isSelf || isBusy}
                          onClick={() => onStatusToggle(managedUser._id, !managedUser.isActive)}
                          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-100 hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {managedUser.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function UserCardGrid({ users, loading, onSelectUser, selectedUserId }) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-200">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Viewer Accounts</h2>
          <p className="text-sm text-zinc-400">Choose a viewer to open their financial summary and transaction history.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-40 rounded-xl border border-zinc-800 bg-zinc-950 animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-5 py-12 text-center text-sm text-zinc-500">
          No viewer accounts are available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((viewer) => {
            const isSelected = String(selectedUserId) === String(viewer._id);

            return (
              <article
                key={viewer._id}
                className={`rounded-xl border p-5 transition-colors ${
                  isSelected ? 'border-white bg-zinc-800' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Viewer</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{viewer.username}</h3>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      viewer.isActive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'
                    }`}
                  >
                    {viewer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectUser(viewer)}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-100"
                >
                  <BarChart3 className="h-4 w-4" />
                  View Summary
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

const buildSummaryFromTransactions = (items) =>
  items.reduce(
    (acc, transaction) => {
      const amount = Number(transaction.amount || 0);

      if (transaction.type === 'income') {
        acc.totalIncome += amount;
      } else if (transaction.type === 'expense') {
        acc.totalExpense += amount;
      }

      acc.netBalance = acc.totalIncome - acc.totalExpense;
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, netBalance: 0 }
  );

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const normalizedRole = normalizeRole(user?.role);
  const isAnalyst = normalizedRole === APP_ROLES.ANALYST;
  const isAdmin = canManageTransactions(normalizedRole);
  const canManageSystemUsers = canManageUsers(normalizedRole);
  const isGlobalUser = hasGlobalAccess(normalizedRole);
  const canCreateTransactions = normalizedRole === APP_ROLES.ADMIN || normalizedRole === APP_ROLES.USER;

  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [pendingUserId, setPendingUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState('add');
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminTab, setAdminTab] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [analystMode, setAnalystMode] = useState('users');
  const [tableUserFilter, setTableUserFilter] = useState('');

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const response = await api.get('/dashboard/summary');
      setSummary(response.data?.data?.summary || { totalIncome: 0, totalExpense: 0, netBalance: 0 });
    } catch (error) {
      console.error('Failed to load summary.', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchTransactions = async () => {
    if (!canViewTransactions(normalizedRole)) {
      setTransactions([]);
      setLoadingTransactions(false);
      return;
    }

    setLoadingTransactions(true);
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data?.data || []);
    } catch (error) {
      console.error('Failed to load transactions.', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin && !isAnalyst) {
      setUsers([]);
      return;
    }

    setLoadingUsers(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data?.data || []);
    } catch (error) {
      console.error('Failed to load users.', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchTransactions();
    fetchUsers();
  }, [normalizedRole]);

  useEffect(() => {
    if (!isAnalyst) return;

    if (tableUserFilter) {
      const nextUser = users.find((candidate) => String(candidate._id) === String(tableUserFilter));
      if (nextUser) {
        setSelectedUser(nextUser);
        setAnalystMode('user');
        return;
      }
    }

    if (analystMode === 'user' && selectedUser) {
      setTableUserFilter(String(selectedUser._id));
    }
  }, [analystMode, isAnalyst, selectedUser, tableUserFilter, users]);

  const refreshCoreData = async () => {
    await Promise.all([fetchSummary(), fetchTransactions(), fetchUsers()]);
  };

  const openAddExpense = () => {
    setModalMode('add');
    setActiveTransaction(null);
    setShowModal(true);
  };

  const openEditExpense = (transaction) => {
    setModalMode('edit');
    setActiveTransaction(transaction);
    setShowModal(true);
  };

  const handleDeleteExpense = async (transactionId) => {
    if (!window.confirm('Delete this transaction?')) return;

    try {
      await api.delete(`/transactions/${transactionId}`);
      await refreshCoreData();
    } catch (error) {
      console.error('Unable to delete transaction.', error);
    }
  };

  const handleRoleToggle = async (userId, role) => {
    setPendingUserId(userId);
    try {
      await api.patch(`/users/${userId}/role`, { role });
      await fetchUsers();
    } catch (error) {
      console.error('Unable to update user role.', error);
    } finally {
      setPendingUserId('');
    }
  };

  const handleStatusToggle = async (userId, isActive) => {
    setPendingUserId(userId);
    try {
      await api.patch(`/users/${userId}/status`, { isActive });
      await fetchUsers();
    } catch (error) {
      console.error('Unable to update user status.', error);
    } finally {
      setPendingUserId('');
    }
  };

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return transactions;

    return transactions.filter((transaction) => {
      const parts = [
        transaction.type,
        transaction.category,
        transaction.notes,
        transaction.userId?.username,
        getRoleLabel(transaction.userId?.role),
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return parts.some((value) => value.includes(term));
    });
  }, [searchTerm, transactions]);

  const pendingTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.status === 'pending'),
    [transactions]
  );

  const analystViewerUsers = useMemo(
    () => users.filter((candidate) => normalizeRole(candidate.role) === APP_ROLES.USER),
    [users]
  );

  const analystTransactions = useMemo(() => {
    if (!isAnalyst) return [];

    if (selectedUser) {
      return transactions.filter((transaction) => String(transaction.userId?._id || transaction.userId?.id) === String(selectedUser._id));
    }

    if (tableUserFilter) {
      return transactions.filter((transaction) => String(transaction.userId?._id || transaction.userId?.id) === String(tableUserFilter));
    }

    return transactions;
  }, [isAnalyst, selectedUser, tableUserFilter, transactions]);

  const filteredPendingTransactions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return pendingTransactions;

    return pendingTransactions.filter((transaction) => {
      const parts = [
        transaction.type,
        transaction.category,
        transaction.notes,
        transaction.userId?.username,
        getRoleLabel(transaction.userId?.role),
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return parts.some((value) => value.includes(term));
    });
  }, [pendingTransactions, searchTerm]);

  const handleStatusUpdate = async (transactionId, status) => {
    try {
      await api.patch(`/transactions/${transactionId}/status`, { status });
      await refreshCoreData();
    } catch (error) {
      console.error(`Unable to mark transaction as ${status}.`, error);
    }
  };

  const showPendingApprovals = isAdmin && adminTab === 'pending';
  const activeTransactions = isAnalyst
    ? analystTransactions.filter((transaction) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;

        const parts = [
          transaction.type,
          transaction.category,
          transaction.notes,
          transaction.userId?.username,
          getRoleLabel(transaction.userId?.role),
          transaction.status,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());

        return parts.some((value) => value.includes(term));
      })
    : showPendingApprovals
    ? filteredPendingTransactions
    : filteredTransactions;
  const analystSummary = useMemo(() => buildSummaryFromTransactions(analystTransactions), [analystTransactions]);
  const visibleSummary = isAnalyst ? analystSummary : summary;
  const showUserColumn = isGlobalUser;
  const isAnalystUsersView = isAnalyst && analystMode === 'users';
  const isAnalystGlobalOverview = isAnalyst && analystMode === 'global';
  const analystActiveUserLabel = selectedUser?.username || analystViewerUsers.find((candidate) => String(candidate._id) === String(tableUserFilter))?.username;
  const columnCount = 5 + (showUserColumn ? 1 : 0) + (isAdmin ? 1 : 0);

  const openAnalystUserSummary = (viewer) => {
    setSelectedUser(viewer);
    setTableUserFilter(String(viewer._id));
    setAnalystMode('user');
  };

  const openAnalystGlobalOverview = () => {
    setSelectedUser(null);
    setTableUserFilter('');
    setAnalystMode('global');
  };

  const returnToAllUsers = () => {
    setSelectedUser(null);
    setTableUserFilter('');
    setAnalystMode('users');
    setSearchTerm('');
  };

  return (
    <>
      {showModal ? (
        <ExpenseFormModal
          mode={modalMode}
          selectedTransaction={activeTransaction}
          users={users}
          isAdmin={isAdmin}
          actorRole={normalizedRole}
          onClose={() => setShowModal(false)}
          onSaved={refreshCoreData}
        />
      ) : null}

      <div className="min-h-full p-6 md:p-8 space-y-6">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-white">Welcome, {user?.username || 'User'}</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Role: <span className="text-zinc-200">{getRoleLabel(normalizedRole)}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isAnalyst ? (
              <button
                type="button"
                onClick={openAnalystGlobalOverview}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isAnalystGlobalOverview
                    ? 'bg-white text-black'
                    : 'border border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-500'
                }`}
              >
                <Globe2 className="h-4 w-4" />
                Global Overview
              </button>
            ) : null}

          {canCreateTransactions ? (
            <button
              type="button"
              onClick={openAddExpense}
              className="inline-flex items-center gap-2 rounded-lg bg-white text-black text-sm font-semibold px-4 py-2.5 hover:bg-zinc-100"
            >
              <Plus className="h-4 w-4" />
              {normalizedRole === APP_ROLES.USER ? '+ Submit Expense' : '+ Add Expense'}
            </button>
          ) : null}
          </div>
        </header>

        {isAnalyst ? (
          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Analyst Navigation</p>
              <h2 className="mt-2 text-lg font-semibold text-white">
                {isAnalystUsersView
                  ? 'Browse viewers and drill into individual summaries.'
                  : isAnalystGlobalOverview
                  ? 'Total Company Cash Flow'
                  : `${analystActiveUserLabel || 'Selected viewer'} Summary`}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                {isAnalystUsersView
                  ? 'Start from the user list or jump straight into the company-wide overview.'
                  : isAnalystGlobalOverview
                  ? 'Review the aggregate totals and full transaction stream across the database.'
                  : 'You are viewing user-specific totals and transaction history.'}
              </p>
            </div>

            {!isAnalystUsersView ? (
              <button
                type="button"
                onClick={returnToAllUsers}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-100 hover:border-zinc-500"
              >
                <Users className="h-4 w-4" />
                Back to All Users
              </button>
            ) : null}
          </section>
        ) : null}

        {!isAnalystUsersView ? (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title={isAnalystGlobalOverview ? 'Company Income' : 'Total Income'}
              value={formatCurrency(visibleSummary.totalIncome)}
              icon={TrendingUp}
              tone="positive"
              loading={isAnalyst ? loadingTransactions : loadingSummary}
            />
            <StatCard
              title={isAnalystGlobalOverview ? 'Company Expenses' : 'Total Expenses'}
              value={formatCurrency(visibleSummary.totalExpense)}
              icon={TrendingDown}
              tone="negative"
              loading={isAnalyst ? loadingTransactions : loadingSummary}
            />
            <StatCard
              title={isAnalystGlobalOverview ? 'Total Company Cash Flow' : 'Net Balance'}
              value={formatCurrency(visibleSummary.netBalance)}
              icon={DollarSign}
              tone={visibleSummary.netBalance >= 0 ? 'positive' : 'negative'}
              loading={isAnalyst ? loadingTransactions : loadingSummary}
            />
          </section>
        ) : null}

        {isAnalystUsersView ? (
          <UserCardGrid
            users={analystViewerUsers}
            loading={loadingUsers}
            onSelectUser={openAnalystUserSummary}
            selectedUserId={selectedUser?._id}
          />
        ) : null}

        {canManageSystemUsers ? (
          <SystemUsersPanel
            currentUserId={user?._id || user?.id}
            users={users}
            loading={loadingUsers}
            onRoleToggle={handleRoleToggle}
            onStatusToggle={handleStatusToggle}
            pendingUserId={pendingUserId}
          />
        ) : null}

        {!isAnalystUsersView ? (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-200">
                {isAdmin ? <ShieldCheck className="h-5 w-5" /> : <Users className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="text-sm uppercase tracking-[0.15em] text-zinc-400">
                  {isAnalyst
                    ? isAnalystGlobalOverview
                      ? 'All Transactions'
                      : `${analystActiveUserLabel || 'Viewer'} Transactions`
                    : showPendingApprovals
                    ? 'Pending Approvals'
                    : 'Transaction List'}
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  {isAnalyst
                    ? isAnalystGlobalOverview
                      ? 'Inspect every transaction in the system with quick user-based filtering.'
                      : `Review the full history for ${analystActiveUserLabel || 'the selected viewer'}.`
                    : isAdmin
                    ? showPendingApprovals
                      ? 'Review transactions submitted by viewers before they affect totals.'
                      : 'Full CRUD access across all user transactions.'
                    : normalizedRole === APP_ROLES.ANALYST
                    ? 'Global read-only visibility across every user.'
                    : 'Read-only view of your personal transactions.'}
                </p>
              </div>
            </div>

            <div className="flex w-full sm:w-auto items-center gap-3">
              {isAdmin ? (
                <div className="flex rounded-lg border border-zinc-700 bg-zinc-800 p-1">
                  <button
                    type="button"
                    onClick={() => setAdminTab('all')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium ${adminTab === 'all' ? 'bg-white text-black' : 'text-zinc-300'}`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTab('pending')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium ${adminTab === 'pending' ? 'bg-white text-black' : 'text-zinc-300'}`}
                  >
                    Pending Approvals
                  </button>
                </div>
              ) : null}

              {isAnalyst ? (
                <select
                  value={tableUserFilter}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setTableUserFilter(nextValue);
                    setSelectedUser(
                      nextValue ? analystViewerUsers.find((candidate) => String(candidate._id) === String(nextValue)) || null : null
                    );
                    setAnalystMode(nextValue ? 'user' : 'global');
                  }}
                  className="w-full sm:w-56 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="">Filter by User</option>
                  {analystViewerUsers.map((viewer) => (
                    <option key={viewer._id} value={viewer._id}>
                      {viewer.username}
                    </option>
                  ))}
                </select>
              ) : null}

              <label className="relative w-full sm:w-72">
                <Search className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={showPendingApprovals ? 'Search pending approvals' : 'Search transactions'}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  {showUserColumn ? <th className="px-5 py-3 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">User</th> : null}
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">Transaction</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">Category</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">Date</th>
                  <th className="px-5 py-3 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">Status</th>
                  <th className="px-5 py-3 text-right text-xs uppercase tracking-[0.14em] text-zinc-500">Amount</th>
                  {isAdmin ? <th className="px-5 py-3 text-right text-xs uppercase tracking-[0.14em] text-zinc-500">Actions</th> : null}
                </tr>
              </thead>

              <tbody>
                {loadingTransactions ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b border-zinc-800/70">
                      <td className="px-5 py-4" colSpan={columnCount}>
                        <div className="h-4 rounded bg-zinc-800 animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : activeTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={columnCount} className="px-5 py-14 text-center text-sm text-zinc-500">
                      {showPendingApprovals ? 'No pending approvals found.' : 'No matching transactions found.'}
                    </td>
                  </tr>
                ) : (
                  activeTransactions.map((transaction) => (
                    <tr key={transaction._id} className="border-b border-zinc-800/70 hover:bg-zinc-800/40 group">
                      {showUserColumn ? (
                        <td className="px-5 py-3.5 bg-zinc-950/60">
                          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
                            <p className="text-sm font-semibold text-white">{transaction.userId?.username || 'Unknown'}</p>
                            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{getRoleLabel(transaction.userId?.role)}</p>
                          </div>
                        </td>
                      ) : null}

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-md flex items-center justify-center ${
                              transaction.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {transaction.type === 'income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white capitalize">{transaction.type}</p>
                            {transaction.notes ? <p className="text-xs text-zinc-500 max-w-44 truncate">{transaction.notes}</p> : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-zinc-200">{transaction.category}</td>
                      <td className="px-5 py-3.5 text-sm text-zinc-400">{formatDate(transaction.date)}</td>
                      <td className="px-5 py-3.5">
                        {(() => {
                          const meta = getStatusMeta(transaction.status);
                          const StatusIcon = meta.icon;
                          return (
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              {meta.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className={`px-5 py-3.5 text-right text-sm font-semibold ${transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </td>

                      {isAdmin ? (
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {showPendingApprovals ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStatusUpdate(transaction._id, 'approved')}
                                  title="Approve"
                                  className="rounded-md border border-emerald-500/40 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusUpdate(transaction._id, 'rejected')}
                                  title="Reject"
                                  className="rounded-md border border-red-500/40 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/10"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEditExpense(transaction)}
                                  title="Edit"
                                  className="h-8 w-8 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 flex items-center justify-center"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExpense(transaction._id)}
                                  title="Delete"
                                  className="h-8 w-8 rounded-md border border-red-500/40 text-red-400 hover:bg-red-500/10 flex items-center justify-center"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
        ) : null}
      </div>
    </>
  );
}
