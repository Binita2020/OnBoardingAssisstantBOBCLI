Cloud Technologies Knowledge Repository
Purpose

This document defines the fundamental concepts, platform-specific services, best practices, and architectural principles expected of professionals working with cloud technologies.

It serves as a knowledge base for an AI Interview Assistant to generate interview questions based on:

Job Description (JD)
Candidate Resume
Years of Experience
Target Role
Required Cloud Platform(s)

The assistant should use this repository to generate conceptual, implementation, scenario-based, troubleshooting, architecture, and leadership questions while adjusting the depth according to the candidate's experience.

1. Cloud Computing Fundamentals
Candidate should understand
What is Cloud Computing?
Benefits of Cloud Computing
Cloud Service Models
Infrastructure as a Service (IaaS)
Platform as a Service (PaaS)
Software as a Service (SaaS)
Function as a Service (FaaS)
Deployment Models
Public Cloud
Private Cloud
Hybrid Cloud
Multi-Cloud
Shared Responsibility Model
High Availability
Fault Tolerance
Disaster Recovery
Scalability
Elasticity
Cloud Regions
Availability Zones
Evaluate
Understanding of cloud fundamentals.
Ability to choose appropriate service and deployment models.
Awareness of reliability and resilience concepts.
2. Compute Services

Evaluate understanding of virtual machines, containers, and serverless computing.

AWS
EC2
Auto Scaling Groups
Elastic Load Balancer
ECS
EKS
Lambda
Azure
Virtual Machines
VM Scale Sets
Azure App Service
AKS
Azure Functions
GCP
Compute Engine
Managed Instance Groups
Cloud Run
GKE
Cloud Functions
Evaluate
Service selection.
Autoscaling.
Cost considerations.
High availability.
3. Storage Services

Candidate should understand:

Object Storage

AWS

S3

Azure

Blob Storage

GCP

Cloud Storage
Block Storage

AWS

EBS

Azure

Managed Disks

GCP

Persistent Disks
File Storage

AWS

EFS

Azure

Azure Files

GCP

Filestore

Evaluate

Storage selection.
Durability.
Availability.
Performance.
Lifecycle management.
4. Networking

Candidate should know

Virtual Networks
CIDR
Subnets
Public vs Private Networks
NAT
VPN
DNS
Routing
Firewalls
Security Groups
Network ACLs
Load Balancers

Platform services

AWS

VPC
Route 53
Internet Gateway
NAT Gateway

Azure

Virtual Network
Azure DNS
Application Gateway
Azure Firewall

GCP

VPC
Cloud DNS
Cloud Load Balancer
Cloud NAT

Evaluate

Secure network design.
Connectivity.
Network troubleshooting.
5. Identity and Access Management (IAM)

Candidate should understand

Authentication
Authorization
Least Privilege
Roles
Policies
Service Accounts
Multi-Factor Authentication
Identity Federation

Platform Services

AWS IAM

Azure Entra ID (formerly Azure Active Directory)

GCP IAM

Evaluate

Security best practices.
Permission management.
Identity design.
6. Databases

Candidate should understand relational and NoSQL databases.

AWS

RDS
Aurora
DynamoDB
Redshift

Azure

Azure SQL Database
Cosmos DB
PostgreSQL
Synapse Analytics

GCP

Cloud SQL
Spanner
BigQuery
Firestore

Evaluate

Database selection.
Scalability.
Backup and recovery.
Performance optimization.
7. Containers and Kubernetes

Candidate should know

Docker fundamentals
Container lifecycle
Kubernetes architecture
Pods
Deployments
Services
ConfigMaps
Secrets
Ingress
Helm

Platform Services

AWS EKS

Azure AKS

Google Kubernetes Engine (GKE)

Evaluate

Container orchestration.
Scaling.
Deployment strategies.
8. Serverless Computing

Candidate should understand

Event-driven architecture
Stateless execution
Cold starts
Event triggers
Scaling
Monitoring

Platform Services

AWS Lambda

Azure Functions

Cloud Functions

Evaluate

Appropriate use cases.
Limitations.
Cost optimization.
9. DevOps & CI/CD

Candidate should know

CI/CD concepts
Infrastructure as Code
Deployment strategies
Blue-Green Deployment
Canary Deployment
Rolling Deployment

Tools

Git

GitHub

Azure DevOps

Jenkins

GitHub Actions

Terraform

Ansible

Evaluate

Pipeline design.
Deployment automation.
Release management.
10. Infrastructure as Code (IaC)

Candidate should understand

