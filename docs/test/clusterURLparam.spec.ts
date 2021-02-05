
// const url = 'http://localhost:9000/en/?link=http://thoughtspot.com';

jest.setTimeout(30000)

describe('Google', () => {
    beforeAll(async () => {
        await page.goto(`${URL}?link=https://wwww.thoughtspot.com`);
    });

    it('should navigate to new page', async () => {
        await expect(page).toClick('a', { text: 'click me' });
        await page.waitForNavigation();

        const pageUrl = page.url();

        expect(pageUrl).toMatch('https://www.thoughtspot.com/');
    });
});