/** Upload and proxying blacklists. In the future this will live on-chain. */

interface Blacklist<T> {
    includes: (item: T) => boolean
}

/* tslint:disable:max-line-length */
export const imageBlacklist: Blacklist<string> = ['']

export const accountBlacklist: Blacklist<string> = ['']
