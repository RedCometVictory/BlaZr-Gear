import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateSlide } from '../../../redux/actions/slideActions';
import Spinner from '../../layouts/Spinner';

const initialState = {title: '', image_url: '', description: '', theme: '', category: ''};

const AdminSlideUpdate = ({stateChanger}) => {
  const { slide_id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const slideDetail = useSelector(state => state.slide);
  const { loading, slide } = slideDetail;
  const [hasMounted, setHasMounted] = useState(false);
  const [formProductData, setFormProductData] = useState(initialState);
  const [fileTypeError, setFileTypeError] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    setFormProductData({ // on comp load
      title: loading || !slide ? '' : slide.title,
      image_url: loading || !slide ? '' : slide.image_url,
      description: loading || !slide ? '' : slide.description,
      theme: loading || !slide ? '' : slide.theme,
      category: loading || !slide ? '' : slide.category
    })
  }, [dispatch, loading]);

  const fileInputText = useRef();

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
    dispatch(updateSlide(slide_id, formProductData, history));
    fileInputText.current.value = ""; // upon submit clear field for image file upload
    stateChanger(false);
  }

  return loading ? (
    <Spinner />
  ) : (
    <section className="">
      <form className="admForm" onSubmit={onSubmit} >
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
          <div className="admForm__section prod-image">
            <div className="admForm__group">
              <label htmlFor="image_url" className="admForm_label">
                Slide Image
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
                <img className="admForm__img" src={imageData} alt="Uploaded Slide" />
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
              placeholder="Update slide description"
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
          ) : (
            <div className="admForm__submit-update">
              <input type="submit" className="btn btn-primary btn-full-width admForm__submit" value="Submit Slide Update" />
            </div>
          )}
        </div>
      </form>
    </section>
  );
};
export default AdminSlideUpdate;