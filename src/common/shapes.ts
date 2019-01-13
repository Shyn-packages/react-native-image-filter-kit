import { bool, image, resizeMode, color, offset, text, marker, scalar } from './inputs'

export const Composition = {
  dstImage: image,
  dstAnchor: offset,
  dstPosition: offset,
  dstRotate: scalar,
  dstResizeMode: resizeMode,
  srcImage: image,
  srcAnchor: offset,
  srcPosition: offset,
  srcRotate: scalar,
  srcResizeMode: resizeMode,
  resizeCanvasTo: text,
  disableCache: bool,
  swapImages: bool
}

export const Common = {
  image: image,
  disableCache: bool
}

export const BlendColor = {
  dstImage: image,
  srcColor: color,
  disableCache: bool
}

export const Generator = {
  ...Common,
  isGenerator: marker
}

export const CompositionBaseIos = {
  resizeCanvasTo: text,
  inputImage: image,
  inputImageResizeMode: resizeMode,
  inputImageAnchor: offset,
  inputImagePosition: offset,
  inputImageRotate: scalar,
  clampToExtent: bool,
  disableCache: bool,
  swapImages: bool
}

export const CommonIos = {
  inputImage: image,
  clampToExtent: bool,
  disableCache: bool
}

export const GeneratorIos = {
  ...CommonIos,
  isGenerator: marker
}
