#!/usr/bin/env node

import { parse } from 'csv-parse'
import fs from 'fs'
import https from 'https'
import chalk from 'chalk'
import { Option, program } from 'commander'
import { convertTimeToMilliseconds } from './utils/utils'

import WavefrontDirectClient from './utils/wavefront-light-api'
import type { AwsCpu, AzureCpu, AwsInstance, AzureInstance, AwsEmbodied } from './cloud-carbon-footprint'

type Cpu = {
  'Manufacturer': string,
  'CPU Name': string,
  'tdp': number
}

const getRemoteFile = async (file: string, url: string) => {
  return new Promise((resolve) => {
    let localFile = fs.createWriteStream(__dirname + '/inputs/' + file);
    https.get(url, function(response) {

      response.pipe(localFile);
      localFile.on("finish", function() {
        localFile.close()
        resolve("Download complete")
      });

        
    });
  });
}

const downloadFiles = async () => {
    var targets = [
      {
          file: "aws-instances.csv",
          url: "https://raw.githubusercontent.com/cloud-carbon-footprint/cloud-carbon-coefficients/main/data/aws-instances.csv"
      },
      {
          file: "aws-instances-cpus.csv",
          url: "https://raw.githubusercontent.com/cloud-carbon-footprint/cloud-carbon-coefficients/main/data/aws-instances-cpus.csv"
      },
      {
        file: "coefficients-aws-embodied.csv",
        url: "https://raw.githubusercontent.com/cloud-carbon-footprint/cloud-carbon-coefficients/main/output/coefficients-aws-embodied.csv"
      },
      {
        file: "azure-instances.csv",
        url: "https://raw.githubusercontent.com/cloud-carbon-footprint/cloud-carbon-coefficients/main/data/azure-instances.csv"
      },
      {
        file: "azure-instances-cpus.csv",
        url: "https://raw.githubusercontent.com/cloud-carbon-footprint/cloud-carbon-coefficients/main/data/azure-instances-cpus.csv"
      }
    ];

    const p: any[] = new Array()
    for (const item of targets) {
      p.push(getRemoteFile(item.file, item.url))
    }
    
    await Promise.all(p)
}

const sendAwsEmbodied = async (wavefrontClient:WavefrontDirectClient) => {
  let timestamp = Math.floor(new Date().getTime() / 1000)

  fs.createReadStream(__dirname + '/inputs/coefficients-aws-embodied.csv')
  .pipe(parse({cast: true, columns: true}))
  .on('data', (row: AwsEmbodied) => {
    wavefrontClient.sendMetric(
      'aria.sustainability.embodied',
      Number(row['total']),
      timestamp,
      'aria.sustainability',
      {
          "InstanceType": row['type']
      }
    )
  })
  .on('end', () => {
    console.log(chalk.green(`${Date()} AWS Embodied sent`))
  })
}

const sendAwsWatt = async (wavefrontClient: WavefrontDirectClient) => {

  //CPU TDP from WikiChip
  let cpuTdp: Cpu[] = new Array()
  const fd = fs.createReadStream(__dirname + "/inputs/tdp_cpus.csv")
          .pipe(parse({cast: true, columns: true}))
          .on('data', (row) => {
            cpuTdp.push(row)
          })

  await new Promise((resolve) => {
    fd.on('end', () => {
      resolve('Cpu Tdp Loaded')
    })
  })

  // AWS calculation
  let awsCpus: AwsCpu[] = new Array()
  let timestamp = Math.floor(new Date().getTime() / 1000)

  fs.createReadStream(__dirname + "/inputs/aws-instances-cpus.csv")
  .pipe(parse({ cast: true, columns: true }))
  .on("data", function (row) {
    //Create array whith all AwsCpu
    awsCpus.push(row)
  })
  .on("end", function() {
    // console.log(result)

    fs.createReadStream(__dirname + "/inputs/aws-instances.csv")
    .pipe(parse({ cast: true, columns: true }))
    .on("data", function (row: AwsInstance) {
      let coreRatio = Number(row['Instance vCPU']) / Number(row['Platform Total Number of vCPU'])
      let cpuInfo: AwsCpu[] = awsCpus.filter((cpu: AwsCpu) => cpu['CPU Name'] == row['Platform CPU Name'])
      let tdp: Cpu[] = cpuTdp.filter((cpu :Cpu) => cpu['CPU Name'] == row['Platform CPU Name'])

      let total = coreRatio * cpuInfo[0]['Platform Number of CPU Socket(s)'] * tdp[0]['tdp']
      //console.log(total.toFixed(2))

      wavefrontClient.sendMetric(
        'aria.sustainability.pkgwatt',
        Number(total.toFixed(3)),
        timestamp,
        'aria.sustainability',
        {
            "InstanceType": row['Instance type']
        }
    )

    })
    .on("end", function() {
      console.log(chalk.green(`${Date()} AWS Watt sent`))
    })

})

}

(async () => {

  program
  .version('0.0.1', '-v, --version', 'output the current version')
  .option('-u, --update', 'update file from git repo')
  .option('-d, --daemon', 'loop 5 minutes')
  .addOption(new Option('-wf, --wavefront-host <string>', 'your wavefront cluster name ex: longboard.wavefront.com').env('WAVEFRONT_HOST'))
  .addOption(new Option('-wt, --wavefront-token <string>', 'wavefront Token').env('WAVEFRONT_TOKEN'))


program.parse(process.argv)
const options = program.opts()

  if ( options.update ){
    await downloadFiles()
    console.log(chalk.green(`${Date()} Cloud Carbon Footprint Data updated`))
  }

  if ( !options.wavefrontHost) {
      console.error(chalk.red("set env vars: WAVEFRONT_HOST"))
      process.exit(1);
  }
  let wavefrontClient = new WavefrontDirectClient({
      server: options.wavefrontHost,
      token: options.wavefrontToken
  });

  sendAwsWatt(wavefrontClient)
  sendAwsEmbodied(wavefrontClient)

  if (options.daemon) {
    const interval = convertTimeToMilliseconds('5m')
        setInterval(() => {
            sendAwsWatt(wavefrontClient)
            sendAwsEmbodied(wavefrontClient)
        }, interval)  
    }
  

})();

