#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Backend14CStack } from '../lib/backend14_c-stack';

const app = new cdk.App();
new Backend14CStack(app, 'Backend14CStack');
