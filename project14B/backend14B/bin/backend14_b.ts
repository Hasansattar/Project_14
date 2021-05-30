#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Backend14BStack } from '../lib/backend14_b-stack';

const app = new cdk.App();
new Backend14BStack(app, 'Backend14BStack');
