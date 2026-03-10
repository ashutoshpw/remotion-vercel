import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "../../../../lib/auth";

const handler = async (request: Request) => {
  const auth = getAuth();
  return auth.handler(request);
};

export const { GET, POST } = toNextJsHandler(handler);
