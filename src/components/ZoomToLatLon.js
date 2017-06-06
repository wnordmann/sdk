import ZoomToLatLonView from './ZoomToLatLonView';
import {connect} from 'react-redux';
import * as zoomToLatLonActions from '../actions/ZoomToLatLonActions';

// Maps state from store to props
const mapStateToProps = (state) => {
  return {
    open: state.zoomToLatLon.dialogIsOpen
  }
};

// Maps actions to props
const mapDispatchToProps = (dispatch) => {
  return {
    openDialog: () => dispatch(zoomToLatLonActions.openDialog()),
    closeDialog: () => dispatch(zoomToLatLonActions.closeDialog())
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(ZoomToLatLonView);
