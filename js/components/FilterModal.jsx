import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from 'pui-react-modals';
import filtrex from 'filtrex';
import Grids from 'pui-react-grids';
import UI from 'pui-react-buttons';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

const messages = defineMessages({
  inputlabel: {
    id: 'filtermodal.inputlabel',
    description: 'Label for filter input in modal dialog, only used for screen readers',
    defaultMessage: 'Text to filter features in layer by'
  },
  addfiltertext: {
    id: 'filtermodal.addfiltertext',
    description: 'Title for the add filter button',
    defaultMessage: 'Add'
  },
  removefiltertext: {
    id: 'filtermodal.removefiltertext',
    description: 'Title for the remove filter button',
    defaultMessage: 'Remove'
  },
  title: {
    id: 'filtermodal.title',
    description: 'Title for the filter button',
    defaultMessage: 'Filters for layer {layer}'
  }
});

class FilterModal extends Dialog.Modal {
  constructor(props) {
    super(props);
    this.state = {
      filters: [],
      hasError: false
    };
  }
  componentDidMount() {
    this._setStyleFunction();
  }
  _setStyleFunction() {
    var layer = this.props.layer;
    if (layer instanceof ol.layer.Vector) {
      var cluster = layer.getSource() instanceof ol.source.Cluster;
      var style = layer.getStyle();
      var me = this;
      layer.setStyle(function(feature, resolution) {
        var hide = false;
        if (!cluster) {
          for (var i = 0, ii = me.state.filters.length; i < ii; i++){
            if (!me.state.filters[i].filter(feature.getProperties())){
              hide = true;
              continue;
            }
          }
        }
        if (hide) {
          return null;
        } else {
          if (style instanceof ol.style.Style || Array.isArray(style)) {
            return style;
          } else {
            return style.call(this, feature, resolution);
          }
        }
      });
    }
  }
  _onSubmit(evt) {
    evt.preventDefault();
  }
  _addFilter() {
    var layer = this.props.layer;
    var filters = this.state.filters;
    var filter;
    var expression = ReactDOM.findDOMNode(this.refs.filterTextBox).value;
    try {
      filter = filtrex(expression);
    } catch (e) {
      this.setState({hasError: true});
      return;
    }
    var exists = false;
    for (var i = 0, ii = filters.length; i < ii; ++i) {
      if (filters[i].title === expression) {
        exists = true;
        break;
      }
    }
    if (exists === false) {
      filters.push({title: expression, filter: filter});
      this.setState({
        filters: filters,
        hasError: false
      });
      if (layer.getSource() instanceof ol.source.Cluster) {
        this._updateCluster();
      }
      layer.getSource().changed();
    }
  }
  _removeFilter(filter) {
    var layer = this.props.layer;
    var filters = this.state.filters;
    for (var i = 0, ii = filters.length; i < ii; i++){
      if (filters[i] === filter){
        filters.splice(i, 1);
        break;
      }
    }
    this.setState({filters: filters});
    if (layer.getSource() instanceof ol.source.Cluster) {
      this._updateCluster();
    }
    layer.getSource().changed();
  }
  _updateCluster() {
    var layer = this.props.layer;
    var features = layer.getSource().getFeatures();
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var subFeatures = features[i].get('features');
      for (var j = 0, jj = subFeatures.length; j < jj; ++j) {
        var hide = false;
        for (var f = 0, ff = this.state.filters.length; f < ff; f++){
          if (!this.state.filters[f].filter(subFeatures[j].getProperties())) {
            hide = true;
            continue;
          }
        }
        // do not use an observable property, we do not want to notify
        subFeatures[j].hide = hide;
      }
    }
  }
  render() {
    const {formatMessage} = this.props.intl;
    var inputClassName = 'form-control';
    if (this.state.hasError) {
      inputClassName += ' input-has-error';
    }
    var filters = this.state.filters.map(function(f) {
      var filterName = f.title.replace(/\W+/g, '');
      return (
        <div key={filterName} className='form-group' ref={filterName}>
          <Grids.Col md={20}>
            <label>{f.title}</label>
          </Grids.Col>
          <Grids.Col md={4}>
            <UI.DefaultButton onClick={this._removeFilter.bind(this, f)}>{formatMessage(messages.removefiltertext)}</UI.DefaultButton>
          </Grids.Col>
        </div>
      );
    }, this);
    return (
      <Dialog.BaseModal title={formatMessage(messages.title, {layer: this.props.layer.get('title')})} show={this.state.isVisible} onHide={this.close} {...this.props}>
        <Dialog.ModalBody>
          <form onSubmit={this._onSubmit} className='form-horizontal layerlistitem'>
            <div className="form-group">
              <Grids.Col md={20}>
                <label htmlFor='layerlistitem-filtertext' className='sr-only'>{formatMessage(messages.inputlabel)}</label>
                <input id='layerlistitem-filtertext' ref='filterTextBox' type='text' className={inputClassName}/>
              </Grids.Col>
              <Grids.Col md={4}>
                <UI.DefaultButton onClick={this._addFilter.bind(this)}>{formatMessage(messages.addfiltertext)}</UI.DefaultButton>
              </Grids.Col>
            </div>
            {filters}
          </form>
        </Dialog.ModalBody>
        <Dialog.ModalFooter />
      </Dialog.BaseModal>
    );
  }
}

FilterModal.propTypes = {
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(FilterModal, {withRef: true});
