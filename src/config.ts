var cspUrl: string = 'https://console-stg.cloud.vmware.com/csp/gateway/am/api/auth/api-tokens/authorize'
var cieloUrl: string = 'https://dev.skyscraper.vmware.com/api/cielo/'

if (process.env.NODE_ENV === 'staging') {
   cspUrl = 'https://console-stg.cloud.vmware.com/csp/gateway/am/api/auth/api-tokens/authorize'
   cieloUrl = 'https://dev.skyscraper.vmware.com/api/cielo/'
} 

export {cspUrl, cieloUrl}