import React from 'react';
import RaisedButton from 'material-ui/lib/raised-button';
import FlatButton from 'material-ui/lib/flat-button';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import Tooltip from 'material-ui/lib/tooltip';
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
      button = (<FloatingActionButton ref='button' {...this.props} onMouseEnter={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)} disableTouchRipple={true}/>);
    } else if (this.props.buttonType === 'Flat') {
      button = (<FlatButton ref='button' {...this.props} onMouseEnter={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)} disableTouchRipple={true}/>);
    } else {
      buttonStyle = {margin: '10px 12px'};
      button = (<RaisedButton ref='button' {...this.props} onMouseEnter={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)} disableTouchRipple={true}/>);
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
