import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import {
  completeEmailOtpLink,
  db,
  hasEmailOtpLink,
  registerWithEmail,
  resendVerificationEmail,
  sendEmailOtpLink,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
} from '../lib/firebase';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

type AuthMode = 'login' | 'register';

const authErrorMessages: Record<string, string> = {
  'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
  'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
  'auth/wrong-password': 'Mật khẩu không đúng.',
  'auth/email-already-in-use': 'Email này đã được đăng ký.',
  'auth/weak-password': 'Mật khẩu cần ít nhất 6 ký tự.',
  'auth/invalid-email': 'Email không hợp lệ.',
  'auth/missing-email': 'Vui lòng nhập email.',
  'auth/email-not-verified': 'Email chưa được xác minh. Mình đã gửi lại email xác minh cho bạn.',
  'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập.',
  'auth/operation-not-allowed': 'Phương thức đăng nhập này chưa được bật trong Firebase Authentication.',
  'auth/provider-already-linked': 'Tài khoản này đã liên kết với phương thức đăng nhập khác.',
  'auth/invalid-action-code': 'Liên kết xác thực đã hết hạn hoặc không hợp lệ.',
  'auth/argument-error': 'Liên kết đăng nhập email không hợp lệ hoặc thiếu email.',
};

export default function Login() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const cleanEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  useEffect(() => {
    if (loading || !user) return;
    navigate(profile?.userType ? '/' : '/profile-setup', { replace: true });
  }, [loading, navigate, profile?.userType, user]);

  useEffect(() => {
    if (!hasEmailOtpLink()) return;

    let cancelled = false;
    const finishEmailLink = async () => {
      setSubmitting(true);
      setError('');
      try {
        const signedInUser = await completeEmailOtpLink();
        if (!cancelled) await routeAfterAuth(signedInUser.uid);
      } catch (err) {
        if (!cancelled) setError(formatAuthError(err));
      } finally {
        if (!cancelled) setSubmitting(false);
      }
    };

    finishEmailLink();
    return () => {
      cancelled = true;
    };
  }, []);

  const routeAfterAuth = async (uid: string) => {
    const profileSnap = await getDoc(doc(db, 'users', uid));
    const existingProfile = profileSnap.exists() ? profileSnap.data() : null;
    navigate(existingProfile?.userType ? '/' : '/profile-setup', { replace: true });
  };

  const formatAuthError = (err: unknown) => {
    const maybeCode = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code: string }).code) : '';
    if (maybeCode && authErrorMessages[maybeCode]) return authErrorMessages[maybeCode];
    if (err instanceof FirebaseError) return authErrorMessages[err.code] || err.message;
    if (err instanceof Error) return err.message;
    return 'Không thể đăng nhập lúc này. Vui lòng thử lại.';
  };

  const handleGoogleLogin = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const signedInUser = await signInWithGoogle();
      await routeAfterAuth(signedInUser.uid);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const validateEmailPassword = () => {
    if (!cleanEmail || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return false;
    }
    if (mode === 'register') {
      if (!displayName.trim()) {
        setError('Vui lòng nhập tên hiển thị.');
        return false;
      }
      if (password.length < 6) {
        setError('Mật khẩu cần ít nhất 6 ký tự.');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || !validateEmailPassword()) return;

    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      if (mode === 'register') {
        await registerWithEmail(cleanEmail, password, displayName);
        setNotice('Tài khoản đã được tạo. Mình đã gửi email xác minh, hãy mở email rồi đăng nhập lại.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        return;
      }

      const signedInUser = await signInWithEmail(cleanEmail, password);
      await routeAfterAuth(signedInUser.uid);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailOtp = async () => {
    if (submitting) return;
    if (!cleanEmail) {
      setError('Nhập email trước, mình sẽ gửi link OTP đăng nhập vào email đó.');
      return;
    }
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      await sendEmailOtpLink(cleanEmail);
      setNotice('Đã gửi link OTP đăng nhập vào email. Mở email trên cùng trình duyệt này để hoàn tất.');
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (submitting) return;
    if (!cleanEmail) {
      setError('Nhập email trước để nhận link đặt lại mật khẩu.');
      return;
    }
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      await sendPasswordReset(cleanEmail);
      setNotice('Đã gửi link đặt lại mật khẩu vào email của bạn.');
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (submitting || !cleanEmail || !password) {
      setError('Nhập email và mật khẩu để gửi lại email xác minh.');
      return;
    }
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      await resendVerificationEmail(cleanEmail, password);
      setNotice('Đã gửi lại email xác minh.');
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setNotice('');
    setConfirmPassword('');
  };

  return (
    <div className="mx-auto grid min-h-[calc(100svh-10rem)] max-w-6xl items-center gap-10 py-6 lg:grid-cols-[1fr_460px] lg:py-12">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="space-y-8"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
          <ShieldCheck className="h-4 w-4" />
          Cổng truy cập Nexus M&A
        </div>
        <div className="max-w-2xl space-y-5">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
            Đăng nhập an toàn cho giao dịch M&A.
          </h1>
          <p className="text-base font-medium leading-7 text-slate-600">
            Hỗ trợ Google, email/mật khẩu, email xác minh, link OTP và phiên đăng nhập 20 phút.
          </p>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/8 sm:p-7"
      >
        <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
          {[
            { id: 'login' as const, label: 'Đăng nhập' },
            { id: 'register' as const, label: 'Đăng ký' },
          ].map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => switchMode(item.id)}
              className={cn(
                'min-w-0 flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all',
                mode === item.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="flex min-w-0 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <img src="https://www.google.com/favicon.ico" alt="" className="h-5 w-5" />
            Tiếp tục với Google
          </button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Hoặc dùng email</span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-600">Tên hiển thị</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 focus-within:border-blue-500">
                <UserRound className="h-4 w-4 text-slate-400" />
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value.slice(0, 80))}
                  placeholder="Nguyễn Văn A"
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-300"
                />
              </div>
            </label>
          )}

          <label className="block space-y-2">
            <span className="text-xs font-bold text-slate-600">Email</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 focus-within:border-blue-500">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value.slice(0, 120))}
                placeholder="you@example.com"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-300"
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-bold text-slate-600">Mật khẩu</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 focus-within:border-blue-500">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value.slice(0, 72))}
                placeholder="Tối thiểu 6 ký tự"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(value => !value)}
                className="text-slate-400 transition-colors hover:text-slate-700"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {mode === 'register' && (
            <label className="block space-y-2">
              <span className="text-xs font-bold text-slate-600">Xác nhận mật khẩu</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 focus-within:border-blue-500">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value.slice(0, 72))}
                  placeholder="Nhập lại mật khẩu"
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-300"
                />
              </div>
            </label>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-bold leading-5 text-rose-600">
              {error}
            </div>
          )}
          {notice && (
            <div className="flex gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-xs font-bold leading-5 text-green-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Đang xử lý...' : mode === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {mode === 'login' && (
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button type="button" onClick={handleEmailOtp} className="rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50">
              <KeyRound className="mx-auto mb-1 h-4 w-4 text-blue-600" />
              Link OTP
            </button>
            <button type="button" onClick={handleResetPassword} className="rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50">
              Quên mật khẩu
            </button>
            <button type="button" onClick={handleResendVerification} className="rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50">
              Gửi xác minh
            </button>
          </div>
        )}

        <p className="mt-5 text-center text-[11px] font-semibold leading-5 text-slate-400">
          Tài khoản email phải xác minh trước khi vào hệ thống. Phiên đăng nhập tự khóa sau 20 phút.
        </p>
      </motion.section>
    </div>
  );
}
