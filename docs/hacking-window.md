# Hacking-window commit ledger

**Official window:** 2026-08-08 00:00 UTC through 2026-08-09 23:59 UTC.

Meridian has a public pre-work history, which the rules permit. The repository was not uploaded as one finished snapshot: the build continues through distinct, reviewable commits inside the hacking window.

## Public boundary

| Boundary | Commit | UTC timestamp | Meaning |
|---|---|---:|---|
| Last pre-work commit | [`dde2cf9`](https://github.com/iamdflame/meridian/commit/dde2cf9d1dfc57961e3589b739c43771b53e4b5d) | 2026-08-07 10:30:02 | Public baseline before the window |
| First in-window commit | [`fc57268`](https://github.com/iamdflame/meridian/commit/fc57268ce4eb536e30ba6941add887abbb4dba35) | 2026-08-08 01:07:27 | Live Monad deployment and integration evidence |
| Ledger head at publication | [`289d173`](https://github.com/iamdflame/meridian/commit/289d173) | 2026-08-08 04:11:58 | Protocol consumer and public-proof census |

**Count at ledger publication:** 20 separate commits after the pre-work boundary, all authored and committed after the window opened.

- [Inspect the complete public in-window diff and commit list](https://github.com/iamdflame/meridian/compare/dde2cf9d1dfc57961e3589b739c43771b53e4b5d...main)
- [Inspect every commit on `main`](https://github.com/iamdflame/meridian/commits/main/)
- Immutable boundary tag: `pre-hackathon-baseline-2026-08-07`

## What landed in-window

The in-window history separately records the live Monad deployment, measured evidence, primitive definition, CI and production hardening, proof-gated contracts, issuer integration, and protocol-consumer integration. Later holder and agent surfaces continue as separate commits.

Reviewers can reproduce the boundary without trusting this document:

```bash
git log dde2cf9..main --reverse --date=iso-strict \
  --pretty=format:'%h | author %aI | commit %cI | %s'
git rev-list --count dde2cf9..main
```

No dates were rewritten and no pre-work commits were hidden. The original public chronology remains intact.