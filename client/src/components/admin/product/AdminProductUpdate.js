import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateProduct } from '../../../redux/actions/productActions';
import Spinner from '../../layouts/Spinner';

const initialState = {name: '', image_url: '', brand: '', category: '', description: '', price: '', count_in_stock: ''};

const AdminProductUpdate = ({stateChanger}) => {
  const { prod_id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const productDetail = useSelector(state => state.product);
  const { loading, productById } = productDetail;
  const [hasMounted, setHasMounted] = useState(false);
  const [formProductData, setFormProductData] = useState(initialState);
  const [fileTypeError, setFileTypeError] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    setFormProductData({
      name: loading || !productById ? '' : productById.productInfo.name,
      image_url: loading || !productById ? '' : productById.productInfo.product_image_url,
      brand: loading || !productById ? '' : productById.productInfo.brand,
      category: loading || !productById ? '' : productById.productInfo.category,
      description: loading || !productById ? '' : productById.productInfo.description,
      price: loading || !productById ? '' : productById.productInfo.price,
      count_in_stock: loading || !productById ? '' : productById.productInfo.count_in_stock
    })
  }, [dispatch, loading]);

  const fileInputText = useRef();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const { name, brand, category, description, price, count_in_stock } = formProductData;

  const onChange = e => setFormProductData({ ...formProductData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    // check file type
    let fileToUpload = e.target.files[0];
    checkFileType(fileToUpload);
    // check file size
    checkFileSize(fileToUpload);

    setFormProductData({
      ...formProductData,
      [e.target.name]: e.target.files[0]
    });
    // * set up image preview, if valid
    if (fileToUpload) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageData(reader.result)
      });
      reader.readAsDataURL(fileToUpload);
    }
    // *--------------------
  };

  // check file type
  const checkFileType = (img) => {
    const types = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
    if (types.every(type => img.type !== type)) {
      return setFileTypeError(true);
    }
    return setFileTypeError(false);
  }

  const checkFileSize=(img)=>{
    let size = 3 * 1024 * 1024; // size limit 3mb
    if (img.size > size) {
      return setFileSizeError(true);
    }
    return setFileSizeError(false);
  }

  const onSubmit = e => {
    e.preventDefault();
    dispatch(updateProduct(prod_id, formProductData, history));
    fileInputText.current.value = ""; // upon submit clear field for image file upload
    stateChanger(false);
  }

  return (
    <>
    {loading ? (
      <Spinner />
    ) : (
      <section className="">
        <form className="admForm" onSubmit={onSubmit} >
          <div className="admForm__inner-container">
            <div className="admForm__section">
              <div className="admForm__group">
                <label htmlFor="name" className="admForm__label">Name: </label>
                <input
                  type="text"
                  placeholder="Skechers Shoes - Men"
                  className=""
                  name="name"
                  maxLength={110}
                  onChange={e => onChange(e)}
                  value={name}
                />
              </div>
              <div className="admForm__group">
                <label htmlFor="brand" className="admForm__label">Brand: </label>
                <input
                  type="text"
                  placeholder="Skechers"
                  className=""
                  name="brand"
                  maxLength={255}
                  onChange={e => onChange(e)}
                  value={brand}
                />
              </div>
              <div className="admForm__group">
                <label htmlFor="category" className="admForm__label">Category: </label>
                <select name="category" value={category} onChange={e => onChange(e)}>
                  <option value="Video Games">Video Games</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Sneakers">Sneakers</option>
                  <option value="Sports">Sports</option>
                  <option value="Camping">Camping</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Laptops">Laptops</option>
                  <option value="Clothes">Clothes</option>
                </select>
              </div>
            </div>
            <div className="admForm__section">
              <div className="admForm__group">
                <label htmlFor="price" className="admForm__label">Price: </label>
                <input
                  type="number"
                  placeholder="70.00"
                  className=""
                  name="price"
                  step="0.01"
                  onChange={e => onChange(e)}
                  value={price}
                />
              </div>
              <div className="admForm__group">
                <label htmlFor="count_in_stock" className="admForm__label">Stock Count of Product: </label>
                <input
                  type="number"
                  placeholder="10"
                  className=""
                  name="count_in_stock"
                  min={0}
                  onChange={e => onChange(e)}
                  value={count_in_stock}
                />
              </div>
            </div>
            <div className="admForm__section prod-image">
              <div className="admForm__group">
                <label htmlFor="image_url" className="admForm_label">
                  Product Image
                </label>
                <input
                  type="file"
                  accept=".jpeg, .jpg, .png, .gif"
                  placeholder=".jpeg, .jpg, .png, .gif formats only"
                  className="file-btn-input file-slim"
                  name="image_url"
                  onChange={handleImageChange}
                  ref={fileInputText}
                />
              </div>
              {imageData && (
                <div className="admForm__image">
                  <img className="admForm__img" src={imageData} alt="Uploaded Product" />
                </div>
              )}
            </div>
          </div>
          <div className="admForm__section">
            <div className="admForm__group">
              <textarea
                name="description"
                cols="30"
                rows="5"
                placeholder="Create a post"
                onChange={e => onChange(e)}
                value={description}
                required
              ></textarea>
            </div>
          </div>
          <div className="admForm__section">
            {fileTypeError || fileSizeError ? (
              <div className="admForm__error">
                File type or size limit exceeded: jpg, jpeg, png, gif only and size must be less than 3mb.
              </div>
            ) : (
              <div className="admForm__submit-update">
                <input type="submit" className="btn btn-primary btn-full-width admForm__submit" value="Submit Product Update" />
              </div>
            )}
          </div>
        </form>
      </section>
    )}
    </>
  );
};
export default AdminProductUpdate;