import express from "express";
import cookieParser from "cookie-parser";
import { createAdminRouter } from "./backend.ts";

export default function adminApiPlugin() {
  return {
    name: "vite:admin-api",
    configureServer(server: any) {
      const app = express();
      app.use(cookieParser());
      app.use(express.json({ limit: "1mb" }));
      app.use("/admin/api", createAdminRouter());
      server.middlewares.use(app);
    },
  };
}
