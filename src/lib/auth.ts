import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-pos-to-pos-jwt-key-2026"
);

export async function signToken(payload: Record<string, any>, expires: string = "12h") {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload;
  } catch (err) {
    return null;
  }
}
