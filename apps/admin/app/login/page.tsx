export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">BPS EC Election-2026 Admin</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to view nomination responses</p>

        <form method="POST" action="/api/login" className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-600"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">Incorrect password. Try again.</p>
          )}

          <button
            type="submit"
            className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
