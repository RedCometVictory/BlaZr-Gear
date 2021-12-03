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
  PRODUCT_CREATE_RESET,
  PRODUCT_UPDATE_REQUEST,
  PRODUCT_UPDATE_SUCCESS,
  PRODUCT_UPDATE_FAILURE,
  PRODUCT_UPDATE_RESET,
  PRODUCT_CREATE_REVIEW_REQUEST,
  PRODUCT_CREATE_REVIEW_SUCCESS,
  PRODUCT_CREATE_REVIEW_FAILURE,
  PRODUCT_CREATE_REVIEW_RESET,
  PRODUCT_UPDATE_REVIEW_REQUEST,
  PRODUCT_UPDATE_REVIEW_SUCCESS,
  PRODUCT_UPDATE_REVIEW_FAILURE,
  // PRODUCT_UPDATE_REVIEW_RESET,
  PRODUCT_DELETE_REVIEW_REQUEST,
  PRODUCT_DELETE_REVIEW_SUCCESS,
  PRODUCT_DELETE_REVIEW_FAILURE,
  PRODUCT_DELETE_REQUEST,
  PRODUCT_DELETE_SUCCESS,
  PRODUCT_DELETE_FAILURE
} from '../constants/productConstants';

const initialState = {
  productIds: [],
  productById: null,
  products: [],
  topProducts: [],
  categories: [],
  page: null,
  pages: null,
  loading: true,
  errors: []
}

const productReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case PRODUCT_ID_REQUEST:
      return {
        ...state,
        loading: true,
        productIds: []
      }
    case PRODUCT_CATEGORY_REQUEST:
      return {
        ...state,
        loading: true,
        categories: []
      }
    case PRODUCT_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        products: [],
        categories: []
      }
    case PRODUCT_TOP_REQUEST:
      return { ...state, loading: true, topProducts: [] }
    case PRODUCT_DETAILS_REQUEST:
      return { ...state, loading: true }
    case PRODUCT_CREATE_REQUEST:
    case PRODUCT_UPDATE_REQUEST:
    case PRODUCT_CREATE_REVIEW_REQUEST:
    case PRODUCT_UPDATE_REVIEW_REQUEST:
    case PRODUCT_DELETE_REVIEW_REQUEST:
    case PRODUCT_DELETE_REQUEST:
      return { ...state, loading: true }
    case PRODUCT_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: payload
      }
    case PRODUCT_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        productIds: payload
      }
    case PRODUCT_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        products: payload.products,
        pages: payload.pages,
        page: payload.page
      }
    case PRODUCT_TOP_SUCCESS:
      return { loading: false, topProducts: payload }
    case PRODUCT_DETAILS_SUCCESS:
      return { loading: false, productById: payload }
    case PRODUCT_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
      }
    case PRODUCT_UPDATE_SUCCESS:
      return {
        loading: false,
        // success: true,
        // product: payload
        productById: {
          productInfo: payload,
          productRating: {...state.productById.productRating},
          productReviews: [...state.productById.productReviews]
        }
      }
    case PRODUCT_DELETE_SUCCESS:
      return {
        ...state,
        loading: false
      }
    case PRODUCT_CREATE_REVIEW_SUCCESS:
      return {
        ...state,
        loading: false,
        productById: {
          productInfo: {...state.productById.productInfo},
          productRating: {...state.productById.productRating},
          productReviews: [payload, ...state.productById.productReviews]
        },
        success: true
      }
    case PRODUCT_UPDATE_REVIEW_SUCCESS:
      // let updatedReviews = state.productById.productReviews.map(review => review.id === payload.review_id ? review = payload.updatedReview : review);
      return {
        ...state,
        loading: false,
        productById: {
          productInfo: {...state.productById.productInfo},
          productRating: {...state.productById.productRating},
          productReviews: [...state.productById.productReviews.map(review => review.id === payload.id ? review = payload: review)]
        },
        // isSuccess: true
      }
    case PRODUCT_DELETE_REVIEW_SUCCESS:
      const reviewRemoved = state.productById.productReviews.filter(review => review.id !== payload.review_id);
      state.productById.productReviews = reviewRemoved;
      return {
       ...state,
       loading: false
      };
    case PRODUCT_UPDATE_RESET:
      return { product: {} }
    case PRODUCT_CREATE_RESET:
    case PRODUCT_CREATE_REVIEW_RESET:
      return {}
    case PRODUCT_ID_FAILURE:
      return { ...state, loading: false, errors: payload }
    case PRODUCT_CATEGORY_FAILURE:
    case PRODUCT_LIST_FAILURE:
    case PRODUCT_TOP_FAILURE:
    case PRODUCT_DETAILS_FAILURE:
    case PRODUCT_CREATE_FAILURE:
    case PRODUCT_UPDATE_FAILURE:
    case PRODUCT_CREATE_REVIEW_FAILURE:
    case PRODUCT_UPDATE_REVIEW_FAILURE:
    case PRODUCT_DELETE_REVIEW_FAILURE:
    case PRODUCT_DELETE_FAILURE:
      return { ...state, loading: false, errors: payload }
    default:
      return state;
  }
};
export default productReducer;