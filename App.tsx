
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import UserForm from './components/UserForm';
import { AppView, UserListItem, UserData } from './types';
import { fetchUserList, fetchUserData, saveUserData } from './services/api';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('login');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [userList, setUserList] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const loadUserList = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fetchUserList();
      setUserList(list);
    } catch (err) {
      setError('Failed to load user list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // In a real app, this should be verified server-side
      setError(null);
      setView('dashboard');
      loadUserList();
    } else {
      setError('Invalid admin password');
    }
  };

  const handleUserClick = async (username: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUserData(username);
      setSelectedUser(data);
      setView('edit');
    } catch (err) {
      setError(`Failed to load data for ${username}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = async (data: UserData) => {
    setIsLoading(true);
    setError(null);
    try {
      await saveUserData(data);
      // Refresh list if it's a new user
      if (view === 'add') {
        await loadUserList();
      }
      setView('dashboard');
      alert('User updated successfully!');
    } catch (err) {
      setError('Failed to save user data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setView('login');
    setPassword('');
    setUserList([]);
    setSelectedUser(null);
    setError(null);
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Admin Login</h2>
            <p className="mt-2 text-sm text-gray-500">Access the chatbot management dashboard</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                placeholder="Enter password..."
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 transform active:scale-95"
            >
              Sign In
            </button>
          </form>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <button 
              onClick={() => alert('Please contact the system administrator for access.')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout title="Dashboard" onLogout={handleLogout}>
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex justify-between items-center animate-in slide-in-from-top duration-300">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>
      )}

      {view === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bot Users</h2>
              <p className="text-gray-500 text-sm">Manage existing users or add new ones to the bot system.</p>
            </div>
            <button
              onClick={() => {
                setSelectedUser(null);
                setView('add');
              }}
              className="inline-flex items-center px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New User
            </button>
          </div>

          {isLoading && userList.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-pulse">
                  <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 w-1/3 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userList.map((u) => (
                <div
                  key={u.user}
                  onClick={() => handleUserClick(u.user)}
                  className="group bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all flex flex-col justify-between h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors truncate">
                        {u.user}
                      </h3>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2 font-medium">Click to configure</div>
                </div>
              ))}
              {userList.length === 0 && !isLoading && (
                <div className="col-span-full py-12 text-center text-gray-500">
                  No users found. Click "Add New User" to get started.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {(view === 'edit' || view === 'add') && (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <button
                onClick={() => setView('dashboard')}
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 mb-2 group transition-all"
              >
                <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {view === 'edit' ? `Edit Configuration: ${selectedUser?.user}` : 'New Bot User Configuration'}
              </h2>
            </div>
          </div>

          <UserForm
            initialData={selectedUser}
            isSubmitting={isLoading}
            existingUsers={userList.map(u => u.user)}
            onCancel={() => setView('dashboard')}
            onSubmit={handleSaveUser}
          />
        </div>
      )}
    </Layout>
  );
};

export default App;
