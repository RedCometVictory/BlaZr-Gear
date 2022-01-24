import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { listAllCategories, listAllProducts } from '../../../redux/actions/productActions';
import AdminProductItem from './AdminProductItem';
import Paginate from '../../layouts/Paginate';
import Spinner from '../../layouts/Spinner';

const AdminProductList = () => {
  const dispatch = useDispatch();
  const ProductDetail = useSelector(state => state.product);
  const { loading, categories, products, page, pages } = ProductDetail;
  const [hasMounted, setHasMounted] = useState(false);
  let [currentPage, setCurrentPage] = useState(page || 1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    dispatch(listAllCategories());
    dispatch(listAllProducts(keyword, category !== 'All' ? category : '', currentPage, itemsPerPage));
  }, [dispatch, keyword, category, currentPage, itemsPerPage]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const categoryChange = (e) => {
    setCurrentPage(1);
    setCategory(e.target.value); // 12 or 20, dropdown
  };

  const itemCountChange = (e) => {
    if (e.target.value > itemsPerPage) {
      setCurrentPage(currentPage = currentPage - 1);
    }
    setItemsPerPage(Number(e.target.value)); // 12 or 20, dropdown
  };

  const pageChange = (chosenPage) => {
    setCurrentPage(chosenPage);
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  return loading ? (
    <Spinner />
  ) : (
    <section className="admProducts">
      <div className="admProducts__header prod-item">
        <h2 className="admProducts__title">Products in Store</h2>
        <div className="admProducts__header-options prod-item">
          <div className="admProducts__items-page prod-item">
            <span>Items per Page:{" "}</span>
            <div className="admProducts__items-select">
              <select name="category" value={category} onChange={(e) => categoryChange(e)}>
                {categories.map((category, index) => (
                  <option value={category.category} key={index}>{category.category}</option>
                ))}
              </select>
              <select name="itemCount" value={itemsPerPage} onChange={e => itemCountChange(e)}>
                <option value="12">12</option>
                <option value="20">20</option>
              </select>
            </div>
          </div>
          <div className="admProducts__create-item prod-item">
            <Link to="/admin/product/create">
              <button className="btn btn-secondary">
                Add Product
              </button>
            </Link>
          </div>
          <div className="admProducts__create-item prod-item">
            <Link to='/admin/image/list'>
              <button className="btn btn-secondary">
                Images List
              </button>
            </Link>
          </div>
          <div className="admProducts__total-items prod-item">
            {products.length} Products
          </div>
        </div>
      </div>
      <div className="admProducts__content">
        <div className="admProducts__list">
          <>
          {products.map(product => (
            <AdminProductItem key={product.id} product={product} />
          ))}
          </>
        </div>
      </div>
      <Paginate currentPage={currentPage} itemsPerPage={itemsPerPage} pages={pages} pageChange={pageChange} />
    </section>
  )
}
export default AdminProductList;