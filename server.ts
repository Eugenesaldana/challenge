import * as http from 'http';
import * as url from 'url';
import * as https from 'https';

const PORT = 3000;

http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url as string, true);
    const { firstName, lastName, category, year } = parsedUrl.query;

    getNobelLaureates({
        firstName: Array.isArray(firstName) ? firstName[0] : firstName,
        lastName: Array.isArray(lastName) ? lastName[0] : lastName,
        category: Array.isArray(category) ? category[0] : category,
        year: Array.isArray(year) ? year[0] : year,
    })
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

interface NobelLaureate {
    firstname: string;
    surname: string;
    category: string;
    year: string;
}

async function getNobelLaureates(filters: { firstName?: string, lastName?: string, category?: string, year?: string }): Promise<NobelLaureate[]> {
    const apiUrl = 'https://api.nobelprize.org/v1/prize.json';
    const response = await fetch(apiUrl);
    const data = await response.json();

    const prizes = data.prizes || [];
    const laureates: NobelLaureate[] = [];

    prizes.forEach((prize: any) => {
        const year = prize.year;
        const category = prize.category;

        prize.laureates.forEach((laureate: any) => {
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
    });

    return laureates;
}

function fetch(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                resolve(JSON.parse(data));
            });

        }).on('error', (error) => {
            reject(error);
        });
    });
}
