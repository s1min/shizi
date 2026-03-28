# Device Regression Evidence Template

> Date: YYYY-MM-DD  
> Build: `<mini-program build id / git commit>`  
> Tester: `<name>`  
> Session ledger: `docs/bug_reports/session_YYYY-MM-DD.md`

## 1. Device Matrix

| Platform | Device Model | OS Version | WeChat Version | Result | Evidence |
|---|---|---|---|---|---|
| iOS |  |  |  |  | screenshot/video path |
| Android |  |  |  |  | screenshot/video path |

## 2. Core Flow Checklist

| Flow | Expected | iOS | Android | Evidence | Bug IDs |
|---|---|---|---|---|---|
| Login | Login succeeds and enters Home | PASS/FAIL | PASS/FAIL | screenshot/video path | `BUG-...` or `N/A` |
| Home -> Learn | Page opens without blank screen | PASS/FAIL | PASS/FAIL | screenshot/video path | `BUG-...` or `N/A` |
| Learn -> Unit Test | Questions load and submit works | PASS/FAIL | PASS/FAIL | screenshot/video path | `BUG-...` or `N/A` |
| Unit Complete | Summary page renders correctly | PASS/FAIL | PASS/FAIL | screenshot/video path | `BUG-...` or `N/A` |
| Review | Flashcard flow works and returns Home | PASS/FAIL | PASS/FAIL | screenshot/video path | `BUG-...` or `N/A` |
| Privacy page | `/pages/privacy/index` opens | PASS/FAIL | PASS/FAIL | screenshot/video path | `BUG-...` or `N/A` |
| Agreement page | `/pages/agreement/index` opens | PASS/FAIL | PASS/FAIL | screenshot/video path | `BUG-...` or `N/A` |

## 3. Notes and Issues

1. All confirmed issues should be tracked in:
   `docs/bug_reports/session_YYYY-MM-DD.md`
2. For each confirmed issue, create an individual bug document using:
   `docs/bug_reports/_bug_report_template.md`
3. Keep `Bug IDs` in section 2 synchronized with session ledger status.

## 4. Final Decision

- [ ] Ready for submission
- [ ] Blocked, fixes required
