export type CacheStore = {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<any>;
    delete(key: string): Promise<any>;
}

export interface BlogOptions {

    /**
     * The subdomain given by Hyvor Blogs
     * Sign up at https://blogs.hyvor.com/console to create a new one
     * Get your subdomain from Console -> Settings -> Hosting
     */
    subdomain: string,

    /**
     * API Key to access the Delivery API of your blog
     * Console -> Settings -> API Keys -> Create an API key for Delivery API
     * Add the API key to your environment variables
    */
    deliveryApiKey: string,

    /**
     * Optional but recommended
     * As per the tutorial, you should set up a webhook with all cache events at
     * Console -> Settings -> Webhooks
     * Then, copy the secret here for webhook validation
     * If the secret is undefined, no validation is done
    */
    webhookSecret?: string,

    /**
     * Set up a custom cache store for caching
     * This must be an object with `get`, `set`, and `delete` methods (See `CacheStore` type)
     * [Keyv](https://keyvhq.js.org/) is a good option
     * If not provided, an in-memory store is used using Keyv
     */
    cache?: CacheStore 

    /**
     * This option is for package developers and testing purposes
     */
    hbApiEndpoint?: string,

}

export interface FileResponse {
    type: 'file',
    at: number,
    cache: boolean,
    status: number,
    file_type: 'template' | 'asset' | 'media',
    content: string,
    mime_type: string,
    cache_control: string,
}

export interface RedirectResponse {
    type: 'redirect',
    at: number,
    cache: boolean,
    status: number,
    to: string
}

export type ResponseObject = FileResponse | RedirectResponse;