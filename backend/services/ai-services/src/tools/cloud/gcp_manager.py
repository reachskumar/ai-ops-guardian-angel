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

    # Firewall CRUD (simple ingress)
    def add_firewall_rule(self, name: str, network: str, direction: str, priority: int, ranges: list[str], ports: list[str]) -> Any:
        firewalls = compute_v1.FirewallsClient()
        rule = compute_v1.Firewall()
        rule.name = name
        rule.direction = direction
        rule.priority = priority
        rule.network = network
        rule.allowed = [compute_v1.Allowed(I_p_protocol="tcp", ports=ports)]
        rule.source_ranges = ranges
        return firewalls.insert(project=self.project_id, firewall_resource=rule)

    def delete_firewall_rule(self, name: str) -> Any:
        firewalls = compute_v1.FirewallsClient()
        return firewalls.delete(project=self.project_id, firewall=name)

    # Disk snapshot/restore (zonal PD)
    def create_disk_snapshot(self, zone: str, disk: str, snapshot_name: str) -> Any:
        snaps = compute_v1.SnapshotsClient()
        req = compute_v1.InsertSnapshotRequest(project=self.project_id, snapshot_resource=compute_v1.Snapshot(name=snapshot_name, source_disk=f"projects/{self.project_id}/zones/{zone}/disks/{disk}"))
        return snaps.insert(request=req)

    def create_disk_from_snapshot(self, zone: str, new_disk: str, snapshot_link: str, size_gb: int) -> Any:
        disks = compute_v1.DisksClient()
        disk = compute_v1.Disk(name=new_disk, source_snapshot=snapshot_link, size_gb=size_gb)
        req = compute_v1.InsertDiskRequest(project=self.project_id, zone=zone, disk_resource=disk)
        return disks.insert(request=req)


