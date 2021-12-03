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
  SLIDE_CREATE_RESET,
  SLIDE_UPDATE_REQUEST,
  SLIDE_UPDATE_SUCCESS,
  SLIDE_UPDATE_FAILURE,
  SLIDE_UPDATE_RESET,
  SLIDE_DELETE_REQUEST,
  SLIDE_DELETE_SUCCESS,
  SLIDE_DELETE_FAILURE
} from '../constants/slideConstants';

const initialState = {
  slides: [],
  slide: {},
  loading: true,
  errors: [],
};

const slideReducer = (state = initialState, action) => {
  const { type, payload } = action;
  
  switch (type) {
    case SLIDE_LIST_REQUEST:
      return { loading: true, slides: [] }
    case SLIDE_LIST_DETAILS_REQUEST:
      return { ...state, loading: true}
    case SLIDE_CREATE_REQUEST:
    case SLIDE_UPDATE_REQUEST:
    case SLIDE_DELETE_REQUEST:
      return { ...state, loading: true }
    case SLIDE_LIST_SUCCESS:
      return {
        loading: false,
        slides: payload.slides
      }
    case SLIDE_LIST_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        slide: payload
      }
    case SLIDE_CREATE_SUCCESS:
      return {
        ...state,
        loading: false
      }
    case SLIDE_UPDATE_SUCCESS:
      return {
        loading: false,
        slide: {
          payload
          // slideInfo: payload
        }
      }
    case SLIDE_DELETE_SUCCESS:
      // may uncomment
      // const slideRemoved = state.slides.filter(slide => slide.id !== payload.id);
      // const slideRemoved = state.slides.filter(slide => slide.id !== payload.slide_id);
      // state.slides = slideRemoved;
      return {
        ...state,
        loading: false
      }
      /* delete from the slideshow
        return {
          ...state,
          loading: false,
          slides: state.slides.filter(slide => slide.id !== payload.id)
        }
      */
    case SLIDE_CREATE_RESET:
      return { slide: {} }
    case SLIDE_UPDATE_RESET:
      return { slide: {} }
    case SLIDE_LIST_FAILURE:
    case SLIDE_LIST_DETAILS_FAILURE:
    case SLIDE_CREATE_FAILURE:
    case SLIDE_UPDATE_FAILURE:
    case SLIDE_DELETE_FAILURE:
      return {
        ...state,
        loading: false,
        errors: payload
      }
    default:
      return state;
  }
};
export default slideReducer;