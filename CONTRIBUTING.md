# Contributing

Thank you for helping make AI-generated code easier to verify.

1. Open an issue describing the verification loophole or rule.
2. Add a minimal fixture or unit test that demonstrates it.
3. Keep detection deterministic; model calls must remain optional.
4. Run `npm test` and `npm run verify:self`.
5. Explain false-positive risks in the pull request.

Good first contributions include ecosystem command detection, report accessibility, fixtures for real verification failures, and translations.
