"use strict";

const http = require('http');
const url = require('url');
const https = require('https');

const PORT = 3000;

http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { firstName, lastName, category, year } = parsedUrl.query;

    getNobelLaureates({ firstName, lastName, category, year })
        .then((data) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        })
        .catch((error) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        });
})
.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

function getNobelLaureates(filters) {
    const apiUrl = 'https://api.nobelprize.org/v1/prize.json';
    return new Promise((resolve, reject) => {
        https.get(apiUrl, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                const prizes = JSON.parse(data).prizes || [];
                const laureates = [];

                prizes.forEach((prize) => {
                    const year = prize.year;
                    const category = prize.category;

                    if (prize.laureates) {
                        prize.laureates.forEach((laureate) => {
                            const firstname = laureate.firstname;
                            const surname = laureate.surname;

                            if (
                                (!filters.firstName || firstname.toLowerCase().includes(filters.firstName.toLowerCase().replace(/\*/g, ''))) &&
                                (!filters.lastName || surname.toLowerCase().includes(filters.lastName.toLowerCase().replace(/\*/g, ''))) &&
                                (!filters.category || category.toLowerCase() === filters.category.toLowerCase()) &&
                                (!filters.year || year === filters.year)
                            ) {
                                laureates.push({
                                    firstname,
                                    surname,
                                    category,
                                    year
                                });
                            }
                        });
                    }
                });

                resolve(laureates);
            });

        }).on('error', (error) => {
            reject(error);
        });
    });
}
