import "dart:convert";

import "package:file_picker/file_picker.dart";
import "package:http/http.dart" as http;

/// Talks to the local engine. When the engine serves this web build,
/// the API is on the same host. During `flutter run`, pass
/// `--dart-define=API_BASE=http://127.0.0.1:8765`.
String apiBase() {
  const defined = String.fromEnvironment("API_BASE");
  if (defined.isNotEmpty) {
    return defined;
  }
  final origin = Uri.base.origin;
  if (origin.startsWith("http")) {
    return origin;
  }
  return "http://127.0.0.1:8765";
}

Uri apiUri(String path) => Uri.parse("${apiBase()}$path");

class ApiException implements Exception {
  ApiException(this.message);
  final String message;

  @override
  String toString() => message;
}

Future<Map<String, dynamic>> _decode(http.Response response) async {
  final body = jsonDecode(response.body);
  if (body is Map<String, dynamic> && body["error"] != null) {
    throw ApiException(body["error"].toString());
  }
  if (response.statusCode >= 400) {
    throw ApiException("Server error ${response.statusCode}");
  }
  if (body is Map<String, dynamic>) {
    return body;
  }
  throw ApiException("Unexpected response");
}

Future<List<dynamic>> listJobs() async {
  final response = await http.get(apiUri("/api/jobs"));
  final data = await _decode(response);
  return data["jobs"] as List<dynamic>? ?? [];
}

Future<Map<String, dynamic>> getJob(String jobId) async {
  return _decode(await http.get(apiUri("/api/jobs/${Uri.encodeComponent(jobId)}")));
}

Future<Map<String, dynamic>> saveJob(Map<String, dynamic> payload) async {
  return _decode(
    await http.post(
      apiUri("/api/jobs"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode(payload),
    ),
  );
}

Future<Map<String, dynamic>> runReport(String jobId) async {
  return _decode(
    await http.get(apiUri("/api/jobs/${Uri.encodeComponent(jobId)}/report")),
  );
}

Future<void> uploadFile({
  required String jobId,
  required String role,
  required PlatformFile file,
}) async {
  final request = http.MultipartRequest(
    "POST",
    apiUri("/api/jobs/${Uri.encodeComponent(jobId)}/files"),
  );
  request.fields["role"] = role;
  if (file.bytes != null) {
    request.files.add(
      http.MultipartFile.fromBytes("file", file.bytes!, filename: file.name),
    );
  } else if (file.path != null) {
    request.files.add(await http.MultipartFile.fromPath("file", file.path!, filename: file.name));
  } else {
    throw ApiException("Could not read the chosen file");
  }
  final streamed = await request.send();
  final response = await http.Response.fromStream(streamed);
  await _decode(response);
}

Future<Map<String, dynamic>> addRemark({
  required String jobId,
  required String remark,
  required String by,
  String? checkId,
  String? summary,
}) async {
  return _decode(
    await http.post(
      apiUri("/api/jobs/${Uri.encodeComponent(jobId)}/remarks"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "remark": remark,
        "by": by,
        "check_id": checkId,
        "summary": summary,
      }),
    ),
  );
}
