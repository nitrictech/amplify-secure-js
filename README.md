

# @nitric/amplify-secure-js 🔒

This library was created the address the issues found [here](https://github.com/aws-amplify/amplify-js/issues/8147).

Basically this will avoid using client side cookies and local storage by using secure http cookies instead.

This library is open for contributors. 🚀

## Setup

1. Configure amplify with the `amplifyLocalStorage` storage class:

   ```ts
   import { amplifyLocalStorage } from "@nitric/amplify-secure-js";
   import config from "./aws-amplify-config";
   
   Amplify.configure({
     ...config,
     storage: amplifyLocalStorage,
   });
   ```

2. Ensure you have your API routes setup to store the secure cookies, see the API route example below.

3. Call the API from your app after you have authenticated to persist the session:

   ```ts
   import { Auth } from "aws-amplify";
   import { sendAuthStorage } from "@nitric/amplify-secure-js";
   
   await Auth.signIn(username, password) // or custom flow
   await sendAuthStorage(); // this will persist the session
   ```

4. Restore the session from secure cookies:

   ```ts
   import { restoreAuthenticatedUser } from "@nitric/amplify-secure-js";
   
   const user = await restoreAuthenticatedUser(); // this restore the storage
   ```

5. Sign out to clear the storage:

   ```ts
   import { amplifySignOut } from "@nitric/amplify-secure-js";
   
   await amplifySignOut(); // clears the storage and signs out the user
   ```

   

## React Context Example (NextJS)

Coming soon.

## Protected Page SSR (NextJS)

```tsx
import * as React from "react";
import type { GetServerSidePropsContext, NextPage } from "next";
import { AmplifyStorage } from "@nitric/amplify-secure-js";
import { withSSRContext } from "aws-amplify";
import config from "./amplify-config";

const Profile: NextPage = () => {
  return (
    <main>
      <h1>Protected profile page</h1>
    </main>
  );
};

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const { Auth } = withSSRContext({ req });

  Auth.configure({
    ...config,
    storage: new AmplifyStorage({ req }),
  });

  try {
    await Auth.currentAuthenticatedUser();

    return { props: {} };
  } catch (e) {
    return {
      props: {},
      redirect: {
        permanent: false,
        destination: "/login",
      },
    };
  }
}

export default Profile;
```

## API Route Example (NextJS)

Place this in your `/api/auth` route. Or set the environment variable `NITRIC_AMPLIFY_AUTH_PATH` to change it.

```ts
import {
  getAuthStorageServer,
  setAuthStorageServer,
  removeAuthStorageServer,
} from "@nitric/amplify-secure-js";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { data } = req.body;
    try {
      setAuthStorageServer(req, res, data);
    } catch (err) {
      console.log("error: nothing set", err);
    }

    res.statusCode = 200;
    return res.json({ success: true });
  } else if (req.method === "GET") {
    const storage = getAuthStorageServer(req);

    res.statusCode = 200;
    return res.json({ data: storage });
  } else if (req.method === "DELETE") {
    removeAuthStorageServer(req, res);
    res.statusCode = 200;
    return res.json({ success: true });
  }

  res.json({ success: false });
};
```
