import React from 'react';
import UI from 'pui-react-buttons';
import DD from 'pui-react-dropdowns';
import Icon from 'pui-react-iconography';
import Responsive from 'react-responsive-decorator';
import pureRender from 'pure-render-decorator';

/**
 * Adds the ability to show a toolbar with buttons. On small screen sizes
 * a dropdown will be shown instead.
 */
@Responsive
@pureRender
class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile: false
    };
  }
  componentDidMount() {
    this.props.media({minWidth: this.props.width}, () => {
      this.setState({
        isMobile: false
      });
    });
    this.props.media({maxWidth: this.props.width}, () => {
      this.setState({
        isMobile: true
      });
    });
  }
  render() {
    const {isMobile} = this.state;
    if (isMobile) {
      var nonTextItems = [];
      var items = [];
      for (var i = 0, ii = this.props.options.length; i < ii; ++i) {
        var option = this.props.options[i];
        if (option.jsx) {
          nonTextItems.push(option.jsx);
        } else {
          var icon = option.icon ? (<Icon.Icon name={option.icon} />) : undefined;
          items.push(<DD.DropdownItem key={option.title} onSelect={option.onClick}>{icon} {option.title}</DD.DropdownItem>);
        }
      }
      return (
        <nav role='navigation'>
          <div className='toolbar'>
            <DD.Dropdown title='=' className='pull-right'>
              {items}
            </DD.Dropdown>
            {nonTextItems}
          </div>
        </nav>
      );
    } else {
      var buttons = this.props.options.map(function(option) {
        if (option.jsx) {
          return option.jsx;
        } else {
          var icon = option.icon ? (<Icon.Icon name={option.icon} />) : undefined;
          return (<ul className='pull-right' key={option.title}><UI.DefaultButton onClick={option.onClick} title={option.title}>{icon} {option.title}</UI.DefaultButton></ul>);
        }
      });
      return (
        <nav role='navigation'>
          <div className='toolbar'>
            {buttons}
          </div>
        </nav>
      );
    }
  }
}

Toolbar.propTypes = {
  /**
   * The options to show in the toolbar. An array of objects with jsx, icon, title and onClick keys.
   * When using the jsx option, make sure to use a key property in the root element.
   */
  options: React.PropTypes.arrayOf(React.PropTypes.shape({
    jsx: React.PropTypes.element,
    icon: React.PropTypes.string,
    title: React.PropTypes.string,
    onClick: React.PropTypes.func
  })).isRequired,
  /**
   * Handled automatically by the responsive decorator.
   */
  media: React.PropTypes.func,
  /**
   * Width in pixels below which mobile layout should kick in.
   */
  width: React.PropTypes.number
};

Toolbar.defaultProps = {
  width: 1024
};

export default Toolbar;
