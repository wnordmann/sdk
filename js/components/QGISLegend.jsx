import React from 'react';
import ol from 'openlayers';
import UI from 'pui-react-buttons';
import Icon from 'pui-react-iconography';
import LayerStore from '../stores/LayerStore.js';
import './QGISLegend.css';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';
import Grids from 'pui-react-grids';

const messages = defineMessages({
  buttontitle: {
    id: 'qgislegend.buttontitle',
    description: 'Title to display on hover of the QGIS legend button',
    defaultMessage: 'Legend'
  }
});

/**
 * A component that shows a legend based on artefacts created by the QGIS plugin Web Application Builder.
 */
@pureRender
class QGISLegend extends React.Component {
  constructor(props) {
    super(props);
    LayerStore.bindMap(this.props.map);
    this.state = {
      visible: false
    };
  }
  _hidePanel() {
    this.setState({visible: false});
  }
  _showPanel() {
    this.setState({visible: true});
  }
  _renderItems(legendData, legendBasePath) {
    var legendNodes = [];
    var symbolFunc = function(symbol) {
      var src = legendBasePath + symbol.href;
      return (<li key={symbol.title}><img src={src}></img> {symbol.title}</li>);
    };
    var symbolFuncB = function(symbol) {
      var src = legendBasePath + symbol.href;
      return (<img key={symbol.title} src={src}></img>);
    };
    for (var id in legendData) {
      var title = LayerStore.findLayer(id).get('title');
      if (title !== null) {
        if (legendData[id].length > 1){
          var symbols = legendData[id].map(symbolFunc);
          var forLabel = 'legend-layer-' + id;
          legendNodes.push(
            <li key={id}>
              <ul>
                <h5><strong>{title}</strong></h5> {symbols}
              </ul>
            </li>
          );
        } else {
          var symbols = legendData[id].map(symbolFuncB);
          var forLabel = 'legend-layer-' + id;
          legendNodes.push(
            <li key={id}>
              <ul>
                {symbols} {title}
              </ul>
            </li>
          );
        }

      }
    }
    return (
      <ul className='expandableList'>
        {legendNodes}
      </ul>
    );
  }
  render() {
    const {formatMessage} = this.props.intl;
    var className = 'legend';
    if (this.state.visible) {
      className += ' shown';
    }
    var items = this._renderItems(this.props.legendData, this.props.legendBasePath);
    return (
      <div onMouseOut={this._hidePanel.bind(this)} onMouseOver={this._showPanel.bind(this)} className={className}>
        <UI.DefaultButton title={formatMessage(messages.buttontitle)} onClick={this._showPanel.bind(this)}><Icon.Icon name="file-picture-o" /></UI.DefaultButton>
        <div className='legend-panel' id='legend'>{items}</div>
      </div>
    );
  }
}

QGISLegend.propTypes = {
  /**
   * The map from which to extract the layers.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * The base path (relative url) to use for finding the artefacts.
   */
  legendBasePath: React.PropTypes.string,
  /**
   * The label and image to use per layer. The object is keyed by layer name currently. For example: {'swamp': [['', '4_0.png']]}.
   */
  legendData: React.PropTypes.object.isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

QGISLegend.defaultProps = {
  legendBasePath: './legend/'
};

export default injectIntl(QGISLegend);
