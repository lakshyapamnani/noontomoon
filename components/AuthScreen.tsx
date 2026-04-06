import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { Eye, EyeOff, LogIn, UserPlus, Mail, Lock, Store, Check, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PLANS = [
  { id: '1mo', label: '1 Month', price: 499, perMonth: 499 },
  { id: '3mo', label: '3 Months', price: 1199, perMonth: Math.round(1199 / 3) },
  { id: '6mo', label: '6 Months', price: 2499, perMonth: Math.round(2499 / 6) },
  { id: '12mo', label: '12 Months', price: 4499, perMonth: Math.round(4499 / 12) },
] as const;

const UPI_ID = 'lakshaypamnani2@okaxis';

const DEMO_EMAIL = 'demo@dronapos.com';
const DEMO_PASSWORD = 'demo123456';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Payment flow state (signup only)
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[number]>(PLANS[0]);
  // Store signup credentials temporarily for after payment
  const [pendingSignup, setPendingSignup] = useState<{ email: string; password: string; name: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      setLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        const code = err?.code || '';
        if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') setError('Invalid email or password.');
        else if (code === 'auth/invalid-email') setError('Invalid email address.');
        else setError(err?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    } else {
      // Signup: validate then show payment
      if (!restaurantName.trim()) {
        setError('Please enter your restaurant name');
        return;
      }
      if (!email.trim()) {
        setError('Please enter your email');
        return;
      }
      if (password.length < 6) {
        setError('Password should be at least 6 characters');
        return;
      }
      setPendingSignup({ email, password, name: restaurantName.trim() });
      setShowPayment(true);
    }
  };

  const handleCompleteSignup = async () => {
    if (!pendingSignup) return;
    setLoading(true);
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, pendingSignup.email, pendingSignup.password);
      await updateProfile(cred.user, { displayName: pendingSignup.name });
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') setError('This email is already registered. Please login.');
      else if (code === 'auth/invalid-email') setError('Invalid email address.');
      else if (code === 'auth/weak-password') setError('Password should be at least 6 characters.');
      else setError(err?.message || 'Something went wrong.');
      setShowPayment(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
    } catch (err: any) {
      // If demo account doesn't exist, create it
      try {
        const cred = await createUserWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
        await updateProfile(cred.user, { displayName: 'Demo Restaurant' });
      } catch (createErr: any) {
        setError('Unable to access demo account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Noon%20To%20Moon%20POS&am=${selectedPlan.price}&cu=INR&tn=Noon%20To%20Moon%20POS%20${selectedPlan.label}%20Plan`;

  // Payment / Plan Selection Screen
  if (showPayment) {
    return (
      <div className="h-screen bg-gray-50 overflow-y-auto p-4">
        <div className="w-full max-w-lg mx-auto py-6 pb-10">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[#F57C00] rounded-2xl flex items-center justify-center font-bold text-lg text-white mx-auto mb-3 shadow-lg shadow-orange-200">
              NM
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              NOON TO MOON <span className="text-[#F57C00]">POS</span>
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
            <button
              onClick={() => setShowPayment(false)}
              className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-700 mb-4 transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <h2 className="text-lg font-black text-gray-900 mb-1">Choose Your Plan</h2>
            <p className="text-sm text-gray-500 font-medium mb-5">Select a plan and pay via UPI to activate your account</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-bold">
                {error}
              </div>
            )}

            {/* Plan Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPlan.id === plan.id
                      ? 'border-[#F57C00] bg-orange-50 shadow-md shadow-orange-100'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  {selectedPlan.id === plan.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#F57C00] rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  {plan.id === '12mo' && (
                    <span className="absolute -top-2 left-3 bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Best Value</span>
                  )}
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider">{plan.label}</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">₹{plan.price}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">₹{plan.perMonth}/month</p>
                </button>
              ))}
            </div>

            {/* QR Code */}
            <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-5 text-center">
              <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">
                Scan to Pay ₹{selectedPlan.price}
              </p>
              <div className="inline-block p-3 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                <QRCodeSVG
                  value={upiUrl}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-gray-500 font-bold mt-3">UPI ID: <span className="text-gray-900 font-black">{UPI_ID}</span></p>
              <p className="text-[10px] text-gray-400 font-medium mt-1">
                Pay using any UPI app — Google Pay, PhonePe, Paytm, etc.
              </p>
            </div>

            {/* Complete Signup Button */}
            <button
              onClick={handleCompleteSignup}
              disabled={loading}
              className="w-full mt-5 bg-[#F57C00] text-white py-3 rounded-xl font-black text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={18} /> Done Payment — Activate Account
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#F57C00] rounded-2xl flex items-center justify-center font-bold text-xl text-white mx-auto mb-4 shadow-lg shadow-orange-200">
            NM
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            NOON TO MOON <span className="text-[#F57C00]">POS</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Restaurant Point of Sale</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
          <h2 className="text-xl font-black text-gray-900 mb-6">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                  Restaurant Name
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="Your Restaurant Name"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#F57C00] focus:border-[#F57C00] outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@restaurant.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#F57C00] focus:border-[#F57C00] outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#F57C00] focus:border-[#F57C00] outline-none transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F57C00] text-white py-3 rounded-xl font-black text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLogin ? (
                <>
                  <LogIn size={18} /> Sign In
                </>
              ) : (
                <>
                  <UserPlus size={18} /> Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm font-bold text-gray-500 hover:text-[#F57C00] transition-colors"
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="text-[#F57C00] font-black">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </span>
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-black text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={16} /> Try Demo Account
                  </>
                )}
              </button>
              <p className="text-[10px] text-gray-400 mt-2 font-medium">No signup needed — explore with sample data</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          Each restaurant gets its own isolated data space
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
