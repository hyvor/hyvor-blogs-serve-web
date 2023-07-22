import { expect, it, vi } from "vitest";
import { Blog } from "../src";
import { BlogOptions, ResponseObject } from "../src/types";

export function getBlog(options: Partial<BlogOptions> = {}) {

    return new Blog({
        subdomain: 'test',
        deliveryApiKey: 'delivery-api-key',
        cache: {
            store: new Map(), // In-memory cache
        },
        ...options
    })

}


it('returns blog response success', async () => {

    const deliveryResponseTime = Math.floor(Date.now() / 1000);
    const deliveryResponse : ResponseObject = {
        type: 'file',
        file_type: 'template',
        at: deliveryResponseTime,
        cache: true,
        cache_control: 'no-cache',
        status: 200,
        content: btoa('Hello World'),
        mime_type: 'text/html',
    }

    const mock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => new Promise(resolve =>  resolve(deliveryResponse))
    });
    global.fetch = mock;

    const blog = getBlog();
    const response = await blog.handleBlogRequest('');

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-cache');

    expect(await response.text()).toBe('Hello World');

    expect(mock).toHaveBeenCalledOnce();
    expect(mock).toHaveBeenCalledWith(
        'https://blogs.hyvor.com/api/delivery/v0/test' +
        '?path=/' +
        '&api_key=delivery-api-key',
        { cache: 'no-store' }
    )

    const cached = await blog.cacheService.get('/');
    expect(cached).toEqual(deliveryResponse);

});

it('returns blog redirect response with path', async () => {
   
    const deliveryResponseTime = Math.floor(Date.now() / 1000);
    const deliveryResponse : ResponseObject = {
        type: 'redirect',
        at: deliveryResponseTime,
        cache: true,
        status: 301,
        to: 'https://example.com',
    }

    const mock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => new Promise(resolve =>  resolve(deliveryResponse))
    });
    global.fetch = mock;

    const blog = getBlog();
    const response = await blog.handleBlogRequest('/about');

    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe('https://example.com/');

    expect(mock).toHaveBeenCalledOnce();
    expect(mock).toHaveBeenCalledWith(
        'https://blogs.hyvor.com/api/delivery/v0/test' +
        '?path=/about' +
        '&api_key=delivery-api-key',
        { cache: 'no-store' }
    )

    const cached = await blog.cacheService.get('/about');
    expect(cached).toEqual(deliveryResponse);
    
});

it('handles server error', async () => {

    const mock = vi.fn().mockResolvedValue({
        ok: false,
    });
    global.fetch = mock;

    const blog = getBlog();
    const response = await blog.handleBlogRequest('/bad');

    expect(response.status).toBe(500);

    const cached = await blog.cacheService.get('/about');
    expect(cached).toBeNull();

});