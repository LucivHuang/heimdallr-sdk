/**
 * 是否支持historyAPI
 */
export const supportsHistory = () => window && !!window.history.pushState && !!window.history.replaceState;
