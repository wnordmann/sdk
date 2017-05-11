import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import NavigationArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import Subheader from 'material-ui/Subheader';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import Popover from 'material-ui/Popover';
import Divider from 'material-ui/Divider';
import {List, ListItem} from 'material-ui/List';
import Paper from 'material-ui/Paper';

/**
 * A simple example of `AppBar` with an icon on the right.
 * By default, the left icon is a navigation-menu.
 */


class AppBarExampleIcon extends Component {

  state = {
    value: 1,
  };

  handleChange = (event, index, value) => this.setState({value});

render () {

  return (
    <div className="queryBuilderResults">
      <div className="queryHeader">
        <h4>Add Filter</h4>
      </div>
      <Divider/>
      <div className="addRule">
        <SelectField
          floatingLabelText="Layer"
          value={this.state.value}
          onChange={this.handleChange}
          className="selectAttrib"
          fullWidth="true"
          >
          <MenuItem value={1} primaryText="Never" />
          <MenuItem value={2} primaryText="Every Night" />
          <MenuItem value={3} primaryText="Weeknights" />
          <MenuItem value={4} primaryText="Weekends" />
          <MenuItem value={5} primaryText="Weekly" />
        </SelectField>
        <Subheader className="sub">Rule</Subheader>
        <div className="filterRule">
          <div className="values">
            <SelectField
              floatingLabelText="Attribute (Trees)"
              value={this.state.value}
              onChange={this.handleChange}
              className="selectAttrib"
              >
              <MenuItem value={1} primaryText="Never" />
              <MenuItem value={2} primaryText="Every Night" />
              <MenuItem value={3} primaryText="Weeknights" />
              <MenuItem value={4} primaryText="Weekends" />
              <MenuItem value={5} primaryText="Weekly" />
            </SelectField>
            <SelectField
              floatingLabelText=" "
              value={this.state.value}
              onChange={this.handleChange}
              className="selectOperator"
              >
              <MenuItem value={1} primaryText="==" />
              <MenuItem value={2} primaryText="<" />
              <MenuItem value={3} primaryText=">" />
              <MenuItem value={4} primaryText="!=" />
            </SelectField>
            <TextField
              className="selectValue"
              floatingLabelText="Value"
              />
          </div>
        </div>
      </div>
      <Divider/>
      <div className="queryBuilderFooter">
        <FlatButton
          label="CANCEL"
          primary={true}
          />
        <FlatButton
          label="ADD"
          primary={true}
          />
      </div>
    </div>
  )};
}

export default AppBarExampleIcon;
