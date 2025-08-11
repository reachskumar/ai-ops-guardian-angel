package cloud.exposure

# Deny resources with public exposure
deny[msg] {
    input.public_exposure == true
    msg := sprintf("Resource %v is publicly exposed", [input.id])
}

# Deny security groups with 0.0.0.0/0 ingress
deny[msg] {
    input.resource_type == "security_group"
    input.cloud_attributes.ingress_rules[_].cidr == "0.0.0.0/0"
    msg := sprintf("Security group %v allows access from anywhere (0.0.0.0/0)", [input.id])
}

# Deny load balancers with public IP
deny[msg] {
    input.resource_type == "load_balancer"
    input.cloud_attributes.public_ip == true
    input.cloud_attributes.internal == false
    msg := sprintf("Load balancer %v has public IP", [input.id])
}

# Deny databases with public access
deny[msg] {
    input.resource_type in ["rds_instance", "sql_database", "cloud_sql"]
    input.cloud_attributes.publicly_accessible == true
    msg := sprintf("Database %v is publicly accessible", [input.id])
}

# Deny storage buckets with public read/write
deny[msg] {
    input.resource_type in ["s3_bucket", "blob_container", "gcs_bucket"]
    input.cloud_attributes.public_access == "read_write"
    msg := sprintf("Storage bucket %v has public read/write access", [input.id])
}

# Warn about resources without proper tags
warn[msg] {
    not input.tags.owner
    not input.tags.team
    not input.tags.project
    msg := sprintf("Resource %v missing required tags (owner, team, project)", [input.id])
}

# Warn about high-risk regions
warn[msg] {
    input.region in ["us-east-1", "us-west-1", "eastus", "westus", "us-central1"]
    input.public_exposure == true
    msg := sprintf("Resource %v is publicly exposed in high-risk region %v", [input.id, input.region])
}
