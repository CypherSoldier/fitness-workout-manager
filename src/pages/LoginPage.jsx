import { useState } from "react";
import { ArrowRight, Dumbbell } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../services/firebase";
import { useAuth } from "../hooks/useAuth";

function LoginPage() {
  const { loginWithJWT } = useAuth();
  const navigate = useNavigate();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signInWithGoogle = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(err.message || "Unable to sign in with Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload = isSignUpMode
      ? { display_name: displayName, email, password }
      : { email, password };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE}/${isSignUpMode ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      if (isSignUpMode) {
        setIsSignUpMode(false);
        setError("Account created. Please sign in.");
      } else {
        loginWithJWT(data.accessToken);
        // App owns a separate useAuth instance, so reload it to pick up the JWT.
        window.location.href = "/";
      }
    } catch (err) {
      console.error(
        isSignUpMode ? "Error creating account:" : "Error logging in:",
        err,
      );
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#171b1e] px-4 py-10 text-white">
      <section
        aria-labelledby="auth-title"
        className="w-full max-w-md rounded-2xl border border-[#343d42] bg-[#202629] p-7 shadow-2xl sm:p-9"
      >
        <div className="mb-9 flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400 text-[#12201c]">
            <Dumbbell size={21} />
          </span>
          <span>Fitness Workout</span>
        </div>

        <div className="mb-7">
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-emerald-300">
            {isSignUpMode ? "GET STARTED" : "WELCOME BACK"}
          </p>
          <h1 id="auth-title" className="text-3xl font-bold tracking-tight">
            {isSignUpMode ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#a5b0b5]">
            {isSignUpMode
              ? "Build better habits with a plan made for you."
              : "Sign in to continue your training journey."}
          </p>
        </div>

        {error && (
          <p
            role="status"
            className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
              error.startsWith("Account created")
                ? "border-emerald-800 bg-emerald-950/50 text-emerald-200"
                : "border-rose-900 bg-rose-950/40 text-rose-200"
            }`}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUpMode && (
            <label className="block text-sm font-medium text-[#d5dcdf]">
              Display name
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
                className="mt-2 w-full rounded-lg border border-[#3e494f] bg-[#191f22] px-3.5 py-3 text-white outline-none transition placeholder:text-[#748188] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </label>
          )}
          <label className="block text-sm font-medium text-[#d5dcdf]">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="mt-2 w-full rounded-lg border border-[#3e494f] bg-[#191f22] px-3.5 py-3 text-white outline-none transition placeholder:text-[#748188] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />
          </label>
          <label className="block text-sm font-medium text-[#d5dcdf]">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete={isSignUpMode ? "new-password" : "current-password"}
              minLength={6}
              required
              className="mt-2 w-full rounded-lg border border-[#3e494f] bg-[#191f22] px-3.5 py-3 text-white outline-none transition placeholder:text-[#748188] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 font-semibold text-[#11201b] transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting
              ? "Please wait…"
              : isSignUpMode
                ? "Create account"
                : "Log in"}
            {!isSubmitting && <ArrowRight size={17} />}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-[#829097]">
          <span className="h-px flex-1 bg-[#3a4449]" />
          <span>OR CONTINUE WITH</span>
          <span className="h-px flex-1 bg-[#3a4449]" />
        </div>

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#465158] bg-[#252d31] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#718087] hover:bg-[#2b3438] disabled:opacity-60"
        >
          <span className="font-bold text-base text-[#4285f4]">G</span>
          Continue with Google
        </button>

        <p className="mt-7 text-center text-sm text-[#a5b0b5]">
          {isSignUpMode
            ? "Already have an account?"
            : "New to Fitness Workout?"}{" "}
          <button
            type="button"
            onClick={() => {
              setError("");
              setIsSignUpMode((current) => !current);
            }}
            className="font-semibold text-emerald-300 hover:text-emerald-200"
          >
            {isSignUpMode ? "Log in" : "Create account"}
          </button>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
