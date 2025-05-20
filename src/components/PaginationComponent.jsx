import React from "react";

function PaginationComponent({
  itemsPerPage,
  totalItems,
  paginate,
  currentPage,
  setCurrentPage,
}) {
  const pageNumbers = [];
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      setCurrentPage(nextPage);
      paginate(nextPage);
    }
  };

  const handlePrevPage = () => {
    const prevPage = currentPage - 1;
    if (prevPage >= 1) {
      setCurrentPage(prevPage);
      paginate(prevPage);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
    paginate(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
    paginate(totalPages);
  };

  return (
    <>
      <nav>
        <div className="d-flex gap-3 justify-content-end">
          <div>
            <p className="fw-bold">
              Page {currentPage} of {totalPages}
            </p>
          </div>
          <div className="d-flex gap-3">
            <p className="fw-bold" onClick={handleFirstPage}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-skip-start-fill"
                viewBox="0 0 16 16"
              >
                <path d="M4 4a.5.5 0 0 1 1 0v3.248l6.267-3.636c.54-.313 1.232.066 1.232.696v7.384c0 .63-.692 1.01-1.232.697L5 8.753V12a.5.5 0 0 1-1 0V4z" />
              </svg>
            </p>
            <p onClick={handlePrevPage}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-caret-left-fill"
                viewBox="0 0 16 16"
              >
                <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
              </svg>
            </p>
            <p
              onClick={handleNextPage}
              className={`page-link ${
                currentPage === totalPages ? "disabled" : ""
              }`}
              disabled={currentPage === totalPages}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-caret-right-fill "
                viewBox="0 0 16 16"
              >
                <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
              </svg>
            </p>
            <p onClick={handleLastPage}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-skip-end-fill"
                viewBox="0 0 16 16"
              >
                <path d="M12.5 4a.5.5 0 0 0-1 0v3.248L5.233 3.612C4.693 3.3 4 3.678 4 4.308v7.384c0 .63.692 1.01 1.233.697L11.5 8.753V12a.5.5 0 0 0 1 0V4z" />
              </svg>
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}

export default PaginationComponent;
