import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getAuthInstance } from '../config/firebase';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (emailValue) => {
    if (!emailValue) {
      setEmailError('Email is required');
      return false;
    }
    if (!EMAIL_REGEX.test(emailValue)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value) validateEmail(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(getAuthInstance(), email);
      setSuccess(true);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        // For security, show success message even if user doesn't exist
        setSuccess(true);
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-7 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-green-600 font-bold text-3xl">W</span>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-1.5">
              Reset Password
            </h1>
            <p className="text-green-100 text-sm font-medium">
              We'll send you a reset link
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-6">
            {success ? (
              <div className="text-center py-4">
                <div className="mb-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Check Your Email
                </h3>
                <p className="text-gray-600 mb-4">
                  If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Don't see the email? Check your spam folder.
                </p>
                <Link
                  to="/login"
                  className="inline-block w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all text-center"
                >
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg flex items-start gap-2">
                    <span className="text-red-500 font-bold">⚠️</span>
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => email && validateEmail(email)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      emailError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    autoFocus
                  />
                  {emailError && (
                    <p className="mt-1 text-xs text-red-500">{emailError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    ← Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-3 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500">
              © 2025 <span className="font-semibold">Workside Software</span>. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
