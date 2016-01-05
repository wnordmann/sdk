import React from 'react';
import FeatureStore from '../stores/FeatureStore.js';
import c3 from 'c3-windows';
import './c3.min.css';
import UI from 'pui-react-dropdowns';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';
import './Chart.css';

const AGGREGATION_MIN = 0;
const AGGREGATION_MAX = 1;
const AGGREGATION_SUM = 2;
const AGGREGATION_AVG = 3;
const DISPLAY_MODE_FEATURE = 0;
const DISPLAY_MODE_CATEGORY = 1;
const DISPLAY_MODE_COUNT = 2;

const messages = defineMessages({
  count: {
    id: 'chart.count',
    description: 'Title of the column which will be used to show feature count',
    defaultMessage: 'Feature count'
  }
});

/**
 * Allow for the creation of charts based on selected features of a layer.
 */
@pureRender
class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chart: this.props.charts[0],
      selected: null
    };
  }
  componentDidMount() {
    this._onChangeCb = this._onChange.bind(this);
    FeatureStore.addChangeListener(this._onChangeCb);
  }
  componentWillUnmount() {
    FeatureStore.removeChangeListener(this._onChangeCb);
  }
  _onChange() {
    this._storeConfig = FeatureStore.getState();
    this.setState({selected: this._storeConfig[this.state.chart.layer].selected});
  }
  _getColumns() {
    var chart = this.state.chart;
    const {formatMessage} = this.props.intl;
    var i, ii, j, jj, values, cat, key;
    var categoryField = chart.categoryField;
    var valueFields = chart.valueFields;
    var selectedFeatures = this.state.selected ? this.state.selected : [];
    var columns = [['x']];
    if (chart.displayMode === DISPLAY_MODE_COUNT) {
      var count = formatMessage(messages.count);
      columns.push([count]);
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
    return columns;
  }
  _selectChart(evt) {
    for (var i = 0, ii = this.props.charts.length; i < ii; ++i) {
      var chart = this.props.charts[i];
      if (chart.title === evt.target.value) {
          this.setState({
            chart: chart,
            selected: this._storeConfig[chart.layer].selected
          });
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
   var columns = this._getColumns();
   c3.generate({
        bindto: '#chart',
        data: {
          x: 'x',
          columns: columns,
          type: 'bar'
        },
        padding: {
          right: 30
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
        <UI.Dropdown {...this.props} title='Charts'>
          {listitems}
        </UI.Dropdown>
      );
    }
  }
}

Chart.propTypes = {
  /**
   * An array of configuration objects. Configuration objects have title, categoryField, layer,
   * valueFields, displayMode and operation keys.
   * title is the title to display for the chart.
   * categoryField is the attribute to use as the category.
   * layer is the id property of the corresponding layer to use.
   * valueFields is an array of field names to use for displaying values in the chart.
   * displayMode defines how the feature attributes will be used to create the chart. When using a value of 0 (by feature), an element will
   * be added to the chart for each selected feature. When using a value of 1 (by category), selected features will be grouped according to
   * a category defined by the categoryField. When using a value of 2 (count by category) the chart will show the number of features in each
   * category.
   * The statistic function to use when displayMode is by category (1) is defined in the operation key.
   * A value of 0 means MIN, a value of 1 means MAX, a value of 2 means SUM and a value of 3 means AVG (Average).
   */
  charts: React.PropTypes.array.isRequired,
  /**
   * If true, show a combo box to select charts instead of dropdown button.
   */
  combo: React.PropTypes.bool,
  /**
   * The id of the container to show when a chart is selected.
   */
  container: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

Chart.defaultProps = {
  combo: false
};

export default injectIntl(Chart);
