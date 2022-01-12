import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';
import { createSlide } from '../../../redux/actions/slideActions';

const initialState = {title: '', image_url: '', description: '', theme: '', category: ''};

const AdminSlideCreate = () => {
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

  const { title, description, theme, category } = formProductData;

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
    dispatch(createSlide(formProductData, history));
  }

  return (
    <section className="">
      <form className="admForm" onSubmit={onSubmit} >
        <div className="admForm__header">
          <h2>Add Slide</h2>
          <div className="">
            <Link to='/admin/slide/list'>
              <div className="btn btn-secondary update-btn">
                Slide List
              </div>
            </Link>
          </div>
        </div>
        <div className="admForm__section create-form">
          <div className="admForm__group">
            <label htmlFor="image_url" className="admForm_label">
              Slideshow Image
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
              <img className="admForm__img create-form" src={imageData} alt="Uploaded Slide" />
            </div>
          )}
        </div>
        <div className="admForm__inner-container">
          <div className="admForm__section">
            <div className="admForm__group">
              <label htmlFor="title" className="admForm__label">Title: </label>
              <input
                type="text"
                placeholder="Summer Camping Gear"
                className=""
                name="title"
                onChange={e => onChange(e)}
                value={title}
                maxLength="40"
              />
            </div>
            <div className="admForm__group">
              <label htmlFor="theme" className="admForm__label">Theme: </label>
              <input
                type="text"
                placeholder="Fall Clothing"
                className=""
                name="theme"
                onChange={e => onChange(e)}
                value={theme}
                maxLength="40"
              />
            </div>
            <div className="admForm__group">
              <label htmlFor="category" className="admForm__label">Category: </label>
              <select name="category" value={category} onChange={e => onChange(e)}>
                <option>Select Category (optional)</option>
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
        </div>
        <div className="admForm__section">
          <div className="admForm__group">
            <textarea
              name="description"
              cols="30"
              rows="5"
              placeholder="Add description of slide"
              onChange={e => onChange(e)}
              value={description}
              maxLength="120"
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
              <input className="btn-full-width admForm__submit" value="Uploading Slide..." readOnly/>
            </div>
          ) : (
            <div className="admForm__submit-update">
              <input type="submit" className="btn btn-primary btn-full-width" value="Create Slide" />
            </div>
          )}
        </div>
      </form>
    </section>
  )
}
export default AdminSlideCreate;