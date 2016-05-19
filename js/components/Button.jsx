import React from 'react';
import ReactDOM from 'react-dom';
import RaisedButton from 'material-ui/lib/raised-button';
import Tooltip from 'material-ui/lib/tooltip';

/**
 * Button with built-in tooltip.
 */
class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      left: 0,
      showTooltip: false
    };
  }
  showTooltip(evt) {
    var left = ReactDOM.findDOMNode(evt.target).getBoundingClientRect().left;
    this.setState({left: left, showTooltip: true});
  }
  hideTooltip() {
    this.setState({showTooltip: false});
  }
  render() {
    return (
      <span>
        <RaisedButton {...this.props} onMouseEnter={this.showTooltip.bind(this)} onMouseLeave={this.hideTooltip.bind(this)}/>
        <Tooltip verticalPosition='bottom' style={{left: this.state.left, boxSizing: 'border-box'}} show={this.state.showTooltip} label={this.props.tooltip} />
      </span>
    );
  }
}

Button.propTypes = {
  /**
   * The tooltip to show for this button.
   */
  tooltip: React.PropTypes.string.isRequired
};

export default Button;
