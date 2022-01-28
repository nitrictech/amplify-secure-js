amplify-secure-js

## API Route Example (NextJS)

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
