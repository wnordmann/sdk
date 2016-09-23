import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Tooltip from 'material-ui/internal/Tooltip';
import classNames from 'classnames';
import pureRender from 'pure-render-decorator';
import './Button.css';

/**
 * Button with built-in tooltip.
 */
@pureRender
class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTooltip: false
    };
  }
  showTooltip(evt) {
    if (this.props.tooltip && !this.props.disabled) {
      this.setState({showTooltip: true});
    }
  }
  hideTooltip() {
    if (this.props.tooltip && !this.props.disabled) {
      this.setState({showTooltip: false});
    }
  }
  render() {
    var styleConfig = {left: 12, boxSizing: 'border-box'};
    var style = this.props.tooltipStyle ? Object.assign(styleConfig, this.props.tooltipStyle) : styleConfig;
    var button, buttonStyle;
    if (this.props.buttonType === 'Action') {
      button = (<FloatingActionButton backgroundColor={this.props.backgroundColor} onTouchTap={this.props.onTouchTap} style={this.props.style} children={this.props.children} mini={this.props.mini} onMouseEnter={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)} />);
    } else if (this.props.buttonType === 'Flat') {
      button = (<FlatButton onTouchTap={this.props.onTouchTap} icon={this.props.icon} children={this.props.children} label={this.props.label} onMouseEnter={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)} />);
    } else {
      buttonStyle = {margin: '10px 12px'};
      button = (<RaisedButton secondary={this.props.secondary} onTouchTap={this.props.onTouchTap} icon={this.props.icon} children={this.props.children} label={this.props.label} onMouseEnter={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)} />);
    }
    return (
      <span style={buttonStyle} className={classNames('sdk-component sdk-button', this.props.className)} >
        {button}
        <Tooltip verticalPosition='bottom' style={style} show={this.state.showTooltip} label={this.props.tooltip || ''} />
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
   * Style for tooltip element.
   */
  tooltipStyle: React.PropTypes.object,
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
  secondary: React.PropTypes.bool
};

Button.defaultProps = {
  buttonType: 'Raised'
};

export default Button;
