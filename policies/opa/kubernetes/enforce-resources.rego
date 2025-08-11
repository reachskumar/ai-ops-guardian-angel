package kubernetes.admission

deny[msg] {
  input.kind.kind == "Pod"
  some i
  c := input.review.object.spec.containers[i]
  not c.resources.limits
  msg := sprintf("container missing resource limits: %s", [c.name])
}

deny[msg] {
  input.kind.kind == "Pod"
  some i
  c := input.review.object.spec.containers[i]
  not c.securityContext.runAsNonRoot
  msg := sprintf("container must runAsNonRoot: %s", [c.name])
}

