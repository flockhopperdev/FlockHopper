//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class RouteGeometry {
  /// Returns a new [RouteGeometry] instance.
  RouteGeometry({
    this.coordinates = const [],
    required this.distance,
    required this.duration,
  });

  /// Array of [longitude, latitude] pairs
  List<List<double>> coordinates;

  /// Route distance in meters
  double distance;

  /// Route duration in seconds
  double duration;

  @override
  bool operator ==(Object other) => identical(this, other) || other is RouteGeometry &&
    _deepEquality.equals(other.coordinates, coordinates) &&
    other.distance == distance &&
    other.duration == duration;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (coordinates.hashCode) +
    (distance.hashCode) +
    (duration.hashCode);

  @override
  String toString() => 'RouteGeometry[coordinates=$coordinates, distance=$distance, duration=$duration]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'coordinates'] = this.coordinates;
      json[r'distance'] = this.distance;
      json[r'duration'] = this.duration;
    return json;
  }

  /// Returns a new [RouteGeometry] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static RouteGeometry? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "RouteGeometry[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "RouteGeometry[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return RouteGeometry(
        coordinates: json[r'coordinates'] is List
          ? (json[r'coordinates'] as List).map((e) =>
              e == null ? const  <double>[] : (e as List).map((v) => (v as num).toDouble()).toList()
            ).toList()
          :  const [],
        distance: mapValueOfType<double>(json, r'distance')!,
        duration: mapValueOfType<double>(json, r'duration')!,
      );
    }
    return null;
  }

  static List<RouteGeometry> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <RouteGeometry>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = RouteGeometry.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, RouteGeometry> mapFromJson(dynamic json) {
    final map = <String, RouteGeometry>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = RouteGeometry.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of RouteGeometry-objects as value to a dart map
  static Map<String, List<RouteGeometry>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<RouteGeometry>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = RouteGeometry.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'coordinates',
    'distance',
    'duration',
  };
}

