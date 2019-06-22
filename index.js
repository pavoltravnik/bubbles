const prompts = require('prompts');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const argv = require('yargs').argv;

(async () => {
    try {
        console.log('Please, turn of 2FA before signing in, this feature is not implemented yet. Happy blocking!')
        const credentials = await prompts([
            {
                type: 'text',
                name: 'username',
                message: 'Username: ',
            },
            {
                type: 'password',
                name: 'password',
                message: 'Password: ',
            },
        ]);

        console.log('Opening a browser...')
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        await  page.setViewport({width: 1280, height:720});
        await page.goto('https://www.facebook.com/', {waitUntil: 'networkidle2'});
        await page.type('#email', credentials.username);
        await page.type('#pass', credentials.password);
        await page.click('input[type="submit"]');

        if (argv.e || argv.export){
            console.log('Downloading blocked ids...');
            await page.goto('https://www.facebook.com/settings?tab=blocking', {waitUntil: 'networkidle2'});

            const elements = await page.$x('//input[@name="uid"]');
            let values = [];
            for (let element of elements){
                const propertyHandle = await element.getProperty('value');
                const propertyValue = await propertyHandle.jsonValue();
                values.push(propertyValue)
            }
            console.log('Number of blocked persons: ', values.length);
            console.log(`Exporting ids to blocked/export/${credentials.username}.json was successfull.`);
            await fs.writeFile(`./blocked/export/${credentials.username}.json`, JSON.stringify(values),  'utf8');

        }

         if (argv.i || argv.import) {
            console.log('Uploading blocked ids...');
            const listDir = await fs.readdir('./blocked/import/');
            const files = await listDir.filter(fileName => /.*\.json$/.test(fileName));

            let blocked = [];
            try {
                const importBlocked = await fs.readFile(`./blocked/export/${credentials.username}.json`, 'utf8');
                blocked = await JSON.parse(importBlocked);
            } catch {
                blocked = [];
            }

            for (let file of files){
                const importing = await fs.readFile(`./blocked/import/${file}`, 'utf8');
                const ids = await JSON.parse(importing);

                for (let id of ids){
                    if (blocked.includes(id)) {
                        console.log(`! User ${id} is already blocked.`);
                    } else {
                        try {
                            await page.goto(`https://www.facebook.com/${id}`, {waitUntil: 'networkidle2'});
                            await page.waitForXPath('//button[@aria-label="Other actions"]/i');
                            let [linkHandlers] = await page.$x('//button[@aria-label="Other actions"]/i');
                            await linkHandlers.click();

                            await page.waitForXPath('//span[contains(text(), "Block")]');
                            [linkHandlers] = await page.$x("//span[contains(text(), 'Block')]");
                            await linkHandlers.click();

                            await page.waitForXPath('//button[contains(text(), "Confirm")]');
                            [linkHandlers] = await page.$x('//button[contains(text(), "Confirm")]');
                            await linkHandlers.click();

                            await page.waitForXPath('//a[contains(text(), "Okay")]');
                            [linkHandlers] = await page.$x('//a[contains(text(), "Okay")]');
                            await linkHandlers.click();

                            console.log(`+ User ${id} was blocked.`);
                        } catch {
                            console.log(`! User ${id} is probably already blocked.`);
                        }
                    }
                }
            }

        }
        await browser.close();
        console.log('Finished successfully.')

    } catch (err) {
        await browser.close();
        console.error(err);

  }
  })();