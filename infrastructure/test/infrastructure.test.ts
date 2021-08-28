import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Infrastructure from '../lib/infrastructure-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Infrastructure.InfrastructureStack(app, 'MyTestStack', {
        stackName: 'stack',
        env: {
            account: '12345',
            region: 'eu-central-1',
        },
    });
    // THEN
    expectCDK(stack).to(
        matchTemplate(
            {
                Resources: {},
            },
            MatchStyle.SUPERSET,
        ),
    );
});
