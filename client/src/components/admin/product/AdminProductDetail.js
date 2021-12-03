import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { listProductDetails, deleteProduct } from '../../../redux/actions/productActions';
import AdminProductUpdate from './AdminProductUpdate';
import Spinner from '../../layouts/Spinner';

const AdminProductDetail = () => {
  const { prod_id } = useParams();
  const history = useHistory();
  const myRef = useRef();
  const dispatch = useDispatch();
  const productDetail = useSelector(state => state.product);
  const { loading, errors, productById } = productDetail;
  const [hasMounted, setHasMounted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmUpdate, setConfirmUpdate] = useState(false);

  useEffect(() => {
    dispatch(listProductDetails(prod_id));
  }, [dispatch, prod_id]);  

  useEffect(() => {
    if (confirmUpdate) {
      scrollToUpdateForm()
    }
  }, [confirmUpdate]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const scrollToUpdateForm = () => myRef.current.scrollIntoView({ behavior: 'smooth'});

  const deleteProductHandler = () => {
    setConfirmUpdate(true)
    window.scrollTo({ behavior: "smooth", top: 0 });
  };
  return (
    <>
    {loading ? (
      <Spinner />
    ) : (
      <section className="admProductDetail">
        <div className="admProductDetail__title">
          <h2>{productById.productInfo.name}</h2>
        </div>
        {confirmDelete && (
          <div className="admProductDetail__delete-confirm">
            <div>
              <p>Are you sure you want to delete this product from the online store? Please confirm.</p>
            </div>
            <div className="admProductDetail__delete-btns">
              <button className="btn btns del-primary" onClick={e => dispatch(deleteProduct(productById.productInfo.product_id, history))}>Yes</button>
              <button className="btn btns del-secondary" onClick={() => setConfirmDelete(false)}>No</button>
            </div>
          </div>
        )}
        <div className="admProductDetail__details">
          <div className="admProductDetail__image">
            <img className="admProductDetail__img" src={productById.productInfo.product_image_url} alt="forest view" />
          </div>
          <div className="admProductDetail__info">
            <div className="admProductDetail__info-inner">
              <h3>Product Information</h3>
              <div>
                <span className="title">ID#: </span>{productById.productInfo.product_id}
              </div>
              <div>
                <span className="title">Brand Name: </span>{productById.productInfo.brand}
              </div>
              <div>
                <span className="title">Category: </span>{productById.productInfo.category}
              </div>
              <div>
                <span className="title">Base Price: </span> $ {productById.productInfo.price}
              </div>
              <div>
                <span className="title">Stock: </span>{productById.productInfo.count_in_stock}
              </div>
              <div>
                <span className="title">Product Created: </span>{productById.productInfo.created_at}
              </div>
            </div>
            <div className="admProductDetail__btn-container">
              <div className="">
                <Link to='/admin/product-list'>
                  <div className="btn btn-primary update-btn">
                    Product List
                  </div>
                </Link>
              </div>
              {confirmUpdate ? (
                <div className="btn btn-primary update-btn" onClick={() => setConfirmUpdate(false)}>
                  Cancel Update
                </div>
              ) : (
                <div className="btn btn-primary update-btn" onClick={() => deleteProductHandler()}>
                  Update Product
                </div>
              )}
              <button className="btn btn-secondary delete-btn" onClick={() => setConfirmDelete(true)}>Delete Product</button>
            </div>
          </div>
        </div>
        <div className="admProductDetail__info-section two">
          <h3 className="info-header">Description</h3>
          <div className="description">
            {productById.productInfo.description}
          </div>
        </div>
        <div className="admProductDetail__info-section three" ref={myRef}>
          {confirmUpdate && (
            <>
            <h2 className="info-header two">Update Product Information</h2>
            <AdminProductUpdate stateChanger={setConfirmUpdate} />
            </>
          )}
        </div>
      </section>
    )}
    </>
  )
}
export default AdminProductDetail;