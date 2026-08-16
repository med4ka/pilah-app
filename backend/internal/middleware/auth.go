package middleware

import (
	"strings"

	"backend/internal/config"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// Protected ensures the request carries a valid JWT, then stores
// user_id and role in Locals for downstream handlers/middleware.
// Token is read from the httpOnly cookie first; falls back to the Authorization
// (Bearer) header for temporary compatibility during the migration period.
func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Cookies("pilah_token")

		if tokenString == "" {
			authHeader := c.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"status":  "error",
					"message": "Access denied, token not found",
				})
			}
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Secret read once at startup (config.JWTSecret), not per request
			return []byte(config.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Token invalid or expired",
			})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Invalid token claims",
			})
		}

		c.Locals("user_id", claims["user_id"])
		c.Locals("user_role", claims["role"])
		return c.Next()
	}
}

// RequireRole restricts access to an endpoint based on the JWT role.
// Must be mounted AFTER Protected() so claims are already available in Locals.
// Example: api.Patch("/x", middleware.Protected(), middleware.RequireRole("collector"), handler)
func RequireRole(role string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole, ok := c.Locals("user_role").(string)
		if !ok || userRole != role {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"status":  "error",
				"message": "Access denied for this role",
			})
		}
		return c.Next()
	}
}
