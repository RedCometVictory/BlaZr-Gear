import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllImages } from '../../../redux/actions/imageActions';
import AdminImageItem from './AdminImageItem';
import Paginate from '../../layouts/Paginate';
import Spinner from '../../layouts/Spinner';

const AdminImageList = () => {
  const dispatch = useDispatch();
  const imageDetail = useSelector(state => state.image);
  const { loading, images, page, pages } = imageDetail;
  const [hasMounted, setHasMounted] = useState(false);
  let [currentPage, setCurrentPage] = useState(page || 1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    dispatch(getAllImages(currentPage, itemsPerPage));
  }, [dispatch, currentPage, itemsPerPage]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const itemCountChange = (e) => {
    setIsLoading(true);
    if (e.target.value > itemsPerPage) {
      setCurrentPage(currentPage = currentPage - 1);
    }
    setItemsPerPage(Number(e.target.value)); // 12 or 20, dropdown
  };

  const pageChange = (chosenPage) => {
    setIsLoading(true);
    setCurrentPage(chosenPage);
    window.scrollTo({ behavior: "smooth", top: 0 });
    // setIsLoading(false);
  };

  return (
    <>
    {loading ? (
      <Spinner />
    ) : (
      <section className="admProducts">
        <div className="admProducts__header">
          <h2 className="admProducts__title image-item">Images</h2>
          <div className="admProducts__header-options">
            <div className="admProducts__items-page">
              <span>Items per Page:{" "}</span>
              <div className="admProducts__items-select">
                <select name="itemCount" value={itemsPerPage} onChange={e => itemCountChange(e)}>
                  <option value="12">12</option>
                  <option value="20">20</option>
                </select>
              </div>
            </div>
            <div className="admProducts__total-items">
              {images.length} Products
            </div>
          </div>
        </div>
        <div className="admProducts__content">
          <section className="admImage">
            <>
            {images.map(image => (
              <AdminImageItem key={image.id} image={image} />
            ))}
            </>
          </section>
        </div>
        <Paginate currentPage={currentPage} itemsPerPage={itemsPerPage} pages={pages} pageChange={pageChange} />
      </section>
    )}
    </>
  )
}
export default AdminImageList;