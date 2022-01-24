import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCard, deleteCard } from '../../redux/actions/stripeActions';

const CardSelect = ({guest}) => {
  const dispatch = useDispatch();
  const paymentDetails = useSelector(state => state.stripe);
  const { cards } = paymentDetails;
  let [selected, setSelected] = useState('');
  let [removeSelect, setRemoveSelect] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const chooseCardHandler = (chosenCard) => {
    setSelected(selected = chosenCard.id);
    if (selected) {
      dispatch(setCard(selected));
    }
  };
  const deleteCardHandler = (value, removeVal = '') => {
    if (value) {
      setRemoveSelect(removeVal);
      setConfirmDelete(true);
    };
    if (!value) {
      setRemoveSelect(removeSelect = '');
      setConfirmDelete(false);
    };
  };
  const confirmCardDeleteHandler = (cardId) => {
    dispatch(deleteCard(cardId));
    setConfirmDelete(false);
  };

  return (
    <ul className="payments__card-list container">
      {cards?.data?.length > 0 ? (
        cards.data.map((indivCard, index) => (
          <li className="payments__card-list card" key={index}>
            <div className="payments__card-list card-info">
              <div className="payments__card-name">
                {indivCard.card.brand}
              </div>
              <div className="payments__card-digits">
                {indivCard.card.last4}
              </div>
            </div>
            <div className="payments__card-list card-options">
              <div className="payments__card-list choice" onClick={() => chooseCardHandler(indivCard)}>
                {confirmDelete ? (
                  <></>
                ) : selected === indivCard.id && !confirmDelete ? (
                  <>
                    Card Selected
                  </>
                ) : (
                  <>
                    Use Card
                  </>
                )}  
              </div>
              <div className="payments__card-list delete" >
                <div onClick={() => deleteCardHandler(true, indivCard.id)}>{!confirmDelete && (
                  <div className="remove">Remove</div>
                )}
                </div>
                <>
                {confirmDelete && removeSelect === indivCard.id && (
                  <div className="delete-list">
                    <p>Delete Card?</p>
                    <div className="yes" onClick={() => confirmCardDeleteHandler(indivCard.id)}>Yes</div>
                    <div className="no" onClick={() => deleteCardHandler(false)}>No</div>
                  </div>
                )}
                </>
              </div>
            </div>
          </li>
        ))
      ) : (
        <div className="">No cards found.</div>
      )}
      <div className="div">
        <input
          type="submit"
          value="Cancel"
          onClick={() => guest()}
        />
      </div>
    </ul>
  )
}
export default CardSelect;