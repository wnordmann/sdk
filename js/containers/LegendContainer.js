import React from 'react';
import {connect} from 'react-redux';
import Legend from '../components/Legend.jsx';

const mapStateToProps = (state) => {
  return {
    flatLayers: state.flatLayers
  };
};

class LegendContainer extends React.Component {
  render() {
    return (
      <Legend {...this.props} />
    );
  }
}

LegendContainer = connect(
   mapStateToProps
)(LegendContainer);

export default LegendContainer;
