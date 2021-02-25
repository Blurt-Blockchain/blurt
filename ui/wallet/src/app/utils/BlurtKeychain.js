import { isLoggedIn, extractLoginData } from 'app/utils/UserUtil';

/**
 *
 * @returns {boolean}
 */
export function hasCompatibleKeychain() {
    return (
        window.blurt_keychain &&
        window.blurt_keychain.requestSignBuffer &&
        window.blurt_keychain.requestBroadcast &&
        window.blurt_keychain.requestSignedCall
    );
}

/**
 *
 * @returns {boolean}
 */
export function isLoggedInWithKeychain() {
    if (!isLoggedIn()) {
        return false;
    }
    if (!hasCompatibleKeychain()) {
        // possible to log in w/ keychain, then disable plugin
        return false;
    }
    const data = localStorage.getItem('autopost2');
    const [
        username,
        password,
        memoWif,
        login_owner_pubkey,
        login_with_keychain,
    ] = extractLoginData(data);
    return !!login_with_keychain;
}
