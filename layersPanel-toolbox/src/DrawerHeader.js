import React, {Component} from 'react';
import AppBar from 'react-toolbox/lib/app_bar';
import Navigation from 'react-toolbox/lib/navigation';
import {Button, IconButton} from 'react-toolbox/lib/button';
import Link from 'react-toolbox/lib/link';


class AppBarExampleIcon extends Component {

render () {
  const iconStyles = {
    // color: '#fff',
  };
  return (
    <AppBar  title="Layers" leftIcon="arrow_back" rightIcon='arrow_drop_down'>

    </AppBar>
  )};
}

export default AppBarExampleIcon;


// <Popover
//   open={this.state.open}
//   anchorEl={this.state.anchorEl}
//   anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
//   targetOrigin={{horizontal: 'left', vertical: 'top'}}
//   onRequestClose={this.handleRequestClose}
// >
//   <Menu>
//     <MenuItem primaryText="Legend" />
//     <MenuItem primaryText="Table" />
//     <MenuItem primaryText="Edit" />
//   </Menu>
// </Popover>
