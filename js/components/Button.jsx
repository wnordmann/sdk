import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import classNames from 'classnames';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import pureRender from 'pure-render-decorator';

/**
 * Button with built-in tooltip.
 */
@pureRender
class Button extends React.Component {
  getChildContext() {
    return {muiTheme: getMuiTheme()};
  }
  render() {
    var button, buttonStyle, hintStyle;
    if (this.props.buttonType === 'Action') {
      button = (<FloatingActionButton iconStyle={this.props.iconStyle} backgroundColor={this.props.backgroundColor} onTouchTap={this.props.onTouchTap} style={this.props.style} children={this.props.children} mini={this.props.mini}  />);
    } else if (this.props.buttonType === 'Flat') {
      hintStyle = 'hint--small';
      button = (<FlatButton onTouchTap={this.props.onTouchTap} icon={this.props.icon} children={this.props.children} label={this.props.label} />);
    } else {
      hintStyle = 'hint--small';
      buttonStyle = {margin: '10px 12px'};
      button = (<RaisedButton disabled={this.props.disabled} style={this.props.style} secondary={this.props.secondary} onTouchTap={this.props.onTouchTap} icon={this.props.icon} children={this.props.children} label={this.props.label} />);
    }
    return (
      <span style={buttonStyle} className={classNames('hint--bottom', hintStyle, this.props.className)} aria-label={this.props.tooltip}>
        {button}
      </span>
    );
  }
}

Button.propTypes = {
  /**
   * Type of button.
   */
  buttonType: React.PropTypes.oneOf(['Raised', 'Flat', 'Action']),
  /**
   * Should this button be disabled?
   */
  disabled: React.PropTypes.bool,
  /**
   * Css class name to apply on the span.
   */
  className: React.PropTypes.string,
  /**
   * The tooltip to show for this button.
   */
  tooltip: React.PropTypes.string,
  /**
   * Background color.
   */
  backgroundColor: React.PropTypes.string,
  /**
   * Function to execute when the button is clicked.
   */
  onTouchTap: React.PropTypes.func,
  /**
   * Style config object.
   */
  style: React.PropTypes.object,
  /**
   * Child components.
   */
  children: React.PropTypes.node,
  /**
   * Should this button be mini? Only applies to certain button types.
   */
  mini: React.PropTypes.bool,
  /**
   * Optional icon.
   */
  icon: React.PropTypes.node,
  /**
   * Label to show on the button.
   */
  label: React.PropTypes.string,
  /**
   * Should we use the secondary state?
   */
  secondary: React.PropTypes.bool,
  /**
   * Icon style config object.
   */
  iconStyle: React.PropTypes.object
};

Button.defaultProps = {
  buttonType: 'Raised'
};

Button.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired
};

export default Button;
