import React, { cloneElement } from 'react';
import upperCaseFirst from 'upper-case-first';
import PropTypes from 'prop-types';
import Children from 'react-children-utilities';
import { defaultStyle, checkStyle } from './style';
import { requireNativeComponent, View, Platform } from 'react-native';

// taken from here: https://github.com/skratchdot/color-matrix/blob/master/lib/filters.js

const isIos = Platform.OS === 'ios';

const staticFilters = {
  normal: [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0
  ],

  luminanceToAlpha: [
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0.2125, 0.7154, 0.0721, 0, 0
  ],

  invert: [
    -1, 0, 0, 0, isIos ? 1 : 255,
    0, -1, 0, 0, isIos ? 1 : 255,
    0, 0, -1, 0, isIos ? 1 : 255,
    0, 0, 0, 1, 0
  ],

  grayscale: [
    0.299, 0.587, 0.114, 0, 0,
    0.299, 0.587, 0.114, 0, 0,
    0.299, 0.587, 0.114, 0, 0,
    0, 0, 0, 1, 0
  ],

  sepia: [
    0.393, 0.769, 0.189, 0, 0,
    0.349, 0.686, 0.168, 0, 0,
    0.272, 0.534, 0.131, 0, 0,
    0, 0, 0, 1, 0
  ],

  nightvision: [
    0.1, 0.4, 0, 0, 0,
    0.3, 1, 0.3, 0, 0,
    0, 0.4, 0.1, 0, 0,
    0, 0, 0, 1, 0
  ],

  warm: [
    1.06, 0, 0, 0, 0,
    0, 1.01, 0, 0, 0,
    0, 0, 0.93, 0, 0,
    0, 0, 0, 1, 0
  ],

  cool: [
    0.99, 0, 0, 0, 0,
    0, 0.93, 0, 0, 0,
    0, 0, 1.08, 0, 0,
    0, 0, 0, 1, 0
  ],

  protanomaly: [
    0.817, 0.183, 0, 0, 0,
    0.333, 0.667, 0, 0, 0,
    0, 0.125, 0.875, 0, 0,
    0, 0, 0, 1, 0
  ],

  deuteranomaly: [
    0.8, 0.2, 0, 0, 0,
    0.258, 0.742, 0, 0, 0,
    0, 0.142, 0.858, 0, 0,
    0, 0, 0, 1, 0
  ],

  tritanomaly: [
    0.967, 0.033, 0, 0, 0,
    0, 0.733, 0.267, 0, 0,
    0, 0.183, 0.817, 0, 0,
    0, 0, 0, 1, 0
  ],

  protanopia: [
    0.567, 0.433, 0, 0, 0,
    0.558, 0.442, 0, 0, 0,
    0, 0.242, 0.758, 0, 0,
    0, 0, 0, 1, 0
  ],

  deuteranopia: [
    0.625, 0.375, 0, 0, 0,
    0.7, 0.3, 0, 0, 0,
    0, 0.3, 0.7, 0, 0,
    0, 0, 0, 1, 0
  ],

  tritanopia: [
    0.95, 0.05, 0, 0, 0,
    0, 0.433, 0.567, 0, 0,
    0, 0.475, 0.525, 0, 0,
    0, 0, 0, 1, 0
  ],

  achromatopsia: [
    0.299, 0.587, 0.114, 0, 0,
    0.299, 0.587, 0.114, 0, 0,
    0.299, 0.587, 0.114, 0, 0,
    0, 0, 0, 1, 0
  ],

  achromatomaly: [
    0.618, 0.320, 0.062, 0, 0,
    0.163, 0.775, 0.062, 0, 0,
    0.163, 0.320, 0.516, 0, 0,
    0, 0, 0, 1, 0
  ]
};

