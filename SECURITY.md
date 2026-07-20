# Security Notes

Memora uses JWT-based authentication. Keep the JWT secret private and configure it through environment variables.

Do not commit:

- `.env` files
- database passwords
- production tokens
- real user data
