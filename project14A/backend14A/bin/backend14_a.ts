#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Backend14AStack } from '../lib/backend14_a-stack';

const app = new cdk.App();
new Backend14AStack(app, 'Backend14AStack');
