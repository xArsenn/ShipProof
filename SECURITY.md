# Security policy

ShipProof executes verification commands from repository configuration with the current user's permissions. Treat `.shipproof.json` changes like CI workflow changes and review them before running an untrusted branch.

Do not include secrets in verification command output. ShipProof stores a bounded tail of stdout and stderr inside local reports.

Please report suspected vulnerabilities privately to the repository maintainers. Do not include working exploits, tokens, or private repository data in a public issue.
