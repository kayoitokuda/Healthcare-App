# Referral Navigator spreadsheet automation

The GitHub Actions workflow in `.github/workflows/update-project-ledgers.yml` updates the existing Referral Navigator Google Sheet:

- **Version Links:** after a successful Vercel Preview deployment, it inserts or refreshes one row marked `AUTOMATED_LATEST_PREVIEW`. Failed builds and Production deployments are ignored.
- **Decision Log:** after a pull request is merged, it adds one entry only when the PR includes Area, Decision / direction, Reason / problem, Evidence / uncertainty, and Validation / follow-up. The entry links back to the PR. Re-runs check the PR URL to avoid duplicates.
- The PR template is in `.github/pull_request_template.md`. Its rationale fields stay explicit; the workflow does not infer a decision from a code diff or commit title.

## One-time setup

1. In Google Cloud Console, create or select a project and enable the Google Sheets API.
2. Create a service account and generate a JSON key. Keep the key private; do not commit or paste it into chat.
3. Share the [Referral Navigator spreadsheet](https://docs.google.com/spreadsheets/d/1g27l9rXK3zXs8UKRjBesg1XGpoZttiBm131HEvv1XRA/edit) with the service account email as an Editor.
4. In GitHub, open **Healthcare-App → Settings → Secrets and variables → Actions**.
   - Add repository secret `GOOGLE_SERVICE_ACCOUNT_JSON` and paste the full JSON key file contents.
   - Add repository variable `RN_SHEET_ID` with value `1g27l9rXK3zXs8UKRjBesg1XGpoZttiBm131HEvv1XRA`.
5. Confirm the Vercel GitHub integration sends deployment statuses to this repository. The workflow listens for successful deployments whose GitHub environment is exactly `Preview`.
6. Merge one PR containing the completed template fields, or wait for a Vercel Preview deployment, then check **Actions → Update Referral Navigator project logs** and the two spreadsheet tabs.

The service account needs access only to this spreadsheet. If the Actions run says the Google Sheets credential is missing, finish steps 1–4; never put service-account JSON in the repository or the application’s Vercel environment.
