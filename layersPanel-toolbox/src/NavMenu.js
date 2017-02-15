import React, {Component} from 'react';
import { List, ListItem, ListSubHeader, ListDivider, ListCheckbox } from 'react-toolbox/lib/list';
// import IconButton from 'material-ui/IconButton';
// import FontIcon from 'material-ui/FontIcon';
// import IconMenu from 'material-ui/IconMenu';
// import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
// import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
// import NavigationArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
// import ActionDelete from 'material-ui/svg-icons/action/delete';
// import HardwareKeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';

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
    <List selectable ripple>
      <ListSubHeader caption='Explore characters' />
      <ListItem
        avatar='https://dl.dropboxusercontent.com/u/2247264/assets/m.jpg'
        caption='Dr. Manhattan'
        legend="Jonathan 'Jon' Osterman"
        rightIcon='star'
      />
      <ListItem
        avatar='https://dl.dropboxusercontent.com/u/2247264/assets/o.jpg'
        caption='Ozymandias'
        legend='Adrian Veidt'
        rightIcon='star'
      />
      <ListItem
        avatar='https://dl.dropboxusercontent.com/u/2247264/assets/r.jpg'
        caption='Rorschach'
        legend='Walter Joseph Kovacs'
        rightIcon='star'
      />
      <ListSubHeader caption='Configuration' />
      <ListCheckbox checked caption='Notify new comics' legend='You will receive a notification when a new one is published' />
      <ListDivider />
      <ListItem caption='Contact the publisher' leftIcon='send' />
      <ListItem caption='Remove this publication' leftIcon='delete' />
    </List>
  )};
}

export default AppBarExampleIcon;



//
// <List selectable ripple>
//   <ListItem
//     className={'menuItem'}
//     primaryText={<span className="statusIcons"><i className="fa fa-angle-down"></i><i className="ms ms-layers"></i><span> ESMR117</span></span>}
//     primaryTogglesNestedList={true}
//     insetChildren={false}
//     rightIconButton={<span className="fixedContainer"><i className="fa fa-eye"></i><i className="fa fa-crosshairs"></i><i className="fa fa-cog"></i></span>}
//     nestedItems={[
//       <ListItem
//         className={'menuItem'}
//         primaryText={<span className="statusIcons"><i className="fa fa-angle-down"></i><i className="ms ms-layers"></i><span> ESMR117</span></span>}
//         rightIconButton={<span className="fixedContainer"><i className="fa fa-eye"></i><i className="fa fa-crosshairs"></i><i className="fa fa-cog"></i></span>}
//       />,
//       <ListItem
//         className={'menuItem'}
//         primaryText={<span className="statusIcons"><i className="fa fa-angle-down"></i><i className="ms ms-layers"></i><span> ESMR117</span></span>}
//         rightIconButton={<span className="fixedContainer"><i className="fa fa-eye"></i><i className="fa fa-crosshairs"></i><i className="fa fa-cog"></i></span>}
//       />,
//     ]}
//   />
//
//
// </List>
