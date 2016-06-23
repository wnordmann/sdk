import React from 'react';
import ol from 'openlayers';
import debounce from  'debounce';
import Slider from 'material-ui/lib/slider';
import pureRender from 'pure-render-decorator';

/**
 * Horizontal slider to allow zooming the map.
 */
@pureRender
export default class ZoomSlider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._onChange = debounce(this._onChange, this.props.refreshRate);
  }
  componentDidMount() {
    this.props.map.getView().on('change:resolution', this._handleChangeResolution, this);
    this._handleChangeResolution();
  }
  componentWillUnmount() {
    this.props.map.getView().un('change:resolution', this._handleChangeResolution, this);
  }
  _handleChangeResolution() {
    this.setState({
      value: this._getValue(this.props.map.getView().getResolution())
    });
  }
  _getValue(resolution) {
    var fn = this.props.map.getView().getValueForResolutionFunction();
    return 1 - fn(resolution);
  }
  _onChange(evt, value) {
    var map = this.props.map;
    var view = map.getView();
    var fn = view.getResolutionForValueFunction();
    var resolution = fn(1 - value);
    view.setResolution(view.constrainResolution(resolution));
  }
  render() {
    return (
      <Slider onChange={this._onChange.bind(this)} value={this.state.value} />
    );
  }
}

ZoomSlider.propTypes = {
  /**
   * Refresh rate in ms for handling changes from the slider.
   */
  refreshRate: React.PropTypes.number,
  /**
   * The map to use.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired
};

ZoomSlider.defaultProps = {
  refreshRate: 100
};
