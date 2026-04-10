import serverless from "serverless-http";
import app from "../../../app.js"; // Tu app.js actual

export const handler = serverless(app);
