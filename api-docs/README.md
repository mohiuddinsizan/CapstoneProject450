# OmniLock API Docs

OpenAPI definition is available at `api-docs/openapi.yaml`.
Postman collection is available at `api-docs/omnilock.postman_collection.json`.

## Quick preview options

- Swagger Editor: https://editor.swagger.io (paste YAML content)
- Redoc CLI:

```bash
npx @redocly/cli preview-docs api-docs/openapi.yaml
```

## Notes

- This spec is generated from currently implemented Express routes.
- Security includes `bearerAuth`, `x-device-secret`, and `x-webhook-signature`.

## Postman import

1. Open Postman
2. Import `api-docs/omnilock.postman_collection.json`
3. Set collection variables: `baseUrl`, `accessToken`, `adminToken`, `deviceSecret`

## CI

Backend CI workflow is in `.github/workflows/backend-ci.yml` and runs `npm test` for changes under `backend/`.