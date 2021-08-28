import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecr from '@aws-cdk/aws-ecr';
import * as logs from '@aws-cdk/aws-logs';
import { AppResources } from './app-resources';

const prefix = 'elixir-ecs';
const repository = prefix;

export class InfrastructureStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vegetaVersion = new cdk.CfnParameter(this, 'vegetaVersion', {
            description: 'vegeta service version',
            type: 'String',
            default: 'latest',
        });
        const krillinVersion = new cdk.CfnParameter(this, 'krillinVersion', {
            description: 'krillin service version',
            type: 'String',
            default: 'latest',
        });

        const vpc = ec2.Vpc.fromLookup(this, 'vpc', { isDefault: true });
        const logGroup = new logs.LogGroup(this, 'LogGroup', {
            retention: logs.RetentionDays.ONE_DAY,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            logGroupName: `${prefix}-log-group`,
        });
        const ecsLogDriver = new ecs.AwsLogDriver({
            logGroup,
            streamPrefix: `${prefix}-logs`,
        });
        new ecr.Repository(this, repository, {
            repositoryName: repository,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            imageTagMutability: ecr.TagMutability.MUTABLE,
        });

        const { loadBalancer } = new AppResources(this, 'app', {
            prefix,
            ecsLogDriver,
            vpc,
            vegetaServiceVersion: vegetaVersion.valueAsString,
            krillinServiceVersion: krillinVersion.valueAsString,
            repository,
        });
        new cdk.CfnOutput(this, 'OutputName', {
            value: loadBalancer.loadBalancerDnsName,
            description: 'load balancer url',
            exportName: `${prefix}-lb-url`,
        });
    }
}
