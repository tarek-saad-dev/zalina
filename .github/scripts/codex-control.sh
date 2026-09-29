#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-}"

usage_pattern='usage limit|rate limit|limit reached|quota|weekly limit|5[- ]hour|credits?.*(remaining|exhausted|limit)|insufficient.*credits|too many requests'

write_output() {
  local key="$1"
  local value="$2"
  printf '%s=%s\n' "$key" "$value" >> "$GITHUB_OUTPUT"
}

authorize() {
  : "${GH_TOKEN:?}"
  : "${REPO:?}"
  : "${ACTOR:?}"
  : "${BODY:?}"
  : "${NUMBER:?}"
  PR_URL="${PR_URL:-}"

  local action=""
  local allowed="false"
  local target_sha=""
  local target_ref=""
  local issue_title=""

  case "$BODY" in
    "DEV_ACTION: EXECUTE") action="EXECUTE" ;;
    "DEV_ACTION: REVIEW") action="REVIEW" ;;
    "DEV_ACTION: FIX_FINDINGS") action="FIX_FINDINGS" ;;
    *) action="" ;;
  esac

  rm -rf control-context
  mkdir -p control-context

  if [[ "$ACTOR" == "tarek-saad-dev" && -n "$action" ]]; then
    if [[ "$action" == "EXECUTE" && -z "$PR_URL" ]]; then
      gh api "repos/$REPO/issues/$NUMBER" > control-context/issue.json

      local issue_author
      issue_author="$(jq -r '.user.login' control-context/issue.json)"
      issue_title="$(jq -r '.title' control-context/issue.json)"

      if [[ "$issue_author" == "tarek-saad-dev" ]]; then
        allowed="true"
        target_ref="codex/issue-$NUMBER"

        if gh api "repos/$REPO/git/ref/heads/$target_ref" > control-context/ref.json 2>/dev/null; then
          target_sha="$(jq -r '.object.sha' control-context/ref.json)"
        else
          target_sha="$(gh api "repos/$REPO/commits/main" --jq '.sha')"
        fi

        {
          printf 'ACTION: EXECUTE\n'
          printf 'ISSUE: #%s\n' "$NUMBER"
          printf 'TITLE: %s\n\n' "$issue_title"
          jq -r '.body // ""' control-context/issue.json
        } > control-context/context.txt
      fi

    elif [[ ( "$action" == "REVIEW" || "$action" == "FIX_FINDINGS" ) && -n "$PR_URL" ]]; then
      gh api "repos/$REPO/pulls/$NUMBER" > control-context/pr.json

      local head_repo head_ref head_sha base_ref
      head_repo="$(jq -r '.head.repo.full_name' control-context/pr.json)"
      head_ref="$(jq -r '.head.ref' control-context/pr.json)"
      head_sha="$(jq -r '.head.sha' control-context/pr.json)"
      base_ref="$(jq -r '.base.ref' control-context/pr.json)"
      issue_title="$(jq -r '.title' control-context/pr.json)"

      if [[ "$head_repo" == "$REPO" && "$head_ref" == codex/issue-* && "$base_ref" == "main" ]]; then
        allowed="true"
        target_ref="$head_ref"
        target_sha="$head_sha"

        gh api "repos/$REPO/issues/$NUMBER/comments?per_page=100" > control-context/comments.json

        {
          printf 'ACTION: %s\n' "$action"
          printf 'PR: #%s\n' "$NUMBER"
          printf 'TITLE: %s\n' "$issue_title"
          printf 'HEAD: %s\n' "$head_sha"
          printf 'BRANCH: %s\n\n' "$head_ref"
          printf 'PR BODY:\n'
          jq -r '.body // ""' control-context/pr.json

          if [[ "$action" == "FIX_FINDINGS" ]]; then
            printf '\n\nLATEST CODEX REVIEW:\n'
            jq -r '[.[] | select((.body // "") | contains("CODEX_REVIEW"))] | last | .body // "No prior CODEX_REVIEW comment was found."' control-context/comments.json
          fi
        } > control-context/context.txt
      fi
    fi
  fi

  write_output allowed "$allowed"
  write_output action "$action"
  write_output target_sha "$target_sha"
  write_output target_ref "$target_ref"
  write_output issue_title "$issue_title"
}

