## Moving to a Turborepo Monorepo

To integrate this P2P network node into a Turborepo monorepo, follow these steps:

1. In your existing Turborepo project, create a new package directory:
   ```bash
   mkdir packages/p2p-network
   ```

2. Copy all files from this project into the new directory:
   ```bash
   cp -r * packages/p2p-network/
   ```

3. Update the package name in `packages/p2p-network/package.json` to include your organization scope:
   ```json
   {
     "name": "@your-org/p2p-network",
     "version": "1.0.0",
     ...
   }
   ```

4. Add the package to your Turborepo's root `package.json`:
   ```json
   {
     "workspaces": [
       "packages/*"
     ]
   }
   ```

5. Update the Turborepo pipeline in `turbo.json` to include the new package:
   ```json
   {
     "pipeline": {
       "build": {
         "dependsOn": ["^build"],
         "outputs": ["dist/**"]
       },
       "dev": {
         "cache": false
       }
     }
   }
   ```

6. Install dependencies from the root:
   ```bash
   pnpm install
   # or
   yarn install
   # or
   npm install
   ```

7. You can now run the P2P network node using Turborepo:
   ```bash
   turbo run dev --filter=@your-org/p2p-network
   ```

### Using the Package in Other Workspace Packages

To use the P2P network node in other packages within your monorepo:

1. Add it as a dependency in the package's `package.json`:
   ```json
   {
     "dependencies": {
       "@your-org/p2p-network": "workspace:*"
     }
   }
   ```

2. Import and use the P2P node:
   ```typescript
   import { P2PNode } from '@your-org/p2p-network'
   ```

### Environment Variables

Create a `.env` file in the package root with these variables:
```
P2P_PORT=6000
WS_PORT=6001
API_PORT=6002
```

Make sure to add any environment variable handling to your Turborepo configuration if needed.