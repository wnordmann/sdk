## Upgrade notes

### Next release

#### showGroupContent in LayerList
```showGroupContent``` got removed from LayerList as a general settings. There is a new setting to be used on instances of ```ol.layer.Group``` named showContent. If not specified, group content will be shown by default. To hide group content from the layer list for a specific group, set ```showContent``` to ```false```.

#### new setting isGroupExpanded in LayerList
A new setting is introduced which can be set on ```ol.layer.Group``` instances, called ```isGroupExpanded```. If set to false, a group will not show expanded but will show collapsed initially in the LayerList.

#### new setting disableEdit on layer
If you do not want to enable editing on a specific layer, you can set ```disableEdit``` to true on the layer.
