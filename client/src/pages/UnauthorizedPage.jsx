import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 border border-zinc-700 rounded-2xl flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8 text-zinc-500" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
      <p className="text-zinc-500 text-sm mb-8 max-w-sm">
        You don't have the necessary permissions to view this page. Contact your administrator if you believe this is an error.
      </p>
      <Link
        to="/dashboard"
        className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-zinc-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
