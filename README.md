This package contains helpers for serving blogs created with [Hyvor Blogs](https://hyvor.com/blogs) on web applications such as Next.js. It can run on any framework that supports Web APIs.

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

    cache: {

        // see below
        store: keyvStore,
       
        /**
         * @optional
         * Namespace for the cache.
         */
        namespace: 'my-blog',

    }

})
```

### Caching

This library uses [Keyv](https://keyvhq.js.org/) as an unified caching layer. By default, blog cache is stored in an in-memory cache. You can set up a custom cache store by passing a Keyv store to the `cache.store` option (highly recommended).

Here is an example using Redis as the cache store.

```bash
npm install @keyvhq/redis --save
```

```ts
const blog = new Blog({
    // ...
    cache: {
        store: new KeyvRedis('redis://user:pass@localhost:6379')
    }
})
```

See [Keyv's documentation](https://keyvhq.js.org/#/?id=all-the-adapters) for all the available adapters.

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