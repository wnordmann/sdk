import React from 'react';
import './QGISLegend.css';

export default class QGISLegend extends React.Component {
  constructor(props) {
    super(props);
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
      var src = legendBasePath + symbol[1];
      var lbl = symbol[0];
      return (<li key={src}><img src={src}></img>{lbl}</li>);
    };
    for (var name in legendData) {
      var symbols = legendData[name].map(symbolFunc);
      var forLabel = 'legend-layer-' + name;
      legendNodes.push(
        <li key={name}>
          <label htmlFor={forLabel}>{name}</label>
          <input readOnly={true} type='checkbox' checked id={forLabel} />
          <ul>
            {symbols}
          </ul>
        </li>
      );
    }
    return (
      <ul className='expandableList'>
        {legendNodes}
      </ul>
    );
  }
  render() {
    var className = 'ol-unselectable ol-control legend';
    if (this.state.visible) {
      className += ' shown';
    }
    var items = this._renderItems(this.props.legendData, this.props.legendBasePath);
    return (
      <div onMouseOut={this._hidePanel.bind(this)} onMouseOver={this._showPanel.bind(this)} className={className}><button onClick={this._showPanel.bind(this)} title='Legend'></button>
      <div className='legend-panel' id='legend'>{items}</div></div>
    );
  }
}

QGISLegend.propTypes = {
  legendBasePath: React.PropTypes.string,
  legendData: React.PropTypes.object.isRequired
};

QGISLegend.defaultProps = {
  legendBasePath: './legend/'
};
