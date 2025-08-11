from __future__ import annotations

from typing import List, Dict, Any

from azure.identity import DefaultAzureCredential
from azure.mgmt.compute import ComputeManagementClient
from azure.mgmt.network import NetworkManagementClient


class AzureManager:
    """Azure operations wrapper (inventory + basic lifecycle and NSG)."""

    def __init__(self, subscription_id: str) -> None:
        self.subscription_id = subscription_id
        self.credential = DefaultAzureCredential()
        self.compute = ComputeManagementClient(self.credential, subscription_id)
        self.network = NetworkManagementClient(self.credential, subscription_id)

    # Inventory
    def list_vms(self) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []
        for vm in self.compute.virtual_machines.list_all():
            out.append({
                "name": vm.name,
                "location": vm.location,
                "id": vm.id,
                "type": vm.type,
            })
        return out

    # Lifecycle
    def start_vm(self, resource_group: str, vm_name: str) -> Any:
        return self.compute.virtual_machines.begin_start(resource_group, vm_name).result()

    def poweroff_vm(self, resource_group: str, vm_name: str) -> Any:
        return self.compute.virtual_machines.begin_power_off(resource_group, vm_name).result()

    # NSG simple rule add/remove (ingress)
    def add_nsg_rule(self, resource_group: str, nsg_name: str, rule_name: str, port: int, protocol: str = "Tcp") -> Any:
        nsg = self.network.network_security_groups.get(resource_group, nsg_name)
        security_rules = nsg.security_rules or []
        security_rules.append({
            "name": rule_name,
            "protocol": protocol,
            "source_port_range": "*",
            "destination_port_range": str(port),
            "source_address_prefix": "*",
            "destination_address_prefix": "*",
            "access": "Allow",
            "priority": 4000,  # ensure no conflict with existing
            "direction": "Inbound",
        })
        nsg.security_rules = security_rules
        return self.network.network_security_groups.begin_create_or_update(resource_group, nsg_name, nsg).result()

    def remove_nsg_rule(self, resource_group: str, nsg_name: str, rule_name: str) -> Any:
        return self.network.security_rules.begin_delete(resource_group, nsg_name, rule_name).result()


