#import <Foundation/Foundation.h>
#import "Image/RCTImageView.h"
#import "Image/RCTImageUtils.h"
#import "RNImageFilter.h"

#define UPDATE_FILTER_CUSTOM_NUMBER_PROPERTY(name, prop, Prop)                    \
- (void)updateInput##Prop:(CIFilter *)filter {                                    \
  if ([_paramNames containsObject:@#name]) {                                      \
    [filter setValue:[NSNumber numberWithFloat:_##prop] forKey:@"input" @#Prop];  \
  }                                                                               \
}

#define UPDATE_FILTER_NUMBER_PROPERTY(prop, Prop)        \
  UPDATE_FILTER_CUSTOM_NUMBER_PROPERTY(prop, prop, Prop)

#define UPDATE_FILTER_CUSTOM_VECTOR_4_PROPERTY(name, prop, Prop)                     \
- (void)updateInput##Prop:(CIFilter *)filter {                                       \
  if ([_paramNames containsObject:@#name]) {                                         \
    CGFloat v[4] = {                                                                 \
      [_##prop[0] floatValue],                                                       \
      [_##prop[1] floatValue],                                                       \
      [_##prop[2] floatValue],                                                       \
      [_##prop[3] floatValue]                                                        \
    };                                                                               \
    [filter setValue:[CIVector vectorWithValues:v count:4] forKey:@"input" @#Prop];  \
  }                                                                                  \
}

#define UPDATE_FILTER_VECTOR_4_PROPERTY(prop, Prop)        \
  UPDATE_FILTER_CUSTOM_VECTOR_4_PROPERTY(prop, prop, Prop)

#define UPDATE_FILTER_CUSTOM_RELATIVE_POINT_PROPERTY(name, prop, Prop)            \
- (void)updateInput##Prop:(CIFilter *)filter bounds:(CGSize)bounds {              \
  if ([_paramNames containsObject:@#name]) {                                      \
    CGPoint p = CGPointMake(_##prop.x * bounds.width, _##prop.y * bounds.height); \
    [filter setValue:[CIVector vectorWithCGPoint:p] forKey:@"input" @#Prop];      \
  }                                                                               \
}

#define UPDATE_FILTER_RELATIVE_POINT_PROPERTY(prop, Prop)       \
  UPDATE_FILTER_CUSTOM_RELATIVE_POINT_PROPERTY(prop, prop, Prop)


@interface UIImage (React)

@property (nonatomic, copy) CAKeyframeAnimation *reactKeyframeAnimation;

@end

static UIImage *RCTResizeImageIfNeeded(UIImage *image,
                                       CGSize size,
                                       CGFloat scale,
                                       RCTResizeMode resizeMode)
{
  if (CGSizeEqualToSize(size, CGSizeZero) ||
      CGSizeEqualToSize(image.size, CGSizeZero) ||
      CGSizeEqualToSize(image.size, size)) {
    return image;
  }
  CAKeyframeAnimation *animation = image.reactKeyframeAnimation;
  CGRect targetSize = RCTTargetRect(image.size, size, scale, resizeMode);
  CGAffineTransform transform = RCTTransformFromTargetRect(image.size, targetSize);
  image = RCTTransformImage(image, size, scale, transform);
  image.reactKeyframeAnimation = animation;
  return image;
}

static CIContext* context;

@interface RNImageFilter ()

@property (nonatomic, strong) NSMapTable<UIView *, CIImage *> *originalImages;
@property (nonatomic, strong) CIFilter* filter;

- (void)drawImages:(CIFilter* )filter;

@end

@implementation RNImageFilter

- (instancetype)initWithFrame:(CGRect)frame
{
  if ((self = [super initWithFrame:frame])) {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
      //      CFAbsoluteTime start = CFAbsoluteTimeGetCurrent();
      // use metal context if supported ?
      EAGLContext *eaglContext = [[EAGLContext alloc] initWithAPI:kEAGLRenderingAPIOpenGLES3];
      eaglContext = eaglContext ?: [[EAGLContext alloc] initWithAPI:kEAGLRenderingAPIOpenGLES2];
      
      context = [CIContext contextWithEAGLContext:eaglContext];
      //      NSLog(@"filter: context %f", CFAbsoluteTimeGetCurrent() - start);
    });

    _originalImages = [NSMapTable weakToStrongObjectsMapTable];
  }
  
  return self;
}

- (void)dealloc
{
  for (UIView *child in self.subviews) {
    if ([child isKindOfClass:[RCTImageView class]]) {
      [child removeObserver:self forKeyPath:@"image"];
    }
  }
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  
  for (UIView *child in self.subviews) {
    if ([child isKindOfClass:[RCTImageView class]]) {
      [child addObserver:self
              forKeyPath:@"image"
                 options:NSKeyValueObservingOptionNew
                 context:NULL];
    }
  }
}

UPDATE_FILTER_NUMBER_PROPERTY(radius, Radius);
UPDATE_FILTER_NUMBER_PROPERTY(angle, Angle);
UPDATE_FILTER_NUMBER_PROPERTY(noiseLevel, NoiseLevel);
UPDATE_FILTER_NUMBER_PROPERTY(sharpness, Sharpness);
UPDATE_FILTER_NUMBER_PROPERTY(amount, Amount);
UPDATE_FILTER_NUMBER_PROPERTY(saturation, Saturation);
UPDATE_FILTER_NUMBER_PROPERTY(brightness, Brightness);
UPDATE_FILTER_NUMBER_PROPERTY(contrast, Contrast);
UPDATE_FILTER_NUMBER_PROPERTY(levels, Levels);
UPDATE_FILTER_VECTOR_4_PROPERTY(minComponents, MinComponents);
UPDATE_FILTER_VECTOR_4_PROPERTY(maxComponents, MaxComponents);
UPDATE_FILTER_CUSTOM_RELATIVE_POINT_PROPERTY(center, filterCenter, Center);

- (void)updateInputWidth:(CIFilter *)filter {
  if ([_paramNames containsObject:@"filterWidth"]) {
    [filter setValue:[NSNumber numberWithFloat:_filterWidth] forKey:@"inputWidth"];
  }
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary *)change
                       context:(void *)context {
  if ([keyPath isEqualToString:@"image"]) {
    [_originalImages removeObjectForKey:object];
    [self drawImages: [_filter copy]];
  }
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps
{
  NSLog(@"filter: %@", changedProps);
  if ([changedProps containsObject:@"name"]) {
    NSLog(@"filter: %@", _name);
    _filter = [CIFilter filterWithName:_name];
  }
  
  [self updateInputAngle:_filter];
  [self updateInputAmount:_filter];
  [self updateInputLevels:_filter];
  [self updateInputRadius:_filter];
  [self updateInputContrast:_filter];
  [self updateInputSharpness:_filter];
  [self updateInputBrightness:_filter];
  [self updateInputNoiseLevel:_filter];
  [self updateInputSaturation:_filter];
  [self updateInputMinComponents:_filter];
  [self updateInputMaxComponents:_filter];
  [self updateInputWidth:_filter];
  
  for (NSString* paramName in _paramNames) {
    if ([changedProps containsObject:paramName]) {
      [self drawImages:[_filter copy]];
      break;
    }
  }
}

- (void)drawImages:(CIFilter *)filter {
  //  CFAbsoluteTime start = CFAbsoluteTimeGetCurrent();
  if (filter) {
    for (RCTImageView *child in self.subviews) {
      if ([child isKindOfClass:[RCTImageView class]]) {
        
        CIImage* originalImage = [_originalImages objectForKey:child];
        CIImage* image = originalImage
          ? originalImage
          : [[CIImage alloc] initWithImage:child.image];
        
        [_originalImages setObject:image forKey:child];
        
        [filter setValue:image forKey:@"inputImage"];
        
        [self updateInputCenter:filter bounds:image.extent.size];
        
        CGImageRef cgim = [context createCGImage:filter.outputImage
                                        fromRect:image.extent];
        
        UIImage *newImage = RCTResizeImageIfNeeded([UIImage imageWithCGImage:cgim],
                                                   child.image.size,
                                                   child.image.scale,
                                                   child.resizeMode);
        
        [child removeObserver:self forKeyPath:@"image"];
        [child setImage:newImage];
        [child addObserver:self
                forKeyPath:@"image"
                   options:NSKeyValueObservingOptionNew
                   context:NULL];
        
        CGImageRelease(cgim);
      }
    }
  }
  //  NSLog(@"filter: draw %f", CFAbsoluteTimeGetCurrent() - start);
}

@end
