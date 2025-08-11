package tags.format

# Owner tag format: lowercase with dots (e.g., john.doe)
deny[msg] {
    input.resource_type
    input.tags.owner
    not re_match("^[a-z]+\\.[a-z]+$", input.tags.owner)
    msg := sprintf("Resource %v 'owner' tag '%v' does not match format 'firstname.lastname'", [input.id, input.tags.owner])
}

# Team tag format: lowercase with hyphens (e.g., frontend-team)
deny[msg] {
    input.resource_type
    input.tags.team
    not re_match("^[a-z-]+$", input.tags.team)
    msg := sprintf("Resource %v 'team' tag '%v' does not match format 'lowercase-with-hyphens'", [input.id, input.tags.team])
}

# Project tag format: lowercase with hyphens and numbers (e.g., my-project-123)
deny[msg] {
    input.resource_type
    input.tags.project
    not re_match("^[a-z0-9-]+$", input.tags.project)
    msg := sprintf("Resource %v 'project' tag '%v' does not match format 'lowercase-numbers-hyphens'", [input.id, input.tags.project])
}

# Environment tag format: must be one of allowed values
deny[msg] {
    input.resource_type
    input.tags.environment
    not input.tags.environment in ["dev", "staging", "prod", "test"]
    msg := sprintf("Resource %v 'environment' tag '%v' is not one of: dev, staging, prod, test", [input.id, input.tags.environment])
}

# Cost center tag format: must be one of allowed values
deny[msg] {
    input.resource_type
    input.tags.cost_center
    not input.tags.cost_center in ["engineering", "marketing", "sales", "operations", "infrastructure"]
    msg := sprintf("Resource %v 'cost_center' tag '%v' is not one of: engineering, marketing, sales, operations, infrastructure", [input.id, input.tags.cost_center])
}

# Warn about tags with uppercase letters
warn[msg] {
    input.resource_type
    input.tags.owner
    re_match("[A-Z]", input.tags.owner)
    msg := sprintf("Resource %v 'owner' tag '%v' contains uppercase letters, consider using lowercase", [input.id, input.tags.owner])
}

warn[msg] {
    input.resource_type
    input.tags.team
    re_match("[A-Z]", input.tags.team)
    msg := sprintf("Resource %v 'team' tag '%v' contains uppercase letters, consider using lowercase", [input.id, input.tags.team])
}

warn[msg] {
    input.resource_type
    input.tags.project
    re_match("[A-Z]", input.tags.project)
    msg := sprintf("Resource %v 'project' tag '%v' contains uppercase letters, consider using lowercase", [input.id, input.tags.project])
}

# Warn about tags with special characters (except hyphens and dots)
warn[msg] {
    input.resource_type
    input.tags.owner
    re_match("[^a-z.]", input.tags.owner)
    msg := sprintf("Resource %v 'owner' tag '%v' contains special characters, consider using only lowercase letters and dots", [input.id, input.tags.owner])
}

warn[msg] {
    input.resource_type
    input.tags.team
    re_match("[^a-z-]", input.tags.team)
    msg := sprintf("Resource %v 'team' tag '%v' contains special characters, consider using only lowercase letters and hyphens", [input.id, input.tags.team])
}

warn[msg] {
    input.resource_type
    input.tags.project
    re_match("[^a-z0-9-]", input.tags.project)
    msg := sprintf("Resource %v 'project' tag '%v' contains special characters, consider using only lowercase letters, numbers, and hyphens", [input.id, input.tags.project])
}
