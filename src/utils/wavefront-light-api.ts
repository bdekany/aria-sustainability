import axios from 'axios'

// Mimic Official Javascript SDK https://github.com/wavefrontHQ/wavefront-sdk-javascript
/*
    let wavefrontClient = new WavefrontDirectClient({
        server: options.wavefrontHost,
        token: options.wavefrontToken
    });

    datacenters.data.map((dc) =>{
        wavefrontClient.sendMetric(
            'aria.sustaiability.region_ci',
            dc.staticCi,
            Date.now(),
            'aria.sustainability',
            {
                "provider": dc.provider,
                "display_name": dc.displayName,
                "name": dc.name,
                "country": dc.country
            }
        );
    })
    */

export type WavefrontConfig = {
    server: string,
    token: string
}

export default class WavefrontLightClient {
    wavefrontUrl: string
    wavefrontToken: string

    constructor(config: WavefrontConfig) {
        // Fix support Proxy
        // if ( server startsWith proxy://)
        // else
        this.wavefrontUrl = `${config.server}/report`
        this.wavefrontToken = config.token
        // set the new accessToken as default for next axios call
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.wavefrontToken}`;

        axios.defaults.headers.common['Content-Type'] = 'text/plain';


    }

    /**
     * Check if a string is null or contains nothing.
     */
    isBlank(str: any) {
        return (
        (typeof str == 'string' && !str.trim()) ||
        typeof str == 'undefined' ||
        str === null
        );
    }

    /**
     * Sanitize a string, replace whitespace with "-".
     */
    sanitize(str: any) {
        if (str == null) return str;
        let sanitized = str.replace(/\s/g, '-');
        if (sanitized.indexOf('"') >= 0) {
          sanitized = sanitized.replace(/["]+/g, '\\"');
        }
        return `"${sanitized}"`;
      }
    
    metricToLineData(name: string, value: number, timestamp: (number|null), source: string, tags: any) {
        if (this.isBlank(name)) {
            throw 'Metrics name cannot be blank';
        }

        let strBuilder: string[] = [this.sanitize(name), value];

        if (timestamp) {
            strBuilder.push(timestamp.toString());
        }
    
        if (this.isBlank(source)) {
            source = String(process.env.HOSTNAME)
        }
        strBuilder.push('source=' + this.sanitize(source));

        if (tags) {
          for (const [key, value] of Object.entries(tags)) {
            if (this.isBlank(key)) {
              throw 'Metric point tag key cannot be blank';
            }
            if (this.isBlank(value)) {
              throw 'Metric point tag value cannot be blank';
            }
            strBuilder.push(this.sanitize(key) + '=' + this.sanitize(value));
          }
        }
        return strBuilder.join(' ');
      }



    sendMetric(name: string, value: number, timestamp: (number|null), source: string, tags: Object) {
    try {
        var data = this.metricToLineData(
            name,
            value,
            timestamp,
            source,
            tags
        )

        axios.post(this.wavefrontUrl, data)

    } catch (error: any) {
        if (error.message) {
            throw error.message
        }
        if (error.response.data.message) {
            throw error.response.data.message
        }
    }
    }

}