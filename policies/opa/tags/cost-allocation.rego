package tags.cost_allocation

# Deny resources missing cost center tag
deny[msg] {
    input.resource_type
    not input.tags.cost_center
    msg := sprintf("Resource %v missing required 'cost_center' tag for billing allocation", [input.id])
}

# Deny resources with empty cost center tag
deny[msg] {
    input.resource_type
    input.tags.cost_center == ""
    msg := sprintf("Resource %v has empty 'cost_center' tag", [input.id])
}

# Deny resources with null cost center tag
deny[msg] {
    input.resource_type
    input.tags.cost_center == null
    msg := sprintf("Resource %v has null 'cost_center' tag", [input.id])
}

# Deny resources with invalid cost center values
deny[msg] {
    input.resource_type
    input.tags.cost_center
    not input.tags.cost_center in ["engineering", "marketing", "sales", "operations", "infrastructure", "research", "support", "qa"]
    msg := sprintf("Resource %v 'cost_center' tag '%v' is not a valid cost center", [input.id, input.tags.cost_center])
}

# Deny resources missing project tag (required for cost tracking)
deny[msg] {
    input.resource_type
    not input.tags.project
    msg := sprintf("Resource %v missing required 'project' tag for cost tracking", [input.id])
}

# Deny resources with empty project tag
deny[msg] {
    input.resource_type
    input.tags.project == ""
    msg := sprintf("Resource %v has empty 'project' tag", [input.id])
}

# Deny resources with null project tag
deny[msg] {
    input.resource_type
    input.tags.project == null
    msg := sprintf("Resource %v has null 'project' tag", [input.id])
}

# Warn about resources without environment tag (affects cost allocation)
warn[msg] {
    input.resource_type
    not input.tags.environment
    msg := sprintf("Resource %v missing 'environment' tag, may affect cost allocation accuracy", [input.id])
}

# Warn about resources without team tag (affects cost allocation)
warn[msg] {
    input.resource_type
    not input.tags.team
    msg := sprintf("Resource %v missing 'team' tag, may affect cost allocation accuracy", [input.id])
}

# Warn about resources without owner tag (affects cost allocation)
warn[msg] {
    input.resource_type
    not input.tags.owner
    msg := sprintf("Resource %v missing 'owner' tag, may affect cost allocation accuracy", [input.id])
}

# Deny resources with inconsistent cost center and team tags
deny[msg] {
    input.resource_type
    input.tags.cost_center
    input.tags.team
    input.tags.cost_center != input.tags.team
    input.tags.team in ["engineering", "marketing", "sales", "operations", "infrastructure"]
    msg := sprintf("Resource %v has inconsistent 'cost_center' '%v' and 'team' '%v' tags", [input.id, input.tags.cost_center, input.tags.team])
}

# Warn about resources with high cost but missing detailed tags
warn[msg] {
    input.resource_type
    input.monthly_cost
    input.monthly_cost > 100
    not input.tags.cost_center
    msg := sprintf("Resource %v has high monthly cost $%v but missing 'cost_center' tag", [input.id, input.monthly_cost])
}

warn[msg] {
    input.resource_type
    input.monthly_cost
    input.monthly_cost > 100
    not input.tags.project
    msg := sprintf("Resource %v has high monthly cost $%v but missing 'project' tag", [input.id, input.monthly_cost])
}

# Deny resources with invalid cost allocation patterns
deny[msg] {
    input.resource_type
    input.tags.cost_center == "engineering"
    not input.tags.team
    msg := sprintf("Resource %v has 'cost_center' 'engineering' but missing 'team' tag", [input.id])
}

deny[msg] {
    input.resource_type
    input.tags.cost_center == "marketing"
    not input.tags.project
    msg := sprintf("Resource %v has 'cost_center' 'marketing' but missing 'project' tag", [input.id])
}

deny[msg] {
    input.resource_type
    input.tags.cost_center == "sales"
    not input.tags.project
    msg := sprintf("Resource %v has 'cost_center' 'sales' but missing 'project' tag", [input.id])
}
