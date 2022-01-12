import React, { useEffect, useState } from 'react';
import Payment from './Payment';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from '@stripe/stripe-js';
import api from '../../utils/api';

const PaymentContainer = () => {
  // let stripeRef = useRef(null);
  const [hasMounted, setHasMounted] = useState(false);
  let [stripeApiKey, setStripeApiKey] = useState('');
  useEffect(() => {
    let getStripeApiKey = async () => {
      let { data } = await api.get('/payment/get-stripe-key');
      setStripeApiKey(stripeApiKey = data.stripeApiKey);
    };
    getStripeApiKey();
  }, []);

  useEffect(() => {
      setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <>
    {stripeApiKey &&
      <Elements stripe={loadStripe(stripeApiKey)}>
        <Payment />
      </Elements>
    }
    </>
  )
}
export default PaymentContainer;