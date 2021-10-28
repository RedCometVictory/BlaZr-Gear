import api from '../../utils/api';
import { setAlert } from './alertActions';
import {
  IMAGE_LIST_REQUEST,
  IMAGE_LIST_SUCCESS,
  IMAGE_LIST_FAILURE,
  IMAGE_LIST_DETAILS_REQUEST,
  IMAGE_LIST_DETAILS_SUCCESS,
  IMAGE_LIST_DETAILS_FAILURE,
  IMAGE_DELETE_REQUEST,
  IMAGE_DELETE_SUCCESS,
  IMAGE_DELETE_FAILURE
} from '../constants/imageConstants';

export const getAllImages = (pageNumber, itemsPerPage) => async dispatch => {
  try {
    console.log("ACTION: retrieving all images");
    dispatch({type: IMAGE_LIST_REQUEST});
    const res = await api.get(`/images/all?pageNumber=${pageNumber}&offsetItems=${itemsPerPage}`);
    
    dispatch({
      type: IMAGE_LIST_SUCCESS,
      payload: res.data.data
    })
  } catch (err) {
    dispatch(setAlert('Failed to retrieve images.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: IMAGE_LIST_FAILURE});
  }
};

export const getImageDetails = (image_id) => async dispatch => {
  try {
    console.log("ACTION: image details")
    console.log(image_id)
    dispatch({type: IMAGE_LIST_DETAILS_REQUEST});
    const res = await api.get(`/images/${image_id}`);
    let result = res.data.data.image;
    console.log("result")
    console.log(result)
    dispatch({
      type: IMAGE_LIST_DETAILS_SUCCESS,
      payload: result
    })
  } catch (err) {
    dispatch(setAlert('Failed to list image details.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: IMAGE_LIST_DETAILS_FAILURE});
  }
};

export const deleteImage = (image_id, history) => async dispatch => {
  console.log("===ACTION: deleting image ===");
  console.log(image_id);
  try {
    dispatch({type: IMAGE_DELETE_REQUEST});
    await api.delete(`/images/${image_id}`);
    
    dispatch({
      type: IMAGE_DELETE_SUCCESS
    })

    dispatch(setAlert('Deleted image.', 'success'));
    history.push('/admin/image/list');
  } catch (err) {
    dispatch(setAlert('Failed to deleste image.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: IMAGE_DELETE_FAILURE});
  }
};