DevOps Knowledge Repository
Purpose

This document defines the core concepts, engineering practices, tools, and architectural principles expected of professionals working in DevOps. It is intended to serve as a knowledge base for an AI Interview Assistant to generate personalized interview questions based on:

Job Description (JD)
Candidate Resume
Years of Experience
Target Role
Required Skills

The assistant should use this repository to generate conceptual, implementation, troubleshooting, architecture, optimization, security, and scenario-based interview questions while adapting the depth according to the candidate's experience.

1. DevOps Fundamentals
Candidate should understand
What is DevOps?
DevOps culture and principles
Collaboration between Development, QA, Operations, and Security
Continuous Integration (CI)
Continuous Delivery (CD)
Continuous Deployment
Infrastructure as Code (IaC)
Automation
Monitoring and Feedback
Shift Left Testing
DevSecOps (high level)
GitOps (high level)
Evaluate
Understanding of DevOps practices.
Benefits of automation.
Knowledge of the software delivery lifecycle.
2. Version Control

Candidate should know

Git fundamentals
Repository structure
Branching strategies
Feature branches
Git Flow
Trunk-based development
Merge
Rebase
Cherry-pick
Pull Requests
Conflict resolution
Tags and Releases
Evaluate
Collaboration using Git.
Source code management.
Branching strategy selection.
3. CI/CD Concepts

Candidate should understand

CI pipeline stages
CD pipeline stages
Build automation
Automated testing
Static code analysis
Artifact management
Deployment strategies
Rollback mechanisms
Deployment Strategies
Blue-Green Deployment
Canary Deployment
Rolling Deployment
Recreate Deployment

Evaluate

Pipeline design.
Release strategies.
Deployment automation.
4. Docker
Fundamentals

Candidate should understand

Containerization
Containers vs Virtual Machines
Docker Architecture
Docker Engine
Docker Images
Docker Containers
Docker Registry
Docker Hub
Docker Images

Knowledge of

Dockerfile
Layers
Image optimization
Multi-stage builds
Base images

Evaluate

Efficient image creation.
Security considerations.
Image optimization.
Container Management

Candidate should know

Build images
Run containers
Stop containers
Remove containers
Logs
Volumes
Networks
Environment variables
Port mapping
Docker Compose

Knowledge of

Multi-container applications
Service dependencies
Environment configuration
Persistent storage

Evaluate

Local development environments.
Service orchestration.
5. Kubernetes
Core Concepts

Candidate should understand

Kubernetes Architecture
Control Plane
Worker Nodes
Cluster
API Server
Scheduler
etcd
Kubelet
Kube Proxy
Workloads

Knowledge of

Pods
ReplicaSets
Deployments
StatefulSets
DaemonSets
Jobs
CronJobs

Evaluate

Appropriate workload selection.
Scaling strategies.
Networking

Candidate should know

Services
ClusterIP
NodePort
LoadBalancer
Ingress
DNS
Network Policies
Configuration

Knowledge of

ConfigMaps
Secrets
Environment Variables
Persistent Volumes
Persistent Volume Claims
Storage Classes
Scaling

Evaluate

Horizontal Pod Autoscaler (HPA)
Vertical scaling (conceptual)
Resource requests
Resource limits
Deployment

Knowledge of

Rolling updates
Rollbacks
Health checks
Readiness probes
Liveness probes
Troubleshooting

Evaluate ability to diagnose

Pod failures
CrashLoopBackOff
Pending pods
Image pull failures
Networking issues
Resource constraints
6. Jenkins
Fundamentals

Candidate should understand

Jenkins Architecture
Controller and Agents
Freestyle Jobs
Pipelines
Pipeline as Code
Pipeline

Knowledge of

Declarative Pipelines
Scripted Pipelines
Jenkinsfile
Pipeline stages
Parallel execution
Environment variables
Parameters

Evaluate

Pipeline design.
Build automation.
Maintainability.
Integrations

Candidate should know

Integration with

Git
Docker
Kubernetes
Maven
Gradle
SonarQube
JUnit/TestNG reports
Artifact repositories (e.g., Nexus, Artifactory)
Build Automation

Evaluate

Build triggers
Scheduled builds
Webhooks
Notifications
Artifact archiving
Test execution
Deployment automation
7. Infrastructure as Code (IaC)

Candidate should understand

Declarative vs Imperative infrastructure
Infrastructure provisioning
Version-controlled infrastructure

Common tools

Terraform
Ansible
AWS CloudFormation
Azure Bicep
ARM Templates

Evaluate

Infrastructure automation.
Reusability.
Environment consistency.
8. Monitoring & Logging

Candidate should know

Centralized logging
Metrics
Dashboards
Alerting
Tracing
Health monitoring

Common tools

