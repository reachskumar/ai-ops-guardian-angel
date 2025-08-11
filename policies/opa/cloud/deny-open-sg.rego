package cloud.plan

deny[msg] {
  input.action == "sg_authorize"
  input.cidr == "0.0.0.0/0"
  input.to_port < 1024
  msg := sprintf("Opening port %v to 0.0.0.0/0 is not allowed", [input.to_port])
}

