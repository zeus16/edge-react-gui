#import "EmbraceManager.h"
#import <Embrace/Embrace.h>

@implementation EmbraceManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(endAppStartup) {
  [[Embrace sharedInstance] endAppStartup];
}

RCT_EXPORT_METHOD(setUserIdentifier:(NSString*)userIdentifier) {
  [[Embrace sharedInstance] setUserIdentifier:userIdentifier];
}

RCT_EXPORT_METHOD(setUsername:(NSString*)username) {
  [[Embrace sharedInstance] setUsername:username];
}

RCT_EXPORT_METHOD(setUserEmail:(NSString*)userEmail) {
  [[Embrace sharedInstance] setUserEmail:userEmail];
}

RCT_EXPORT_METHOD(clearUserEmail) {
  [[Embrace sharedInstance] clearUserEmail];
}

RCT_EXPORT_METHOD(clearUserIdentifier) {
  [[Embrace sharedInstance] clearUserIdentifier];
}

RCT_EXPORT_METHOD(clearUsername) {
  [[Embrace sharedInstance] clearUsername];
}

RCT_EXPORT_METHOD(logBreadcrumb:(NSString*)message) {
  [[Embrace sharedInstance] logBreadcrumbWithMessage:message];
}

RCT_EXPORT_METHOD(startMomentWithName:(NSString*)name) {
  [[Embrace sharedInstance] startMomentWithName:name];
}

RCT_EXPORT_METHOD(startMomentWithNameAndIdentifier:(NSString*)name identifier:(NSString*)identifier) {
  [[Embrace sharedInstance] startMomentWithName:name identifier:identifier];
}

RCT_EXPORT_METHOD(startMomentWithNameAndIdentifierAndProperties:(NSString*)name identifier:(NSString*)identifier properties:(NSDictionary*)properties) {
  [[Embrace sharedInstance] startMomentWithName:name identifier:identifier properties:properties];
}

RCT_EXPORT_METHOD(startMomentWithNameAndIdentifierAllowingScreenshot:(NSString*)name identifier:(NSString*)identifier allowScreenshot:(BOOL)allowScreenshot) {
  [[Embrace sharedInstance] startMomentWithName:name identifier:identifier allowScreenshot:allowScreenshot];
}

RCT_EXPORT_METHOD(startMomentWithNameAndIdentifierAndPropertiesAllowingScreenshot:(NSString*)name identifier:(NSString*)identifier properties:(NSDictionary*)properties allowingScreenshot:(BOOL)allowingScreenshot) {
  [[Embrace sharedInstance] startMomentWithName:name identifier:identifier allowScreenshot:allowingScreenshot properties:properties];
}

RCT_EXPORT_METHOD(endMomentWithName:(NSString*)name) {
  [[Embrace sharedInstance] endMomentWithName:name];
}

RCT_EXPORT_METHOD(endMomentWithNameAndIdentifier:(NSString*)name identifier:(NSString*)identifier) {
  [[Embrace sharedInstance] endMomentWithName:name identifier:identifier];
}

RCT_EXPORT_METHOD(setUserPersona:(NSString*)persona) {
  [[Embrace sharedInstance] setUserPersona:persona];
}

RCT_EXPORT_METHOD(clearUserPersona:(NSString*)persona) {
  [[Embrace sharedInstance] clearUserPersona:persona];
}

-(EMBSeverity)severityFromString:(NSString*)inputString {
  if ([inputString isEqualToString:@"info"]) {
    return EMBSeverityInfo;
  } else if ([inputString isEqualToString:@"warning"]) {
    return EMBSeverityWarning;
  }
  return EMBSeverityError;
}

RCT_EXPORT_METHOD(logMessageWithSeverity:(NSString*)message severity:(NSString*)severity) {
  [[Embrace sharedInstance] logMessage:message withSeverity:[self severityFromString:severity]];
}

RCT_EXPORT_METHOD(logMessageWithSeverityAndProperties:(NSString*)message severity:(NSString*)severity properties:(NSDictionary*)properties) {
  [[Embrace sharedInstance] logMessage:message withSeverity:[self severityFromString:severity] properties:properties];
}

@end
