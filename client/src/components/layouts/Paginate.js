import React from 'react';
import Pagination from 'react-js-pagination';

const Paginate = ({ currentPage, itemsPerPage, pages, pageChange}) => {

  Number(currentPage);
  Number(itemsPerPage);
  Number(pages);
  Number(pageChange);
  return (
    <div className="admProducts__paginate-menu">
      <Pagination
        activePage={currentPage}
        itemsCountPerPage={itemsPerPage}
        totalItemsCount={pages}
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