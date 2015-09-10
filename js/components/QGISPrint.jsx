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
  _elementLoaded() {
    this._elementsLoaded++;
    if (this._elementsLoaded === this.state.layout.elements.length) {
      this._pdf.save('map.pdf');
    }
  }
  _getTileLayers() {
    var tileLayers = [];
    this.props.map.getLayers().forEach(function(layer) {
      if (layer instanceof ol.layer.Tile && layer.getSource() instanceof ol.source.TileWMS) {
        tileLayers.push(layer);
      }
    });
    return tileLayers;
  }
  _tileLayerLoaded() {
    this._tiledLayersLoaded++;
    if (this._tiledLayersLoaded === this._tileLayers.length){
      this._paintMapInPdf();
    }
  }
  _paintMapInPdf() {
    var data = this._canvas.toDataURL('image/jpeg');
    var pdf = this._pdf;
    var mapElement = this._mapElement;
    var map = this.props.map;
    var size = map.getSize();
    var extent = map.getView().calculateExtent(size);
    pdf.rect(mapElement.x, mapElement.y, mapElement.width, mapElement.height);
    pdf.addImage(data, 'JPEG', mapElement.x, mapElement.y, mapElement.width, mapElement.height);
    map.setSize(size);
    map.getView().fit(extent, size);
    map.renderSync();
    this._elementLoaded();
  }
  _createMap(labels) {
    var map = this.props.map;
    var resolution = React.findDOMNode(this.refs.resolution).value;
    var layout = this.state.layout;
    this._layoutSafeName = layout.name.replace(/[^a-z0-9]/gi,'').toLowerCase();
    var elements = layout.elements;
    this._pdf = new jsPDF('landscape', "mm", [layout.width, layout.height]);
    var images = [];
    this._elementsLoaded = 0;
    var size = (map.getSize());
    var extent = map.getView().calculateExtent(size);
    this._tileLayers = this._getTileLayers();
    this._tiledLayersLoaded = 0;
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      if (element.type === "label") {
        this._pdf.setFontSize(element.size)
        this._pdf.text(element.x, element.y + element.size / 25.4, labels[element.name])
        this._elementLoaded();
      } else if (element.type === "map"){
        this._mapElement = element;
        var width = Math.round(element.width * resolution / 25.4);
        var height = Math.round(element.height * resolution / 25.4);
        map.once('postcompose', function(event) {
          this._canvas = event.context.canvas;
          var sources = [];
          var loaded = [];
          var loading = [];
          var me = this;
          for (var j = 0, jj = this._tileLayers.length; j < jj; j++) {
            (function(idx){
              sources[idx] = tileLayers[idx].getSource();
              loading[idx] = 0;
              loaded[idx] = 0;
              sources[idx].on('tileloadstart', function() {
                ++loading;
              });
              sources[idx].on('tileloadend', function() {
                ++loaded;
                if (loading === loaded) {
                  me._tileLayerLoaded();
                }
              });
              sources[idx].on('tileloaderror', function() {
                ++loaded;
              });
            })(j);
          }
        }, this);
        map.setSize([width, height]);
        map.getView().fit(extent, map.getSize());
        map.renderSync();
        if (this._tileLayers.length === 0) {
          this._paintMapInPdf();
        }
      } else if (element.type === "shape" || element.type === "arrow" ||
        element.type === "legend" || element.type === "scalebar") {
          var me = this;
          (function(el){
            images[el.id] = new Image();
            images[el.id].crossOrigin = "anonymous";
            images[el.id].addEventListener('load', function() {
              me._pdf.addImage(images[el.id], 'png', el.x, el.y, el.width, el.height);
              me._elementLoaded();
            });
            images[el.id].src = me.props.thumbnailPath + me._layoutSafeName + "_" + el.id + "_" +
              resolution.toString() + ".png";
          })(element);
      } else if (element.type === "picture"){
        var me = this;
        (function(el){
          images[el.id] = new Image();
          images[el.id].crossOrigin = "anonymous";
          images[el.id].addEventListener('load', function() {
            me._pdf.addImage(images[el.id], 'png', el.x, el.y, el.width, el.height);
            me._elementLoaded();
          });
          images[el.id].src = me.props.thumbnailPath + el.file;
        })(element);
      } else {
        this._elementLoaded();
      }
    }
  }
  _print() {
    var elements = this.state.layout.elements;
    var labels = {};
    for (var i = 0, ii = elements.length; i < ii; i++) {
      if (elements[i].type === "label") {
        var name = elements[i].name; 
        labels[name] = React.findDOMNode(this.refs[name]).value;
      }
    }
    this._createMap(labels)
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
