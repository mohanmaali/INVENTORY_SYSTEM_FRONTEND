function Table({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-base">
        <thead>
          <tr className="text-gray-500 text-xs uppercase">
            {columns.map((c) => (
              <th key={c.key} className="py-4 pr-6">{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              {columns.map((c) => (
                <td key={c.key} className="py-4 pr-6">{row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
