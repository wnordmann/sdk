export default {
  transformColor(color) {
    var colorObj = color.rgb;
    return [colorObj.r, colorObj.g, colorObj.b, colorObj.a];
  }
};
