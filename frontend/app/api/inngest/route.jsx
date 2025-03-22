import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import {GenerateVideoData } from "../../../inngest/function";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [  GenerateVideoData],
});
