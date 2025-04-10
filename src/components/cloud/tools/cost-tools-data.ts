
import { CostTool } from "./types";

export const costTools: CostTool[] = [
  {
    name: "Infracost",
    description: "Cloud cost estimates for Terraform in pull requests. Helps engineers to understand the cost impact of their changes.",
    url: "https://www.infracost.io/",
    github: "https://github.com/infracost/infracost",
    tags: ["Terraform", "IaC", "Cost Estimation"],
    features: [
      "Cost breakdowns for Terraform projects",
      "CI/CD integration for automated cost checking",
      "Pull request comments with cost estimates",
      "Support for over 20 cloud resources",
      "Cost policy checks for governance"
    ],
    documentation: "Infracost shows cloud cost estimates for Terraform. It lets engineers see a cost breakdown and includes price sensitivity analysis. Perfect for DevOps and FinOps teams looking to implement cost controls.",
    installation: "```bash\n# Install via brew\nbrew install infracost\n\n# Or via script\ncurl -fsSL https://raw.githubusercontent.com/infracost/infracost/master/scripts/install.sh | sh\n```",
    commands: [
      "infracost breakdown --path /path/to/terraform",
      "infracost diff --path /path/to/terraform",
      "infracost comment github --path /path/to/terraform --repo my/repo --pull-request 123"
    ],
    compatibleClouds: ["AWS", "Azure", "Google Cloud"]
  },
  {
    name: "Opencost",
    description: "CNCF project for Kubernetes cost monitoring. Provides real-time cost visibility into Kubernetes environments.",
    url: "https://www.opencost.io/",
    github: "https://github.com/opencost/opencost",
    tags: ["Kubernetes", "CNCF", "Real-time"],
    features: [
      "Pod cost allocation",
      "Node and namespace cost analysis",
      "Cost monitoring for idle resources",
      "Multi-cluster support",
      "Customizable pricing models"
    ],
    documentation: "OpenCost provides real-time cost monitoring for Kubernetes workloads. It's a vendor-neutral open source project, part of the CNCF, that gives teams visibility into their container costs across any infrastructure.",
    installation: "```bash\n# Install via Helm\nhelm repo add opencost https://opencost.github.io/opencost-helm-chart\nhelm install opencost opencost/opencost -n opencost --create-namespace\n```",
    commands: [
      "kubectl port-forward --namespace opencost service/opencost 9090:9090",
      "kubectl get pods -n opencost",
      "curl http://localhost:9090/allocation/summary"
    ],
    compatibleClouds: ["AWS", "Azure", "Google Cloud", "On-premise"]
  },
  {
    name: "Kubecost",
    description: "Kubernetes cost allocation tool that provides visibility into infrastructure spending across teams and services.",
    url: "https://kubecost.com/",
    github: "https://github.com/kubecost/cost-model",
    tags: ["Kubernetes", "Allocation", "Optimization"],
    features: [
      "Cost allocation by team, application, or service",
      "Right-sizing recommendations for optimal resource usage",
      "Cloud billing integration",
      "Cost forecasting and alerts",
      "Governance and budget enforcement"
    ],
    documentation: "Kubecost provides real-time cost visibility and insights for teams running Kubernetes. It helps teams monitor and reduce their Kubernetes spend by identifying optimization opportunities and allocating costs to teams and projects.",
    installation: "```bash\n# Install via Helm\nhelm repo add kubecost https://kubecost.github.io/cost-analyzer/\nhelm install kubecost kubecost/cost-analyzer --namespace kubecost --create-namespace\n```",
    commands: [
      "kubectl port-forward -n kubecost svc/kubecost-cost-analyzer 9090",
      "kubectl get pods -n kubecost",
      "curl http://localhost:9090/model/allocation"
    ],
    compatibleClouds: ["AWS", "Azure", "Google Cloud", "Any Kubernetes cluster"]
  },
  {
    name: "Cloud Custodian",
    description: "Rules engine for cloud security, cost optimization, and governance, ensuring enforcement of policies.",
    url: "https://cloudcustodian.io/",
    github: "https://github.com/cloud-custodian/cloud-custodian",
    tags: ["Multi-cloud", "Governance", "Automation"],
    features: [
      "Policy enforcement for security and cost",
      "Resource lifecycle management",
      "Multi-cloud support",
      "Hundreds of pre-built policies",
      "Automated remediation workflows"
    ],
    documentation: "Cloud Custodian is a rules engine for managing cloud resources. It enables users to define policies to enforce both cost management and compliance requirements. Custodian policies can manage resources through their lifecycle ensuring both cost control and compliance.",
    installation: "```bash\n# Install via pip\npip install c7n\n\n# Create a policy file\necho '{\"policies\": [{\"name\": \"unused-volumes\", \"resource\": \"aws.ebs\", \"filters\": [{\"State.Value\": \"available\"}]}]}' > policy.yml\n```",
    commands: [
      "custodian run --output-dir=. policy.yml",
      "custodian report policy.yml --output-dir=.",
      "custodian validate policy.yml"
    ],
    compatibleClouds: ["AWS", "Azure", "Google Cloud"]
  },
  {
    name: "Komiser",
    description: "Cloud environment inspector to analyze and manage cloud cost, usage, security, and governance.",
    url: "https://www.komiser.io/",
    github: "https://github.com/tailwarden/komiser",
    tags: ["Multi-cloud", "Visualization", "Resource tracking"],
    features: [
      "Cloud asset inventory and tracking",
      "Cost optimization recommendations",
      "Resource utilization insights",
      "Security posture assessment",
      "Beautiful visual dashboard"
    ],
    documentation: "Komiser is an open-source cloud environment inspector that helps developers manage cloud costs, security and compliance across multiple cloud providers. It visualizes cloud infrastructure to provide actionable cost-saving insights.",
    installation: "```bash\n# Install via brew\nbrew install komiser/tap/komiser\n\n# Or via Docker\ndocker run -d -p 3000:3000 --name komiser tailwarden/komiser:latest\n```",
    commands: [
      "komiser start",
      "komiser configure aws",
      "komiser analyze --out summary.html"
    ],
    compatibleClouds: ["AWS", "Azure", "Google Cloud", "Digital Ocean", "Oracle Cloud"]
  }
];
