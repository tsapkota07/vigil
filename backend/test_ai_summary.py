"""
Unit test for generate_ai_summary using mocked boto3.
Uses 45press.com as the example site.
"""

import io
import json
import unittest
from unittest.mock import MagicMock, patch

from main import generate_ai_summary

SAMPLE_URL = "https://45press.com"
SAMPLE_SCORES = {
    "performance": 62,
    "seo": 74,
    "accessibility": 55,
    "security": 80,
    "overall": 68,
}
SAMPLE_ISSUES = [
    "Images missing alt text",
    "No HTTPS redirect on all pages",
    "Missing meta descriptions on 3 pages",
    "Render-blocking JavaScript detected",
    "Color contrast ratio too low on nav links",
]

FAKE_SUMMARY = (
    "45press.com has critical issues that need immediate attention: "
    "performance and accessibility scores are below 70, posing potential ADA/legal risk. "
    "Addressing image alt text, contrast ratios, and render-blocking scripts should be prioritized."
)


def _mock_bedrock_response(text: str):
    """Build a fake boto3 invoke_model response."""
    body_bytes = json.dumps({"content": [{"text": text}]}).encode()
    mock_response = {"body": io.BytesIO(body_bytes)}
    return mock_response


class TestGenerateAiSummary(unittest.TestCase):

    @patch("main.boto3.client")
    def test_returns_summary_text(self, mock_boto_client):
        """Happy path: boto3 returns a valid response, function returns the text."""
        mock_client = MagicMock()
        mock_boto_client.return_value = mock_client
        mock_client.invoke_model.return_value = _mock_bedrock_response(FAKE_SUMMARY)

        result = generate_ai_summary(SAMPLE_URL, SAMPLE_SCORES, SAMPLE_ISSUES)

        self.assertEqual(result, FAKE_SUMMARY)

    @patch("main.boto3.client")
    def test_correct_model_and_region(self, mock_boto_client):
        """Verifies the correct Bedrock model ID and region are used."""
        mock_client = MagicMock()
        mock_boto_client.return_value = mock_client
        mock_client.invoke_model.return_value = _mock_bedrock_response(FAKE_SUMMARY)

        generate_ai_summary(SAMPLE_URL, SAMPLE_SCORES, SAMPLE_ISSUES)

        mock_boto_client.assert_called_once_with("bedrock-runtime", region_name="us-east-2")
        call_kwargs = mock_client.invoke_model.call_args.kwargs
        self.assertEqual(call_kwargs["modelId"], "us.anthropic.claude-3-5-sonnet-20241022-v2:0")

    @patch("main.boto3.client")
    def test_prompt_contains_site_and_scores(self, mock_boto_client):
        """Verifies the prompt sent to Bedrock includes the URL and all scores."""
        mock_client = MagicMock()
        mock_boto_client.return_value = mock_client
        mock_client.invoke_model.return_value = _mock_bedrock_response(FAKE_SUMMARY)

        generate_ai_summary(SAMPLE_URL, SAMPLE_SCORES, SAMPLE_ISSUES)

        call_kwargs = mock_client.invoke_model.call_args.kwargs
        sent_body = json.loads(call_kwargs["body"])
        prompt_text = sent_body["messages"][0]["content"]

        self.assertIn("45press.com", prompt_text)
        self.assertIn("62", prompt_text)   # performance
        self.assertIn("55", prompt_text)   # accessibility

    @patch("main.boto3.client")
    def test_fallback_on_boto3_error(self, mock_boto_client):
        """If Bedrock raises an exception, function returns the fallback string."""
        mock_client = MagicMock()
        mock_boto_client.return_value = mock_client
        mock_client.invoke_model.side_effect = Exception("Bedrock unavailable")

        result = generate_ai_summary(SAMPLE_URL, SAMPLE_SCORES, SAMPLE_ISSUES)

        self.assertEqual(result, "AI summary could not be generated at this time.")

    @patch("main.boto3.client")
    def test_issues_truncated_to_ten(self, mock_boto_client):
        """Only the first 10 issues should be included in the prompt."""
        mock_client = MagicMock()
        mock_boto_client.return_value = mock_client
        mock_client.invoke_model.return_value = _mock_bedrock_response(FAKE_SUMMARY)

        many_issues = [f"Issue {i}" for i in range(20)]
        generate_ai_summary(SAMPLE_URL, SAMPLE_SCORES, many_issues)

        call_kwargs = mock_client.invoke_model.call_args.kwargs
        sent_body = json.loads(call_kwargs["body"])
        prompt_text = sent_body["messages"][0]["content"]

        self.assertIn("Issue 9", prompt_text)
        self.assertNotIn("Issue 10", prompt_text)


if __name__ == "__main__":
    unittest.main(verbosity=2)
