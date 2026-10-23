import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 26,
  title: "MCP Connections and Reachability",
  description: "An M C P server can expose an issue tracker, inventory service, or other useful capability. In a cloud managed session, first ask whether the orchestration layer can reach the endpoint at all.",
  concepts: ["Native URL MCP versus host bridge", "Reachability and credentials differ", "Correlate MCP call and result"],
  scope: "Diagnoses an authored MCP connection trace. No external MCP endpoint is contacted or credential validated. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "Correlate a native result", "input": {"path": "native", "reachable": true, "authenticated": true, "resultCallId": "mcp-call-1"}, "expected": "passed", "checks": {"matched": true}}, {"id": "1", "label": "Diagnose an unreachable endpoint", "input": {"path": "native", "reachable": false, "authenticated": true, "resultCallId": "mcp-call-1"}, "expected": "rejected", "checks": {"stage": "reachability"}}, {"id": "2", "label": "Keep host bridge distinct", "input": {"path": "bridge", "reachable": true, "authenticated": true, "resultCallId": "mcp-call-1"}, "expected": "passed", "checks": {"telemetry": "custom-tool"}}],
  async run(input) {

if(text(input,"path")==="bridge")return report("passed","Host bridge telemetry is not native MCP evidence",{telemetry:"custom-tool",eventType:"agent.custom_tool_use"},["Host receives a custom request","Local adapter speaks MCP","Return a user.custom_tool_result"]);
if(!flag(input,"reachable"))return report("rejected","Cloud reachability has not been established",{stage:"reachability"},["Distinguish laptop reachability from cloud access"]);
if(!flag(input,"authenticated"))return report("rejected","The endpoint was reachable but authentication failed",{stage:"authentication"},["Check authentication independently from networking"]);
const matched=text(input,"resultCallId")==="mcp-call-1";
return report(matched?"passed":"rejected","Correlate the result with the captured native call",{matched,telemetry:"native-mcp",callId:"mcp-call-1",resultCallId:text(input,"resultCallId")},["Observe native MCP tool use","Match mcp_tool_use_id","Inspect the result separately from connection setup"]);

  }
};
