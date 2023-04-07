import axios, { AxiosResponse } from 'axios'


export class CieloApi {
    refreshToken: string
    orgId: string
    cspUrl: string = 'https://console.cloud.vmware.com/csp/gateway/am/api/auth/api-tokens/authorize'
    cieloUrl: string = 'https://skyscraper.vmware.com/api/cielo'


    constructor(refreshToken: string, orgId: string, env: string = "production") {
        this.refreshToken = refreshToken
        this.orgId = orgId

        if (env === 'staging') {
            this.cspUrl = 'https://console-stg.cloud.vmware.com/csp/gateway/am/api/auth/api-tokens/authorize'
            this.cieloUrl = 'https://dev.skyscraper.vmware.com/api/cielo'
        }

        // Refresh accessToken for Bearer Authorization
        // https://levelup.gitconnected.com/the-ultimate-guide-for-implementing-refresh-token-with-axios-bad47d0bfa05
        axios.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) => {
                if (error.response) {
                    const originalConfig = error.config

                    if (error.response.status === 401) {
                        originalConfig._retry = true;
                        return this.getAccessToken().then((accessToken) => {
                            originalConfig.headers.Authorization = `Bearer ${accessToken}`;
                            return axios(originalConfig)
                        });
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    // get accessToken from CSP for Bearer Authorization Cielo API
    async getAccessToken() {
        let config = {
            method: 'post',
            url: this.cspUrl,
            params: {
                'refresh_token': this.refreshToken
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        try {
            const response = await axios(config)
            const accessToken: string = response.data.access_token
            // set the new accessToken as default for next axios call
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            return accessToken
            
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async getAllRegions() {
        const response = await axios.get(`${this.cieloUrl}/${this.orgId}/regions`)
        return response.data
    }

    async getRegion(name: string) {
        try {
            const response = await axios.get(`${this.cieloUrl}/${this.orgId}/regions/${name}`)
            return response.data
        } catch (error) {
            return error
        }
    }

    async deleteRegion(name: string) {
        const response = await axios.delete(`${this.cieloUrl}/${this.orgId}/regions/${name}`)
        return response.status
    }

    async getCarbonIntensity(name: string) {
        const response = await axios.get(`${this.cieloUrl}/${this.orgId}/carbon-intensity-summary/${name}`)
        console.log(`${name}: ${response.data.moerMonthlyAvg}$`)
        return response.data
    }

    async createOrUpdateRegion(name: string, country: string, latitude: (string | number), longitude: (string | number)) {
        let data = {
            name: name,
            country: country,
            latitude: latitude,
            longitude: longitude
        }

        const regions = await this.getAllRegions()
        for (const region of regions) {
            if ( region.name === name ){
                //const response = await axios.put(`${this.cieloUrl}/${this.orgId}/regions/${name}`, data)
                //return response.data
                // ISSUE IN CIELO
                console.log("region exists")
                return region
            }
        }

        const response = await axios.post(`${this.cieloUrl}/${this.orgId}/regions`, data)
        return response.data    
    }
}
