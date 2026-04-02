import Button from "./Button";

function Pagination({
  page = 1,
  totalPages = 1,
  totalItems,
  loading = false,
  perPage,
  perPageOptions = [5, 10, 20, 50],
  onPageChange,
  onPerPageChange,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${className}`}
    >
      <div className="text-sm text-gray-500">
        Page {page} of {totalPages}
        {typeof totalItems === "number" ? ` - Total: ${totalItems}` : ""}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {typeof perPage !== "undefined" && onPerPageChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Per Page</label>
            <select
              value={perPage}
              onChange={(event) => onPerPageChange(Number(event.target.value))}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
          <Button
            type="button"
            variant="secondary"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>

          <div className="min-w-[120px] px-3 text-center text-sm text-gray-600">
            {page}
          </div>

          <Button
            type="button"
            variant="secondary"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
