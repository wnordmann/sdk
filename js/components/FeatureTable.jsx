/* global ol */
import React from 'react';
import FixedDataTable from 'fixed-data-table';
import '../../node_modules/fixed-data-table/dist/fixed-data-table.css';

export default class FeatureTable extends React.Component {
  constructor(props) {
    super(props);
    var source = this.props.layer.getSource();
    this.state = {
      features: []
    };
    source.on('change', function(evt) {
      if (evt.target.getState() === 'ready') {
        this.setState({
          features: evt.target.getFeatures()
        });
      }
    }, this);
  }
  render() {
    var Table = FixedDataTable.Table;
    var Column = FixedDataTable.Column;
    if (this.state.features.length > 0) {
      var me = this, idx = -1;
      var feature = this.state.features[0], geom = feature.getGeometryName();
      var columnNodes = feature.getKeys().map(function(key) {
        if (key !== geom) {
          idx++;
          return <Column label={key} dataKey={idx} key={key} width={100} />;
        }
      });
      var rowGetter = function(rowIndex) {
        var obj = me.state.features[rowIndex].getProperties();
        delete obj[geom];
        return Object.keys(obj).map(key => obj[key]);
      };
      return <Table rowHeight={50} rowGetter={rowGetter} headerHeight={50} rowsCount={this.state.features.length} width={400} height={400}>{columnNodes}</Table>;
    } else {
      return false;
    }
  }
}

FeatureTable.propTypes = {
  layer: React.PropTypes.instanceOf(ol.layer.Vector).isRequired
};
