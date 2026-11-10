import { appendFileSync, readFileSync } from "node:fs";
import { google } from "googleapis";

const spreadsheetId = process.env.RN_SHEET_ID;
const credentialText = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const eventName = process.env.GITHUB_EVENT_NAME;
const eventPath = process.env.GITHUB_EVENT_PATH;
const repository = process.env.GITHUB_REPOSITORY;

function finish(message) {
  console.log(message);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, message + "\n");
  }
}

function stripMarkup(value = "") {
  return String(value)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\r/g, "")
    .trim();
}

function field(body, label) {
  const lines = String(body ?? "").split(/\r?\n/);
  const headingIndex = lines.findIndex((line) =>
    /^#{2,3}\s+/.test(line) &&
    line.replace(/^#{2,3}\s+/, "").trim().toLowerCase() === label.toLowerCase()
  );
  if (headingIndex < 0) return "";
  const content = [];
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    if (/^\s*#{1,6}\s+/.test(lines[index])) break;
    content.push(lines[index]);
  }
  return stripMarkup(content.join("\n"));
}

function pacificDate(value, includeTime = false) {
  const date = value ? new Date(value) : new Date();
  if (!Number.isFinite(date.getTime())) return "";
  const options = includeTime
    ? { timeZone: "America/Los_Angeles", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit", timeZoneName: "short" }
    : { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" };
  const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(date);
  const p = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  if (!includeTime) return `${p.year}-${p.month}-${p.day}`;
  return `${p.month} ${p.day}, ${p.year}, ${p.hour}:${p.minute}:${p.second} ${p.dayPeriod} ${p.timeZoneName}`;
}

function versionFromRef(ref, requested) {
  if (requested) return requested;
  const match = String(ref ?? "").match(/(?:^|\/)(v\d+\.\d+\.\d+)(?:[-/]|$)/i)
    ?? String(ref ?? "").match(/^(v\d+\.\d+\.\d+)(?:[-/]|$)/i);
  return match ? match[1] : "Preview";
}

function linkRequest(sheetId, rowIndex, columnIndex, url) {
  return {
    repeatCell: {
      range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: columnIndex, endColumnIndex: columnIndex + 1 },
      cell: { userEnteredFormat: { textFormat: { link: url ? { uri: url } : {} } } },
      fields: "userEnteredFormat.textFormat.link",
    },
  };
}

async function createGoogleSheetsClient() {
  if (!spreadsheetId) throw new Error("Add the RN_SHEET_ID repository variable.");
  if (!credentialText) throw new Error("Add the GOOGLE_SERVICE_ACCOUNT_JSON repository secret.");
  const credentials = JSON.parse(credentialText);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function readValues(sheets, range) {
  const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return response.data.values ?? [];
}

async function writeFormattedRow(sheets, sheetId, tabName, rowNumber, values, linkedColumns, insertAtTop = false) {
  const rowIndex = rowNumber - 1;
  const requests = [];
  if (insertAtTop) {
    requests.push({
      insertDimension: {
        range: { sheetId, dimension: "ROWS", startIndex: 1, endIndex: 2 },
        inheritFromBefore: false,
      },
    });
    requests.push({
      copyPaste: {
        source: { sheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: values.length },
        destination: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: values.length },
        pasteType: "PASTE_FORMAT",
        pasteOrientation: "NORMAL",
      },
    });
  }
  requests.push({
    updateCells: {
      range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 0, endColumnIndex: values.length },
      rows: [{ values: values.map((value) => ({ userEnteredValue: { stringValue: String(value ?? "") } })) }],
      fields: "userEnteredValue",
    },
  });
  for (const { columnIndex, url } of linkedColumns) {
    requests.push(linkRequest(sheetId, rowIndex, columnIndex, url));
  }
  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
}

async function recordPreview(sheets, event) {
  const deployment = event.deployment ?? {};
  const status = event.deployment_status ?? {};
  const environment = deployment.environment ?? "";
  if (status.state !== "success" || environment.toLowerCase() !== "preview") {
    finish("Skipped: this is not a successful Preview deployment.");
    return;
  }

  const rows = await readValues(sheets, "'Version Links'!A1:M200");
  const headers = rows[0] ?? [];
  const expected = ["Version", "Build / purpose", "Branch", "Branch / production URL (changes over time)", "Fixed deployment URL", "Other aliases", "Build created (Pacific)", "Vercel state", "Commit SHA", "Commit message", "Notes", "Vercel details", "Recorded on"];
  if (expected.some((header, index) => headers[index] !== header)) {
    throw new Error("The Version Links header row changed; update the workflow column mapping before writing.");
  }
  const marker = "AUTOMATED_LATEST_PREVIEW";
  const markerIndex = rows.findIndex((row, index) => index > 0 && String(row[10] ?? "").includes(marker));
  const branch = deployment.ref ?? "";
  const sha = deployment.sha ?? "";
  const statusUrl = status.target_url ?? "";
  const branchUrl = status.environment_url ?? deployment.environment_url ?? "";
  const inspectorUrl = status.log_url ?? "";
  let commitMessage = "(commit message unavailable)";
  if (sha && process.env.GITHUB_TOKEN) {
    const response = await fetch(`https://api.github.com/repos/${repository}/commits/${sha}`, {
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    });
    if (response.ok) {
      const data = await response.json();
      commitMessage = data.commit?.message?.split("\n")[0] ?? commitMessage;
    }
  }
  const createdAt = deployment.created_at ?? status.created_at;
  const recordedAt = new Date().toISOString();
  const row = [
    versionFromRef(branch),
    "Latest successful Preview deployment",
    branch,
    branchUrl || statusUrl,
    statusUrl || branchUrl,
    "",
    pacificDate(createdAt, true),
    "READY",
    sha,
    commitMessage,
    `${marker} — Automatically refreshed from a successful Vercel Preview deployment.`,
    inspectorUrl || statusUrl,
    pacificDate(recordedAt),
  ];
  const rowNumber = markerIndex >= 1 ? markerIndex + 1 : 2;
  await writeFormattedRow(
    sheets,
    111403025,
    "Version Links",
    rowNumber,
    row,
    [
      { columnIndex: 3, url: branchUrl || statusUrl },
      { columnIndex: 4, url: statusUrl || branchUrl },
      { columnIndex: 11, url: inspectorUrl || statusUrl },
    ],
    markerIndex < 0,
  );
  finish(`Updated Version Links row ${rowNumber} with the latest successful Preview deployment for ${branch || "the current branch"}.`);
}

async function recordMergedPullRequest(sheets, event) {
  const pr = event.pull_request;
  if (!pr?.merged) {
    finish("Skipped: pull request was closed without merging.");
    return;
  }
  const values = await readValues(sheets, "'Decision Log'!A1:K200");
  const headers = values[0] ?? [];
  const expected = ["Decision ID", "Decision date / precision", "Version / phase", "Area", "Decision / direction", "Reason / problem", "Status", "Source / reference", "Evidence / uncertainty", "Validation / follow-up", "Logged on"];
  if (expected.some((header, index) => headers[index] !== header)) {
    throw new Error("The Decision Log header row changed; update the workflow column mapping before writing.");
  }

  const body = pr.body ?? "";
  const decision = field(body, "Decision / direction");
  const reason = field(body, "Reason / problem");
  const area = field(body, "Area");
  const evidence = field(body, "Evidence / uncertainty");
  const followup = field(body, "Validation / follow-up");
  const missing = [
    ["Area", area],
    ["Decision / direction", decision],
    ["Reason / problem", reason],
    ["Evidence / uncertainty", evidence],
    ["Validation / follow-up", followup],
  ].filter(([, value]) => !value).map(([label]) => label);

  if (missing.length) {
    finish(`Decision Log skipped for PR #${pr.number}: fill these PR template fields before merging: ${missing.join(", ")}.`);
    return;
  }
  const prUrl = pr.html_url ?? `https://github.com/${repository}/pull/${pr.number}`;
  if (values.slice(1).some((row) => String(row[7] ?? "").includes(prUrl))) {
    finish(`Decision Log already contains PR #${pr.number}; no duplicate row added.`);
    return;
  }

  const maxId = values.slice(1).reduce((max, row) => {
    const match = String(row[0] ?? "").match(/^RN-(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  const branch = pr.head?.ref ?? "";
  const version = versionFromRef(branch, field(body, "Version / phase"));
  const date = pr.merged_at ?? new Date().toISOString();
  const logged = pacificDate(date);
  const row = [
    `RN-${String(maxId + 1).padStart(3, "0")}`,
    `${logged} (Pacific)`,
    version,
    area,
    decision,
    reason,
    "Recorded from merged PR",
    prUrl,
    evidence,
    followup,
    logged,
  ];
  await writeFormattedRow(
    sheets,
    662307936,
    "Decision Log",
    2,
    row,
    [{ columnIndex: 7, url: prUrl }],
    true,
  );
  finish(`Added Decision Log row ${row[0]} for merged PR #${pr.number}.`);
}

async function main() {
  if (!eventPath || !eventName) throw new Error("GitHub event context is missing.");
  const event = JSON.parse(readFileSync(eventPath, "utf8"));
  const sheets = await createGoogleSheetsClient();
  if (eventName === "deployment_status") return recordPreview(sheets, event);
  if (eventName === "pull_request") return recordMergedPullRequest(sheets, event);
  finish("Manual run completed; no event-specific log was written.");
}

main().catch((error) => {
  console.error(`Spreadsheet update failed: ${error instanceof Error ? error.message : "unknown error"}`);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, "Spreadsheet update failed. Check the Actions log and verify the setup values.\n");
  process.exitCode = 1;
});
