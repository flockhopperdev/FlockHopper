//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CompareRoutes200Response {
  /// Returns a new [CompareRoutes200Response] instance.
  CompareRoutes200Response({
    required this.ok,
    required this.result,
    required this.error,
  });

  CompareRoutes200ResponseOkEnum ok;

  RouteComparisonResult result;

  /// Human-readable error message
  String error;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CompareRoutes200Response &&
    other.ok == ok &&
    other.result == result &&
    other.error == error;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (ok.hashCode) +
    (result.hashCode) +
    (error.hashCode);

  @override
  String toString() => 'CompareRoutes200Response[ok=$ok, result=$result, error=$error]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'ok'] = this.ok;
      json[r'result'] = this.result;
      json[r'error'] = this.error;
    return json;
  }

  /// Returns a new [CompareRoutes200Response] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CompareRoutes200Response? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "CompareRoutes200Response[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "CompareRoutes200Response[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return CompareRoutes200Response(
        ok: CompareRoutes200ResponseOkEnum.fromJson(json[r'ok'])!,
        result: RouteComparisonResult.fromJson(json[r'result'])!,
        error: mapValueOfType<String>(json, r'error')!,
      );
    }
    return null;
  }

  static List<CompareRoutes200Response> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CompareRoutes200Response>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CompareRoutes200Response.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CompareRoutes200Response> mapFromJson(dynamic json) {
    final map = <String, CompareRoutes200Response>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CompareRoutes200Response.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CompareRoutes200Response-objects as value to a dart map
  static Map<String, List<CompareRoutes200Response>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CompareRoutes200Response>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CompareRoutes200Response.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'ok',
    'result',
    'error',
  };
}


class CompareRoutes200ResponseOkEnum {
  /// Instantiate a new enum with the provided [value].
  const CompareRoutes200ResponseOkEnum._(this.value);

  /// The underlying value of this enum member.
  final bool value;

  @override
  String toString() => value.toString();

  bool toJson() => value;

  static const false_ = CompareRoutes200ResponseOkEnum._(false);

  /// List of all possible values in this [enum][CompareRoutes200ResponseOkEnum].
  static const values = <CompareRoutes200ResponseOkEnum>[
    false_,
  ];

  static CompareRoutes200ResponseOkEnum? fromJson(dynamic value) => CompareRoutes200ResponseOkEnumTypeTransformer().decode(value);

  static List<CompareRoutes200ResponseOkEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CompareRoutes200ResponseOkEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CompareRoutes200ResponseOkEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [CompareRoutes200ResponseOkEnum] to bool,
/// and [decode] dynamic data back to [CompareRoutes200ResponseOkEnum].
class CompareRoutes200ResponseOkEnumTypeTransformer {
  factory CompareRoutes200ResponseOkEnumTypeTransformer() => _instance ??= const CompareRoutes200ResponseOkEnumTypeTransformer._();

  const CompareRoutes200ResponseOkEnumTypeTransformer._();

  bool encode(CompareRoutes200ResponseOkEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a CompareRoutes200ResponseOkEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  CompareRoutes200ResponseOkEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case false: return CompareRoutes200ResponseOkEnum.false_;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [CompareRoutes200ResponseOkEnumTypeTransformer] instance.
  static CompareRoutes200ResponseOkEnumTypeTransformer? _instance;
}


