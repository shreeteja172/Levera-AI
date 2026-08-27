export default function SuccessPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <div className="rounded-lg border p-8 text-center">
        <h1 className="text-3xl font-bold text-green-600">
          Extension Approved
        </h1>

        <p className="mt-4">You can now return to the Chrome extension.</p>
      </div>
    </main>
  );
}
