package tags.required

# Deny resources missing required tags
deny[msg] {
    input.resource_type
    not input.tags.owner
    msg := sprintf("Resource %v missing required tag 'owner'", [input.id])
}

deny[msg] {
    input.resource_type
    not input.tags.team
    msg := sprintf("Resource %v missing required tag 'team'", [input.id])
}

deny[msg] {
    input.resource_type
    not input.tags.project
    msg := sprintf("Resource %v missing required tag 'project'", [input.id])
}

# Deny resources with empty required tags
deny[msg] {
    input.resource_type
    input.tags.owner == ""
    msg := sprintf("Resource %v has empty 'owner' tag", [input.id])
}

deny[msg] {
    input.resource_type
    input.tags.team == ""
    msg := sprintf("Resource %v has empty 'team' tag", [input.id])
}

deny[msg] {
    input.resource_type
    input.tags.project == ""
    msg := sprintf("Resource %v has empty 'project' tag", [input.id])
}

# Deny resources with null required tags
deny[msg] {
    input.resource_type
    input.tags.owner == null
    msg := sprintf("Resource %v has null 'owner' tag", [input.id])
}

deny[msg] {
    input.resource_type
    input.tags.team == null
    msg := sprintf("Resource %v has null 'team' tag", [input.id])
}

deny[msg] {
    input.resource_type
    input.tags.project == null
    msg := sprintf("Resource %v has null 'project' tag", [input.id])
}
