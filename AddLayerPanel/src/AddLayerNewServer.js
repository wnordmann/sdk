import React, {Component} from 'react';
import { List, ListItem, Checkbox, Divider, TextField, Toggle, Subheader, SelectField, MenuItem, Menu } from 'material-ui';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import IconMenu from 'material-ui/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import NavigationArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import Picker from './picker.js';

/**
 * A simple example of `AppBar` with an icon on the right.
 * By default, the left icon is a navigation-menu.
 */


class AppBarExampleIcon extends Component {

  state = {
    open: false,
  };

  handleToggle = () => {
    this.setState({
      open: !this.state.open,
    });
  };

  handleNestedListToggle = (item) => {
    this.setState({
      open: item.state.open,
    });
  };

  state = {
    value: 1,
  };

  handleChange = (event, index, value) => this.setState({value});
  render () {
    var listStyle = {
      padding: '0px 16px',
      marginLeft: 0
    };
    var boxStyle = {
      marginLeft: 0
    };
    var noPadding = {
      padding: 0
    };
  return (
    <div>
      <div className="noBorderPaper">
        <TextField
          hintText="Name your layer"
          floatingLabelText="Name your layer"
          fullWidth={true}
        />
        <SelectField
          floatingLabelText="Select layer source"
          value={this.state.value}
          onChange={this.handleChange}
          fullWidth={true}
        >
          <MenuItem value={3} primaryText="GeoServer" />
          <MenuItem value={2} primaryText="Local" />
          <MenuItem value={1} primaryText="New GeoServer" />
        </SelectField>
        <TextField
          floatingLabelFixed={true}
          hintText="Enter GeoServer name"
          floatingLabelText="GeoServer name"
          fullWidth={true}
        />
        <TextField
          floatingLabelFixed={true}
          hintText="Enter GeoServer URL"
          floatingLabelText="GeoServer URL"
          fullWidth={true}
        />
        <SelectField
          floatingLabelText="Select layer"
          value={this.state.value}
          onChange={this.handleChange}
          fullWidth={true}
        >
          <MenuItem value={1} primaryText="Layer One" />
          <MenuItem value={2} primaryText="Layer Two" />
          <MenuItem value={3} primaryText="Layer Three" />
        </SelectField>
        <TextField
          floatingLabelFixed={true}
          hintText="Set point size"
          floatingLabelText="Point size"
          fullWidth={true}
        />
        <div className="addLayer-colorPicker">

          <Checkbox
            label="Fill"
            style={{width: "70%"}}
          />
          <IconButton tooltip="Choose color" className="icon">
            <Picker />
          </IconButton>
        </div>
        <div className="addLayer-colorPicker">
          <Checkbox
            label="Fill"
            style={{width: "70%"}}
          />
          <IconButton tooltip="Choose color" className="icon">
            <Picker />
          </IconButton>
        </div>
      </div>
      <div className="footerButtons">
        <FlatButton label="Cancel" />
        <FlatButton label="Save" primary={true} />
      </div>
    </div>
  )};
}

export default AppBarExampleIcon;
