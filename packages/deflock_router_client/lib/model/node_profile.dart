//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class NodeProfile {
  /// Returns a new [NodeProfile] instance.
  NodeProfile({
    required this.id,
    required this.name,
    this.tags = const {},
  });

  String id;

  String name;

  /// OSM tag key-value pairs identifying a camera type
  Map<String, String> tags;

  @override
  bool operator ==(Object other) => identical(this, other) || other is NodeProfile &&
    other.id == id &&
    other.name == name &&
    _deepEquality.equals(other.tags, tags);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (name.hashCode) +
    (tags.hashCode);

  @override
  String toString() => 'NodeProfile[id=$id, name=$name, tags=$tags]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'name'] = this.name;
      json[r'tags'] = this.tags;
    return json;
  }

  /// Returns a new [NodeProfile] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static NodeProfile? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "NodeProfile[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "NodeProfile[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return NodeProfile(
        id: mapValueOfType<String>(json, r'id')!,
        name: mapValueOfType<String>(json, r'name')!,
        tags: mapCastOfType<String, String>(json, r'tags')!,
      );
    }
    return null;
  }

  static List<NodeProfile> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <NodeProfile>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = NodeProfile.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, NodeProfile> mapFromJson(dynamic json) {
    final map = <String, NodeProfile>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = NodeProfile.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of NodeProfile-objects as value to a dart map
  static Map<String, List<NodeProfile>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<NodeProfile>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = NodeProfile.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'name',
    'tags',
  };
}

