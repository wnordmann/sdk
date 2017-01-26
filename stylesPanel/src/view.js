import React from 'react';
import ReactDOM from 'react-dom';
import lightTheme from './lightTheme.js';
import './main.css';
import { List, ListItem, Checkbox, Divider, TextField, Toggle, Subheader, SelectField, MenuItem } from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import AppBar from './appbar.js';

// Color picker
import reactCSS from 'reactcss'
import Picker from './picker.js'



export default class ListExampleNested extends React.Component {

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

  render() {
    var listStyle = {
      padding: '0px 16px',
      marginLeft: 0
    };
    var boxStyle = {
      marginLeft: 0
    };
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightTheme)}>
      <div>
          <AppBar />
          <List>
            <ListItem primaryText="First rule"
              primaryTogglesNestedList={true}
              insetChildren={false}
              nestedItems={[
                <Subheader>Symbolizer</Subheader>,
                <ListItem innerDivStyle={ listStyle } insetChildren={false}>
                  <SelectField
                    floatingLabelText="Symbol"
                    value={this.state.value}
                    onChange={this.handleChange}
                    fullWidth={true}
                  >
                    <MenuItem value={1} primaryText="Circle" />
                    <MenuItem value={2} primaryText="Square" />
                    <MenuItem value={3} primaryText="Triangle" />
                    <MenuItem value={4} primaryText="Star" />
                    <MenuItem value={5} primaryText="Cross" />
                    <MenuItem value={6} primaryText="X" />
                  </SelectField>
                </ListItem>,
                <ListItem innerDivStyle={ listStyle }>
                  <TextField
                    hintText="Number"
                    floatingLabelText="Size"
                    floatingLabelFixed={true}
                    fullWidth={true}
                  />
                </ListItem>,
                <ListItem innerDivStyle={ listStyle }>
                  <TextField
                    hintText="Number"
                    floatingLabelText="Rotation"
                    floatingLabelFixed={true}
                    fullWidth={true}
                  />
                </ListItem>,
                <ListItem innerDivStyle={ listStyle }>
                  <TextField
                    hintText="Site Address location"
                    floatingLabelText="URL"
                    floatingLabelFixed={true}
                    fullWidth={true}
                  />
                </ListItem>,
                <ListItem
                  innerDivStyle={ boxStyle }
                  primaryText={
                    <Checkbox
                      label="Fill"
                    />
                  }
                  rightIconButton={ <Picker /> }
                />,
                <ListItem
                  innerDivStyle={ boxStyle }
                  primaryText={
                   <Checkbox
                     label="Stroke"
                   />
                  }
                  rightIconButton={ <Picker /> }
                />,
                <ListItem innerDivStyle={ listStyle }>
                  <TextField
                    hintText="Stroke width"
                    floatingLabelText="Stroke width"
                    floatingLabelFixed={true}
                    fullWidth={true}
                  />
                </ListItem>,
                <Subheader>Label</Subheader>,
                <ListItem innerDivStyle={ listStyle }>
                  <SelectField
                    floatingLabelText="Attribute"
                    value={this.state.value}
                    onChange={this.handleChange}
                    fullWidth={true}
                  >
                    <MenuItem value={1} primaryText="Attribute 1" />
                    <MenuItem value={2} primaryText="Attribute 2" />
                  </SelectField>
                </ListItem>,
                <ListItem innerDivStyle={ listStyle }>
                  <TextField
                    hintText="Enter size"
                    floatingLabelText="Font size"
                    floatingLabelFixed={true}
                    fullWidth={true}
                  /> <Picker />
                </ListItem>,
                <Subheader>Filter</Subheader>,
                  <ListItem innerDivStyle={ listStyle }>
                    <TextField
                      floatingLabelText="Enter expression"
                      floatingLabelFixed={true}
                      fullWidth={true}
                    />
                  </ListItem>,

                <ListItem primaryText="Remove" rightIcon={<ActionDelete />} innerDivStyle={ boxStyle } />,
              ]}
            />
            <Divider />
            <ListItem primaryText="Second rule"
              primaryTogglesNestedList={true}
              nestedItems={[
                <Subheader>Symbolizer</Subheader>,
                <ListItem innerDivStyle={ listStyle } insetChildren={false}>
                  <SelectField
                    floatingLabelText="Symbol"
                    value={this.state.value}
                    onChange={this.handleChange}
                    fullWidth={true}
                  >
                    <MenuItem value={1} primaryText="Circle" />
                    <MenuItem value={2} primaryText="Square" />
                    <MenuItem value={3} primaryText="Triangle" />
                    <MenuItem value={4} primaryText="Star" />
                    <MenuItem value={5} primaryText="Cross" />
                    <MenuItem value={6} primaryText="X" />
                  </SelectField>
                </ListItem>,
                <ListItem innerDivStyle={ listStyle }>
                  <TextField
                    hintText="Number"
                    floatingLabelText="Size"
                    floatingLabelFixed={true}
                    fullWidth={true}
                  />
                </ListItem>,
                <ListItem innerDivStyle={ listStyle }>
                  <TextField
                    hintText="Number"
                    floatingLabelText="Rotation"
                    floatingLabelFixed={true}
                    fullWidth={true}
                  />
                </ListItem>,
                <ListItem innerDivStyle={ listStyle }>
                  <TextField
                    hintText="Site Address location"
                    floatingLabelText="URL"
                    floatingLabelFixed={true}
                    fullWidth={true}
                  />
                </ListItem>,
                <ListItem
                  innerDivStyle={ boxStyle }
                  primaryText={
                    <Checkbox
                      label="Fill"
                    />
                  }
                  rightIconButton={ <Picker /> }
                />,
                <ListItem
                  innerDivStyle={ boxStyle }
                  primaryText={
                   <Checkbox
                     label="Stroke"
                   />
                  }
                  rightIconButton={ <Picker /> }
                />,
                <ListItem innerDivStyle={ listStyle }>
                  <TextField
                    hintText="Stroke width"
                    floatingLabelText="Stroke width"
                    floatingLabelFixed={true}
                    fullWidth={true}
                  />
                </ListItem>,
                <Subheader>Label</Subheader>,
                <ListItem innerDivStyle={ listStyle }>
                  <SelectField
                    floatingLabelText="Attribute"
                    value={this.state.value}
                    onChange={this.handleChange}
                    fullWidth={true}
                  >
                    <MenuItem value={1} primaryText="Attribute 1" />
                    <MenuItem value={2} primaryText="Attribute 2" />
                  </SelectField>
                </ListItem>,
                <ListItem innerDivStyle={ listStyle }>
                  <TextField
                    hintText="Enter size"
                    floatingLabelText="Font size"
                    floatingLabelFixed={true}
                    fullWidth={true}
                  /> <Picker />
                </ListItem>,
                <Subheader>Filter</Subheader>,
                  <ListItem innerDivStyle={ listStyle }>
                    <TextField
                      floatingLabelText="Enter expression"
                      floatingLabelFixed={true}
                      fullWidth={true}
                    />
                  </ListItem>,

                <ListItem primaryText="Remove" rightIcon={<ActionDelete />} innerDivStyle={ boxStyle } />,
              ]}
            />

          </List>
      </div>
      </MuiThemeProvider>
    );
  }
}


//
//
