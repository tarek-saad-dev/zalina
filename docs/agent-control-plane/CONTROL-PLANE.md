# Codex-first Agent Control Plane

## Operator model

Tarek talks to ChatGPT in normal language. ChatGPT is the human-facing control console and translates approved actions into GitHub issue/PR comments.

GitHub is the durable source of truth. The self-hosted Codex runner performs implementation, review, and finding fixes. Codex never merges and never deploys production.

## Flow

1. ChatGPT creates a scoped GitHub issue.
2. ChatGPT posts `DEV_ACTION: EXECUTE`.
3. The GitHub workflow authorizes the request on a GitHub-hosted runner.
4. The self-hosted Zalina runner executes Codex without a repository write token.
5. A GitHub-hosted finalizer applies the generated patch, pushes `codex/issue-<number>`, and opens/updates a PR.
6. ChatGPT posts `DEV_ACTION: REVIEW` when review is needed.
7. Codex reviews the exact current PR head independently.
8. If material findings exist, ChatGPT posts `DEV_ACTION: FIX_FINDINGS`.
9. Codex fixes only the latest unresolved material findings on the same PR branch.
10. Review repeats until `READY_FOR_TAREK`.
11. ChatGPT presents the release summary.
12. Tarek explicitly says `اعتمد`, `ادمج`, or `نزّل production`.
13. ChatGPT revalidates the head/review and merges.
14. Existing `deploy.yml` deploys production from `main`; ChatGPT reports the deployment result.

## Credit policy

Cursor Cloud Agents are not part of this workflow. Codex work uses the authenticated Codex CLI on the VPS. Status inspection is done by ChatGPT through GitHub and should not launch Codex.

A review is not automatically launched after every push. Review is requested only when useful, which avoids unnecessary Codex runs.

## Security model

This repository is public, so the self-hosted runner must not execute arbitrary fork PR code.

The workflow enforces:
- exact command comments only
- command author must be `tarek-saad-dev`
- EXECUTE only on issues authored by `tarek-saad-dev`
- REVIEW/FIX only on same-repository PRs
- REVIEW/FIX only on `codex/issue-*` branches targeting `main`
- the self-hosted Codex job receives no repository write token
- GitHub mutations happen only in GitHub-hosted finalizer jobs
- checkout uses `persist-credentials: false` on the self-hosted runner
- no automatic merge or production dispatch

## Verification gate

For each build/fix/review run the workflow records:
- `npm ci`
- `npm test`
- `npm run typecheck`
- `npm run build`

A failing command is evidence, not permission to hide or bypass the failure. The review must distinguish pre-existing failures from regressions when evidence supports that distinction.

## Review output

Independent review should use:

```text
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
```

`READY_FOR_TAREK` is valid only when the exact reviewed head is safe to merge and deploy immediately.


## Codex usage-limit behavior

The control plane fails closed when the authenticated Codex plan is exhausted or temporarily rate-limited.

When the CLI reports a usage/quota/rate-limit condition:

- the run publishes `CODEX_BLOCKED: USAGE_LIMIT`
- no agent patch is published
- no branch push is performed
- no merge is performed
- no production deployment is triggered
- partially edited workspace files are discarded for builder/fix runs
- the same `DEV_ACTION` can be retried after the usage window resets or credits become available

Status inspection does not consume a Codex run; ChatGPT reads GitHub state directly.


## ChatGPT command transport

Routine GitHub comments created by the connected ChatGPT GitHub app are retained for audit, but in this repository they did not schedule an `issue_comment` Actions run.

The primary machine trigger is therefore a dedicated branch named `codex-control`.

ChatGPT writes a small command envelope to `.github/codex-command.json` on that branch:

```json
{
  "action": "EXECUTE",
  "number": 3,
  "requested_by": "tarek-saad-dev",
  "request_id": "issue-3-execute-1"
}
```

A push to `codex-control` never deploys production. The workflow loads its executable control script from trusted `main`, validates the push actor and envelope, resolves the live issue/PR state, and then runs the same isolated Codex path.

Manual owner comments using `DEV_ACTION: EXECUTE|REVIEW|FIX_FINDINGS` remain supported as a fallback.
