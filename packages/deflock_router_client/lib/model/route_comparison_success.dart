//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class RouteComparisonSuccess {
  /// Returns a new [RouteComparisonSuccess] instance.
  RouteComparisonSuccess({
    required this.ok,
    required this.result,
  });

  RouteComparisonSuccessOkEnum ok;

  RouteComparisonResult result;

  @override
  bool operator ==(Object other) => identical(this, other) || other is RouteComparisonSuccess &&
    other.ok == ok &&
    other.result == result;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (ok.hashCode) +
    (result.hashCode);

  @override
  String toString() => 'RouteComparisonSuccess[ok=$ok, result=$result]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'ok'] = this.ok;
      json[r'result'] = this.result;
    return json;
  }

  /// Returns a new [RouteComparisonSuccess] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static RouteComparisonSuccess? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "RouteComparisonSuccess[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "RouteComparisonSuccess[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return RouteComparisonSuccess(
        ok: RouteComparisonSuccessOkEnum.fromJson(json[r'ok'])!,
        result: RouteComparisonResult.fromJson(json[r'result'])!,
      );
    }
    return null;
  }

  static List<RouteComparisonSuccess> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <RouteComparisonSuccess>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = RouteComparisonSuccess.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, RouteComparisonSuccess> mapFromJson(dynamic json) {
    final map = <String, RouteComparisonSuccess>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = RouteComparisonSuccess.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of RouteComparisonSuccess-objects as value to a dart map
  static Map<String, List<RouteComparisonSuccess>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<RouteComparisonSuccess>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = RouteComparisonSuccess.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'ok',
    'result',
  };
}


class RouteComparisonSuccessOkEnum {
  /// Instantiate a new enum with the provided [value].
  const RouteComparisonSuccessOkEnum._(this.value);

  /// The underlying value of this enum member.
  final bool value;

  @override
  String toString() => value.toString();

  bool toJson() => value;

  static const true_ = RouteComparisonSuccessOkEnum._(true);

  /// List of all possible values in this [enum][RouteComparisonSuccessOkEnum].
  static const values = <RouteComparisonSuccessOkEnum>[
    true_,
  ];

  static RouteComparisonSuccessOkEnum? fromJson(dynamic value) => RouteComparisonSuccessOkEnumTypeTransformer().decode(value);

  static List<RouteComparisonSuccessOkEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <RouteComparisonSuccessOkEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = RouteComparisonSuccessOkEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [RouteComparisonSuccessOkEnum] to bool,
/// and [decode] dynamic data back to [RouteComparisonSuccessOkEnum].
class RouteComparisonSuccessOkEnumTypeTransformer {
  factory RouteComparisonSuccessOkEnumTypeTransformer() => _instance ??= const RouteComparisonSuccessOkEnumTypeTransformer._();

  const RouteComparisonSuccessOkEnumTypeTransformer._();

  bool encode(RouteComparisonSuccessOkEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a RouteComparisonSuccessOkEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  RouteComparisonSuccessOkEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case true: return RouteComparisonSuccessOkEnum.true_;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [RouteComparisonSuccessOkEnumTypeTransformer] instance.
  static RouteComparisonSuccessOkEnumTypeTransformer? _instance;
}


