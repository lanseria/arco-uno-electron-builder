/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0

ABOUT THIS NODE.JS EXAMPLE: This example works with the AWS SDK for JavaScript version 3 (v3),
which is available at https://github.com/aws/aws-sdk-js-v3. This example is in the 'AWS SDK for JavaScript v3 Developer Guide' at
https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started-nodejs.html.

Purpose:
sample.ts demonstrates how to get started using node.js with the AWS SDK for JavaScript.

Inputs (replace in code):
 - BUCKET_NAME
 - KEY
 - BODY

Running the code:
node sample.js
*/
// snippet-start:[GettingStarted.JavaScript.NodeJS.sampleV3]
// Import required AWS SDK clients and commands for Node.js.
import { readFile } from 'node:fs/promises'
import type { PutObjectCommandInput } from '@aws-sdk/client-s3'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { S3Object } from './types'

// Set the AWS Region.
const REGION = 'us-east-1' // e.g. "us-east-1"

export async function s3Run(file: any, credentials: S3Object) {
  const s3Client = new S3Client({
    region: REGION,
    credentials,
  })
  // Set the parameters
  const params: PutObjectCommandInput = {
    Bucket: credentials.bucket,
    Key: credentials.key,
    Body: await readFile(file[0]),
  }
  // Create an object and upload it to the Amazon S3 bucket.
  try {
    const results = await s3Client.send(new PutObjectCommand(params))
    console.warn(
      `Successfully created ${params.Key} and uploaded it to ${params.Bucket}/${params.Key}`,
    )
    return results // For unit tests.
  }
  catch (err: any) {
    console.warn('message', err.message)
    console.warn('stack', err.stack)
    throw err
  }
}
// snippet-end:[GettingStarted.JavaScript.NodeJS.sampleV3]
// For unit tests.
// module.exports = {run, params};
