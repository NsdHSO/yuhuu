import {NullStorageAdapter} from '../../biometric/storage-adapters';

describe('NullStorageAdapter', () => {
    let adapter: NullStorageAdapter;

    beforeEach(() => {
        adapter = new NullStorageAdapter();
    });

    it('setItem does nothing', async () => {
        await expect(adapter.setItem('key', 'value')).resolves.toBeUndefined();
    });

    it('getItem returns null', async () => {
        const result = await adapter.getItem('key');
        expect(result).toBeNull();
    });

    it('deleteItem does nothing', async () => {
        await expect(adapter.deleteItem('key')).resolves.toBeUndefined();
    });
});
