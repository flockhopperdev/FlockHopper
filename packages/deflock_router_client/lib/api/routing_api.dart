//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class RoutingApi {
  RoutingApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Compare normal and camera-avoidance routes
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [RouteComparisonRequest] routeComparisonRequest (required):
  Future<Response> compareRoutesWithHttpInfo(RouteComparisonRequest routeComparisonRequest,) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/route';

    // ignore: prefer_final_locals
    Object? postBody = routeComparisonRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Compare normal and camera-avoidance routes
  ///
  /// Parameters:
  ///
  /// * [RouteComparisonRequest] routeComparisonRequest (required):
  Future<CompareRoutes200Response?> compareRoutes(RouteComparisonRequest routeComparisonRequest,) async {
    final response = await compareRoutesWithHttpInfo(routeComparisonRequest,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'CompareRoutes200Response',) as CompareRoutes200Response;
    
    }
    return null;
  }

  /// Get camera-avoidance directions
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [DirectionsRequest] directionsRequest (required):
  Future<Response> getDirectionsWithHttpInfo(DirectionsRequest directionsRequest,) async {
    // ignore: prefer_const_declarations
    final path = r'/v1/directions';

    // ignore: prefer_final_locals
    Object? postBody = directionsRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Get camera-avoidance directions
  ///
  /// Parameters:
  ///
  /// * [DirectionsRequest] directionsRequest (required):
  Future<GetDirections200Response?> getDirections(DirectionsRequest directionsRequest,) async {
    final response = await getDirectionsWithHttpInfo(directionsRequest,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'GetDirections200Response',) as GetDirections200Response;
    
    }
    return null;
  }
}
