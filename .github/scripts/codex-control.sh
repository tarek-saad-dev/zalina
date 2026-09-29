#!/usr/bin/env bash
# Reserved for future local helper logic.
#
# The current Codex control plane intentionally keeps GitHub write operations
# in GitHub-hosted workflow jobs so the self-hosted Codex process does not
# receive a repository write token.
#
# Do not move merge/deploy behavior into this file.
set -euo pipefail

echo "Zalina Codex control plane helper: GitHub mutations remain GitHub-hosted."
