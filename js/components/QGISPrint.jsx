import React from 'react';
import UI from 'pui-react-dropdowns';
import Button from 'pui-react-buttons';
import Dialog from 'pui-react-modals';
import jsPDF from 'jspdf';

export default class QGISPrint extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layout: null
    };
  }
  _onClick(idx) {
    var layout = this.props.layouts[idx];
    this.setState({layout: layout});
  }
  _print() {
    var dpi = React.findDOMNode(this.refs.resolution).value;
    var layout = this.state.layout;
    var pdf = new jsPDF('landscape', "mm", [layout.width, layout.height]);
    pdf.save('map.pdf');
  }
  componentDidUpdate() {
    this.refs.modal.open();
  }
  render() {
    var listitems = this.props.layouts.map(function(layout, idx) {
      var href = this.props.thumbnailPath + layout.thumbnail;
      return (<UI.DropdownItem key={idx} onSelect={this._onClick.bind(this, idx)}>
        {layout.name}<div><img src={href}/></div></UI.DropdownItem>);
    }, this);
    var dialog, layout = this.state.layout;
    if (layout !== null) {
      var elements;
      for (var i =0, ii = layout.elements.length; i < ii; ++i) {
        var element = layout.elements[i];
        if (element.type === 'label') {
          if (elements === undefined) {
            elements = [];
          }
          var htmlFor = 'layout-label-' + element.name;
          elements.push(
            <div key={element.name} className="form-group">
              <label htmlFor={htmlFor}>{element.name}</label>
              <input ref={element.name} id={htmlFor} name={htmlFor} type="text" className="form-control" />
            </div>
          );
        }
      }
      var selectOptions = this.props.resolutions.map(function(resolution) {
        return (<option key={resolution} value={resolution}>{resolution}</option>);
      });
      dialog = (
        <Dialog.Modal title="Print map" ref="modal">
          <Dialog.ModalBody>
            {elements}
            <label htmlFor="resolution-dropdown">Resolution</label>
            <select ref='resolution' id='resolution-dropdown' className='form-control'>
              {selectOptions}
            </select>
          </Dialog.ModalBody>
          <Dialog.ModalFooter>
            <Button.DefaultButton title="Print map" onClick={this._print.bind(this)}>Print</Button.DefaultButton>
          </Dialog.ModalFooter>
        </Dialog.Modal>
      );
    }
    return (
      <article>
        <UI.Dropdown title='Print'>
          {listitems}
        </UI.Dropdown>
        {dialog}
      </article>
    );
  }
}

QGISPrint.propTypes = {
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  layouts: React.PropTypes.array.isRequired,
  resolutions: React.PropTypes.array,
  thumbnailPath: React.PropTypes.string
};

QGISPrint.defaultProps = {
  thumbnailPath: '../../resources/print/',
  resolutions: [72, 150, 300]
};
