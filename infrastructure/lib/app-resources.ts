import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecr from '@aws-cdk/aws-ecr';
import * as servicediscovery from '@aws-cdk/aws-servicediscovery';

interface ServiceProps extends cdk.NestedStackProps {
    prefix: string;
    version: string;
    ecsLogDriver: ecs.AwsLogDriver;
    repository: string;
    serviceName: string;
    cluster: ecs.Cluster;
    discoveryService: servicediscovery.Service;
}

class Service extends cdk.NestedStack {
    service: ecs.FargateService;
    constructor(scope: cdk.Construct, id: string, props: ServiceProps) {
        super(scope, id, props);

        const containerPort = 4000;
        const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, `${props.prefix}TaskDefinition`, {
            memoryLimitMiB: 512,
            cpu: 256,
        });
        const container = fargateTaskDefinition.addContainer(`${props.prefix}Container`, {
            image: ecs.ContainerImage.fromEcrRepository(
                ecr.Repository.fromRepositoryName(this, `${props.prefix}ECRRepository`, props.repository),
                props.version,
            ),
            logging: props.ecsLogDriver,
            environment: {
                RELEASE_COOKIE: 'my-cookie',
                SERVICE_DISCOVERY_ENDPOINT: `${props.discoveryService.serviceName}.${props.discoveryService.namespace.namespaceName}`,
                //##### connect all instances of all services
                //NODE_NAME: 'dbz',
                //NODE_NAME_QUERY: 'dbz',
                //##### connect only instances within a service
                NODE_NAME: `${props.serviceName}-dbz`,
                NODE_NAME_QUERY: `${props.serviceName}-dbz`,
            },
        });
        container.addPortMappings({ containerPort });

        this.service = new ecs.FargateService(this, 'Service', {
            cluster: props.cluster,
            assignPublicIp: true,
            serviceName: `${props.prefix}-service-${props.serviceName}`,
            propagateTags: ecs.PropagatedTagSource.SERVICE,
            taskDefinition: fargateTaskDefinition,
            desiredCount: 2,
            enableExecuteCommand: true,
            healthCheckGracePeriod: cdk.Duration.seconds(20),
            circuitBreaker: { rollback: true },
        });
        this.service.associateCloudMapService({ service: props.discoveryService });
    }
}

interface AppResourcesProps extends cdk.NestedStackProps {
    vpc: ec2.IVpc;
    prefix: string;
    ecsLogDriver: ecs.AwsLogDriver;
    vegetaServiceVersion: string;
    krillinServiceVersion: string;
    repository: string;
}
export class AppResources extends cdk.NestedStack {
    vegetaService: ecs.FargateService;
    krillinService: ecs.FargateService;
    loadBalancer: elbv2.ApplicationLoadBalancer;

    constructor(scope: cdk.Construct, id: string, props: AppResourcesProps) {
        super(scope, id, props);

        const { cluster, discoveryService } = this.createBaseResources(props);

        this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'DBZLB', {
            vpc: props.vpc,
            internetFacing: true,
            loadBalancerName: `${props.prefix}-load-balancer`,
        });
        const listener = this.loadBalancer.addListener('Listener', { port: 80 });

        this.vegetaService = new Service(this, 'vegetaService', {
            prefix: props.prefix,
            version: props.vegetaServiceVersion,
            ecsLogDriver: props.ecsLogDriver,
            repository: props.repository,
            serviceName: 'vegeta-service',
            cluster: cluster,
            discoveryService: discoveryService,
        }).service;

        this.krillinService = new Service(this, 'krillinService', {
            prefix: props.prefix,
            version: props.krillinServiceVersion,
            ecsLogDriver: props.ecsLogDriver,
            repository: props.repository,
            serviceName: 'krillin-service',
            cluster: cluster,
            discoveryService: discoveryService,
        }).service;

        this.connectServices(props);

        const vegetaTargetGroup = listener.addTargets('vegetaTarget', {
            port: 80,
            targets: [this.vegetaService],
            healthCheck: {
                path: '/',
                interval: cdk.Duration.seconds(30),
                healthyThresholdCount: 2,
                unhealthyThresholdCount: 5,
            },
        });
        vegetaTargetGroup.setAttribute('deregistration_delay.timeout_seconds', '5');

        const krillinTargetGroup = listener.addTargets('krillinTarget', {
            priority: 10,
            port: 80,
            conditions: [elbv2.ListenerCondition.pathPatterns(['/krillin', '/krillin/*'])],
            targets: [this.krillinService],
            healthCheck: {
                path: '/',
                interval: cdk.Duration.seconds(30),
                healthyThresholdCount: 2,
                unhealthyThresholdCount: 5,
            },
        });
        krillinTargetGroup.setAttribute('deregistration_delay.timeout_seconds', '5');
    }

    private createBaseResources(props: AppResourcesProps) {
        const namespace = new servicediscovery.PrivateDnsNamespace(this, 'Namespace', {
            name: `${props.prefix}-ns`,
            vpc: props.vpc,
        });

        const cluster = new ecs.Cluster(this, 'PulpoCluster', {
            clusterName: `${props.prefix}-cluster`,
            vpc: props.vpc,
        });

        const discoveryService = namespace.createService('DiscoveryService', {
            name: `${props.prefix}-discovery-service`,
            dnsRecordType: servicediscovery.DnsRecordType.A,
            dnsTtl: cdk.Duration.seconds(10),
            routingPolicy: servicediscovery.RoutingPolicy.MULTIVALUE,
        });
        return { cluster, discoveryService };
    }

    private connectServices(props: AppResourcesProps) {
        this.krillinService.connections.allowFrom(
            this.vegetaService,
            ec2.Port.allTcp(),
            `${props.prefix} krillin to vegeta`,
        );
        this.krillinService.connections.allowFrom(
            this.vegetaService,
            ec2.Port.allTcp(),
            `${props.prefix} vegeta to krillin`,
        );
        this.krillinService.connections.allowFrom(
            this.krillinService,
            ec2.Port.allTcp(),
            `${props.prefix} krillin to krillin`,
        );
        this.vegetaService.connections.allowFrom(
            this.vegetaService,
            ec2.Port.allTcp(),
            `${props.prefix} vegeta to vegeta`,
        );
    }
}
