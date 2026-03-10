import { headers } from "next/headers";
import { getAuth } from "./auth";

export const getServerSession = async () => {
  const auth = getAuth();
  const headersList = await headers();
  return auth.api.getSession({ headers: headersList });
};