is_usage_blocked() {
  local out="$1"
  grep -Eiq "$usage_pattern"     "$out/codex-stdout.log"     "$out/codex-stderr.log"     "$out/codex-result.txt" 2>/dev/null
}

mark_blocked() {
  local out="$1"
  local reason="$2"
  printf '%s\n' "$reason" > "$out/blocked-reason.txt"
  printf 'CODEX_BLOCKED=%s\n' "$reason" > "$out/verification.txt"

  if [[ "$reason" == "USAGE_LIMIT" ]]; then
    cat > "$out/codex-result.txt" <<'EOF'
CODEX_BLOCKED: USAGE_LIMIT

No code was published. The same DEV_ACTION can be retried after Codex usage resets or credits become available.
EOF
  fi
}

run_verification() {
  local out="$1"
  local login_status="$2"

  set +e
  npm ci > "$out/npm-ci.log" 2>&1
  local npm_ci_status=$?

  local test_status=99
  local typecheck_status=99
  local build_status=99

  if [[ $npm_ci_status -eq 0 ]]; then
    npm test > "$out/npm-test.log" 2>&1
    test_status=$?
    npm run typecheck > "$out/typecheck.log" 2>&1
    typecheck_status=$?
    npm run build > "$out/build.log" 2>&1
    build_status=$?
  fi
  set -e

  {
    printf 'CODEX_LOGIN=%s\n' "$login_status"
    printf 'NPM_CI=%s\n' "$npm_ci_status"
    printf 'NPM_TEST=%s\n' "$test_status"
    printf 'TYPECHECK=%s\n' "$typecheck_status"
    printf 'BUILD=%s\n' "$build_status"
  } > "$out/verification.txt"
}

