//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class DirectionsRequest {
  /// Returns a new [DirectionsRequest] instance.
  DirectionsRequest({
    required this.start,
    required this.end,
    this.avoidanceDistance = 250,
    this.enabledProfiles = const [],
    this.showExclusionZone = false,
  });

  Coordinate start;

  Coordinate end;

  /// Camera avoidance radius in meters
  int avoidanceDistance;

  /// Camera profiles to avoid (filters which camera types to consider)
  List<NodeProfile> enabledProfiles;

  /// If true, include a GeoJSON MultiPolygon of avoided areas in the response
  bool showExclusionZone;

  @override
  bool operator ==(Object other) => identical(this, other) || other is DirectionsRequest &&
    other.start == start &&
    other.end == end &&
    other.avoidanceDistance == avoidanceDistance &&
    _deepEquality.equals(other.enabledProfiles, enabledProfiles) &&
    other.showExclusionZone == showExclusionZone;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (start.hashCode) +
    (end.hashCode) +
    (avoidanceDistance.hashCode) +
    (enabledProfiles.hashCode) +
    (showExclusionZone.hashCode);

  @override
  String toString() => 'DirectionsRequest[start=$start, end=$end, avoidanceDistance=$avoidanceDistance, enabledProfiles=$enabledProfiles, showExclusionZone=$showExclusionZone]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'start'] = this.start;
      json[r'end'] = this.end;
      json[r'avoidance_distance'] = this.avoidanceDistance;
      json[r'enabled_profiles'] = this.enabledProfiles;
      json[r'show_exclusion_zone'] = this.showExclusionZone;
    return json;
  }

  /// Returns a new [DirectionsRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static DirectionsRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "DirectionsRequest[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "DirectionsRequest[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return DirectionsRequest(
        start: Coordinate.fromJson(json[r'start'])!,
        end: Coordinate.fromJson(json[r'end'])!,
        avoidanceDistance: mapValueOfType<int>(json, r'avoidance_distance') ?? 250,
        enabledProfiles: NodeProfile.listFromJson(json[r'enabled_profiles']),
        showExclusionZone: mapValueOfType<bool>(json, r'show_exclusion_zone') ?? false,
      );
    }
    return null;
  }

  static List<DirectionsRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <DirectionsRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = DirectionsRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, DirectionsRequest> mapFromJson(dynamic json) {
    final map = <String, DirectionsRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = DirectionsRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of DirectionsRequest-objects as value to a dart map
  static Map<String, List<DirectionsRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<DirectionsRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = DirectionsRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'start',
    'end',
  };
}

