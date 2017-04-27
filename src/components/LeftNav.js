import React from 'react';
import Drawer from 'material-ui/Drawer';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import {Tabs} from 'material-ui/Tabs';
import AppBar from 'material-ui/AppBar';
import Popover from 'material-ui/Popover';
import NavigationArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';

/**
 * Drawer to use for left nav, drawer uses dropdown list to control tabs
 *
 * ```xml
 * const tablist = [   <Tab key={1} value={1} label='Legend'><Legend map={map} /></Tab>,
 *                      <Tab key={2} value={2} label='FeatureTabe'><FeatureTable ref='table' map={map} /></Tab>,
 *                      <Tab key={3} value={3} label='WFST'><WFST ref='edit' toggleGroup='navigation' showEditForm={true} map={map} />]</Tab>
 *                  ];
 * <LeftNav tabList={tablist}  />
 * ```
 */
class LeftNav extends React.PureComponent {
    static propTypes = {
      /**
       * Override width of left nav
       */
      width: React.PropTypes.number,
      /**
       * Style config.
       */
      style: React.PropTypes.object,
      /**
       * Contents of the Drawer
       */
      children: React.PropTypes.node,
      /**
       * array of <tab> components to be added to <Tabs>
       */
      tabList: React.PropTypes.node,
      /**
       * If true drawer is opened
       */
      open: React.PropTypes.bool,
      /**
       *  Callback for closing the drawer
       */
      onRequestClose: React.PropTypes.func.isRequired

    };
    constructor(props, context) {
      super();
    }
    componentDidMount() {
      if (this.props.tabList && this.props.tabList.length > 0) {
        this.setState({
          menuText: this.props.tabList[0].props.label,
          selectedIndex: this.props.tabList[0].props.value,
          appBarIcon: this.getIconFromTab(this.props.tabList[0]),
          appBarOnTouch: this.props.tabList[0].props.onActive
        });
      }
    }
    static childContextTypes = {
      muiTheme: React.PropTypes.object.isRequired
    };
    state = {
      menuOpen: false
    };

    handleMenuTouchTap = (event) => {
      // This prevents ghost click.
      event.preventDefault();
      this.setState({
        menuOpen: true,
        anchorEl: event.currentTarget
      });
    };
    handleMenuRequestClose = () => {
      this.setState({
        menuOpen: false
      });
    };
    handleMenuChange = (event, value) => {
      this.setState({
        selectedIndex: value.props.value,
        menuOpen: false,
        menuText: value.props.primaryText,
        appBarIcon: this.rightIcon[value.props.value].icon,
        appBarOnTouch: this.rightIcon[value.props.value].onTouchTap
      });
    };
    getIconFromTab = (tabComponent) =>{
      if (tabComponent.type.name === 'Tab') {
        const tabChild = tabComponent.props.children;
        if (tabChild.props) {  //Tab Child has props
          if (tabChild.props.icon) {  //Tab children contains Icon{
            return tabChild.props.icon;
          }else if (tabChild.type === 'div') { //Tab children components are often wrapped in a parent Div
            const divChild = tabChild.props.children;
            if (divChild.props.icon) { //Div children contains Icon
              return divChild.props.icon;
            }
          }
        }
      }
      return <span/>;
    };
    close = (event, value) => {
      this.props.onRequestClose();
    }
    static defaultProps = {
      open: true,
      menuOpen: false,
      width: 360
    };
    rightIcon = {};
    render() {
      const iconStyles = {
        color: '#fff'
      };
      var tabs;
      var noDisplayStyle = {
        display: 'none'
      };
      var menuItems = [];
      var icons = {}
      if (this.props.tabList) {
        tabs = (<Tabs style={{height: 'calc(100% - 64px)'}} tabTemplateStyle={{height: '100%'}} contentContainerStyle={{height: '100%'}} tabItemContainerStyle = { noDisplayStyle } inkBarStyle = { noDisplayStyle } value = { this.state.selectedIndex }>{this.props.tabList}</Tabs>);
        this.props.tabList.forEach((tab) => {
          if (tab.props.onActive) {
            icons[tab.props.value] = {icon: this.getIconFromTab(tab), onTouchTap: tab.props.onActive};
          }else {
            icons[tab.props.value] = {icon: <span/>, onTouchTap: null};
          }
          menuItems.push(<MenuItem primaryText = { tab.props.label } value = { tab.props.value }/>);
        });
      }
      this.rightIcon = icons;
      return (
        <Drawer style={this.props.style} width = { this.props.width } open = { this.props.open } >
          <AppBar title = { <span><span onTouchTap = { this.handleMenuTouchTap }> {this.state.menuText} <NavigationArrowDropDown style = { iconStyles }/></span>
            <Popover
              open = { this.state.menuOpen }
              anchorEl = { this.state.anchorEl }
              anchorOrigin = {{horizontal: 'left', vertical: 'bottom'}}
              targetOrigin = {{horizontal: 'left', vertical: 'top'}}
              onRequestClose = {this.handleMenuRequestClose} >
                  <Menu onItemTouchTap = { this.handleMenuChange } children={menuItems}/>
               </Popover></span>}
            iconElementLeft = { <IconButton> <NavigationArrowBack/> </IconButton>}
            onLeftIconButtonTouchTap={this.close.bind(this)}

            iconElementRight = {this.state.appBarIcon}
            onRightIconButtonTouchTap = {this.state.appBarOnTouch}
            className='left-drawer-titleBar' />
          { tabs }
          { this.props.children }
        </Drawer>
      );
    }
}

export default LeftNav;
