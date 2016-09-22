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
      button = (<FloatingActionButton onTouchTap={this.props.onTouchTap} style={this.props.style} children={this.props.children} mini={this.props.mini} onMouseEnter={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)} />);
    } else if (this.props.buttonType === 'Flat') {
      button = (<FlatButton onTouchTap={this.props.onTouchTap} icon={this.props.icon} children={this.props.children} label={this.props.label} onMouseEnter={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)} />);
    } else {
      buttonStyle = {margin: '10px 12px'};
      button = (<RaisedButton onTouchTap={this.props.onTouchTap} icon={this.props.icon} children={this.props.children} label={this.props.label} onMouseEnter={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)} />);
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
  tooltipStyle: React.PropTypes.object
};

Button.defaultProps = {
  buttonType: 'Raised'
};

export default Button;
