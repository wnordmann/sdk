import React from 'react';
import FeatureStore from '../stores/FeatureStore.js';
import FixedDataTable from 'fixed-data-table';
import ol from 'openlayers';
const {Cell} = FixedDataTable;

export default class FeatureCell extends React.Component {
  _getMyDataForIndex(index, field) {
    return FeatureStore.getFieldValue(this.props.layer, index, field);
  }
  render() {
    var value = this._getMyDataForIndex(this.props.rowIndex, this.props.field);
    if (this.props.link) {
      return (
        <Cell>
          <a href={value} target="_blank">{value}</a>
        </Cell>
      );
    } else {
      return (
        <Cell>
          {value}
        </Cell>
      );
    }
  }
}

FeatureCell.propTypes = {
  rowIndex: React.PropTypes.number.isRequired,
  field: React.PropTypes.string.isRequired,
  link: React.PropTypes.bool,
  layer: React.PropTypes.instanceOf(ol.layer.Vector).isRequired
};

FeatureCell.defaultProps = {
  link: false
};
