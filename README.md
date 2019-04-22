# Weetabix-client

Incrementally access plaintext columnar datafiles over the web.

This is a simple client that enables using [Weetabix](https://github.com/abought/weetabix) byte-range indices from 
the browser.


## Installation

This package may be installed using npm or yarn as follows:
`$ npm install weetabix-client --save`

Or loaded as a UMD module from a CDN (it will register `WeetabixReader` as a single global variable):
`<script src="https://cdn.jsdelivr.net/npm/weetabix-client">`

## Usage
```javascript
// If you are loading the file from a CDN, you can skip this line
import WeetabixReader from 'weetabix';

// Create a reader by specifying the file to read
const reader = new WeetabixReader('https://website.example/big-file.csv');
// Prepare the reader for use by loading the companion index file (eg `big-file.csv.wtb`)
// Once the reader is ready, it can be queried for available entries, and fetch parsed data for the retrieved rows 
//  of interest
reader.prepare()
  .then(() => reader.getEntries())
  .then(keys => reader.fetch(keys[0]));
```


## Development
`$ npm install --dev`
`$ npm run test`

If you are testing via a web browser, note that many local development servers do not support range headers!

This was developed using [npm http-server](https://www.npmjs.com/package/http-server). See 
[MDN guides](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests#Checking_if_a_server_supports_partial_requests) 
for instructions on how to check whether your server supports range requests.
