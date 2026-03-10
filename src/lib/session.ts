import { getAuth } from "./auth";

export const getRequestSession = async (request: Request) => {
  const auth = getAuth();
  return auth.api.getSession({ headers: request.headers });
};
