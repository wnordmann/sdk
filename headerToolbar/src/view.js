import React from 'react';
import ReactDOM from 'react-dom';
import lightTheme from './lightTheme.js';
import './main.scss';
import 'font-awesome-webpack';
import Divider from 'material-ui/Divider';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import IconButton from 'material-ui/IconButton';
import NavigationMoreVert from 'material-ui/svg-icons/navigation/more-vert';
// import AppBar from './appbar.js';
import AppBar from 'material-ui/AppBar';
// require('./mapskin/fonts/mapskin.css');

export default class DrawerSimpleExample extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };



//Duplication .DrawerUnit
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightTheme)}>
        <AppBar
          title="Quickview Application"
          iconElementRight={
            <div className="headerIcons">
              <IconButton
                 iconClassName="headerIcons ms ms-select-box"
                />
              <IconButton
                 iconClassName="headerIcons ms ms-measure-distance"
                />
              <IconButton onTouchTap={this.handleTouchTap} >
                <NavigationMoreVert />
                <Popover
                  open={this.state.open}
                  anchorEl={this.state.anchorEl}
                  anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                  targetOrigin={{horizontal: 'right', vertical: 'top'}}
                  onRequestClose={this.handleRequestClose}

                >
                  <Menu>
                    <MenuItem primaryText="Load" />
                    <MenuItem primaryText="Save" />
                    <MenuItem primaryText="Login" />
                  </Menu>
                </Popover>
              </IconButton>
            </div>}
        />
      </ MuiThemeProvider>
    );
  }
}
