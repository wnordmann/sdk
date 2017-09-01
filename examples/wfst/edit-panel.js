/** An Editing Panel for Tracts
 *
 */

import React from 'react';

class EditPanel extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = { feature: null };
  }

  renderColorOption(onclick, color, selected) {
    let class_names = 'color-control';
    if (selected === true) {
      class_names += ' selected';
    }

    return (
       <button
        key={`color-${color}`}
        className={class_names}
        style={{backgroundColor: this.props.colors[color] }}
        onClick={ () => { onclick(this.state.feature, color)} }/>
    );

  }

  render() {
    const color_controls = [];

    for (let i = 0, ii = this.props.colors.length; i < ii; i++) {
      let selected = false;
      if (this.state.feature) {
        selected = (i === this.state.feature.properties.color);
      }
      color_controls.push(this.renderColorOption(this.props.onChange, i, selected));
    }

    let feature_id = false;
    if (this.state.feature) {
      feature_id = this.state.feature.id;
    }

    return (
      <div className='edit-panel'>
        <div>
          <span className='label'>Feature ID:</span>
          { feature_id }
        </div>
        <div>
          <span className='label'>Color:</span>
          { color_controls }
        </div>
      </div>
    );
  }
}

export default EditPanel;
