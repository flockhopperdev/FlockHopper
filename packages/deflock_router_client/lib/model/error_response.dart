//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ErrorResponse {
  /// Returns a new [ErrorResponse] instance.
  ErrorResponse({
    required this.ok,
    required this.error,
  });

  ErrorResponseOkEnum ok;

  /// Human-readable error message
  String error;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ErrorResponse &&
    other.ok == ok &&
    other.error == error;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (ok.hashCode) +
    (error.hashCode);

  @override
  String toString() => 'ErrorResponse[ok=$ok, error=$error]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'ok'] = this.ok;
      json[r'error'] = this.error;
    return json;
  }

  /// Returns a new [ErrorResponse] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ErrorResponse? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        requiredKeys.forEach((key) {
          assert(json.containsKey(key), 'Required key "ErrorResponse[$key]" is missing from JSON.');
          assert(json[key] != null, 'Required key "ErrorResponse[$key]" has a null value in JSON.');
        });
        return true;
      }());

      return ErrorResponse(
        ok: ErrorResponseOkEnum.fromJson(json[r'ok'])!,
        error: mapValueOfType<String>(json, r'error')!,
      );
    }
    return null;
  }

  static List<ErrorResponse> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ErrorResponse>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ErrorResponse.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ErrorResponse> mapFromJson(dynamic json) {
    final map = <String, ErrorResponse>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ErrorResponse.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ErrorResponse-objects as value to a dart map
  static Map<String, List<ErrorResponse>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ErrorResponse>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ErrorResponse.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'ok',
    'error',
  };
}


class ErrorResponseOkEnum {
  /// Instantiate a new enum with the provided [value].
  const ErrorResponseOkEnum._(this.value);

  /// The underlying value of this enum member.
  final bool value;

  @override
  String toString() => value.toString();

  bool toJson() => value;

  static const false_ = ErrorResponseOkEnum._(false);

  /// List of all possible values in this [enum][ErrorResponseOkEnum].
  static const values = <ErrorResponseOkEnum>[
    false_,
  ];

  static ErrorResponseOkEnum? fromJson(dynamic value) => ErrorResponseOkEnumTypeTransformer().decode(value);

  static List<ErrorResponseOkEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ErrorResponseOkEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ErrorResponseOkEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [ErrorResponseOkEnum] to bool,
/// and [decode] dynamic data back to [ErrorResponseOkEnum].
class ErrorResponseOkEnumTypeTransformer {
  factory ErrorResponseOkEnumTypeTransformer() => _instance ??= const ErrorResponseOkEnumTypeTransformer._();

  const ErrorResponseOkEnumTypeTransformer._();

  bool encode(ErrorResponseOkEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a ErrorResponseOkEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  ErrorResponseOkEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case false: return ErrorResponseOkEnum.false_;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [ErrorResponseOkEnumTypeTransformer] instance.
  static ErrorResponseOkEnumTypeTransformer? _instance;
}


