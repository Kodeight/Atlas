# Admin Dashboard

This folder contains backend middleware support for the admin dashboard.

## Features

- Secure login with JWT in HTTP-only cookies
- Product CRUD endpoints
- Order status updates
- Route protection middleware

## Environment

The admin middleware uses the following environment variables:

- `JWT_SECRET`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`
- `APP_URL`

The admin frontend is implemented inside `src/admin` and is mounted at `/admin`.
