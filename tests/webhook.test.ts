import { expect, it } from "vitest";
import { getBlog } from "./blog.test";
import { ResponseObject } from "../src/types";

it('requires a valid object', async () => {
    expect(async () => await getBlog().handleWebhookRequest('invalid', 'sig'))
        .rejects
        .toThrowError('Invalid data type');
})

it('should match the subdomain', async () => {
    expect(async() => await getBlog().handleWebhookRequest({subdomain: 'test2'}, 'sig'))
        .rejects    
        .toThrowError('Subdomain mismatch');
});

it('should match the signature', async () => {
    expect(async() => await getBlog({
        webhookSecret: 'secret'
    }).handleWebhookRequest({subdomain: 'test'}, 'sig2'))
        .rejects
        .toThrowError('Signature mismatch');
});

it('does not validate when no secret is set', async () => {
    const response = await getBlog({
        webhookSecret: undefined
    }).handleWebhookRequest({subdomain: 'test'}, 'sig2');
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');
});

it('clears template cache', async () => {
    const blog = getBlog();
    const response = await blog.handleWebhookRequest({
        subdomain: 'test',
        event: 'cache.templates'
    }, 'sig');
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');

    const cached = await blog.cacheService.getFromCache('LAST_TEMPLATE_CACHE_CLEARED_AT');
    expect(cached).toBeGreaterThan(0);
});

it('clears single cache', async () => {
    const blog = getBlog();

    await blog.cacheService.set('/test', {type: 'file'} as ResponseObject);

    const response = await blog.handleWebhookRequest({
        subdomain: 'test',
        event: 'cache.single',
        path: '/test'
    }, 'sig');
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');

    const cached = await blog.cacheService.getFromCache('/test');
    expect(cached).toBeUndefined();

});

it('clears all cache', async () => {
    const blog = getBlog();
    const response = await blog.handleWebhookRequest({
        subdomain: 'test',
        event: 'cache.all'
    }, 'sig');
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');

    const cached = await blog.cacheService.getFromCache('LAST_ALL_CACHE_CLEARED_AT');
    expect(cached).toBeGreaterThan(0);
});


it('validates signature', async () => {
    const blog = getBlog({
        webhookSecret: 'secret'
    });
    const data = {
        subdomain: 'test',
        event: 'cache.templates'
    };
    const response = await blog.handleWebhookRequest(
        data, 
        'e3b22f1e804080526e64fa2e757b575914560009bd0e034a664cc655cf57021e'
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');
});