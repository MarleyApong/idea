import path from "path"
import { defineConfig } from "prisma/config"
import { config } from "dotenv"

// En local, charge .env.local ; en prod, les variables viennent de l'environnement Docker
config({ path: ".env.local", override: false })

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
