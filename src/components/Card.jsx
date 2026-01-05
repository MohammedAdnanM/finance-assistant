
export default function Card({ title, children }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
