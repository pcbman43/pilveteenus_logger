const express = require('express');
require('dotenv').config()
import('node-fetch')
const fs = require('fs');
const path = require('path');

const app = express();

const target = process.env.TARGET;
console.log(`Target: ${target}`);
const filePath = path.join(__dirname, 'data/messages.json');

setInterval(() => {
    fetch(target)
        .then(response => response.json().then(data => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            const time = `${hours}:${minutes}:${seconds}`;
            console.log(`[${time}] Response status: ${response.status}, length: ${data.length}`);
            fs.readFile(filePath, (err, fileData) => {
                if (err) {
                    console.error(`Error reading file: ${err}`);
                } else {
                    const messages = JSON.parse(fileData);
                    if (messages.length !== data.length) {
                        fs.writeFile(filePath, JSON.stringify(data, null, 4), (err) => {
                            if (err) {
                                console.error(`Error writing to file: ${err}`);
                            } else {
                                console.log(`[${time}] Data written to file`);
                            }
                        });
                        const { exec } = require('child_process');

                        exec('npm run commit', (error, stdout, stderr) => {
                            if (error) {
                                console.error(`Error executing command: ${error}`);
                                return;
                            }
                            console.log(`stdout: ${stdout}`);
                            console.error(`stderr: ${stderr}`);
                        });
                    } else {
                        console.log(`[${time}] Data not written to file`);
                    }
                }
            });
        }))
        .catch(error => console.error(`Error fetching ${target}: ${error}`));
}, 60000);

app.listen(process.env.PORT, () => {
  console.log(`Logger started on port ${process.env.PORT}`);
});
