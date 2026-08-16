package config

// JWTSecret is set once at startup from env JWT_SECRET (see cmd/api/main.go).
// Must not fall back to a hardcoded string — if env is empty the server must fail to start.
var JWTSecret string