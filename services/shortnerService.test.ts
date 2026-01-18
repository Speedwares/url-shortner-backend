import { ShortenerService } from "./shortenerService";


test('Properly checks if a url is valid', async () => {
    const shortnerServicObj = new ShortenerService('facebook.com')
    const result = await shortnerServicObj.doesUrlExist()
    expect(result).toEqual([])
})
