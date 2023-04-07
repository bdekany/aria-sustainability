#!/usr/bin/env node

import chalk from 'chalk'
import { Option, program } from 'commander'
import { CieloApi } from './utils/cielo-api'

import datacenters from './assets/datacenters.json'


(async() => {

    program
        .version('0.0.1', '-v, --version', 'output the current version')
        .option('-a, --all', 'get all regions')
        .option('-c, --create', 'create regions from ./assets/datacenters.json')
        .option('-ci, --carbon-intensity', 'get regions CI from ./assets/datacenters.json')
        .addOption(new Option('-t, --refresh-token <string>', 'CSP Refresh Token').env('REFRESH_TOKEN'))
        .addOption(new Option('-o, --org-id <string>', 'CSP Organization ID').env('ORG_ID'))


    program.parse(process.argv)
    const options = program.opts()

    if ( !options.refreshToken || !options.orgId) {
        console.error(chalk.red("set env vars: REFRESH_TOKEN and ORG_ID"))
        process.exit(1);
    }

    const cielo = new CieloApi(options.refreshToken, options.orgId, "staging");


    if (options.all) {
        const message = await cielo.getAllRegions()
        console.log(message)
    }

    if (options.create) {
        // FIX Promise.all return
        const responses = await Promise.all(
            datacenters.data.map((dc) => {
                cielo.createOrUpdateRegion(dc.name + "stage", dc.country, dc.latitude, dc.longitude)
            })
        )
        console.log(responses)

        // Test One Create
        //const region = await cielo.createOrUpdateRegion("Virginia-test", "US", "38.13", "-78.45")
        //console.log(region)
     
    }

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
      
    }
})();