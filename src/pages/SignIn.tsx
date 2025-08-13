import React, { useEffect, useState } from 'react';
import { Shield, Mail, Lock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const SignIn: React.FC = () => {
  const { isDark } = useTheme();
  const { signIn, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    // Pre-fill for demo/testing
    setEmail('robert.wesley@crestwood.edu');
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    await signIn(email, password);
  };

  const emailInvalid = touched && (!email || !email.includes('@'));
  const passwordInvalid = touched && (!password || password.length < 6);

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md rounded-2xl border p-8 shadow-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
            <Shield className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>FraudLens</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Admin Dashboard</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <div className={`flex items-center rounded-lg border px-3 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
              <Mail className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-500'}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`flex-1 p-2 bg-transparent outline-none ${isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
                placeholder="you@company.com"
                autoFocus
              />
            </div>
            {emailInvalid && <p className="text-xs text-red-500 mt-1">Please enter a valid email.</p>}
          </div>

          <div>
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
            <div className={`flex items-center rounded-lg border px-3 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
              <Lock className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-500'}`} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`flex-1 p-2 bg-transparent outline-none ${isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
                placeholder="Enter your password"
              />
            </div>
            {passwordInvalid && <p className="text-xs text-red-500 mt-1">Password must be at least 6 characters.</p>}
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-medium ${isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} disabled:opacity-50`}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <div className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            By signing in you agree to the Acceptable Use Policy.
          </div>
        </form>
      </div>
      {/* Global Footer on Sign In */}
      <div className={`fixed bottom-2 inset-x-0 text-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Powered by Ellucian
      </div>
    </div>
  );
};

export default SignIn;
