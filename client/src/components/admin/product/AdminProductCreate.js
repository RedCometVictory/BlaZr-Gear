import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { createProduct } from '../../../redux/actions/productActions';

const initialState = {name: '', image_url: '', brand: '', category: '', description: '', price: '', count_in_stock: ''};

const AdminProductCreate = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [hasMounted, setHasMounted] = useState(false);
  const [formProductData, setFormProductData] = useState(initialState);
  const [fileTypeError, setFileTypeError] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [showImageData, isShowImageData] = useState(false);

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
        isShowImageData(true);
      });
      reader.readAsDataURL(fileToUpload);
    }
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
    setUploadingImage(true);
    dispatch(createProduct(formProductData, history));
  }

  return (
    <section className="">
      <form className="admForm" onSubmit={onSubmit} >
        <h2 className="admForm__header prod-item">Create Product</h2>
        <div className="admForm__section create-form">
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
              required
            />
          </div>
          {imageData && (
            <div className="admForm__show">
              <div className="btn btn-secondary" onClick={() => isShowImageData(true)}>Show Preview</div>
              <div className="btn btn-secondary" onClick={() => isShowImageData(false)}>Hide Preview</div>
            </div>
          )}
          {imageData && showImageData && (
            <div className="admForm__image create-form">
              <img className="admForm__img create-form" src={imageData} alt="Uploaded Product" />
            </div>
          )}
        </div>
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
                required
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
                required
              />
            </div>
            <div className="admForm__group">
              <label htmlFor="category" className="admForm__label">Category: </label>
              <select name="category" value={category} onChange={e => onChange(e)} required>
                <option value="">Select Category</option>
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
                // min={1}
                step="0.01"
                onChange={e => onChange(e)}
                value={price}
                required
              />
            </div>
            <div className="admForm__group">
              <label htmlFor="count_in_stock" className="admForm__label">Stock Count of Product: </label>
              <input
                type="number"
                placeholder="10"
                className=""
                name="count_in_stock"
                min={1}
                onChange={e => onChange(e)}
                value={count_in_stock}
                required
              />
            </div>
          </div>
        </div>
        <div className="admForm__section">
          <div className="admForm__group">
            <textarea
              name="description"
              cols="30"
              rows="5"
              placeholder="Add description of product"
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
          ) : uploadingImage ? (
            <div className="admForm__submit-update">
              <input className="btn-full-width admForm__submit" value="Uploading Product..." readOnly/>
            </div>
          ) : (
            <div className="admForm__submit-update">
              <input type="submit" className="btn btn-primary btn-full-width" value="Create Product" />
            </div>
          )}
        </div>
      </form>
    </section>
  )
}
export default AdminProductCreate;