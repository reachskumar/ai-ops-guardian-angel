from __future__ import annotations

from typing import Dict, Any, List, Optional
from ...agents.base_agent import BaseAgent, AgentTask, AgentCapabilities
from ...config.settings import AgentType, settings
from ...tools.cloud.aws_manager import AWSManager


class CloudOpsAgent(BaseAgent):
    """Multi-cloud operations agent (AWS first)."""

    def __init__(self) -> None:
        caps = AgentCapabilities(
            supported_tasks=[
                "cloud_inventory",
                "instance_start",
                "instance_stop",
                "instance_reboot",
                "instance_resize",
                "sg_authorize",
                "sg_revoke",
                "ebs_snapshot",
                "dns_upsert",
                "cdn_invalidate",
            ],
            required_tools=["aws"],
            max_concurrent_tasks=5,
            average_response_time=5.0,
        )
        super().__init__(
            agent_type=AgentType.INFRASTRUCTURE,
            name="Cloud Ops Agent",
            description="Performs cloud inventory and lifecycle actions",
            capabilities=caps,
        )

        self.aws = None

    async def _on_start(self):
        if settings.aws_access_key_id and settings.aws_secret_access_key:
            self.aws = AWSManager(settings.aws_access_key_id, settings.aws_secret_access_key, settings.aws_region)

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        ctx = task.context or {}
        if task.task_type == "cloud_inventory":
            return {"instances": self.aws.list_instances(states=ctx.get("states"))}
        if task.task_type == "instance_start":
            return self.aws.start_instances(ctx["instance_ids"])  # type: ignore
        if task.task_type == "instance_stop":
            return self.aws.stop_instances(ctx["instance_ids"])  # type: ignore
        if task.task_type == "instance_reboot":
            return self.aws.reboot_instances(ctx["instance_ids"])  # type: ignore
        if task.task_type == "instance_resize":
            return self.aws.resize_instance(ctx["instance_id"], ctx["instance_type"])  # type: ignore
        if task.task_type == "sg_authorize":
            return self.aws.authorize_sg_ingress(ctx["sg_id"], ctx["protocol"], ctx["from_port"], ctx["to_port"], ctx["cidr"])  # type: ignore
        if task.task_type == "sg_revoke":
            return self.aws.revoke_sg_ingress(ctx["sg_id"], ctx["protocol"], ctx["from_port"], ctx["to_port"], ctx["cidr"])  # type: ignore
        if task.task_type == "ebs_snapshot":
            return self.aws.create_ebs_snapshot(ctx["volume_id"], ctx.get("description", ""))  # type: ignore
        if task.task_type == "dns_upsert":
            return self.aws.route53_upsert_record(ctx["zone_id"], ctx["name"], ctx["rtype"], ctx["value"], ctx.get("ttl", 60))  # type: ignore
        if task.task_type == "cdn_invalidate":
            return self.aws.cloudfront_invalidate(ctx["distribution_id"], ctx["paths"])  # type: ignore
        return {"error": "Unsupported task"}


