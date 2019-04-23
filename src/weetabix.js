/**
 * Use a weetabix format index
 */

import CSV from 'comma-separated-values';

class Reader {
    constructor(source_url, { index = null } = {}) {
        this._source = source_url;
        this._index_src = index || `${source_url}.wtb`;

        // Information to read from the index (once ready)
        this._delimiter = null;
        this._index = null;
        this._ready = false;

    }

    /**
     * Load the index file from the specified source. Returns a promise that will resolve when the reader is ready to
     *  use.
     * @returns {Promise<Reader | never>}
     */
    prepare() {
        // Load data from the index, and return a promise
        let loader;
        if (typeof this._index_src === 'string') {
            loader = fetch(this._index_src).then(resp => {
                if (resp.ok) {
                    return resp.json();
                } else {
                    throw new Error(`Index could not be read from ${this._index_src}`);
                }
            });
        } else {
            // Allows specifying the index inline with the page, rather than as a separate download
            loader = Promise.resolve(this._index_src);
        }

        return loader.then(contents => {
            this._delimiter = contents.delimiter;
            this._index = contents.index;
            this._ready = true;
            return this;
        });
    }

    /**
     * Fetch the section of the file containing the data of interest
     * @param value The category of name to retrieve from the index
     * @param strict Whether to throw an error if the desired value is not in the file
     * @returns {Promise<Array[]>}
     */
    fetch(value, strict=false) {
        const entry = this._index[value];
        if (!entry && !strict) {
            return Promise.resolve([]);
        } else if (!entry) {
            throw new Error('The index has no information about the requested item');
        }
        const [start, end] = entry;

        return fetch(this._source, {headers: {
            range: `bytes=${start}-${end - 1}` // TODO: index end position off by one; check
        }}).then(resp => {
            if (!resp.ok || resp.status !== 206) {
                // TODO: The "correct" status code for a partial request is 206, but some implementations might return
                //  a range with an incorrect status code. We can relax this check if too many
                //  real world implementations turn out to be half-baked.
                throw new Error('Could not successfully request partial data');
            }
            return resp.text();
        }).then(data => CSV.parse(data, {cellDelimiter: this._delimiter, cast: false}));
    }

    getEntries() {
        if (!this._ready) {
            throw new Error('Index data has not yet been loaded.');
        }
        return Object.keys(this._index);
    }
}

// Initially exports only one single symbol
export default Reader;
export { Reader };