run_codex() {
  : "${CONTROL_ACTION:?}"
  : "${CONTROL_CONTEXT_DIR:?}"
  : "${CODEX_OUTPUT_DIR:?}"

  hydrate_outputs
  local out="$CODEX_OUTPUT_DIR"
  local ctx="$CONTROL_CONTEXT_DIR"

  rm -rf "$out"
  mkdir -p "$out"
  : > "$out/codex-stdout.log"
  : > "$out/codex-stderr.log"
  : > "$out/codex-result.txt"

  cp -n .env.example .env.local 2>/dev/null || true

  set +e
  codex login status > "$out/login-status.txt" 2>&1
  local login_status=$?
  set -e

  if [[ $login_status -ne 0 ]]; then
    mark_blocked "$out" "AUTH"
    rm -f .env.local
    return 0
  fi

  local context
  context="$(cat "$ctx/context.txt")"

  if [[ "$CONTROL_ACTION" == "REVIEW" ]]; then
    run_verification "$out" "$login_status"
    local verification
    verification="$(cat "$out/verification.txt")"

    cat > "$out/prompt.txt" <<EOF
Read AGENTS.md and docs/agent-control-plane/CONTROL-PLANE.md first.

Act as the independent reviewer for the exact checked-out PR head.

$context

WORKFLOW VERIFICATION:
$verification

Inspect the actual code and diff against main. Do not edit files. Do not push, merge, deploy, or access production data.

If any verification command failed, do not report READY_FOR_TAREK unless the failure is clearly demonstrated to be pre-existing and unrelated.

Return exactly this structure:

CODEX_REVIEW

REVIEW_STATUS: PASS | CHANGES_REQUIRED

MATERIAL_FINDINGS:
- ...

NON_BLOCKING_NOTES:
- ...

TEST_EVIDENCE:
...

STATE: REVIEW | READY_FOR_TAREK
NEXT_ACTION: ...
EOF

    set +e
    env -u GITHUB_TOKEN -u GH_TOKEN -u ACTIONS_RUNTIME_TOKEN -u ACTIONS_ID_TOKEN_REQUEST_TOKEN -u ACTIONS_ID_TOKEN_REQUEST_URL       codex exec --sandbox read-only --ask-for-approval never       -o "$out/codex-result.txt"       "$(cat "$out/prompt.txt")"       > "$out/codex-stdout.log" 2> "$out/codex-stderr.log"
    local codex_status=$?
    set -e

    printf 'CODEX_EXEC=%s\n' "$codex_status" >> "$out/verification.txt"

    if [[ $codex_status -ne 0 ]]; then
      if is_usage_blocked "$out"; then
        mark_blocked "$out" "USAGE_LIMIT"
      else
        printf 'CODEX_BLOCKED=EXEC_ERROR\n' >> "$out/verification.txt"
        printf 'EXEC_ERROR\n' > "$out/blocked-reason.txt"
      fi
    fi

  else
    local mode_text="Implement only the originating issue scope."
    if [[ "$CONTROL_ACTION" == "FIX_FINDINGS" ]]; then
      mode_text="Fix only the unresolved MATERIAL_FINDINGS from the latest Codex review. Do not broaden scope."
    fi

    cat > "$out/prompt.txt" <<EOF
Read AGENTS.md and docs/agent-control-plane/CONTROL-PLANE.md first.

$mode_text

$context

Work only in this repository workspace. Do not merge, deploy, or perform real production mutations. Do not use production secrets. Prefer local tests, mocks, and safe flows.

Make the required code changes. Run targeted checks when useful. The workflow will run the full repository verification gate after you finish.

Finish with a concise implementation summary and important verification notes.
EOF

    set +e
    env -u GITHUB_TOKEN -u GH_TOKEN -u ACTIONS_RUNTIME_TOKEN -u ACTIONS_ID_TOKEN_REQUEST_TOKEN -u ACTIONS_ID_TOKEN_REQUEST_URL       codex exec --full-auto       -o "$out/codex-result.txt"       "$(cat "$out/prompt.txt")"       > "$out/codex-stdout.log" 2> "$out/codex-stderr.log"
    local codex_status=$?
    set -e

    if [[ $codex_status -ne 0 ]]; then
      if is_usage_blocked "$out"; then
        git reset --hard HEAD >/dev/null 2>&1 || true
        git clean -fd >/dev/null 2>&1 || true
        mark_blocked "$out" "USAGE_LIMIT"
        rm -f .env.local
        return 0
      fi

      git reset --hard HEAD >/dev/null 2>&1 || true
      git clean -fd >/dev/null 2>&1 || true
      mark_blocked "$out" "EXEC_ERROR"
      rm -f .env.local
      return 0
    fi

    run_verification "$out" "$login_status"
    printf 'CODEX_EXEC=%s\n' "$codex_status" >> "$out/verification.txt"

    rm -f .env.local
    git add -N . >/dev/null 2>&1 || true
    git diff --binary HEAD > "$out/agent.patch"

    if git diff --name-only HEAD | grep -E '(^|/)\.env($|\.)' | grep -v -E '(^|/)\.env\.example$' >/dev/null 2>&1; then
      printf 'SECURITY_BLOCKED=1\n' >> "$out/verification.txt"
      : > "$out/agent.patch"
      printf 'SECURITY\n' > "$out/blocked-reason.txt"
    fi
  fi

  rm -f .env.local
}

