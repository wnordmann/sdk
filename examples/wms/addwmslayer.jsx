import React from 'react';
import PropTypes from 'prop-types';

const AddWMSLayer = (props) => {
  const children = [];
  for (let i = 0, ii = props.layers.length; i < ii; ++i) {
    const layer = props.layers[i];
    const button = (<button onClick={() => { props.onAddLayer(layer); }}>Add</button>);
    children.push(<li key={i}>{layer.Title}{button}</li>);
  }
  return (<ul>{children}</ul>);
};

AddWMSLayer.propTypes = {
  layers: PropTypes.arrayOf(PropTypes.object).isRequired,
  onAddLayer: PropTypes.func,
};

AddWMSLayer.defaultProps = {
  onAddLayer: () => {},
};

export default AddWMSLayer;
