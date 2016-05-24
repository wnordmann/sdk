import React from 'react';
import MapTool from './MapTool.js';
import RaisedButton from './Button.jsx';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  buttontext: {
    id: 'navigation.buttontext',
    description: 'Text of the Navigation button',
    defaultMessage: 'Navigation'
  },
  buttontitle: {
    id: 'navigation.buttontitle',
    description: 'Title of the Navigation button',
    defaultMessage: 'Switch to map navigation (pan and zoom)'
  }
});

/**
 * Navigation button that allows to get the map back into navigation (zoom, pan) mode.
 */
@pureRender
class Navigation extends MapTool {
  constructor(props) {
    super(props);
    this.state = {
      secondary: false
    };
  }
  activate() {
    super.activate([]);
    this.setState({secondary: true});
  }
  deactivate() {
    super.deactivate();
    this.setState({secondary: false});
  }
  _onClick() {
    if (!this.state.secondary) {
      this.activate();
    }
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <RaisedButton className='sdk-component navigation' secondary={this.state.secondary} onTouchTap={this._onClick.bind(this)} label={formatMessage(messages.buttontext)} tooltip={formatMessage(messages.buttontitle)} />
    );
  }
}

Navigation.propTypes = {
  /**
   * The toggleGroup to use. When this tool is activated, all other tools in the same toggleGroup will be deactivated.
   */
  toggleGroup: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(Navigation);
