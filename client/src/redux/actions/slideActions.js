import api from '../../utils/api';
import { setAlert } from './alertActions';
import {
  SLIDE_LIST_REQUEST,
  SLIDE_LIST_SUCCESS,
  SLIDE_LIST_FAILURE,
  SLIDE_LIST_DETAILS_REQUEST,
  SLIDE_LIST_DETAILS_SUCCESS,
  SLIDE_LIST_DETAILS_FAILURE,
  SLIDE_CREATE_REQUEST,
  SLIDE_CREATE_SUCCESS,
  SLIDE_CREATE_FAILURE,
  // SLIDE_CREATE_RESET,
  SLIDE_UPDATE_REQUEST,
  SLIDE_UPDATE_SUCCESS,
  SLIDE_UPDATE_FAILURE,
  // SLIDE_UPDATE_RESET,
  SLIDE_DELETE_REQUEST,
  SLIDE_DELETE_SUCCESS,
  SLIDE_DELETE_FAILURE
} from '../constants/slideConstants';

import createUpdateSlideShowForm from '../../utils/formDataServices';

export const getAllSlides = () => async dispatch => {
  try {
    dispatch({type: SLIDE_LIST_REQUEST});
    const res = await api.get(`/slides/all`);

    dispatch({
      type: SLIDE_LIST_SUCCESS,
      payload: res.data.data
    })
  } catch (err) {
    dispatch(setAlert('Failed to retrieve slideshow.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: SLIDE_LIST_FAILURE});
  }
};

export const getSlideDetails = (slide_id) => async dispatch => {
  try {
    dispatch({type: SLIDE_LIST_DETAILS_REQUEST});
    const res = await api.get(`/slides/${slide_id}`);
    let result = res.data.data.slideInfo;

    dispatch({
      type: SLIDE_LIST_DETAILS_SUCCESS,
      payload: result
    })
  } catch (err) {
    dispatch(setAlert('Failed to list slide details.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: SLIDE_LIST_DETAILS_FAILURE});
  }
};

export const createSlide = (slideForm, history) => async dispatch => {
  try {
    let servicedData = await createUpdateSlideShowForm(slideForm);
    dispatch({type: SLIDE_CREATE_REQUEST});

    await api.post(`/slides/add`, servicedData);
    dispatch({
      type: SLIDE_CREATE_SUCCESS
    })

    dispatch(setAlert('Created slide.', 'success'));
    history.push('/admin/slide/list');
  } catch (err) {
    dispatch(setAlert('Failed to create slide.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: SLIDE_CREATE_FAILURE});
  }
};

export const updateSlide = (slide_id, slideForm, history) => async dispatch=> {
  try {
    let servicedData = await createUpdateSlideShowForm(slideForm);
    dispatch({type: SLIDE_UPDATE_REQUEST});

    const res = await api.put(`/slides/${slide_id}/update`, servicedData);
    let result = res.data.data.slide;

    dispatch({
      type: SLIDE_UPDATE_SUCCESS,
      payload: result
    })

    dispatch(setAlert('Updated slide.', 'success'));
    history.push('/admin/slide/list');
  } catch (err) {
    dispatch(setAlert('Failed to update slide.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: SLIDE_UPDATE_FAILURE});
  }
};

export const deleteSlide = (slide_id, history) => async dispatch => {
  try {
    dispatch({type: SLIDE_DELETE_REQUEST});
    await api.delete(`/slides/${slide_id}`);
    
    dispatch({
      type: SLIDE_DELETE_SUCCESS
    })

    dispatch(setAlert('Deleted slide.', 'success'));
    history.push('/admin/slide/list');
  } catch (err) {
    dispatch(setAlert('Failed to delete slide.', 'danger'));
    const errors = err.response.data.errors;
    
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({type: SLIDE_DELETE_FAILURE});
  }
};