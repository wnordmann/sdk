import React from 'react';
import ol from 'openlayers';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import Button from './Button';
import {Tabs, Tab} from 'material-ui/Tabs';
import classNames from 'classnames';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  west: {
    id: 'zoomtolatlon.west',
    description: 'Label for West direction',
    defaultMessage: 'West'
  },
  east: {
    id: 'zoomtolatlon.east',
    description: 'Label for East direction',
    defaultMessage: 'East'
  },
  north: {
    id: 'zoomtolatlon.north',
    description: 'Label for North direction',
    defaultMessage: 'North'
  },
  south: {
    id: 'zoomtolatlon.south',
    description: 'Label for South direction',
    defaultMessage: 'South'
  },
  modaltitle: {
    id: 'zoomtolatlon.modaltitle',
    description: 'Title for the modal dialog',
    defaultMessage: 'Zoom to latitude longitude'
  },
  ddtitle: {
    id: 'zoomtolatlon.ddtitle',
    description: 'Title for the decimal degrees tab',
    defaultMessage: 'Decimal degrees (DD)'
  },
  dmstitle: {
    id: 'zoomtolatlon.dmstitle',
    description: 'Title for the degrees minutes seconds tab',
    defaultMessage: 'Degrees minutes seconds (DMS)'
  },
  buttontext: {
    id: 'zoomtolatlon.buttontext',
    description: 'Text for the button',
    defaultMessage: 'Lat/Lon'
  },
  buttontitle: {
    id: 'zoomtolatlon.buttontitle',
    description: 'Title for the button',
    defaultMessage: 'Zoom to latitude / longitude coordinates'
  },
  directionlabel: {
    id: 'zoomtolatlon.directionlabel',
    description: 'Label for the direction select field',
    defaultMessage: 'Direction'
  },
  latitudelabel: {
    id: 'zoomtolatlon.latitudelabel',
    description: 'Label for the latitude input field',
    defaultMessage: 'Latitude'
  },
  degreeslabel: {
    id: 'zoomtolatlon.degreeslabel',
    description: 'Label for the degrees input field',
    defaultMessage: 'D'
  },
  minuteslabel: {
    id: 'zoomtolatlon.minuteslabel',
    description: 'Label for the minutes input field',
    defaultMessage: 'M'
  },
  secondslabel: {
    id: 'zoomtolatlon.secondslabel',
    description: 'Label for the seconds input field',
    defaultMessage: 'S'
  },
  longitudelabel: {
    id: 'zoomtolatlon.longitudelabel',
    description: 'Label for the longitude input field',
    defaultMessage: 'Longitude'
  },
  zoombuttontitle: {
    id: 'zoomtolatlon.zoombuttontitle',
    description: 'Title for zoom button',
    defaultMessage: 'Zoom to latitude / longitude'
  },
  zoombuttontext: {
    id: 'zoomtolatlon.zoombuttontext',
    description: 'Text for zoom button',
    defaultMessage: 'Zoom'
  },
  closebuttontext: {
    id: 'zoomtolatlon.closebuttontext',
    description: 'Text for close button',
    defaultMessage: 'Close'
  },
  closebuttontitle: {
    id: 'zoomtolatlon.closebuttontitle',
    description: 'Tooltip for close button',
    defaultMessage: 'Close dialog'
  }
});


/**
 * Component that allows zooming the map to a lat / lon position.
 */
