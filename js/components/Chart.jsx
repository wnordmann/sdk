import React from 'react';

export default class Chart extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    var options = [];
    for (var key in this.props.charts) {
      options.push(<option key={key} value={key}>{key}</option>);
    }
    return (
      <div className='chart-panel' id='chart-panel'>
        <select className='form-control' id='chart-selector'>
          {options}
        </select>
      </div>
    );
  }
};

Chart.propTypes = {
  charts: React.PropTypes.object.isRequired
};