Declarative infrastructure
State management
Modules
Variables
Reusability

Tools

Terraform

AWS CloudFormation

Azure Bicep

ARM Templates

Google Deployment Manager

Evaluate

Infrastructure automation.
Version control.
Environment management.
11. Monitoring & Logging

Candidate should understand

Metrics
Logs
Tracing
Alerts
Dashboards
Health Checks

AWS

CloudWatch

CloudTrail

X-Ray

Azure

Azure Monitor

Application Insights

Log Analytics

GCP

Cloud Monitoring

Cloud Logging

Cloud Trace

Evaluate

Root cause analysis.
Monitoring strategy.
Incident response.
12. Security

Candidate should know

Encryption at Rest
Encryption in Transit
Key Management
Secrets Management
Certificate Management
Network Security
Compliance
Zero Trust
Security Monitoring

Platform Services

AWS KMS

Azure Key Vault

Google Cloud KMS

Evaluate

Cloud security practices.
Secure architecture.
Compliance awareness.
13. Cost Optimization

Candidate should understand

Reserved Instances
Spot Instances
Savings Plans
Autoscaling
Resource Rightsizing
Storage Lifecycle Policies
Budget Monitoring
Cost Allocation Tags

Evaluate

Cost optimization strategies.
Resource utilization.
14. Backup & Disaster Recovery

Candidate should know

Backup strategies
Recovery Point Objective (RPO)
Recovery Time Objective (RTO)
Replication
Multi-region deployments
Business Continuity

Evaluate

Disaster recovery planning.
Recovery strategies.
15. Data Engineering Services

Candidate should understand

AWS

Glue
EMR
Athena
Kinesis

Azure

Azure Data Factory
Synapse Analytics
Databricks
Event Hubs

GCP

Dataflow
Dataproc
BigQuery
Pub/Sub

Evaluate

Data pipeline architecture.
Batch vs streaming.
ETL/ELT design.
16. AI & Machine Learning Services

AWS

SageMaker
Bedrock

Azure

Azure AI Services
Azure Machine Learning

GCP

Vertex AI

Evaluate

AI service selection.
Model deployment.
Responsible AI considerations.
17. Migration

Candidate should understand

Cloud migration strategies (6Rs)
Assessment
Data migration
Application migration
Hybrid architecture
Migration risks

Evaluate

Migration planning.
Trade-offs.
Downtime reduction.
18. Architecture & Solution Design

Senior candidates should understand

Well-Architected Frameworks
Scalability
High Availability
Fault Tolerance
Event-Driven Architecture
Microservices
API Gateways
Caching
Messaging Systems

Evaluate

Architectural decision-making.
Trade-offs.
Design for resilience.
19. Leadership & Governance

Evaluate

Cloud governance
Landing zones
Resource organization
Policy management
Security governance
Cost governance
Team mentoring
Stakeholder communication
Cloud adoption strategy
Experience Mapping
0–2 Years

Evaluate

Cloud fundamentals
Compute
Storage
Networking basics
IAM
Basic deployments
3–5 Years

Evaluate

Infrastructure as Code
Containers
CI/CD
Monitoring
Security
Database services
Troubleshooting
6–8 Years

Evaluate

Solution design
Kubernetes
Multi-service integration
Performance optimization
Disaster recovery
Cloud migration
Cost optimization
8+ Years

Evaluate

Enterprise cloud architecture
Multi-cloud strategy
Governance
Security architecture
Platform engineering
FinOps
Leadership
Cloud transformation
Technology selection
Guidance for the AI Interview Assistant

When using this repository:

Focus on the cloud platform(s) required by the JD. For example, if the role is Azure-focused, prioritize Azure services while assessing transferable cloud concepts where appropriate.
Differentiate between cloud concepts and platform-specific implementations. A strong candidate should understand foundational cloud principles as well as the services of the target platform.
Tailor questions to the candidate's role.
Developers: compute, serverless, APIs, deployment.
DevOps Engineers: CI/CD, IaC, containers, monitoring.
Data Engineers: storage, databases, analytics, data pipelines.
QA Engineers: cloud-based test environments, automation infrastructure, CI/CD.
Solution Architects: architecture, governance, security, scalability, cost optimization.
Prioritize scenario-based and design-oriented questions over simple service definitions. Ask candidates to justify architectural decisions, troubleshoot failures, optimize costs, or design resilient solutions.
Assess engineering maturity for senior candidates. Evaluate governance, multi-cloud considerations, security, FinOps, disaster recovery, mentoring, and strategic decision-making in addition to technical expertise.