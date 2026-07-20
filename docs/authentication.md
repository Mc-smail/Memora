# Authentication

Memora uses JWT authentication for protected API routes.

The basic flow is:

1. The user submits login credentials.
2. The API validates the credentials.
3. The API signs a JWT.
4. The frontend stores and sends the token for protected requests.

JWT secrets must never be committed to the repository.
