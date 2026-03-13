import json

with open("updated_workflow_3.json", "r") as f:
    wf = json.load(f)

for node in wf.get("nodes", []):
    if node["type"] == "n8n-nodes-base.googleDrive" and node["parameters"].get("operation") == "search":
        node["alwaysOutputData"] = True

with open("updated_workflow_4.json", "w") as f:
    json.dump(wf, f, indent=2)
