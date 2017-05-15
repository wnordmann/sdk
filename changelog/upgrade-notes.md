## Upgrade notes

### Next release

## showGroupContent in LayerList
showGroupContent got removed from LayerList as a general settings. There is a new setting to be used on instances of ```ol.layer.Group``` named showContent. If not specified, group content will be shown by default. To hide group content from the layer list for a specific group, set showContent to ```false```.
