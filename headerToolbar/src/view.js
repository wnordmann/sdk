import React from 'react';
import ReactDOM from 'react-dom';
import lightTheme from './lightTheme.js';
import './main.scss';
import 'font-awesome-webpack';
import Divider from 'material-ui/Divider';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import IconButton from 'material-ui/IconButton';
import NavigationMoreVert from 'material-ui/svg-icons/navigation/more-vert';
// import AppBar from './appbar.js';
import AppBar from 'material-ui/AppBar';
// require('./mapskin/fonts/mapskin.css');

export default class DrawerSimpleExample extends React.Component {



//Duplication .DrawerUnit
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightTheme)}>
        <AppBar
          title="Quickview Application"
          iconElementRight={
            <div className="headerIcons">
              <IconButton
                 iconClassName="headerIcons ms ms-measure-distance"
                />
              <IconButton
                 iconClassName="headerIcons ms ms-measure-distance"
                />
              <IconButton>
                <NavigationMoreVert />
              </IconButton>
            </div>}
        />
      </ MuiThemeProvider>
    );
  }
}
