// Load modules
const fs = require("fs");
const Crawler = require("crawler");
const csv = require("csv-file-creator");

const baseURL = "http://shirts4mike.com/";
// Initialize array of links
let links = [];
// Initialize array to hold shirt data (price, title, etc.) with first row as column headers
let shirts = [["Title", "Price", "ImageURL", "URL", "Time"]];


/**
Function to append error to scraper error log 
*/
const appendError = (error) => {
    
    let date = new Date();
    // Create message
    let message = "[" + date.toISOString() + "] " + error;
    // Add the error to the log file
    fs.appendFileSync("scraper-error.log", message);
    
};


/**
Function to scrape each link in array
*/
const scrape = () => {
    
    const c = new Crawler({
        maxConnections: 10,
        retries: 0,
        callback: (error, res, done) => {
            if (error) {
                console.log("An error has occurred! Can't connect to http://shirts4mike.com.");
                appendError(error);
            } else {
                let $ = res.$;
                // Get data
                let price = $(".price").text();
                let title = $("title").text();
                let image = $(".shirt-picture img")['0'].attribs.src;
                let url = res.options.uri;
                let time = Math.floor(Date.now() / 1000);
                // Insert into shirts
                shirts.push([price, title, url, image, time]);
                if (shirts.length == 8) {
                    // We've got 8 shirts, let's begin creating the CSV file
                    // Get date
                    let date = new Date();
                    let name = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + ".csv";
                    // Create file
                    csv("./data/" + name, shirts);
                }
            }
        }
    });
    
    c.queue(links.map(element => baseURL + element));
    
    
};

/**
Function to get shirts on entry point
*/
const getLinks = () => {
  
    // Create new crawler
    const c = new Crawler({
        maxConnections: 10,
        retries: 0,
        callback: (error, res, done) => {
            if (error) {
                console.log("An error has occurred! Can't connect to http://shirts4mile.com.");
                appendError(error);
            } else {
                let $ = res.$;
                // Get the product links
                let elements = $(".products a");
                // Loop through each returned element
                for (let elem in elements) {
                    // Don't want element if it's from prototype
                    if (!elements.hasOwnProperty(elem)) continue;
                    // Get the element's properties
                    let element = elements[elem];
                    // Only want the HTML elements with href attribute
                    if (element.attribs) {
                        // Insert the URL
                        links.push(element.attribs.href);
                    }
                }
                // Once we have all the links, scrape each one by calling the scrape function
                scrape();
            }
        }
    });
    
    // Crawl the entry point URL for links
    c.queue("http://shirts4mike.com/shirts.php");
    
};

// Check for folder called 'data'
if (!fs.existsSync("./data")) {
    // If doesn't exist, create one
    fs.mkdirSync("./data");
}
// Begin scraping
getLinks();