comment_blocked() {
  local out="$1"
  local reason
  reason="$(cat "$out/blocked-reason.txt")"

  {
    printf 'CODEX_BLOCKED: %s\n\n' "$reason"
    printf 'ACTION: %s\n' "$CONTROL_ACTION"
    printf 'NO_CODE_PUSH: true\n'
    printf 'NO_MERGE: true\n'
    printf 'NO_DEPLOY: true\n\n'

    if [[ "$reason" == "USAGE_LIMIT" ]]; then
      printf 'Codex usage is exhausted or temporarily rate-limited. Retry the same DEV_ACTION after the usage window resets or credits become available.\n\n'
    elif [[ "$reason" == "AUTH" ]]; then
      printf 'Codex authentication is unavailable on the self-hosted runner. Re-authenticate the codex-agent user, then retry the same DEV_ACTION.\n\n'
    else
      printf 'Codex could not complete this action. Inspect the workflow artifact/logs before retrying.\n\n'
    fi

    printf 'WORKFLOW_VERIFICATION:\n'
    cat "$out/verification.txt" 2>/dev/null || true
  } > "$out/comment.md"

  gh issue comment "$NUMBER" --repo "$REPO" --body-file "$out/comment.md"
}

pack_file() {
  local path="$1"
  if [[ -s "$path" ]]; then
    gzip -c "$path" | base64 -w0
  fi
}

