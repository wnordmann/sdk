import React from 'react';
import FeatureStore from '../stores/FeatureStore.js';
import c3 from 'c3';
import '../../node_modules/c3/c3.min.css';
import UI from 'pui-react-dropdowns';
import './Chart.css';

const AGGREGATION_MIN = 0;
const AGGREGATION_MAX = 1;
const AGGREGATION_SUM = 2;
const AGGREGATION_AVG = 3;
const DISPLAY_MODE_FEATURE = 0;
const DISPLAY_MODE_CATEGORY = 1;
const DISPLAY_MODE_COUNT = 2;

export default class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chart: this.props.charts[0]
    };
  }
  componentWillMount() {
    FeatureStore.addChangeListener(this._onChange.bind(this));
  }
  _onChange() {
    this._storeConfig = FeatureStore.getState();
    if (this.state.chart && this.state.chart.layer) {
      this._drawFromSelection(this.state.chart);
    }
  }
  _drawFromSelection(chart) {
    var i, ii, j, jj, values, cat, key;
    var categoryField = chart.categoryField;
    var valueFields = chart.valueFields;
    var selectedFeatures = this._storeConfig[chart.layer] ? this._storeConfig[chart.layer].selected : [];
    var columns = [['x']];
    if (chart.displayMode === DISPLAY_MODE_COUNT){
      columns.push(['Feature count']);
    } else {
      for (i = 0, ii = valueFields.length; i < ii; i++) {
        columns.push([valueFields[i]]);
      }
    }
    switch(chart.displayMode) {
      case DISPLAY_MODE_FEATURE:
        for (i = 0, ii = selectedFeatures; i < ii; ++i) {
          columns[0].push(selectedFeatures[i].get(categoryField));
          for (j = 0, jj = valueFields.length; j < jj; ++j) {
            columns[j + 1].push(selectedFeatures[i].get(valueFields[j]));
          }
        }
        break;
      case DISPLAY_MODE_CATEGORY:
        values = {};
        for (i = 0, ii = selectedFeatures.length; i < ii; i++) {
          cat = selectedFeatures[i].get(categoryField);
          if (cat !== undefined) {
            cat = cat.toString();
            if (!(cat in values)){
              values[cat] = [];
              for (j = 0, jj = valueFields.length; j < jj; j++) {
                values[cat].push([selectedFeatures[i].get(valueFields[j])]);
              }
            } else {
              for (j = 0, jj = valueFields.length; j < jj; j++) {
                values[cat][j].push(selectedFeatures[i].get(valueFields[j]));
              }
            }
          }
        }
        for (key in values) {
          columns[0].push(key);
          var v;
          for (i = 0, ii = valueFields.length; i < ii; i++) {
            if (chart.operation === AGGREGATION_SUM || chart.operation === AGGREGATION_AVG) {
              v = 0;
              jj = values[key][i].length;
              for (j = 0; j < jj; ++j) {
                v += values[key][i][j];
              }
              if (chart.operation === AGGREGATION_AVG) {
                v /= jj;
              }
            } else if (chart.operation === AGGREGATION_MIN) {
              Math.min.apply(Math, values[key][i]);
            } else if (chart.operation === AGGREGATION_MAX) {
              Math.max.apply(Math, values[key][i]);
            }
            columns[i + 1].push(v);
          }
        }
        break;
      case DISPLAY_MODE_COUNT:
        values = {};
        for (i = 0, ii = selectedFeatures.length; i < ii; i++) {
          cat = selectedFeatures[i].get(categoryField);
          if (cat !== undefined) {
            cat = cat.toString();
            if (!(cat in values)){
              values[cat] = 1;
            } else {
              values[cat]++;
            }
          }
        }
        var sorted = [];
        for (key in values){
          sorted.push([key, values[key]]);
        }
        sorted.sort(function(a, b) {
          return b[1] - a[1];
        });
        for (i = 0, ii = sorted.length; i < ii; i++) {
          columns[0].push(sorted[i][0]);
          columns[1].push(sorted[i][1]);
        }
        break;
      default:
        break;
    }
    this.setState({
      chart: chart
    });
    c3.generate({
      bindto: '#chart',
      data: {
        x: 'x',
        columns: columns,
        type: 'bar'
      },
      axis: {
        x: {
          type: 'category',
          tick: {
            rotate: 70,
            multiline: false
          },
          height: 80
        }
      }
    });
  }
  _selectChart(evt) {
    for (var i = 0, ii = this.props.charts.length; i < ii; ++i) {
      var chart = this.props.charts;
      if (chart.title === evt.target.value) {
        this._drawFromSelection(chart);
        break;
      }
    }
  }
  _onClick() {
    if (this.props.container) {
      document.getElementById(this.props.container).style.display = 'block';
    }
  }
  render() {
    var key;
    if (this.props.combo === true) {
      var options = this.props.charts.map(function(chart, idx) {
        var title = chart.title;
        return (<option key={idx} value={title}>{title}</option>);
      });
      return (
        <div className='chart-panel' id='chart-panel'>
          <select onChange={this._selectChart.bind(this)} className='form-control' id='chart-selector'>
            {options}
          </select>
          <div id='chart'></div>
        </div>
      );
    } else {
      var listitems = this.props.charts.map(function(chart, idx) {
        var key = chart.title;
        return (<UI.DropdownItem key={idx} onSelect={this._onClick.bind(this, {target: {value: key}})}>{key}</UI.DropdownItem>);
      }, this);
      return (
        <UI.Dropdown title='Charts'>
          {listitems}
        </UI.Dropdown>
      );
    }
  }
}

Chart.propTypes = {
  charts: React.PropTypes.array.isRequired,
  combo: React.PropTypes.bool,
  container: React.PropTypes.string
};

Chart.defaultProps = {
  combo: false
};
