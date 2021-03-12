const domains = [];

/**
 * Does this URL look like a phishing attempt?
 *
 * @param {string} questionableUrl
 * @returns {boolean}
 */
export const looksPhishy = (questionableUrl) => {
    for (const domain of domains) {
        if (questionableUrl.toLocaleLowerCase().indexOf(domain) > -1) {
            return true;
        }
    }

    return false;
};
