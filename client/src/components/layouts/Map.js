import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ReactMapGl, { Marker, Popup, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'
import Geocoder from "react-map-gl-geocoder";
import api from '../../utils/api';
import axios from "axios";
import Spinner from './Spinner';
import { shippingAddressForCart } from '../../redux/actions/cartActions';
import { setAlert } from '../../redux/actions/alertActions';

const defaultLocation = { lat: 30.265, lng: -97.724 }

const Map = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const userAuth = useSelector(state => state.auth);
  const cartDetails = useSelector(state => state.cart);
  const { userInfo, isAuthenticated } = userAuth;
  const { shippingAddress } = cartDetails;
  const [mapboxApiKey, setMapboxApiKey] = useState('');
  let [pin, setPin] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: defaultLocation.lat,
    longitude: defaultLocation.lng,
    width: "100vw",
    height: "30rem",
    zoom: 10
  });
  const [hasMounted, setHasMounted] = useState(false);
  let [fullname, setFullName] = useState(shippingAddress.fullname || '');
  let [fName, setFName] = useState(userInfo.f_name || '');
  let [lName, setLName] = useState(userInfo.l_name || '');
  let [email, setEmail] = useState(shippingAddress.email || '');

  let [address, setAddress] = useState(shippingAddress.address || '');
  let [zipcode, setZipcode] = useState(shippingAddress.zipcode || '');
  let [city, setCity] = useState(shippingAddress.city || '');
  let [state, setState] = useState(shippingAddress.state || '');
  let [country, setCountry] = useState(shippingAddress.country || '');
  let [lat, setLat] = useState(shippingAddress?.lat || '');
  let [lng, setLng] = useState(shippingAddress?.lng || '');

  const mapRef = useRef(null);

  useEffect(() => {
    const fetchMapboxApi = async () => {
      const { data } = await api.get('/config/mapbox');
      setMapboxApiKey(data);
    };
    fetchMapboxApi();
  }, []);

  useEffect(() => {
    setHasMounted(true);
  }, [dispatch]);

  if (!hasMounted) {
    return null;
  }
  const glStyle = {
    right: 10,
    top: 10
  };
  const markerStyle = {
    "color": "black",
    "cursor": "pointer"
  };

  const handleOnResult = e => {
    let result = e.result;
    let resAddress;
    if (result.place_type[0] === "postcode") {
      resAddress = result.place_name.split(',').map(elem => elem.trim());
      let stateZip = resAddress[1].split(" ");
      let coords = {lat: result.center[1], lng: result.center[0]};
      setAddress(address = address || "");
      setZipcode(stateZip[1]);
      setCity(resAddress[0]);
      setState(stateZip[0]);
      setCountry(resAddress[2]);
      setLat(result.center[1]);
      setLng(result.center[0]);
      setPin(pin = coords);
    } else if (result.place_type[0] === "address") { 
      resAddress = result.place_name.split(',').map(elem => elem.trim());
      let stateZip = resAddress[2].split(" ");
      let coords = {lat: result.center[1], lng: result.center[0]};
      setAddress(resAddress[0]);
      setZipcode(stateZip[1]);
      setCity(resAddress[1]);
      setState(stateZip[0]);
      setCountry(resAddress[3]);
      setLat(result.center[1]);
      setLng(result.center[0]);
      setPin(pin = coords);
    } else {
      dispatch(setAlert('Please search using zipcode or by street address', 'danger'));
    }
  };

  const onViewportChange = viewport => {
    setViewport({...viewport, transitionDuration: 1000})
  };

  const handleGeocoderViewportChange = viewport => {
    const geocoderDefaultOverrides = { transitionDuration: 1000 };

    // return setViewport({
    setViewport({
      ...viewport,
      ...geocoderDefaultOverrides
    });
  }

  let revGeoLocate = async (lng, lat) => {
    let slng = parseFloat(lng);
    let slat = parseFloat(lat);
    let fetch = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${slng},${slat}.json?types=postcode&access_token=${mapboxApiKey}`);

    let result = fetch.data;
    let placeType = result.features[0].place_type[0];
    let resAddress;
    if (placeType === "postcode") {
      resAddress = result.features[0].place_name.split(',').map(elem => elem.trim());
      let stateZip = resAddress[1].split(" ");

      let coords = {lat: lat, lng: lng};
      setPin(pin = coords);
      setAddress(address = address || '');
      setZipcode(stateZip[1]);
      setCity(resAddress[0]);
      setState(stateZip[0]);
      setCountry(resAddress[2]);
      setLat(lat);
      setLng(lng);
    }
  };

  const setAddPinHandler = (e) => {
    e.preventDefault();
    let [longitude, latitude] = e.lngLat
    revGeoLocate(longitude, latitude)
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      if (fullname === '' || !fullname) {
        let fullName = `${userInfo.f_name} ${userInfo.l_name}`;
        setFullName(fullname = fullName);
      }
      if (!email) {
        setEmail(email = userInfo.user_email);
      }
    }
    if (!isAuthenticated) {
      if (fullname === '' || !fullname) {
        let fullName = `${fName} ${lName}`;
        setFullName(fullname = fullName);
      }
    }
    dispatch(shippingAddressForCart({ fullname, email, address, zipcode, city, state, country, lat, lng }));
    history.push('/confirm-order');
  }

  return mapboxApiKey ? (
    <>
    <section className="map map-container">
      <div className="map__header">
        <h2>Map Search</h2>
      </div>
      <div className="map__description">
        <div className="">
          <p>Search for your address to confirm shipping location. Or double click on the map to set a location marker of your address.</p>
          <p>Its recommended that you search by street address for best results.</p>
        </div>
      </div>
      <div className="map__map">
        <ReactMapGl
          {...viewport}
          mapboxApiAccessToken={mapboxApiKey}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          // mapStyle="mapbox://styles/mapbox/streets-v9"
          // mapStyle="mapbox://styles/mapbox/dark-v8"
          // mapStyle="mapbox://styles/mapbox/outdoors-v11"
          // mapStyle="mapbox://styles/mapbox/light-v10"
          // mapStyle="mapbox://styles/mapbox/dark-v10"
          // mapStyle="mapbox://styles/mapbox/satellite-v9"
          // mapStyle="mapbox://styles/mapbox/satellite-streets-v11"
          // mapStyle="mapbox://styles/mapbox/navigation-preview-day-v4"
          // mapStyle="mapbox://styles/mapbox/navigation-preview-night-v4"
          // mapStyle="mapbox://styles/mapbox/navigation-guidance-day-v4"
          // mapStyle="mapbox://styles/mapbox/navigation-guidance-night-v4"
          width="100%"
          height="100%"
          onViewportChange={onViewportChange}
          ref={mapRef}
          onDblClick={setAddPinHandler}
        >
          <GeolocateControl
            style={glStyle}
            positionOptions={{enableHighAccuracy: true}}
            trackUserLocation={true}
            auto
          />
          <Geocoder 
            mapRef={mapRef}
            onResult={handleOnResult}
            onViewportChange={handleGeocoderViewportChange}
            mapboxApiAccessToken={mapboxApiKey}
            reverseGeocode={true}
            position='top-left'
          />
          {pin && (
            <>
            <Marker
              latitude={pin.lat ?? defaultLocation.lat}
              longitude={pin.lng ?? defaultLocation.lng}
            >
            </Marker>
            <Popup
              latitude={pin.lat ?? defaultLocation.lat}
              longitude={pin.lng ?? defaultLocation.lng}
              closeButton={true}
              closeOnClick={false}
              onClose={() => setPin(null)}
              anchor="left"
            >
              <div className="map__popup-box" style={markerStyle}>
                <div className="map__popup-header">
                  <h3>You are here.</h3>
                </div>
                <div className="map__popup-desc">
                  <div className="">Confirm your address in the form below.</div>
                </div>
              </div>
            </Popup>
            </>
          )}
        </ReactMapGl>
      </div>
    </section>
    <section className="">
      <form className="admForm" onSubmit={(e) => submitHandler(e)}>
        <div className="admForm__header prod-item">
          <h2 className="">Shipping Address</h2>
        </div>
        <div className="admForm__inner-container">
          <div className="admForm__section">
            <div className="admForm__group">
              <label htmlFor="address" className="admForm__label">Primary Shipping Address: </label>
              <input
                type="text"
                placeholder="111 N. Broadway Str."
                className=""
                name="address"
                onChange={e => setAddress(e.target.value)}
                value={address}
                required
              />
            </div>
            <div className="admForm__group">
              <label htmlFor="zipcode" className="admForm__label">Zipcode: </label>
              <input
                type="text"
                placeholder="52103"
                className=""
                name="zipcode"
                minLength="2"
                maxLength="5"
                pattern='[0-9]*'
                onChange={e => setZipcode(e.target.value)}
                value={zipcode}
                required
              />
            </div>
          </div>
          <div className="admForm__section">
            <div className="admForm__group">
              <label htmlFor="city" className="admForm__label">City: </label>
              <input
                type="text"
                placeholder="Atlanta"
                className=""
                name="city"
                onChange={e => setCity(e.target.value)}
                value={city}
                required
              />
            </div>
            <div className="admForm__group">
              <label htmlFor="state" className="admForm__label">State: </label>
              <input
                type="text"
                placeholder="Georgia"
                className=""
                name="state"
                minLength="2"
                onChange={e => setState(e.target.value)}
                value={state}
                required
              />
            </div>
            <div className="admForm__group">
              <label htmlFor="country" className="admForm__label">Country: </label>
              <input
                type="text"
                placeholder="United States"
                className=""
                name="country"
                minLength="2"
                onChange={e => setCountry(e.target.value)}
                value={country}
                required
              />
            </div>
          </div>
        </div>
        <div className="admForm__section">
          <div className="admForm__submit-update">
            <input type="submit" className="btn btn-primary btn-full-width admForm__submit" value="Submit Shipping Info" />
          </div>
        </div>
      </form>
    </section>
    </>
  ) : (
    <Spinner />
  )
}
export default Map;