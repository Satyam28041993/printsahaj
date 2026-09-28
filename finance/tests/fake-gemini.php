<?php
// Stand-in for the Gemini API in tests. Logs every request body to
// FAKE_GEMINI_LOG and answers like Gemini would: first a tool call, then
// text, then the final JSON. "gemini-2.5-flash" answers 404 so the
// model fallback is exercised.
$uri = $_SERVER['REQUEST_URI'];
$body = file_get_contents('php://input');
file_put_contents(getenv('FAKE_GEMINI_LOG') ?: '/tmp/fake-gemini.log', $uri . "\n" . $body . "\n---\n", FILE_APPEND);
header('Content-Type: application/json');
if (($_SERVER['HTTP_X_GOOG_API_KEY'] ?? '') !== 'test-key') {
    http_response_code(403);
    echo '{"error":{"message":"bad key"}}';
    return;
}
if (str_contains($uri, '/models/gemini-2.5-flash:')) {
    http_response_code(404);
    echo '{"error":{"message":"not found"}}';
    return;
}
$req = json_decode($body, true);
$hasToolResult = str_contains($body, '"functionResponse"');
$wantsJson = ($req['generationConfig']['responseMimeType'] ?? '') === 'application/json';
$text = fn ($t) => ['candidates' => [['content' => ['role' => 'model', 'parts' => [['text' => $t]]]]]];
if ($wantsJson) {
    echo json_encode($text(json_encode([
        'short_answer' => 'Person 2 ka incentive gold loan mein jaaye to gold loan jaldi band hoga.',
        'facts' => ['Tool se: gold loans closed month mila.', $hasToolResult ? 'tool result seen' : 'no tool result'],
        'assumptions' => ['Incentive har 3 mahine aata hai (Person 2).'],
        'estimates' => ['Estimate: kuch mahine jaldi.'],
        'suggestions' => ['Emergency fund pehle ₹50,000 tak le jaayein.'],
    ])));
    return;
}
if (!$hasToolResult) {
    echo json_encode(['candidates' => [['content' => ['role' => 'model', 'parts' => [['functionCall' => ['name' => 'run_payoff_plan', 'args' => [
        'extra_monthly_rupees' => 5000,
        'lumps' => [['amount_rupees' => 30000, 'first_month' => date('Y-m', strtotime('first day of +1 month')), 'every_months' => 3, 'times' => 2]],
    ]]]]]]]]);
    return;
}
echo json_encode($text('Plan dekh liya.'));
