/* eslint-disable */

//dependencies
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  const stripe = Stripe(
    'pk_test_51KmJ3GCrw5ZzWe8vkWUUcRZCyKf95KiYXpEtKKNEO68lSkqsLUVWfeJeTS8iRRxHySSQziRisxSvK7UVnlGKkkgk00dTkW8hY0'
  );
  try {
    //1) getting checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    //2) creating checkout form + charging credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (error) {
    console.log(error);
    showAlert('error', err.response.data.message);
  }
};
