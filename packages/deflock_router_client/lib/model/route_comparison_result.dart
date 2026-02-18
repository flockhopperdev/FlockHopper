//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class RouteComparisonResult {
  /// Returns a new [RouteComparisonResult] instance.
  RouteComparisonResult({
    required this.route,
    required this.normalRoute,
    required this.camerasAvoided,
    required this.cameraReductionPercent,
    required this.normalCameraCount,
    required this.avoidanceCameraCount,
    this.normalCameras = const [],
    this.avoidanceCameras = const [],
    required this.distanceIncreasePercent,
    this.durationIncreasePercent,
    required this.strategy,
  });

  /// Camera-avoidance route
  RouteGeometry route;

  /// Normal (shortest) route
  RouteGeometry normalRoute;

  /// Number of cameras avoided compared to normal route
  int camerasAvoided;

  /// Percentage reduction in camera exposure
  double cameraReductionPercent;

  /// Number of cameras on the normal route
  int normalCameraCount;

  /// Number of cameras on the avoidance route
  int avoidanceCameraCount;

  /// Cameras encountered on the normal route
  List<CameraOnRoute> normalCameras;

  /// Cameras encountered on the avoidance route
  List<CameraOnRoute> avoidanceCameras;

  /// Percentage increase in distance for the avoidance route
  double distanceIncreasePercent;

  /// Percentage increase in duration for the avoidance route
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  double? durationIncreasePercent;

  /// Routing strategy used (e.g. \"normal\", \"iterative\", \"aggressive-polygon\")
  String strategy;

  @override
  bool operator ==(Object other) => identical(this, other) || other is RouteComparisonResult &&
    other.route == route &&
    other.normalRoute == normalRoute &&
    other.camerasAvoided == camerasAvoided &&
    other.cameraReductionPercent == cameraReductionPercent &&
    other.normalCameraCount == normalCameraCount &&
    other.avoidanceCameraCount == avoidanceCameraCount &&
    _deepEquality.equals(other.normalCameras, normalCameras) &&
    _deepEquality.equals(other.avoidanceCameras, avoidanceCameras) &&
    other.distanceIncreasePercent == distanceIncreasePercent &&
    other.durationIncreasePercent == durationIncreasePercent &&
    other.strategy == strategy;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (route.hashCode) +
    (normalRoute.hashCode) +
    (camerasAvoided.hashCode) +
    (cameraReductionPercent.hashCode) +
    (normalCameraCount.hashCode) +
    (avoidanceCameraCount.hashCode) +
    (normalCameras.hashCode) +
    (avoidanceCameras.hashCode) +
    (distanceIncreasePercent.hashCode) +
    (durationIncreasePercent == null ? 0 : durationIncreasePercent!.hashCode) +
    (strategy.hashCode);

  @override
  String toString() => 'RouteComparisonResult[route=$route, normalRoute=$normalRoute, camerasAvoided=$camerasAvoided, cameraReductionPercent=$cameraReductionPercent, normalCameraCount=$normalCameraCount, avoidanceCameraCount=$avoidanceCameraCount, normalCameras=$normalCameras, avoidanceCameras=$avoidanceCameras, distanceIncreasePercent=$distanceIncreasePercent, durationIncreasePercent=$durationIncreasePercent, strategy=$strategy]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'route'] = this.route;
      json[r'normal_route'] = this.normalRoute;
      json[r'cameras_avoided'] = this.camerasAvoided;
      json[r'camera_reduction_percent'] = this.cameraReductionPercent;
      json[r'normal_camera_count'] = this.normalCameraCount;
      json[r'avoidance_camera_count'] = this.avoidanceCameraCount;
      json[r'normal_cameras'] = this.normalCameras;
      json[r'avoidance_cameras'] = this.avoidanceCameras;
      json[r'distance_increase_percent'] = this.distanceIncreasePercent;
    if (this.durationIncreasePercent != null) {
      json[r'duration_increase_percent'] = this.durationIncreasePercent;
    } else {
      json[r'duration_increase_percent'] = null;
    }
      json[r'strategy'] = this.strategy;
    return json;
  }

  /// Returns a new [RouteComparisonResult] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static RouteComparisonResult? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "RouteComparisonResult[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "RouteComparisonResult[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return RouteComparisonResult(
        route: RouteGeometry.fromJson(json[r'route'])!,
        normalRoute: RouteGeometry.fromJson(json[r'normal_route'])!,
        camerasAvoided: mapValueOfType<int>(json, r'cameras_avoided')!,
        cameraReductionPercent: mapValueOfType<double>(json, r'camera_reduction_percent')!,
        normalCameraCount: mapValueOfType<int>(json, r'normal_camera_count')!,
        avoidanceCameraCount: mapValueOfType<int>(json, r'avoidance_camera_count')!,
        normalCameras: CameraOnRoute.listFromJson(json[r'normal_cameras']),
        avoidanceCameras: CameraOnRoute.listFromJson(json[r'avoidance_cameras']),
        distanceIncreasePercent: mapValueOfType<double>(json, r'distance_increase_percent')!,
        durationIncreasePercent: mapValueOfType<double>(json, r'duration_increase_percent'),
        strategy: mapValueOfType<String>(json, r'strategy')!,
      );
    }
    return null;
  }

  static List<RouteComparisonResult> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <RouteComparisonResult>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = RouteComparisonResult.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, RouteComparisonResult> mapFromJson(dynamic json) {
    final map = <String, RouteComparisonResult>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = RouteComparisonResult.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of RouteComparisonResult-objects as value to a dart map
  static Map<String, List<RouteComparisonResult>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<RouteComparisonResult>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = RouteComparisonResult.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'route',
    'normal_route',
    'cameras_avoided',
    'camera_reduction_percent',
    'normal_camera_count',
    'avoidance_camera_count',
    'distance_increase_percent',
    'strategy',
  };
}

