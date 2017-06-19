import ZoomSliderView from './ZoomSliderView';
import {connect} from 'react-redux';
//import * as zoomSliderActions from '../actions/ZoomSliderActions';


// Maps state from store to props
const mapStateToProps = (state) => {
  return {
    //resolution: state.zoomSlider.resolution || 0
    mapStore: state.mapState || null
    //zoom: state.mapState.view ? state.mapState.view.zoom : 1
  }
};

// Maps actions to props
const mapDispatchToProps = (dispatch) => {
  return {
    //getResolutionValue: resolutionValue => dispatch(zoomSliderActions.getResolutionValue(resolutionValue))
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ZoomSliderView);
