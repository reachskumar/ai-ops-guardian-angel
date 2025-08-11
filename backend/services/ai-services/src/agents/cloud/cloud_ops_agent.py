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
                "asg_scale",
                "rds_snapshot",
                "rds_failover",
                "alb_register",
                "alb_deregister",
                "lambda_publish",
                "lambda_traffic",
                "vpc_peering_create",
                "vpc_peering_accept",
                "privatelink_create",
                "egress_audit",
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
        if task.task_type == "asg_scale":
            return self.aws.asg_set_desired_capacity(ctx["asg_name"], int(ctx["desired"]))  # type: ignore
        if task.task_type == "rds_snapshot":
            return self.aws.rds_create_snapshot(ctx["db_instance_id"], ctx["snapshot_id"])  # type: ignore
        if task.task_type == "rds_failover":
            return self.aws.rds_failover(ctx["db_instance_id"])  # type: ignore
        if task.task_type == "alb_register":
            return self.aws.alb_register_targets(ctx["target_group_arn"], ctx["target_ids"])  # type: ignore
        if task.task_type == "alb_deregister":
            return self.aws.alb_deregister_targets(ctx["target_group_arn"], ctx["target_ids"])  # type: ignore
        if task.task_type == "lambda_publish":
            return self.aws.lambda_publish_version(ctx["function_name"], ctx.get("description", ""))  # type: ignore
        if task.task_type == "lambda_traffic":
            return self.aws.lambda_update_alias(ctx["function_name"], ctx["alias"], ctx["version"], ctx.get("weights"))  # type: ignore
        if task.task_type == "vpc_peering_create":
            return self.aws.create_vpc_peering(ctx["vpc_id"], ctx["peer_vpc_id"], ctx.get("peer_region"))  # type: ignore
        if task.task_type == "vpc_peering_accept":
            return self.aws.accept_vpc_peering(ctx["peering_connection_id"])  # type: ignore
        if task.task_type == "privatelink_create":
            return self.aws.create_interface_endpoint(ctx["vpc_id"], ctx["service_name"], ctx["subnet_ids"], ctx["sg_ids"])  # type: ignore
        if task.task_type == "egress_audit":
            return self.aws.egress_audit()
        return {"error": "Unsupported task"}


