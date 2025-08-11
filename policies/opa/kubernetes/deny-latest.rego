package kubernetes.admission

deny[msg] {
  input.kind.kind == "Pod"
  some i
  container := input.review.object.spec.containers[i]
  endswith(container.image, ":latest")
  msg := sprintf("image uses latest tag: %s", [container.image])
}

