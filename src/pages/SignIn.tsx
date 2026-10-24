import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';

export default function SignIn() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');

    if (mode === 'sign-in') {
      const result = await signIn(email.trim(), password);
      if (result) setError(result);
    } else {
      const result = await signUp(fullName.trim(), email.trim(), password);
      if (result.error) {
        setError(result.error);
      } else if (result.needsEmailConfirmation) {
        setNotice('Check your email for a confirmation link, then sign in.');
      }
    }

    setBusy(false);
  }

  function changeMode(nextMode: 'sign-in' | 'sign-up') {
    setMode(nextMode);
    setError('');
    setNotice('');
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
        <p className="font-serif text-2xl text-teal-800">Referral Navigator</p>
        <h1 className="mt-7 text-2xl font-semibold text-navy-950">
          {mode === 'sign-in' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-navy-500">
          {mode === 'sign-in'
            ? 'Sign in to see your referral updates.'
            : 'Create an account to keep your referral information together.'}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === 'sign-up' && (
            <label className="block text-sm font-medium text-navy-800">
              Name
              <input
                autoComplete="name"
                className="mt-1.5 h-12 w-full rounded-xl border border-line bg-white px-3 text-base text-navy-950"
                onChange={(event) => setFullName(event.target.value)}
                required
                value={fullName}
              />
            </label>
          )}
          <label className="block text-sm font-medium text-navy-800">
            Email
            <input
              autoComplete="email"
              className="mt-1.5 h-12 w-full rounded-xl border border-line bg-white px-3 text-base text-navy-950"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block text-sm font-medium text-navy-800">
            Password
            <input
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              className="mt-1.5 h-12 w-full rounded-xl border border-line bg-white px-3 text-base text-navy-950"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
            {mode === 'sign-up' && (
              <span className="mt-1 block text-xs font-normal text-navy-500">
                Use at least 8 characters.
              </span>
            )}
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded-xl bg-teal-50 p-3 text-sm text-teal-800">
              {notice}
            </p>
          )}

          <button
            className="h-12 w-full rounded-xl bg-teal-700 px-4 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
            disabled={busy}
            type="submit"
          >
            {busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-navy-600">
          {mode === 'sign-in' ? 'New to Referral Navigator?' : 'Already have an account?'}{' '}
          <button
            className="font-semibold text-teal-800 underline underline-offset-2"
            onClick={() => changeMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
            type="button"
          >
            {mode === 'sign-in' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </section>
    </main>
  );
}
