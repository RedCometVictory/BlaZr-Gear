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

const initialState = {
  images: [],
  image: {},
  page: null,
  pages: null,
  loading: true,
  errors: {},
};

const imageReducer = (state = initialState, action) => {
  const { type, payload } = action;
  
  switch (type) {
    case IMAGE_LIST_REQUEST:
      return { loading: true, images: [] }
    case IMAGE_LIST_DETAILS_REQUEST:
      return { ...state, loading: true}
    case IMAGE_DELETE_REQUEST:
      return { ...state, loading: true }
    case IMAGE_LIST_SUCCESS:
      return {
        loading: false,
        images: payload.images,
        pages: payload.pages,
        page: payload.page
      }
    case IMAGE_LIST_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        image: payload
      }
    case IMAGE_DELETE_SUCCESS:
      // may uncomment
      // const imageRemoved = state.images.filter(image => image.id !== payload.id);
      // const imageRemoved = state.images.filter(image => image.id !== payload.image_id);
      // state.images = imageRemoved;
      return {
        ...state,
        loading: false
      }
    case IMAGE_LIST_FAILURE:
    case IMAGE_LIST_DETAILS_FAILURE:
    case IMAGE_DELETE_FAILURE:
      return {
        ...state,
        loading: false,
        errors: payload
      }
    default:
      return state;
  }
};
export default imageReducer;