emit_outputs() {
  : "${CODEX_OUTPUT_DIR:?}"
  local out="$CODEX_OUTPUT_DIR"

  local blocked_reason=""
  [[ -f "$out/blocked-reason.txt" ]] && blocked_reason="$(cat "$out/blocked-reason.txt")"

  local patch_b64 result_b64 verification_b64
  patch_b64="$(pack_file "$out/agent.patch")"
  result_b64="$(pack_file "$out/codex-result.txt")"
  verification_b64="$(pack_file "$out/verification.txt")"

  local total_size=$(( ${#patch_b64} + ${#result_b64} + ${#verification_b64} ))

  # GitHub job outputs are intentionally bounded. Large changes should be split
  # into smaller issues instead of weakening the token boundary.
  if (( total_size > 400000 )); then
    blocked_reason="OUTPUT_TOO_LARGE"
    patch_b64=""
    result_b64="$(printf '%s' 'CODEX_BLOCKED: OUTPUT_TOO_LARGE' | gzip -c | base64 -w0)"
    verification_b64="$(printf '%s' 'CODEX_BLOCKED=OUTPUT_TOO_LARGE' | gzip -c | base64 -w0)"
  fi

  write_output blocked_reason "$blocked_reason"
  write_output patch_b64 "$patch_b64"
  write_output result_b64 "$result_b64"
  write_output verification_b64 "$verification_b64"
}

unpack_value() {
  local value="$1"
  local path="$2"
  if [[ -n "$value" ]]; then
    printf '%s' "$value" | base64 -d | gzip -d > "$path"
  else
    : > "$path"
  fi
}

hydrate_outputs() {
  : "${CODEX_OUTPUT_DIR:?}"
  local out="$CODEX_OUTPUT_DIR"
  rm -rf "$out"
  mkdir -p "$out"

  unpack_value "${PATCH_B64:-}" "$out/agent.patch"
  unpack_value "${RESULT_B64:-}" "$out/codex-result.txt"
  unpack_value "${VERIFICATION_B64:-}" "$out/verification.txt"

  if [[ -n "${BLOCKED_REASON:-}" ]]; then
    printf '%s\n' "$BLOCKED_REASON" > "$out/blocked-reason.txt"
  fi
}

finalize() {
  : "${GH_TOKEN:?}"
  : "${REPO:?}"
  : "${NUMBER:?}"
  : "${CONTROL_ACTION:?}"
  : "${TARGET_SHA:?}"
  : "${TARGET_REF:?}"
  : "${CODEX_OUTPUT_DIR:?}"

  local out="$CODEX_OUTPUT_DIR"

  if [[ -f "$out/blocked-reason.txt" ]]; then
    comment_blocked "$out"
    return 0
  fi

  if [[ "$CONTROL_ACTION" == "REVIEW" ]]; then
    {
      cat "$out/codex-result.txt"
      printf '\n---\nWORKFLOW_VERIFICATION:\n'
      cat "$out/verification.txt"
      printf '\nReviewed head: `%s`\n' "$TARGET_SHA"
    } > "$out/comment.md"

    gh issue comment "$NUMBER" --repo "$REPO" --body-file "$out/comment.md"
    return 0
  fi

  if [[ ! -s "$out/agent.patch" ]]; then
    {
      printf 'CODEX_RESULT: NO_CHANGES\n\n'
      cat "$out/codex-result.txt"
      printf '\n---\nWORKFLOW_VERIFICATION:\n'
      cat "$out/verification.txt"
    } > "$out/comment.md"

    gh issue comment "$NUMBER" --repo "$REPO" --body-file "$out/comment.md"
    return 0
  fi

  git apply --index --binary "$out/agent.patch"
  git config user.name "codex-agent"
  git config user.email "codex-agent@users.noreply.github.com"

  local commit_message
  if [[ "$CONTROL_ACTION" == "EXECUTE" ]]; then
    commit_message="feat: implement issue #$NUMBER"
  else
    commit_message="fix: address review findings for PR #$NUMBER"
  fi

  git commit -m "$commit_message"
  git push origin "HEAD:refs/heads/$TARGET_REF"

  if [[ "$CONTROL_ACTION" == "EXECUTE" ]]; then
    local pr_url
    pr_url="$(gh pr list --repo "$REPO" --state open --head "$TARGET_REF" --json url --jq '.[0].url // empty')"

    if [[ -z "$pr_url" ]]; then
      {
        printf 'Closes #%s\n\n' "$NUMBER"
        printf 'Implemented by the Codex control plane.\n\n'
        printf 'Verification from the execution run:\n\n```text\n'
        cat "$out/verification.txt"
        printf '```\n\nCodex summary:\n\n'
        cat "$out/codex-result.txt"
        printf '\n\nThis PR must not be merged until independent review reaches READY_FOR_TAREK and Tarek explicitly approves production merge.\n'
      } > "$out/pr-body.md"

      pr_url="$(gh pr create         --repo "$REPO"         --draft         --base main         --head "$TARGET_REF"         --title "$ISSUE_TITLE"         --body-file "$out/pr-body.md")"
    fi

    {
      printf 'CODEX_EXECUTION: COMPLETE\n\n'
      printf 'PR: %s\n' "$pr_url"
      printf 'HEAD_BRANCH: `%s`\n' "$TARGET_REF"
      printf 'WORKFLOW_VERIFICATION:\n'
      cat "$out/verification.txt"
      printf '\nCODEX_SUMMARY:\n'
      cat "$out/codex-result.txt"
      printf '\nNEXT_ACTION: DEV_ACTION: REVIEW\n'
    } > "$out/comment.md"

    gh issue comment "$NUMBER" --repo "$REPO" --body-file "$out/comment.md"

  else
    {
      printf 'CODEX_FIX: COMPLETE\n\n'
      printf 'UPDATED_BRANCH: `%s`\n' "$TARGET_REF"
      printf 'WORKFLOW_VERIFICATION:\n'
      cat "$out/verification.txt"
      printf '\nCODEX_SUMMARY:\n'
      cat "$out/codex-result.txt"
      printf '\nNEXT_ACTION: DEV_ACTION: REVIEW\n'
    } > "$out/comment.md"

    gh issue comment "$NUMBER" --repo "$REPO" --body-file "$out/comment.md"
  fi
}

case "$MODE" in
  authorize) authorize ;;
  run) run_codex ;;
  emit) emit_outputs ;;
  finalize) finalize ;;
  *)
    echo "Usage: $0 {authorize|run|emit|finalize}" >&2
    exit 2
    ;;
esac
