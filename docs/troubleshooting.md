# Troubleshooting

## API cannot connect to database

Check `DATABASE_URL` in `apps/api/.env` and verify that PostgreSQL is running.

## Frontend cannot reach API

Check the API base URL inside the frontend API helper.

## Prisma client missing

Run:

```bash
cd apps/api
npm run prisma:generate
```
