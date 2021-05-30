import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Backend14A from '../lib/backend14_a-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Backend14A.Backend14AStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
