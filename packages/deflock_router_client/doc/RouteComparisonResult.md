# deflock_router_client.model.RouteComparisonResult

## Load the model package
```dart
import 'package:deflock_router_client/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**route** | [**RouteGeometry**](RouteGeometry.md) | Camera-avoidance route | 
**normalRoute** | [**RouteGeometry**](RouteGeometry.md) | Normal (shortest) route | 
**camerasAvoided** | **int** | Number of cameras avoided compared to normal route | 
**cameraReductionPercent** | **double** | Percentage reduction in camera exposure | 
**normalCameraCount** | **int** | Number of cameras on the normal route | 
**avoidanceCameraCount** | **int** | Number of cameras on the avoidance route | 
**normalCameras** | [**List<CameraOnRoute>**](CameraOnRoute.md) | Cameras encountered on the normal route | [optional] [default to const []]
**avoidanceCameras** | [**List<CameraOnRoute>**](CameraOnRoute.md) | Cameras encountered on the avoidance route | [optional] [default to const []]
**distanceIncreasePercent** | **double** | Percentage increase in distance for the avoidance route | 
**durationIncreasePercent** | **double** | Percentage increase in duration for the avoidance route | [optional] 
**strategy** | **String** | Routing strategy used (e.g. \"normal\", \"iterative\", \"aggressive-polygon\") | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


