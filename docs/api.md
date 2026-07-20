# API Notes

The backend exposes routes for authentication and task management.

## Authentication

Typical authentication flow:

1. Register a user
2. Log in with credentials
3. Receive a JWT
4. Send the token with protected task requests

## Tasks

Task routes are protected and require a valid token.
