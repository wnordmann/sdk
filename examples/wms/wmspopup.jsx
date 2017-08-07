import React from 'react';
import SdkPopup from '@boundlessgeo/sdk/components/map/popup';

/**
 * Show the WMS GetFeatureInfo feature in a popup.
 */
export default class WMSPopup extends SdkPopup {
  render() {
    const feature = this.props.feature;
    const content = [];
    const keys = Object.keys(feature.properties);
    for (let i = 0, ii = keys.length; i < ii; ++i) {
      const key = keys[i];
      content.push(<p key={key}>{key} : {feature.properties[key]}</p>);
    }
    return this.renderPopup((
      <div>{ content }</div>
    ));
  }
}

