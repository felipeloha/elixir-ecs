# elixir-ecs
This repository is a minimal setup of an elixir application running on multiple connected nodes on aws as fargate services. 
Each instance has a cron job that depending on the configuration can run on every node, on one node of the service or on one node of connected nodes.

The services are called krilling and vegeta so that they can be distinguished while testing and analyzing the logs.

This repository contains:
- an elixir application with a quantum cron job
- an aws infrastructure with two fargate services
- a service discovery to connect the ecs service's instances/nodes
- in the final deployment, the jobs run in only once instance of all connected

Getting started:
- Build docker image: `docker build --progress=plain -t elixir-ecs:latest .`
- Deploy infrastructure
    - `cd infrastructure && npm i && npm run build && cdk deploy`
    - Right after the ECR repo is created, you wil have to push your docker image to ECR as:
    ``` 
  docker tag elixir-ecs:latest AWS_ACCOUNT.dkr.ecr.AWS_REGION.amazonaws.com/elixir-ecs:latest
  docker push AWS_ACCOUNT.dkr.ecr.AWS_REGION.amazonaws.com/elixir-ecs:latest  
  ```
- when the deployment is done you will see the load balancer url on the console

There are two "services" one is shown with LB_URL and the other with LB_URL/krillin.

They display the current node and the connected nodes. Per default only the nodes within a service are connected. 

If you need to connect all nodes of all services:
- go to `lib/app-resources.ts:37`
- change the configuration so that all nodes have the same name and query for the same name
- build and deploy the infrastructure again

The jobs are run once per cluster. This means that if all nodes are connected, the jobs will run only in one instance of all services.
If only the instances within a node are connected, the job will run on one instance of each service.

the logs will show something like:
```
19:00:10.643 [info] Job running on: :"vegeta-service-dbz@172.31.25.17" with cookie :"my-cookie" from possible hosts: [:"vegeta-service-dbz@172.31.11.177"]
19:00:10.646 [info] Job running on: :"dbz@172.31.1.110" with cookie :"my-cookie" from possible hosts: [:"dbz@172.31.23.124"]
19:00:15.643 [info] Job running on: :"vegeta-service-dbz@172.31.25.17" with cookie :"my-cookie" from possible hosts: [:"vegeta-service-dbz@172.31.11.177"]
19:00:15.646 [info] Job running on: :"dbz@172.31.1.110" with cookie :"my-cookie" from possible hosts: [:"dbz@172.31.23.124"]
19:00:20.644 [info] Job running on: :"vegeta-service-dbz@172.31.25.17" with cookie :"my-cookie" from possible hosts: [:"vegeta-service-dbz@172.31.11.177"]
19:00:20.646 [info] Job running on: :"dbz@172.31.1.110" with cookie :"my-cookie" from possible hosts: [:"dbz@172.31.23.124"]
19:00:25.259 [info] Job running on: :"krillin-service-dbz@172.31.22.8" with cookie :"my-cookie" from possible hosts: [:"krillin-service-dbz@172.31.6.25"]
19:00:25.643 [info] Job running on: :"vegeta-service-dbz@172.31.25.17" with cookie :"my-cookie" from possible hosts: [:"vegeta-service-dbz@172.31.11.177"]
19:00:25.646 [info] Job running on: :"dbz@172.31.1.110" with cookie :"my-cookie" from possible hosts: [:"dbz@172.31.23.124"]
```