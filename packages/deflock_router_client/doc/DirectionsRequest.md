# deflock_router_client.model.DirectionsRequest

## Load the model package
```dart
import 'package:deflock_router_client/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**start** | [**Coordinate**](Coordinate.md) |  | 
**end** | [**Coordinate**](Coordinate.md) |  | 
**avoidanceDistance** | **int** | Camera avoidance radius in meters | [optional] [default to 250]
**enabledProfiles** | [**List<NodeProfile>**](NodeProfile.md) | Camera profiles to avoid (filters which camera types to consider) | [optional] [default to const []]
**showExclusionZone** | **bool** | If true, include a GeoJSON MultiPolygon of avoided areas in the response | [optional] [default to false]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


