import React from 'react';
import classNames from 'classnames';

/**
 * Web Page Logo
 *
 * ```xml
 * <Logo src='logo.gif' />
 * ```
 */
class Logo extends React.PureComponent {
  static propTypes = {
    /**
     * Position of the tooltip.
     */
    tooltipPosition: React.PropTypes.oneOf(['bottom', 'bottom-right', 'bottom-left', 'right', 'left', 'top-right', 'top', 'top-left']),
    /**
     * Should this button be disabled?
     */
    className: React.PropTypes.string,
    /**
     * Source of the image file
     */
    scr: React.PropTypes.string,
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
     * Style config.
     */
    style: React.PropTypes.object,
    /**
    *  Change visibility of the component
    */
    visible: React.PropTypes.bool
  };
  static defaultProps = {
    visible : true,
    tooltipPosition: 'bottom'
  }
  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  render() {
    var className = {
      'sdk-component': true,
      'sdk-logo': true
    };
    className['hint--' + this.props.tooltipPosition] = this.props.tooltip !== undefined;
    return  (
      <span
        onTouchTap={this.props.onTouchTap}
        className={classNames(className, this.props.className)}
        aria-label={this.props.tooltip}
        title={this.props.tooltip}>
        <img src={this.props.src}  style={{marginTop:'12px', height:'40px'}} />
      </span>)
  }
}

export default Logo;
