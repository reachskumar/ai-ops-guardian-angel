from __future__ import annotations

from typing import List, Dict, Any
from google.cloud import compute_v1


class GCPManager:
    """GCP operations wrapper (inventory + basic lifecycle)."""

    def __init__(self, project_id: str) -> None:
        self.project_id = project_id
        self.instances = compute_v1.InstancesClient()

    def list_instances(self, zone: str) -> List[Dict[str, Any]]:
        req = compute_v1.ListInstancesRequest(project=self.project_id, zone=zone)
        out: List[Dict[str, Any]] = []
        for inst in self.instances.list(request=req):
            out.append({"name": inst.name, "zone": zone, "status": inst.status})
        return out

    def start_instance(self, zone: str, instance: str) -> Any:
        req = compute_v1.StartInstanceRequest(project=self.project_id, zone=zone, instance=instance)
        return self.instances.start(request=req)

    def stop_instance(self, zone: str, instance: str) -> Any:
        req = compute_v1.StopInstanceRequest(project=self.project_id, zone=zone, instance=instance)
        return self.instances.stop(request=req)


