This package contains helpers for serving blogs created with [Hyvor Blogs](https://hyvor.com/blogs) on web applications such as Next.js. It can run on any framework that supports Web APIs.

## Tutorials

Here are some tutorials on how to use this package with different frameworks.

* [Next.js](https://hyvor.com/blog/nextjs-blog)
* [Cloudflare Workers](https://hyvor.com/blog/cloudflare-workers-blog)

## Installation

```bash
npm install @hyvor/hyvor-blogs-serve-web
```

## Usage

First, create a new instance of `Blog`

```ts
import { Blog } from '@hyvor/hyvor-blogs-serve-web';

const blog = new Blog({

    /**
     * The subdomain of your blog.
     * Console -> Settings -> Hosting
     */
    subdomain: 'my-subdomain',

    /**
     * The Delivery API key of your blog.
     * Console -> Settings -> API Keys
     */
    deliveryApiKey: 'my-delivery-api-key',

    /**
     * @optional
     * The webhook secret key of your blog.
     * Console -> Settings -> Webhooks
     */
    webhookSecret: 'my-webhook-secret',

    /**
     * An object that has the following methods:
     * get: (key: string) => Promise<any>
     * set: (key: string, value: any) => Promise<any>
     * delete: (key: string) => Promise<any>
     */
    cache: myCache,

})
```

### Caching

Setting up a cache is highly recommended to reduce the number of requests to our Delivery API and to improve the performance of your blog. We recommend using [Keyv](https://keyvhq.js.org/) as the caching layer. If no cache is provided, Keyv in-memory cache is used, which does not give any performance benefits.

Here is an example using Redis as the cache store.

```bash
npm install @keyvhq/redis --save
```

```ts
import Keyv from '@keyvhq/core'
import KeyvRedis from '@keyvhq/redis'

const blog = new Blog({
    // ...
    cache: new Keyv({store: new KeyvRedis('redis://user:pass@localhost:6379')})
})
```

See [Keyv's documentation](https://keyvhq.js.org/#/?id=all-the-adapters) for all the available adapters.

#### Using a custom cache

If you want to use a custom cache, you can pass an object that has the following methods:

```ts
new Blog({
    cache: {
        get: async (key: string) => {
            // return the value of the key
        },
        set: async (key: string, value: any) => {
            // set the value of the key
        },
        delete: async (key: string) => {
            // delete the key
        }
    }
});
```

### Handling blog requests

Use the `handleRequest` method to handle blog requests. 


```ts
const response = await blog.handleRequest(path)
```

* It accepts one parameter: `path`, which is the path of the request. For example, if your blog root is `/blog`, for a request to `/blog/hello-world`, the `path` parameter should be `/hello-world`. This is used to call our [Delivery API](https://blogs.hyvor.com/docs/api-delivery).
* It returns a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object.

### Handling webhooks

We use webhooks to clear cache of your blog when data is updated in your blog. You can handle webhooks using the `handleWebhook` method.

```ts
await blog.handleWebhook(data, signature)
```

* It accepts two parameters:
    * `data`: The request body as an object.
    * `signature`: The `X-Signature` header of the request.


Here is an example using the `Request` object.

```ts
const body = await request.json();
const signature = request.headers.get('X-Signature') || '';

await blog.handleWebhook(body, signature);
```

See our [Webhooks](https://blogs.hyvor.com/docs/webhooks) docs for more information.