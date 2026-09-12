import "package:artwork_verification/main.dart";
import "package:flutter_test/flutter_test.dart";

void main() {
  testWidgets("app title is Artwork Verification", (tester) async {
    await tester.pumpWidget(const ArtworkVerificationApp());
    expect(find.text("Artwork Verification"), findsOneWidget);
  });
}
