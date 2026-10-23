# C26 · MCP Connections and Reachability

Diagnoses an authored MCP connection trace. No external MCP endpoint is contacted or credential validated. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- Native URL MCP versus host bridge
- Reachability and credentials differ
- Correlate MCP call and result

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3026`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3026
```

## How the app was build

### 1. Distinguish a host bridge from native MCP

The bridge branch reports custom-tool telemetry. A host adapter speaking MCP is a different observation path from a native provider MCP call.

Source: [src/lesson.ts](src/lesson.ts#L13)

```typescript
if (text(input, "path") === "bridge")
  return report(
    "passed",
    "Host bridge telemetry is not native MCP evidence",
    { telemetry: "custom-tool", eventType: "agent.custom_tool_use" },
    [
      "Host receives a custom request",
      "Local adapter speaks MCP",
      "Return a user.custom_tool_result",
    ],
  );
```

### 2. Check reachability and authentication independently

A reachable endpoint can still reject authentication. These supplied flags model separate failure stages; the sample does not connect to an MCP endpoint.

Source: [src/lesson.ts](src/lesson.ts#L14) · selected statements

```typescript
if (!flag(input, "reachable"))
  return report(
    "rejected",
    "Cloud reachability has not been established",
    { stage: "reachability" },
    ["Distinguish laptop reachability from cloud access"],
  );

if (!flag(input, "authenticated"))
  return report(
    "rejected",
    "The endpoint was reachable but authentication failed",
    { stage: "authentication" },
    ["Check authentication independently from networking"],
  );
```

### 3. Correlate the captured native call ID

The result-call identifier must match the seeded call. The evidence shows both IDs and the chosen telemetry path so connection configuration cannot be mistaken for a successful tool result.

Source: [src/lesson.ts](src/lesson.ts#L16) · selected statements

```typescript
const matched = text(input, "resultCallId") === "mcp-call-1";

return report(
  matched ? "passed" : "rejected",
  "Correlate the result with the captured native call",
  {
    matched,
    telemetry: "native-mcp",
    callId: "mcp-call-1",
    resultCallId: text(input, "resultCallId"),
  },
  [
    "Observe native MCP tool use",
    "Match mcp_tool_use_id",
    "Inspect the result separately from connection setup",
  ],
);
```

### Check your understanding

Run **Correlate a native result** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "path": "native",
    "reachable": true,
    "authenticated": true,
    "resultCallId": "mcp-call-1"
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "matched": true
  }
}
```

Then try **Diagnose an unreachable endpoint**. Its expected outcome is `rejected`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
