# @nitric/amplify-secure-js 🔒

This library was created the address the issues found [here](https://github.com/aws-amplify/amplify-js/issues/8147).

Basically this will avoid using client side cookies and local storage by using secure http cookies instead.

This library is open for contributors. 🚀

## React Context Example (NextJS)

Coming soon.

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