@pureRender
class ZoomToLatLon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: 1,
      londirection: 'E',
      latdirection: 'N'
    };
  }
  openDialog() {
    this.setState({open: true});
  }
  closeDialog() {
    this.setState({open: false});
  }
  _dmsToDegrees(degrees, minutes, seconds, direction) {
    var dd = degrees + minutes / 60 + seconds / (60 * 60);
    if (direction === 'S' || direction === 'W') {
      dd = dd * -1;
    }
    return dd;
  }
  _zoomToLatLon() {
    var lat, lon;
    if (this.state.value === 1) {
      lat = parseFloat(this.refs.lat.getValue());
      lon = parseFloat(this.refs.lon.getValue());
    } else {
      lat = this._dmsToDegrees(
        parseFloat(this.refs.latd.getValue()),
        parseFloat(this.refs.latm.getValue()),
        parseFloat(this.refs.lats.getValue()),
        this.state.latdirection
      );
      lon = this._dmsToDegrees(
        parseFloat(this.refs.lond.getValue()),
        parseFloat(this.refs.lonm.getValue()),
        parseFloat(this.refs.lons.getValue()),
        this.state.londirection
      );
    }
    var view = this.props.map.getView();
    view.setCenter(ol.proj.fromLonLat([lon, lat], view.getProjection()));
    view.setZoom(this.props.zoom);
    this.closeDialog();
  }
  handleChange(value) {
    if (value === parseInt(value, 10)) {
      this.setState({
        value: value
      });
    }
  }
  _onNorthSouthChange(evt, idx, value) {
    this.setState({latdirection: value});
  }
  _onEastWestChange(evt, idx, value) {
    this.setState({londirection: value});
  }
  render() {
    const {formatMessage} = this.props.intl;
    var actions = [
      <Button buttonType='Flat' tooltip={formatMessage(messages.zoombuttontitle)} label={formatMessage(messages.zoombuttontext)} onTouchTap={this._zoomToLatLon.bind(this)} />,
      <Button buttonType='Flat' tooltip={formatMessage(messages.closebuttontitle)} label={formatMessage(messages.closebuttontext)} onTouchTap={this.closeDialog.bind(this)} />
    ];
    return (
      <Button {...this.props} className={classNames('sdk-component zoom-to-latlon', this.props.className)} onTouchTap={this.openDialog.bind(this)} label={formatMessage(messages.buttontext)} tooltip={formatMessage(messages.buttontitle)}>
        <Dialog actions={actions} open={this.state.open} autoScrollBodyContent={true} onRequestClose={this.closeDialog.bind(this)} modal={true} title={formatMessage(messages.modaltitle)}>
          <Tabs value={this.state.value} onChange={this.handleChange.bind(this)}>
            <Tab value={1} label={formatMessage(messages.ddtitle)} disableTouchRipple={true}>
              <TextField ref='lat' floatingLabelText={formatMessage(messages.latitudelabel)} /><br/>
              <TextField ref='lon' floatingLabelText={formatMessage(messages.longitudelabel)} />
            </Tab>
            <Tab value={2} label={formatMessage(messages.dmstitle)} disableTouchRipple={true}>
              <p>{formatMessage(messages.latitudelabel)}</p>
              <SelectField style={{top: -8, width: 100}} value={this.state.latdirection} onChange={this._onNorthSouthChange.bind(this)} floatingLabelText={formatMessage(messages.directionlabel)}>
                <MenuItem value='N' primaryText={formatMessage(messages.north)} />
                <MenuItem value='S' primaryText={formatMessage(messages.south)} />
              </SelectField>
              <TextField ref='latd' style={{width: 150}} floatingLabelText={formatMessage(messages.degreeslabel)} />
              <TextField ref='latm' style={{width: 150}} floatingLabelText={formatMessage(messages.minuteslabel)} />
              <TextField ref='lats' style={{width: 150}} floatingLabelText={formatMessage(messages.secondslabel)} />
              <br/>
              <p>{formatMessage(messages.longitudelabel)}</p>
              <SelectField style={{top: -8, width: 100}} value={this.state.londirection} onChange={this._onEastWestChange.bind(this)} floatingLabelText={formatMessage(messages.directionlabel)}>
                <MenuItem value='W' primaryText={formatMessage(messages.west)} />
                <MenuItem value='E' primaryText={formatMessage(messages.east)} />
              </SelectField>
              <TextField ref='lond' style={{width: 150}} floatingLabelText={formatMessage(messages.degreeslabel)} />
              <TextField ref='lonm' style={{width: 150}} floatingLabelText={formatMessage(messages.minuteslabel)} />
              <TextField ref='lons' style={{width: 150}} floatingLabelText={formatMessage(messages.secondslabel)} />
            </Tab>
          </Tabs>
        </Dialog>
      </Button>
    );
  }
}

ZoomToLatLon.propTypes = {
  /**
   * The map onto which to zoom.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * The zoom level used when centering the view.
   */
  zoom: React.PropTypes.number,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

ZoomToLatLon.defaultProps = {
  zoom: 14
};

export default injectIntl(ZoomToLatLon);
