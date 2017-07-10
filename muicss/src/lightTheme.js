import {
  cyan500, cyan700,
  pinkA200,
  grey100, grey300, grey400, grey500,
  white, darkBlack, fullBlack
} from './colors.js';

// Funtions for Themes to support colors
function clamp(value, min, max) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}
  export function decomposeColor(color) {
  if (color.charAt(0) === '#') {
    return decomposeColor(convertHexToRGB(color));
  }

  const marker = color.indexOf('(');
  const type = color.substring(0, marker);
  let values = color.substring(marker + 1, color.length - 1).split(',');
  values = values.map((value) => parseFloat(value));

  return {type, values};
}
export function convertColorToString(color) {
  const {type, values} = color;

  if (type.indexOf('rgb') > -1) {
    // Only convert the first 3 values to int (i.e. not alpha)
    for (let i = 0; i < 3; i++) {
      values[i] = parseInt(values[i]);
    }
  }

  let colorString;

  if (type.indexOf('hsl') > -1) {
    colorString = `${color.type}(${values[0]}, ${values[1]}%, ${values[2]}%`;
  } else {
    colorString = `${color.type}(${values[0]}, ${values[1]}, ${values[2]}`;
  }

  if (values.length === 4) {
    colorString += `, ${color.values[3]})`;
  } else {
    colorString += ')';
  }

  return colorString;
}
export function fade(color, value) {
  color = decomposeColor(color);
  value = clamp(value, 0, 1);

  if (color.type === 'rgb' || color.type === 'hsl') {
    color.type += 'a';
  }
  color.values[3] = value;

  return convertColorToString(color);
}


import spacing from './spacing.js';


// End Scripts to support themes
export default {
  spacing: spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: cyan500,
    primary2Color: cyan700,
    primary3Color: grey400,
    accent1Color: pinkA200,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    secondaryTextColor: fade(darkBlack, 0.54),
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: cyan500,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack
  }
};