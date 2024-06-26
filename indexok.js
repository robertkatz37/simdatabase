const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/search', async (req, res) => {
    const searchdata = req.body.searchdata;

    // Check if searchdata is valid
    if (searchdata === undefined || searchdata === null || typeof searchdata !== 'string') {
        return res.status(400).send('Invalid search data');
    }

    try {
        const browser = await puppeteer.launch(); //{ headless: false }
        const page = await browser.newPage();

        // Navigate to the external website
        await page.goto('https://simownerdata.pk');

        // Fill in the data
        await page.type('#searchdata', searchdata);

        // Submit the form
      //  await Promise.all([
        //    page.waitForNavigation({ waitUntil: 'networkidle0' }), // Wait for network to be idle
            page.click('.search-submit')
       // ]);

        // Wait for the .result-card elements to be present on the page
        await page.waitForSelector('.output-container');
//console.log("load");
        // Extract the HTML content
        const response = await page.content();

        // Use Cheerio to load the HTML content
        const $ = cheerio.load(response);
       // console.log($.html());

        // Find all result cards
        const results = [];
        $('.output-container .result-card').each((index, element) => {
            const fullName = $(element).find('.field:nth-child(1) > div').text().trim();
            const phone = $(element).find('.field:nth-child(2) > div').text().trim();
            const cnic = $(element).find('.field:nth-child(3) > div').text().trim();
            const address = $(element).find('.field:nth-child(4) > div').text().trim();

            // Push extracted data into the results array
            results.push({ fullName, phone, cnic, address });
        });

        // Log each result to the console
        results.forEach(result => {
            console.log('Full Name:', result.fullName);
            console.log('Phone:', result.phone);
            console.log('CNIC:', result.cnic);
            console.log('Address:', result.address);
            console.log('----------------------');
        });

        // Send the array of results back to the client
        res.json(results);

        // Close the browser
        await browser.close();
    } catch (error) {
        console.error('Error occurred while processing the request:', error);
        res.status(500).send('Internal server error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// const express = require('express');
// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');
// const path = require('path');

// const app = express();
// const port = 3000;

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(express.static('public'));

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.post('/search', async (req, res) => {
//     const searchdata = req.body.searchdata;

//     // Check if searchdata is valid
//     if (!searchdata || typeof searchdata !== 'string') {
//         return res.status(400).send('Invalid search data');
//     }

//     try {
//         const browser = await puppeteer.launch(); // Launch Puppeteer browser instance
//         const page = await browser.newPage();

//         // Navigate to the external website
//         await page.goto('https://simownerdata.pk');

//         // Fill in the data
//         await page.type('#searchdata', searchdata);

//         // Submit the form
//         await page.click('.search-submit');

//         // Wait for the response
//         await page.waitForSelector('.output-container'); // Wait for results to load

//         // Extract HTML content
//         const response = await page.content();

//         // Use Cheerio to parse HTML
//         const $ = cheerio.load(response);

//         // Extract desired data (example: fullName, phone, cnic, address)
//         const results = [];
//         $('.output-container .result-card').each((index, element) => {
//             const fullName = $(element).find('.field:nth-child(1) > div').text().trim();
//             const phone = $(element).find('.field:nth-child(2) > div').text().trim();
//             const cnic = $(element).find('.field:nth-child(3) > div').text().trim();
//             const address = $(element).find('.field:nth-child(4) > div').text().trim();

//             results.push({ fullName, phone, cnic, address });
//         });

//         // Close the Puppeteer browser
//         await browser.close();

//         // Send results back to client
//         res.json(results);
//     } catch (error) {
//         console.error('Error occurred while processing the request:', error);
//         res.status(500).send('Internal server error');
//     }
// });

// app.listen(port, () => {
//     console.log(`Node.js server is running on http://localhost:${port}`);
// });
