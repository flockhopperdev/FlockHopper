# deflock_router_client.api.RoutingApi

## Load the API package
```dart
import 'package:deflock_router_client/api.dart';
```

All URIs are relative to *http://localhost:3001/api*

Method | HTTP request | Description
------------- | ------------- | -------------
[**compareRoutes**](RoutingApi.md#compareroutes) | **POST** /v1/route | Compare normal and camera-avoidance routes
[**getDirections**](RoutingApi.md#getdirections) | **POST** /v1/directions | Get camera-avoidance directions


# **compareRoutes**
> CompareRoutes200Response compareRoutes(routeComparisonRequest)

Compare normal and camera-avoidance routes

### Example
```dart
import 'package:deflock_router_client/api.dart';

final api_instance = RoutingApi();
final routeComparisonRequest = RouteComparisonRequest(); // RouteComparisonRequest | 

try {
    final result = api_instance.compareRoutes(routeComparisonRequest);
    print(result);
} catch (e) {
    print('Exception when calling RoutingApi->compareRoutes: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **routeComparisonRequest** | [**RouteComparisonRequest**](RouteComparisonRequest.md)|  | 

### Return type

[**CompareRoutes200Response**](CompareRoutes200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDirections**
> GetDirections200Response getDirections(directionsRequest)

Get camera-avoidance directions

### Example
```dart
import 'package:deflock_router_client/api.dart';

final api_instance = RoutingApi();
final directionsRequest = DirectionsRequest(); // DirectionsRequest | 

try {
    final result = api_instance.getDirections(directionsRequest);
    print(result);
} catch (e) {
    print('Exception when calling RoutingApi->getDirections: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **directionsRequest** | [**DirectionsRequest**](DirectionsRequest.md)|  | 

### Return type

[**GetDirections200Response**](GetDirections200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

