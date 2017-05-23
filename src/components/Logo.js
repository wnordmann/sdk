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
    visible : true
  }
  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  render() {
    var className = {
      'sdk-component': true,
      'sdk-logo': true,
      'hint--small': this.props.buttonType !== 'Action'
    };
    className['hint--' + this.props.tooltipPosition] = this.props.tooltip !== undefined;
    return  (<img src={this.props.src} onTouchTap={this.props.onTouchTap} style={{margin:'5px', height:'40px'}} className={classNames(className, this.props.className)} aria-label={this.props.tooltip}/>)
  }
}

export default Logo;
