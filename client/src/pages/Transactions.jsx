import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import clsx from 'clsx'; // Make sure clsx is imported, if no package use string literal

const Transactions = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data.data);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        setTransactions(transactions.filter(t => t._id !== id));
      } catch (error) {
        console.error('Failed to delete transaction', error);
      }
    }
  };

  // strict RBAC checks for UI visibility
  const canModify = user.role === 'Admin';
  
  const filteredTransactions = transactions.filter(t => 
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Transactions</h1>
          <p className="text-gray-500 mt-1">Review your income and expenses detailed history.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:w-64">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search category or notes..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* RBAC: Only Admin can add transactions */}
          {canModify && (
            <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all w-max whitespace-nowrap">
              <Plus className="w-5 h-5" />
              <span>Add New</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <ListOrdered className="w-12 h-12 mx-auto mb-4 opacity-20" /> {/* Note: Assuming ListOrdered is imported or replace with proper icon if undefined, let's just use text for safe side */}
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  
                  {/* RBAC: Column header strictly for Admin */}
                  {canModify && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        )}>
                          {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">{tx.type}</p>
                          {tx.notes && <p className="text-xs text-gray-500 line-clamp-1 max-w-[150px]">{tx.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className={clsx(
                        "font-bold",
                        tx.type === 'income' ? 'text-green-600' : 'text-gray-900'
                      )}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    
                    {/* RBAC: Action icons strictly for Admin */}
                    {canModify && (
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Delete"
                            onClick={() => handleDelete(tx._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
