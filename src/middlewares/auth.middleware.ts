import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

export async function authMiddleware(c: Context, next: Next) {
  const token = c.req.header("API-Key");

  if (!token) {
    throw new HTTPException(401, {
      message: "Missing authentication token",
    });
  }

  const validToken = process.env.API_SECRET_KEY;
  
  if (!validToken) {
    throw new HTTPException(500, {
      message: "API configuration error",
    });
  }

  if (token !== validToken) {
    throw new HTTPException(403, {
      message: "Invalid authentication token",
    });
  }

  await next();
}
