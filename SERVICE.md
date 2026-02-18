# DeFlock Router — Service Developer Guide

The canonical API contract lives in `api/deflock-router.yaml` (OpenAPI 3.1.0). All clients (FlockHopper web, DeFlock mobile) are generated from this spec.

## Recommended Stack

**Fastify + TypeBox + @fastify/swagger**

TypeBox schemas are JSON Schema natively, which is exactly what OpenAPI 3.1 uses. This means your runtime validation schemas double as your API documentation with zero drift.

```bash
npm install fastify @fastify/swagger @fastify/swagger-ui @sinclair/typebox
```

```typescript
import { Type } from '@sinclair/typebox';

const Coordinate = Type.Object({
  latitude: Type.Number({ minimum: -90, maximum: 90 }),
  longitude: Type.Number({ minimum: -180, maximum: 180 }),
});
```

`@fastify/swagger` will generate an OpenAPI spec from your TypeBox route schemas at runtime. You can then diff this against the canonical spec in CI.

### Alternative: Python / FastAPI

If building in Python, FastAPI with Pydantic provides a similar experience. Generate Pydantic models from the spec:

```bash
pip install datamodel-code-generator
datamodel-codegen --input api/deflock-router.yaml --output models.py
```

FastAPI will generate its own OpenAPI spec at `/openapi.json` which you can diff against the canonical spec.

## Contract Testing in CI

The goal is to catch drift between the service implementation and the canonical spec. Add a CI step that:

1. Starts the service
2. Fetches the service's generated spec (e.g. `GET /docs/json` for Fastify, `/openapi.json` for FastAPI)
3. Diffs it against `api/deflock-router.yaml`

Example with `@redocly/cli`:

```bash
# Lint the canonical spec
npx @redocly/cli lint api/deflock-router.yaml --config api/redocly.yaml

# Compare service spec against canonical (after starting the service)
curl -s http://localhost:3001/docs/json > /tmp/service-spec.json
npx @redocly/cli diff api/deflock-router.yaml /tmp/service-spec.json
```

## API Scripts

```bash
npm run lint:api        # Validate the spec
npm run generate:api    # Generate TypeScript client → src/generated/deflock-router/
npm run preview:api     # Preview API docs in browser
```

## Endpoint Summary

| Endpoint | Consumer | Purpose |
|----------|----------|---------|
| `POST /v1/route` | FlockHopper web | Full comparison (normal vs avoidance route + metrics) |
| `POST /v1/directions` | DeFlock mobile | Simplified avoidance route (backward-compatible with alprwatch format) |

Both endpoints use the `{ok: true, result: ...}` / `{ok: false, error: "..."}` envelope pattern.
