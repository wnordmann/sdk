/* global ol */
import React from 'react';
import Modals from 'pui-react-modals';

export default class AddLayer extends React.Component {
  openModal() {
   this.refs.modal.open();
  }
  closeModal() {
    this.refs.modal.close();
  }
  render() {
    return (
     <article>
       <button onClick={this.openModal.bind(this)}>Click to Open Modal</button>
       <Modals.Modal title="Modal Header Text" ref="modal">
         <Modals.ModalBody>Modal Body Text</Modals.ModalBody>
         <Modals.ModalFooter>
         </Modals.ModalFooter>
       </Modals.Modal>
     </article>
    );
  }
}
