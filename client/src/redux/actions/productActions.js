import api from '../../utils/api';
import { setAlert } from './alertActions';
import {
  PRODUCT_ID_REQUEST,
  PRODUCT_ID_SUCCESS,
  PRODUCT_ID_FAILURE,
  PRODUCT_CATEGORY_REQUEST,
  PRODUCT_CATEGORY_SUCCESS,
  PRODUCT_CATEGORY_FAILURE,
  PRODUCT_LIST_REQUEST,
  PRODUCT_LIST_SUCCESS,
  PRODUCT_LIST_FAILURE,
  PRODUCT_TOP_REQUEST,
  PRODUCT_TOP_SUCCESS,
  PRODUCT_TOP_FAILURE,
  PRODUCT_DETAILS_REQUEST,
  PRODUCT_DETAILS_SUCCESS,
  PRODUCT_DETAILS_FAILURE,
  PRODUCT_CREATE_REQUEST,
  PRODUCT_CREATE_SUCCESS,
  PRODUCT_CREATE_FAILURE,
  // PRODUCT_CREATE_RESET,
  PRODUCT_UPDATE_REQUEST,
  PRODUCT_UPDATE_SUCCESS,
  PRODUCT_UPDATE_FAILURE,
  // PRODUCT_UPDATE_RESET,
  PRODUCT_CREATE_REVIEW_REQUEST,
  PRODUCT_CREATE_REVIEW_SUCCESS,
  PRODUCT_CREATE_REVIEW_FAILURE,
  // PRODUCT_CREATE_REVIEW_RESET,
  PRODUCT_UPDATE_REVIEW_REQUEST,
  PRODUCT_UPDATE_REVIEW_SUCCESS,
  PRODUCT_UPDATE_REVIEW_FAILURE,
  // PRODUCT_UPDATE_REVIEW_RESET,
  PRODUCT_DELETE_REVIEW_REQUEST,
  PRODUCT_DELETE_REVIEW_SUCCESS,
  PRODUCT_DELETE_REVIEW_FAILURE,
  // PRODUCT_DELETE_REVIEW_RESET,
  PRODUCT_DELETE_REQUEST,
  PRODUCT_DELETE_SUCCESS,
  PRODUCT_DELETE_FAILURE

} from '../constants/productConstants';
import { createProductForm, updateProductForm } from '../../utils/formDataServices';

