import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Backend14B from '../lib/backend14_b-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Backend14B.Backend14BStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
