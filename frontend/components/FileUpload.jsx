export function FileUpload({ onFileUpload }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Upload File</h2>
      <input type="file" onChange={(e) => onFileUpload(e.target.files?.[0])} />
    </div>
  );
}