export const getAllProductIds = () => async dispatch => {
  try {
    // console.log("ACTION: list all product ids");
    dispatch({type: PRODUCT_ID_REQUEST});

    const res = await api.get(`/products/product-ids`);
    
    dispatch({
      type: PRODUCT_ID_SUCCESS,
      payload: res.data.data.productIds
    })
  } catch (err) {
    dispatch(setAlert('Failed to list product ids.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: PRODUCT_ID_FAILURE});
  }
};

export const listAllCategories = () => async dispatch => {
  try {
    // console.log("ACTION: list all categories");
    dispatch({type: PRODUCT_CATEGORY_REQUEST});

    const res = await api.get(`/products/categories`);
    
    dispatch({
      type: PRODUCT_CATEGORY_SUCCESS,
      payload: res.data.data.categories
    })
  } catch (err) {
    dispatch(setAlert('Failed to list categories.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: PRODUCT_CATEGORY_FAILURE});
  }
};

// keyword & pageNumber assigned '' as default
export const listAllProducts = (keyword = '', category = '', pageNumber, itemsPerPage) => async dispatch => {
  try {
    console.log("ACTION: list all products");
    console.log(keyword);
    console.log(pageNumber);
    console.log(itemsPerPage);
    dispatch({type: PRODUCT_LIST_REQUEST});
    // const res = await api.get(`/products?keyword=${keyword}&pageNumber=${pageNumber}&offsetItems=${itemsPerPage}`);
    const res = await api.get(`/products?keyword=${keyword}&category=${category}&pageNumber=${pageNumber}&offsetItems=${itemsPerPage}`);
    
    dispatch({
      type: PRODUCT_LIST_SUCCESS,
      payload: res.data.data
    })
  } catch (err) {
    dispatch(setAlert('Failed to list all products.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: PRODUCT_LIST_FAILURE});
  }
};

// keyword & pageNumber assigned '' as default
export const listTopProducts = () => async dispatch => {
  try {
    dispatch({type: PRODUCT_TOP_REQUEST});
    const res = await api.get(`/products/top`);
    
    dispatch({
      type: PRODUCT_TOP_SUCCESS,
      payload: res.data.data.topProducts
    })
  } catch (err) {
    dispatch(setAlert('Failed to list top products.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: PRODUCT_TOP_FAILURE});
  }
};

// keyword & pageNumber assigned '' as default
export const listProductDetails = (prod_id) => async dispatch => {
  try {
    console.log("ACTION: prod_id")
    console.log(prod_id)
    dispatch({type: PRODUCT_DETAILS_REQUEST});
    const res = await api.get(`/products/${prod_id}`);
    let result = res.data.data;
    console.log("result")
    console.log(result)
    dispatch({
      type: PRODUCT_DETAILS_SUCCESS,
      payload: result
    })
  } catch (err) {
    dispatch(setAlert('Failed to list product details.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: PRODUCT_DETAILS_FAILURE});
  }
};

// keyword & pageNumber assigned '' as default
export const createProduct = (productForm, history) => async dispatch => {
  try {
    let servicedData = await createProductForm(productForm);
    dispatch({type: PRODUCT_CREATE_REQUEST});

    // const res = await api.post(`/products`, servicedData);
    await api.post(`/products`, servicedData);
    // let result = res.data.data.productInfo;
    
    dispatch({
      type: PRODUCT_CREATE_SUCCESS,
      // payload: result
    })

    dispatch(setAlert('Created product.', 'success'));
    history.push('/admin/product-list');
  } catch (err) {
    dispatch(setAlert('Failed to create product.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: PRODUCT_CREATE_FAILURE});
  }
};

// keyword & pageNumber assigned '' as default
export const createProductReview = (prod_id, reviewForm) => async dispatch => {
  try {
    dispatch({type: PRODUCT_CREATE_REVIEW_REQUEST});
    console.log("+++Action creating nrw review+++");
    console.log(`${prod_id} + `);
    console.log("reviewForm");
    console.log("----------");
    console.log(reviewForm);
    const res = await api.post(`/products/${prod_id}/reviews`, reviewForm);
    console.log("after creating attempt")
    let result = res.data.data.review;
    console.log(result);

    dispatch({
      type: PRODUCT_CREATE_REVIEW_SUCCESS,
      payload: result
    })
  } catch (err) {
    dispatch(setAlert('Your review already exists. Failed to create product review.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: PRODUCT_CREATE_REVIEW_FAILURE});
  }
};

export const updateProductReview = (prod_id, review_id, reviewForm) => async dispatch => {
  try {
    console.log("===ACTION: updating review===");
    console.log(prod_id);
    console.log(review_id);
    console.log(reviewForm);
    dispatch({type: PRODUCT_UPDATE_REVIEW_REQUEST});
    
    const res = await api.put(`/products/${prod_id}/reviews/${review_id}`, reviewForm);
    let result = res.data.data.updatedReview;

    dispatch({
      type: PRODUCT_UPDATE_REVIEW_SUCCESS,
      payload: result
    })
  } catch (err) {
    dispatch(setAlert('Failed to update product review.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: PRODUCT_UPDATE_REVIEW_FAILURE});
  }
};

export const deleteProductReview = (prod_id, review_id) => async dispatch => {
  try {
    dispatch({type: PRODUCT_DELETE_REVIEW_REQUEST});
    
    await api.delete(`/products/${prod_id}/reviews/${review_id}`);
    // let result = res.data.data.review;

    dispatch({
      type: PRODUCT_DELETE_REVIEW_SUCCESS,
      payload: {prod_id, review_id}
    })
    dispatch(setAlert('Product review removed.', 'success'));
  } catch (err) {
    dispatch(setAlert('Failed to delete product review.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: PRODUCT_DELETE_REVIEW_FAILURE});
  }
};

// keyword & pageNumber assigned '' as default
export const updateProduct = (prod_id, productForm, history) => async dispatch => {
  try {
    let servicedData = await updateProductForm(productForm);
    dispatch({type: PRODUCT_UPDATE_REQUEST});

    const res = await api.put(`/products/${prod_id}`, servicedData);
    let result = res.data.data.productInfo;
    
    dispatch({
      type: PRODUCT_UPDATE_SUCCESS,
      // payload: res.data.data.productInfo
      payload: result
    })

  } catch (err) {
    dispatch(setAlert('Failed to update product.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: PRODUCT_UPDATE_FAILURE});
  }
};

// keyword & pageNumber assigned '' as default
export const deleteProduct = (prod_id, history) => async dispatch => {
    console.log("===ACTION: deleting product ===");
    console.log(prod_id);
    console.log("===============================");
    
  try {
    dispatch({type: PRODUCT_DELETE_REQUEST});
    await api.delete(`/products/${prod_id}`);
    
    dispatch({
      type: PRODUCT_DELETE_SUCCESS
    })

    dispatch(setAlert('Deleted product.', 'success'));
    history.push('/admin/product-list');
  } catch (err) {
    dispatch(setAlert('Failed to delete product.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: PRODUCT_DELETE_FAILURE});
  }
};