# LocalStore

LocalStore is a full-stack grocery storefront with cash-on-delivery checkout and an admin dashboard for inventory and order fulfillment.

| Shopper | Admin |
| --- | --- |
| Browse by category or search the catalog | Manage products, stock, and categories |
| Add items to the cart and apply eligible coupons | Upload product images through Cloudinary |
| Place an order and track its status | Review orders and update fulfillment status |

The React storefront uses Vite and Tailwind CSS. The Express API uses JWT authentication and MongoDB through Mongoose. Checkout calculates prices from the catalog and reserves inventory in a MongoDB transaction. Cancelling an order returns the reserved stock in the same transaction as the status update.

## Run locally

Use Node.js 22.13 or later and a MongoDB Atlas cluster or local MongoDB replica set. Transactions require a replica set or sharded deployment.

Copy [the backend environment example](LocalStore-backend/.env.example) to `LocalStore-backend/.env`. Use the cluster's current Drivers connection string for `MONGO_URI`, set `MONGO_DB_NAME=localstore_demo`, and generate a JWT signing secret with `node -p "require('node:crypto').randomBytes(32).toString('hex')"`.

```sh
cd LocalStore-backend
npm ci
npm run seed
npm run dev
```

The seed is optional and requires an empty `localstore_demo` database. Set a private `ADMIN_EMAIL` and `ADMIN_PASSWORD` before running it. It creates the admin and a sample catalog. After seeding, remove those two variables from the runtime environment.

In a second terminal, from the repository root:

```sh
cd local-store-frontend
npm ci
npm start
```

Open `http://localhost:3000`. The API runs on port 5000 by default.

## Deploy

Deploy the repository root as a Docker web service. The image builds the frontend and serves it from Express alongside the API. The host needs to route traffic to the container's `PORT` and use `/api/health` for its health check.

1. Create or resume an Atlas cluster, create a database user with read/write access to `localstore_demo`, and allow connections from the deployment host. Use the hostname from Atlas **Connect → Drivers**. If startup reports an SRV lookup failure, verify that hostname and confirm the cluster is available.
2. Set `MONGO_URI`, `MONGO_DB_NAME=localstore_demo`, and `JWT_SECRET` in the host's environment settings. Set the three `CLOUDINARY_*` variables if you want image uploads. If the host documents a fixed number of trusted proxy hops, set `TRUST_PROXY_HOPS` accordingly so sign-in rate limits use client IPs.
3. For a populated demo, run `npm run seed` once from a shell on the deployed service with temporary admin credentials. Keep the admin account private. Reviewers can create their own shopper account.
4. Verify that `/api/health` returns HTTP 200 with `db: connected`. Open a catalog item directly, then place a sample cash-on-delivery order and verify it appears in order history.

To run the same container locally from the repository root:

```sh
docker build -t localstore .
docker run --rm --env-file LocalStore-backend/.env -p 5000:5000 localstore
```

## Verify changes

GitHub Actions installs from both lockfiles, runs the backend and frontend tests, audits dependencies, builds the frontend, and builds the Docker image. Locally, run `npm test` and `npm audit` in each package and `npm run build` in the frontend.

## Portfolio walkthrough

1. Search for a grocery item, add it to the cart, and place a cash-on-delivery order.
2. Open order history and show the receipt and fulfillment status.
3. In a private admin session, update the order status and show the corresponding inventory change.

**Resume bullet.** Built a full-stack grocery storefront with React, Express, and MongoDB, implementing role-based admin tools, server-side checkout pricing, and transactional inventory updates. Packaged the app for Docker deployment and automated tests and dependency audits with GitHub Actions.
