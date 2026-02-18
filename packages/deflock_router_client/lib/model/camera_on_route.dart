//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CameraOnRoute {
  /// Returns a new [CameraOnRoute] instance.
  CameraOnRoute({
    required this.lat,
    required this.lon,
    this.operator_,
    this.brand,
    this.direction,
    required this.distanceFromRoute,
    this.isFacingRoute,
  });

  double lat;

  double lon;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? operator_;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? brand;

  /// Camera direction in degrees (0-360)
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  double? direction;

  /// Distance from the route in meters
  double distanceFromRoute;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? isFacingRoute;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CameraOnRoute &&
    other.lat == lat &&
    other.lon == lon &&
    other.operator_ == operator_ &&
    other.brand == brand &&
    other.direction == direction &&
    other.distanceFromRoute == distanceFromRoute &&
    other.isFacingRoute == isFacingRoute;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (lat.hashCode) +
    (lon.hashCode) +
    (operator_ == null ? 0 : operator_!.hashCode) +
    (brand == null ? 0 : brand!.hashCode) +
    (direction == null ? 0 : direction!.hashCode) +
    (distanceFromRoute.hashCode) +
    (isFacingRoute == null ? 0 : isFacingRoute!.hashCode);

  @override
  String toString() => 'CameraOnRoute[lat=$lat, lon=$lon, operator_=$operator_, brand=$brand, direction=$direction, distanceFromRoute=$distanceFromRoute, isFacingRoute=$isFacingRoute]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'lat'] = this.lat;
      json[r'lon'] = this.lon;
    if (this.operator_ != null) {
      json[r'operator'] = this.operator_;
    } else {
      json[r'operator'] = null;
    }
    if (this.brand != null) {
      json[r'brand'] = this.brand;
    } else {
      json[r'brand'] = null;
    }
    if (this.direction != null) {
      json[r'direction'] = this.direction;
    } else {
      json[r'direction'] = null;
    }
      json[r'distance_from_route'] = this.distanceFromRoute;
    if (this.isFacingRoute != null) {
      json[r'is_facing_route'] = this.isFacingRoute;
    } else {
      json[r'is_facing_route'] = null;
    }
    return json;
  }

  /// Returns a new [CameraOnRoute] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CameraOnRoute? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "CameraOnRoute[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "CameraOnRoute[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return CameraOnRoute(
        lat: mapValueOfType<double>(json, r'lat')!,
        lon: mapValueOfType<double>(json, r'lon')!,
        operator_: mapValueOfType<String>(json, r'operator'),
        brand: mapValueOfType<String>(json, r'brand'),
        direction: mapValueOfType<double>(json, r'direction'),
        distanceFromRoute: mapValueOfType<double>(json, r'distance_from_route')!,
        isFacingRoute: mapValueOfType<bool>(json, r'is_facing_route'),
      );
    }
    return null;
  }

  static List<CameraOnRoute> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CameraOnRoute>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CameraOnRoute.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CameraOnRoute> mapFromJson(dynamic json) {
    final map = <String, CameraOnRoute>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CameraOnRoute.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CameraOnRoute-objects as value to a dart map
  static Map<String, List<CameraOnRoute>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CameraOnRoute>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CameraOnRoute.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'lat',
    'lon',
    'distance_from_route',
  };
}

