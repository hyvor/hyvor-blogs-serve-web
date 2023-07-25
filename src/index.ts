import Keyv from "@keyvhq/core";
import KeyvFile from "@keyvhq/file";
import { BlogOptions, ResponseObject } from "./types";
import { verifyHmacSha256 } from "./crypto";
 
export class Blog {

    public cacheService: CacheService;

    constructor(public options: BlogOptions) {
        this.cacheService = new CacheService(options);
    }

    public async handleBlogRequest(path: string) {

        path = path.startsWith('/') ? path : '/' + path;

        const apiEndpoint = 
            (this.options.hbApiEndpoint || 'https://blogs.hyvor.com/api/delivery/v0/') + 
            this.options.subdomain;
        
        const apiKey = this.options.deliveryApiKey;

        let responseObject = await this.cacheService.get(path);

        if (!responseObject) {
            const response = await fetch(`${apiEndpoint}?path=${path}&api_key=${apiKey}`, {
                cache: 'no-store'
            });

            if (!response.ok) {
                return new Response(null, {status: 500});
            }

            responseObject = await response.json() as ResponseObject;

            await this.cacheService.set(path, responseObject);
        }

        return this.responseObjectToResponse(responseObject);
    }

    /**
     * Returns 200 when failing on known errors to prevent webhook retries.
     */
    public async handleWebhookRequest(data: any, signature: string) {

        if (typeof data !== 'object' || data === null) {
            throw new Error('Invalid data type');
        }

        const subdomain = data.subdomain;

        if (subdomain !== this.options.subdomain) {
            throw new Error('Subdomain mismatch');
        }

        if (this.options.webhookSecret) {
            const contentString = JSON.stringify(data);

            const verify = await verifyHmacSha256(contentString, this.options.webhookSecret, signature); 

            if (!verify) {
                throw new Error('Signature mismatch');
            }

        }

        const event = data.event;

        if (event === 'cache.single') {
            await this.cacheService.clearSingleCache(data.path);
        } else if (event === 'cache.templates') {
            await this.cacheService.clearTemplateCache();
        } else if (event === 'cache.all') {
            await this.cacheService.clearAllCache();
        }

        return new Response('ok');

    }

    private responseObjectToResponse(responseObject: ResponseObject) {

        if (responseObject.type === 'redirect') {
            return Response.redirect(responseObject.to, responseObject.status);
        }

        const byteCharacters = atob(responseObject.content);

        // Convert the byte characters to an array buffer
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const arrayBuffer = byteArray.buffer;

        // Create a blob from the array buffer
        const blob = new Blob([arrayBuffer], { type: responseObject.mime_type });

        return new Response(blob, {
            status: responseObject.status,
            headers: {
                'Content-Type': responseObject.mime_type,
                'Cache-Control': responseObject.cache_control,
            }
        });


    }

}


export class CacheService {

    private readonly LAST_TEMPLATE_CACHE_CLEARED_AT = 'LAST_TEMPLATE_CACHE_CLEARED_AT';
    private readonly LAST_ALL_CACHE_CLEARED_AT = 'LAST_ALL_CACHE_CLEARED_AT';

    private store: Keyv;

    constructor(private options: BlogOptions) {
        const storeOptions : Keyv.Options<any> = {};

        if (options.cache?.store) {
            storeOptions.store = options.cache.store;
        } else {
            storeOptions.store = new KeyvFile('./.hyvor-blogs-cache/' + options.subdomain);
        }

        if (options.cache?.namespace) {
            storeOptions.namespace = options.cache.namespace;
        }

        this.store = new Keyv(storeOptions);
    }

    public async set(path: string, object: ResponseObject) {
        await this.store.set(this.getKey(path), object);
    }

    public async get(path: string) : Promise<null|ResponseObject> {

        const cached = await this.getFromCache(path);

        if (!cached)
            return null;

        if (typeof cached !== 'object')
            return null;

        const responseObject = cached as ResponseObject;
        const at = responseObject.at;

        const lastCacheClearedAt = await this.getFromCache(this.LAST_ALL_CACHE_CLEARED_AT) || 0;
        if (at < lastCacheClearedAt)
            return null;

        if (responseObject.type === 'file' && responseObject.file_type) {
            const lastTemplateCacheClearedAt = await this.getFromCache(this.LAST_TEMPLATE_CACHE_CLEARED_AT) || 0;
            if (at < lastTemplateCacheClearedAt)
                return null;
        }   

        return responseObject;
    }


    public async getFromCache(key: string) {
        return await this.store.get(this.getKey(key));
    }

    private getKey(key: string) {
        return `hyvor_blogs:${this.options.subdomain}:${key}`;
    }


    public async clearSingleCache(path: string) {
        await this.store.delete(this.getKey(path));
    }

    public async clearTemplateCache() {
        await this.store.set(
            this.getKey(this.LAST_TEMPLATE_CACHE_CLEARED_AT),
            Math.floor(Date.now() / 1000)    
        );
    }

    public async clearAllCache() {
        await this.store.set(
            this.getKey(this.LAST_ALL_CACHE_CLEARED_AT),
            Math.floor(Date.now() / 1000)    
        );
    }

}