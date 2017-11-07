## Upgrade notes

### Next Release

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
