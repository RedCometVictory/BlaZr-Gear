import React, { useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';

const Paginate = ({ currentPage, itemsPerPage, pages, pageChange}) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;
  let itemsPerPageNum = Number(itemsPerPage);
  let pagesNum = Number(pages);

  return (
    <div className="admProducts__paginate-menu">
      <Pagination
        activePage={currentPage}
        itemsCountPerPage={itemsPerPageNum}
        totalItemsCount={pagesNum}
        onChange={pageChange}
        nextPageText={'⟩'}
        prevPageText={'⟨'}
        firstPageText={'«'}
        lastPageText={'»'}
        innerClass="admProducts__paginate-container"
        activeClass="active"
        activeLinkClass="admProducts__paginate-active-link"
        itemClass="admProducts__paginate-page"
        linkClass="admProducts__paginate-page-link"
        linkClassPrev="admProducts__paginate-previous-link"
        linkClassNext="admProducts__paginate-next-link"
      />
    </div>
  )
}
export default Paginate;