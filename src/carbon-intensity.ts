#!/usr/bin/env node

import chalk from 'chalk'
import { Option, program } from 'commander'
import { CieloApi } from './utils/cielo-api'
//import WavefrontDirectClient from 'wavefront-sdk-javascript'
import WavefrontDirectClient from './utils/wavefront-light-api'
import { convertTimeToMilliseconds } from './utils/utils'


import datacenters from './assets/datacenters.json'

const sendCabonIntensity = (wavefrontClient: WavefrontDirectClient) => {
    datacenters.data.map(async (dc) =>{
        try {
            await wavefrontClient.sendMetric(
                'aria.sustainability.region_ci',
                Number(dc.staticCi),
                null,
                'aria.sustainability',
                {
                    "provider": dc.provider,
                    "display_name": dc.displayName,
                    "name": dc.name,
                    "country": dc.country
                }
            )
        } catch (error: any) {
            console.log(chalk.red(`ERROR: ${Date()} ${dc.displayName}: ${error.message}`))
        }
    })

    console.log(chalk.green(`${Date()} Carbon Intensity Sent`))
}


(async() => {

    program
        .version('0.0.1', '-v, --version', 'output the current version')
        .option('-ci, --carbon-intensity', 'get regions CI from ./assets/datacenters.json')
        .option('-l, --live', 'get live value from Cielo API')
        .option('-d, --daemon', 'loop 5 minutes')
        .addOption(new Option('-t, --refresh-token <string>', 'CSP Refresh Token').env('REFRESH_TOKEN'))
        .addOption(new Option('-o, --org-id <string>', 'CSP Organization ID').env('ORG_ID'))
        .addOption(new Option('-wf, --wavefront-host <string>', 'your wavefront cluster name ex: longboard.wavefront.com').env('WAVEFRONT_HOST'))
        .addOption(new Option('-wt, --wavefront-token <string>', 'wavefront Token').env('WAVEFRONT_TOKEN'))


    program.parse(process.argv)
    const options = program.opts()
    let cielo: CieloApi

    if (options.live) {
        if ( !options.refreshToken || !options.orgId) {
            console.error(chalk.red("set env vars: REFRESH_TOKEN and ORG_ID"))
            process.exit(1);
        }
        cielo = new CieloApi(options.refreshToken, options.orgId, "staging");
    }
    
    if ( !options.wavefrontHost) {
        console.error(chalk.red("set env vars: WAVEFRONT_HOST"))
        process.exit(1);
    }
    let wavefrontClient = new WavefrontDirectClient({
        server: options.wavefrontHost,
        token: options.wavefrontToken
    });

    if (options.carbonIntensity) {
        // FIX Promise.all return
        /* const responses = await Promise.all(
            datacenters.map((dc) => {
                cielo.getCarbonIntensity(dc.name + "stage")
            })
        )
        console.log(responses) */

        // Test One 
        /* try {
        const region = await cielo.getCarbonIntensity("eu-west-2")
        console.log(region)
        } catch (error: any) {
            console.log(error.response.data.message)
        } */
        
        sendCabonIntensity(wavefrontClient)

        if (options.daemon) {
        const interval = convertTimeToMilliseconds('5m')
            setInterval(() => {
                sendCabonIntensity(wavefrontClient)
            }, interval)  
        }
    }

})();