const filters = {
  normal: () => staticFilters.normal,

  saturate: (v = 0) => [
    0.213 + 0.787 * v, 0.715 - 0.715 * v, 0.072 - 0.072 * v, 0, 0,
    0.213 - 0.213 * v, 0.715 + 0.285 * v, 0.072 - 0.072 * v, 0, 0,
    0.213 - 0.213 * v, 0.715 - 0.715 * v, 0.072 + 0.928 * v, 0, 0,
    0, 0, 0, 1, 0
  ],

  hueRotate: (v = 0) => {
    const a00 = (0.213) + (Math.cos(v) * 0.787) - (Math.sin(v) * 0.213);
    const a01 = (0.715) - (Math.cos(v) * 0.715) - (Math.sin(v) * 0.715);
    const a02 = (0.072) - (Math.cos(v) * 0.072) + (Math.sin(v) * 0.928);
    const a10 = (0.213) - (Math.cos(v) * 0.213) + (Math.sin(v) * 0.143);
    const a11 = (0.715) + (Math.cos(v) * 0.285) + (Math.sin(v) * 0.140);
    const a12 = (0.072) - (Math.cos(v) * 0.072) - (Math.sin(v) * 0.283);
    const a20 = (0.213) - (Math.cos(v) * 0.213) - (Math.sin(v) * 0.787);
    const a21 = (0.715) - (Math.cos(v) * 0.715) + (Math.sin(v) * 0.715);
    const a22 = (0.072) + (Math.cos(v) * 0.928) + (Math.sin(v) * 0.072);

    return [
      a00, a01, a02, 0, 0,
      a10, a11, a12, 0, 0,
      a20, a21, a22, 0, 0,
      0, 0, 0, 1, 0,
    ];
  },

  luminanceToAlpha: () => staticFilters.luminanceToAlpha,

  invert: () => staticFilters.invert,

  grayscale: () => staticFilters.grayscale,

  sepia: () => staticFilters.sepia,

  nightvision: () => staticFilters.nightvision,

  warm: () => staticFilters.warm,

  cool: () => staticFilters.cool,

  brightness: (v = 0) => {
    const n = 255 * (v / 100);

    return [
      1, 0, 0, 0, n,
      0, 1, 0, 0, n,
      0, 0, 1, 0, n,
      0, 0, 0, 1, 0
    ];
  },

  exposure: (v) => {
    const n = Math.max(v, 0);

    return [
      n, 0, 0, 0, 0,
      0, n, 0, 0, 0,
      0, 0, n, 0, 0,
      0, 0, 0, 1, 0
    ];
  },

  contrast: (v = 1) => {
    const n = 0.5 * (1 - v);

    return [
      v, 0, 0, 0, n,
      0, v, 0, 0, n,
      0, 0, v, 0, n,
      0, 0, 0, 1, 0
    ];
  },

  temperature: (v = 0) => [
    1 + v, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1 - v, 0, 0,
    0, 0, 0, 1, 0
  ],

  tint: (v = 0) => [
    1 + v, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1 + v, 0, 0,
    0, 0, 0, 1, 0
  ],

  threshold: (v = 0) => {
    const r_lum = 0.3086;
    const g_lum = 0.6094;
    const b_lum = 0.0820;
    const r = r_lum * 256;
    const g = g_lum * 256;
    const b = b_lum * 256;

    return [
      r, g, b, 0, -255 * v,
      r, g, b, 0, -255 * v,
      r, g, b, 0, -255 * v,
      0, 0, 0, 1, 0
    ];
  },

  protanomaly: () => staticFilters.protanomaly,

  deuteranomaly: () => staticFilters.deuteranomaly,

  tritanomaly: () => staticFilters.tritanomaly,

  protanopia: () => staticFilters.protanopia,

  deuteranopia: () => staticFilters.deuteranopia,

  tritanopia: () => staticFilters.tritanopia,

  achromatopsia: () => staticFilters.achromatopsia,

  achromatomaly: () => staticFilters.achromatomaly
};

const concatColorMatrices = (matA, matB) => {
  const a = [...matA];
  const b = [...matB];
  const tmp = Array(20);

  let index = 0;
  for (let j = 0; j < 20; j += 5) {
    for (let i = 0; i < 4; i++) {
      tmp[index++] = a[j + 0] * b[i + 0] + a[j + 1] * b[i + 5] +
        a[j + 2] * b[i + 10] + a[j + 3] * b[i + 15];
    }
    tmp[index++] = a[j + 0] * b[4] + a[j + 1] * b[9] +
      a[j + 2] * b[14] + a[j + 3] * b[19] + a[j + 4];
  }

  return tmp;
};

const NativeImageMatrixFilter = requireNativeComponent(
  'RNImageMatrixFilter',
  {
    name: 'NativeImageMatrixFilter',
    propTypes: {
      matrix: PropTypes.arrayOf(PropTypes.number),
      ...View.propTypes
    }
  },
  {
    nativeOnly: {
      nativeBackgroundAndroid: true,
      nativeForegroundAndroid: true,
    }
  }
);

const ImageMatrixFilter = ({ style, children, matrix, parentMatrix, ...restProps }) => {
  checkStyle(style);

  const concatedMatrix = parentMatrix ? concatColorMatrices(matrix, parentMatrix) : matrix;

  const mappedChildren = Children.deepMap(
    children,
    child => (
      child && child.type === 'ImageMatrixFilter'
        ? cloneElement(child, { ...child.props, parentMatrix: concatedMatrix })
        : child
    )
  );

  return (
    <NativeImageMatrixFilter
      style={[defaultStyle.container, style]}
      matrix={concatedMatrix}
      {...restProps}
    >
      {mappedChildren}
    </NativeImageMatrixFilter>
  );
};

const createImageMatrixFilter = (filter) => ({ value, children, ...restProps }) => (
  <ImageMatrixFilter
    matrix={filter(value)}
    {...restProps}
  >
    {children}
  </ImageMatrixFilter>
);

export default Object.keys(filters).reduce(
  (acc, name) => {
    acc[`Image${upperCaseFirst(name)}MatrixFilter`] = createImageMatrixFilter(filters[name]);
    return acc;
  },
  { 'ImageMatrixFilter': ImageMatrixFilter }
);
