export function ParameterForm({ onSubmit, isLoading }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Parameters</h2>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({}); }}>
        <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
    </div>
  );
}
