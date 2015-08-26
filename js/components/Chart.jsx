import React from 'react';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import SelectConstants from '../constants/SelectConstants.js';
import c3 from 'c3';
import '../../node_modules/c3/c3.min.css';
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
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch(action.type) {
        // TODO have a central place see https://github.com/boundlessgeo/sdk/issues/11
        case SelectConstants.SELECT_FEATURES:
          var layer = action.layer;
          var id = layer.get('id');
          this.state.selected[id] = action.features;
          if (this.state.chart && this.state.chart.layer === id) {
            this.setState({
              selected: this.state.selected
            });
            this._drawFromSelection(this.state.chart);
          }
          break;
        default:
          break;
      }
    });
    this.state = {
      selected: {},
      infoText: '',
      chart: null
    };
  }
  _drawFromSelection(chart) {
    var i, ii, j, jj, values, cat, key;
    var categoryField = chart.categoryField;
    var valueFields = chart.valueFields;
    var selectedFeatures = this.state.selected[chart.layer];
    var columns = [['x']];
    if (chart.displayMode === DISPLAY_MODE_COUNT){
      columns.push(['Feature count']);
    } else {
      for (i = 0, ii = valueFields.length; i < ii; i++) {
        columns.push([valueFields[i]]);
      }
    }
    var selectedCount = 0;
    switch(chart.displayMode) {
      case DISPLAY_MODE_FEATURE:
        for (i = 0, ii = selectedFeatures; i < ii; ++i) {
          columns[0].push(selectedFeatures[i].get(categoryField));
          for (j = 0, jj = valueFields.length; j < jj; ++j) {
            columns[j+1].push(selectedFeatures[i].get(valueFields[j]));
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
          var aggregated = [], v;
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
        }
        break;
      default:
        break;
    }
    this.setState({
      chart: chart,
      infoText: selectedFeatures.length + ' features selected in layer ' + chart.layer
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
    var chart = this.props.charts[evt.target.value];
    if (this.state.selected[chart.layer] && this.state.selected[chart.layer].length > 0) {
      this._drawFromSelection(chart);
    }
  }
  render() {
    var options = [];
    for (var key in this.props.charts) {
      options.push(<option key={key} value={key}>{key}</option>);
    }
    return (
      <div className='chart-panel' id='chart-panel'>
        <select onChange={this._selectChart.bind(this)} className='form-control' id='chart-selector'>
          {options}
        </select>
        <span className="chart-panel-info" id="chart-panel-info">{this.state.infoText}</span>
        <div id='chart'></div>
      </div>
    );
  }
};

Chart.propTypes = {
  charts: React.PropTypes.object.isRequired
};
