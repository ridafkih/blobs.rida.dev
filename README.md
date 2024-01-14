# Vercel Blob Storage

This project allows you to easily publicly store blobs for usage in CI/CD pipelines, while upload functionality remains protected to the adjacent database owner.

## Configuration Notes

### Database Table Creation

There is one table in the database, named `keys` which stores keys, their hash, and whether or not the key is activated and permitted to faciliate blob uploads.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE keys (
    id TEXT NOT NULL DEFAULT uuid_generate_v4(),
    hash VARCHAR(255) NOT NULL,
    activated BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id)
);
```

### Enabling Keys

You can run an `UPDATE` query against this database citing a speciic UUID which you use to enable. This will allow the key associated with this id to facilitate uploads to storage.

```sql
UPDATE keys
SET activated = TRUE
WHERE id = '';
```

## Endpoints

### `/register`

The registration endpoint will return an identifier and an API key.

```json
{
  "id": "5d134356-03fc-4621-8ea9-cd49d05921ce",
  "authorization": "2gPeMBO35HVYUHbOJn2fU1GEN+LtLPwIIsD8X7zybSo="
}
```

### `/artifacts/:path*`

The path and filename are designated in the URL, and it returns the `url`, `pathname`, `contentType`, and `contentDisposition` of the uploaded blob. Anyone with this URL will be able to access the file.

Two headers are required for this API request, `x-id` should contain the value of `id` field and `Authorization` should contain the value of the `authorization` field. These are both sourced from the response body of `/register`.

```json
{
  "url": "https://ngyiwepqpnnt9hxj.public.blob.vercel-storage.com/artifacts/index-vhtb5fSrYzV9JlkY1rwETPvhQEXZuW.png",
  "pathname": "artifacts/index.png",
  "contentType": "image/png",
  "contentDisposition": "attachment; filename=\"index.png\""
}
```

## Authentication

You must set the `activated` to `TRUE` should you want to enable a set of credentials to upload to storage, otherwise a `403` will be returned.
