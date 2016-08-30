import React from 'react';

class LayerListNew extends React.Component {
  render() {
    return (<ul>
      {this.props.layers ? this.props.layers.map(layer =>
        <li key={layer.get('id')}>{layer.get('title')}</li>
      ) : undefined}
    </ul>);
  }
}

export default LayerListNew;
