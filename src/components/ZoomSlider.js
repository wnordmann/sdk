import React from 'react';
import {connect} from 'react-redux';
import * as zoomSliderActions from '../actions/ZoomSliderActions';
import ol from 'openlayers';
import debounce from  'debounce';
import Slider from 'material-ui/Slider';
import classNames from 'classnames';

/**
 * Horizontal slider to allow zooming the map. Make sure that the containing div has a size.
 *
 * ```xml
 * <ZoomSlider map={map} />
 * ```
 */
export class ZoomSlider extends React.PureComponent {
  static propTypes = {
    /**
     * Refresh rate in ms for handling changes from the slider.
     */
    refreshRate: React.PropTypes.number,
    /**
     * Style config.
     */
    style: React.PropTypes.object,
    /**
    * Css class name to apply on the root element of this component.
    */
    className: React.PropTypes.string,
    /**
     * The map to use, only if not provided by context
     */
    map: React.PropTypes.instanceOf(ol.Map)
  };

  static contextTypes = {
    map: React.PropTypes.instanceOf(ol.Map)
  }

  static defaultProps = {
    refreshRate: 100
  };

  constructor(props, context) {
    super(props);
    this.map = context.map || this.props.map;
    this._onChange = debounce(this._onChange, this.props.refreshRate);
  }
  componentDidMount() {
    this.map.getView().on('change:resolution', this._handleChangeResolution, this);
    this._handleChangeResolution();
  }
  componentWillUnmount() {
    this.map.getView().un('change:resolution', this._handleChangeResolution, this);
  }
  _handleChangeResolution() {
    this.props.getResolution(this._getValue(this.map.getView().getResolution()))
  }
  _getValue(resolution) {
    var view = this.map.getView();
    var maxResolution = view.getMaxResolution();
    var minResolution = view.getMinResolution();
    var max = Math.log(maxResolution / minResolution) / Math.log(2);
    return 1 - ((Math.log(maxResolution / resolution) / Math.log(2)) / max);
  }
  _onChange(evt, value) {
    var map = this.map;
    var view = map.getView();
    var maxResolution = view.getMaxResolution();
    var minResolution = view.getMinResolution();
    var max = Math.log(maxResolution / minResolution) / Math.log(2);
    var resolution = maxResolution / Math.pow(2, (1 - value) * max);
    view.setResolution(view.constrainResolution(resolution));
  }
  render() {
    return (
      <Slider style={this.props.style} className={classNames('sdk-component zoom-slider', this.props.className)} onChange={this._onChange.bind(this)} value={this.props.resolution} />
    );
  }
}

// Maps state from store to props
const mapStateToProps = (state) => {
  return {
    resolution: state.zoomSlider.resolution || 0
  }
};

// Maps actions to props
const mapDispatchToProps = (dispatch) => {
  return {
    getResolution: resolution => dispatch(zoomSliderActions.getResolution(resolution))
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ZoomSlider);
