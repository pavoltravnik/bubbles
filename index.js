const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const argv = require('yargs').argv;

(async () => {
  const browser = await puppeteer.launch({
    headless: (!argv.l && !argv.login),
    userDataDir: "loginData"
  });
  const page = await browser.newPage();

  try {

      console.log('Opening a browser...')
        await page.setViewport({width: 1280, height:720});
        await page.goto('https://www.facebook.com/', {waitUntil: 'networkidle2'});

        if (argv.l || argv.login) {
          // wait for homepage to load after a manual login
          console.log('Attempting login in browser')
          await page.waitFor('div[aria-label="Create a post"]', {"timeout": 180000});
        }

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
            console.log(`Exporting ids to blocked/export/myexport.json was successfull.`);
            await fs.writeFile(`./blocked/export/myexport.json`, JSON.stringify(values),  'utf8');

        }

         if (argv.i || argv.import) {
            console.log('Uploading blocked ids...');
            const listDir = await fs.readdir('./blocked/import/');
            const files = await listDir.filter(fileName => /.*\.json$/.test(fileName));

            let blocked = [];
            try {
                const importBlocked = await fs.readFile(`./blocked/export/myexport.json`, 'utf8');
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

                            await page.waitFor(5000)

                            await page.waitForXPath('//span[contains(text(), "Block")]');
                            [linkHandlers] = await page.$x("//span[contains(text(), 'Block')]");
                            await linkHandlers.click();

                            await page.waitFor(5000)

                            await page.waitForXPath('//button[contains(text(), "Confirm")]');
                            [linkHandlers] = await page.$x('//button[contains(text(), "Confirm")]');
                            await linkHandlers.click();

                            await page.waitFor(5000)

                            await page.waitForXPath('//a[contains(text(), "Okay")]');
                            [linkHandlers] = await page.$x('//a[contains(text(), "Okay")]');
                            await linkHandlers.click();

                            await page.waitFor(5000)

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
      console.error(err);
      await page.close();
      await browser.close();

  }
  })();
