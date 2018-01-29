## Upgrade notes

### Next Release

#### onFeatureDrawn, onFeatureModified, onFeatureSelected
The exisiting callback functions of the Map component, onFeatureDrawn, onFeatureModified and onFeatureSelected now get a collection of features instead of a single feature.
The onFeatureDeselected callback function has been added to deal with deselection of features.

The name of the metadata key for filtering time-based datasets on the client has been changed from ```bnd:timeattribute``` to ```bnd:start-time``` and ```bnd:end-time``` where the last one is optional.

### v2.2.0

#### ol package
The version of the ```ol``` package was updated to 4.4.2.

#### Custom layer list items
If you were using a custom layer list item for the layer list, the imports for the base class were moved from:
```
import { SdkLayerListItem } from '@boundlessgeo/sdk/components/layer-list';
```
to:
```
import SdkLayerListItem from '@boundlessgeo/sdk/components/layer-list-item';
```
