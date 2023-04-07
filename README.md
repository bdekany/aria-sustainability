# Aria Sustainability Toolkit

Software Carbon Intensity is model that describes how to calculate a carbon intensity score for software applications with Business Metrics in mind.

Business line are still clueless of Carbon Intensity of a specific app or their footprint on Public Cloud.

## Changelog

 - Support AWS Region and Instance Type

## Docker

```shell
docker run -it --rm -v $PWD:/mnt --entrypoint /bin/bash node
cd /mnt
npm install
npm run build

# Set Wavefront server and Token
export WAVEFRONT_HOST=cluster.wavefront.com
export WAVEFRONT_TOKEN=aaa-bbb-cc-ddd-ee

# PkgWatt
node build/index.js

# Carbon intensity per Region
node build/carbon-intensity.js -ci
