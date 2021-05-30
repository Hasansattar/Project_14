import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Backend14C from '../lib/backend14_c-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Backend14C.Backend14CStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
