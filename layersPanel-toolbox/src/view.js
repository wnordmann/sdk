import React from 'react';
import ReactDOM from 'react-dom';
import 'font-awesome-webpack';
import Drawer from 'react-toolbox/lib/drawer';
import {Button, IconButton, NavigationArrowDropDown} from 'react-toolbox';
// NavigationArrowDropDown
// import MenuItem from 'material-ui/MenuItem';
// import RaisedButton from 'material-ui/RaisedButton';
// import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import getMuiTheme from 'material-ui/styles/getMuiTheme';
import DrawerHeader from './DrawerHeader.js';
import NavMenu from './NavMenu.js';

// require('./fonts/mapskin.css');



export default class DrawerSimpleExample extends React.Component {

    state = {
      active: false
    };

    handleToggle = () => {
      this.setState({active: !this.state.active});
    };

    render() {
        return (
        <div>
          <Button label='Show Drawer' className='matButton' raised accent onClick={this.handleToggle} />
          <Drawer active={this.state.active} onOverlayClick={this.handleToggle}>
            <DrawerHeader />
            <NavMenu/>
          </Drawer>
        </div>
      );
    }
}

//
