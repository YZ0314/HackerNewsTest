#  🐺 QA Wolf Take Home Assignment

This project is a Playwright-based automation script that scrapes article timestamps from the [Hacker News "newest" page](https://news.ycombinator.com/newest), verifies their sort order (from newest to oldest), and saves the data into a JSON file.



## Features

- Scrapes timestamps from the Hacker News "newest" page
- Collects a specified number of articles (default: 100)
- Verifies the sort order (newest → oldest)
- Handles timeout and input validation
- Saves results to `timestamps.json`



## Technologies

- [Node.js](https://nodejs.org/)
- [Playwright](https://playwright.dev/)  
- JavaScript (ES6+)

## Usage

1. Install dependencies:
    ```sh
    npm install
    npm install playwright
    ```

2. Run the script with the default (100 articles):

    ```sh
    node index.js 
    ```
    Or Run the script with a custom count (e.g. 150):

    ```sh
    node index.js 150
    ```


3. Output:
    - Timestamps saved to timestamps.json

    - Console logs whether they are sorted correctly




---


