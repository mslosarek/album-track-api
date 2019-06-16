# album-track-api

## Introduction

This is a [serverless](https://serverless.com/) application comprised of an API, several Lambda function and a DynamoDB table.

## Running Locally

First install dependencies (`npm install`) then you can run locally with `npm run local`. This will create an API running on PORT 4000 and populate a local DynamoDB database with the contents of `dynamodb-seeds/artists.json`.

## Deploying

This is deplyed using the `serverless` command line tool. `serverless deploy --stage <stagename>`

## Dependencies

Any dependencies that are needed for this project are deployed as a common layer shared between all of the lambda functions. To add dependencies, add them to `common-libs-layer/nodejs`.

## MusicBrainz Integration

Artist and Album lookup uses the [MusicBrainz](https://wiki.musicbrainz.org/Development/XML_Web_Service/Version_2). Additional functionality could be added in the future.