Prometheus
Grafana
ELK Stack
Loki
Splunk (high level)

Evaluate

Observability strategy.
Root cause analysis.
Incident response.
9. Security & DevSecOps

Candidate should understand

Secrets management
Least privilege
Image scanning
Vulnerability management
Container security
Kubernetes RBAC
Secure CI/CD pipelines
Dependency scanning
Secret detection in repositories

Evaluate

Secure software delivery.
Risk mitigation.
10. Cloud-Native DevOps

Candidate should know

AWS

ECS
EKS
CodePipeline
CodeBuild

Azure

AKS
Azure DevOps
Azure Container Registry

GCP

GKE
Cloud Build
Artifact Registry

Evaluate

Cloud-native deployments.
Platform integration.
11. Artifact Management

Knowledge of

Nexus Repository
JFrog Artifactory
Docker Registry
Versioning
Dependency management

Evaluate

Artifact lifecycle.
Release management.
12. Automation & Scripting

Candidate should understand

Bash scripting
PowerShell (where applicable)
Python scripting (common automation tasks)
Environment variables
Task automation

Evaluate

Automation of repetitive tasks.
Script maintainability.
13. Performance & Scalability

Candidate should know

Build optimization
Pipeline optimization
Container resource optimization
Cluster scaling
Caching strategies
Parallel execution

Evaluate

Efficient CI/CD pipelines.
Resource utilization.
Scalability.
14. Troubleshooting & Incident Management

Evaluate ability to:

Diagnose failed builds.
Investigate deployment failures.
Debug Kubernetes workloads.
Resolve Docker image issues.
Analyze Jenkins pipeline failures.
Interpret application logs.
Perform root cause analysis.
Implement rollback strategies.
15. Engineering Best Practices

Candidate should understand

Automation-first mindset
Reusable pipelines
Infrastructure as Code
Immutable infrastructure
Configuration management
Code reviews
Version control
Documentation
Standardized environments
Observability
16. Scenario-Based Engineering

Evaluate ability to:

Design a complete CI/CD pipeline for a microservices application.
Containerize an existing application using Docker.
Deploy applications to Kubernetes with zero downtime.
Configure Jenkins pipelines for automated build, test, and deployment.
Troubleshoot a Kubernetes deployment experiencing frequent pod restarts.
Optimize a slow CI pipeline.
Secure Docker images and Kubernetes workloads.
Implement rollback strategies after deployment failures.
Integrate automated testing into the deployment pipeline.
17. Leadership & Platform Engineering (Senior Candidates)

Evaluate

Enterprise CI/CD strategy.
Platform engineering practices.
Kubernetes platform design.
Tool evaluation and selection.
DevOps governance.
Security strategy.
Team mentoring.
Infrastructure cost optimization.
Stakeholder communication.
DevOps transformation initiatives.
Experience Mapping
0–2 Years

Evaluate

DevOps fundamentals
Git basics
Docker fundamentals
Jenkins basics
CI/CD concepts
Basic Kubernetes awareness
Simple troubleshooting
3–5 Years

Evaluate

Docker image creation
Kubernetes deployments
Jenkins pipeline development
Git workflows
Infrastructure as Code basics
Monitoring
Security fundamentals
Pipeline troubleshooting
6–8 Years

Evaluate

Kubernetes administration
CI/CD architecture
Docker optimization
Pipeline scalability
Infrastructure automation
Monitoring strategy
Deployment strategies
Production troubleshooting
8+ Years

Evaluate

Enterprise DevOps architecture
Platform engineering
Kubernetes platform design
DevSecOps strategy
Multi-environment CI/CD governance
Cost optimization
Leadership
Mentoring
Organizational DevOps transformation
Technology selection
Guidance for the AI Interview Assistant

When using this repository:

Prioritize the DevOps technologies listed in the JD and demonstrated in the candidate's resume. For example, if the role focuses on Kubernetes and Jenkins, generate questions around cluster management, deployment strategies, pipeline automation, and troubleshooting while still validating Docker fundamentals.
Adapt question depth based on experience. Junior candidates should be evaluated on containerization, Git, and basic CI/CD concepts. Senior candidates should be challenged with platform architecture, deployment strategies, scalability, security, governance, and operational excellence.
Favor real-world scenarios over memorization. Ask candidates how they would build, deploy, secure, monitor, or troubleshoot applications in production rather than asking for command syntax or definitions.
Evaluate the complete DevOps lifecycle. Cover source control, build automation, testing, containerization, orchestration, deployment, monitoring, security, and incident response to assess end-to-end delivery capabilities.
Personalize questions using the candidate's resume. Reference their projects, cloud platforms, deployment pipelines, automation initiatives, or production support experience to validate practical expertise and decision-making.