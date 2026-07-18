Data Engineering Knowledge Repository
Purpose

This document defines the core knowledge, technical competencies, engineering practices, and architectural principles expected of Data Engineering professionals. It is intended to serve as a knowledge base for an AI Interview Assistant to generate personalized interview questions based on:

Job Description (JD)
Candidate Resume
Years of Experience
Required Skills
Target Role

The assistant should use this repository to generate conceptual, implementation, debugging, optimization, scenario-based, and architecture-focused interview questions while adapting the depth according to the candidate's experience.

1. Data Engineering Fundamentals
Candidate should understand
Data Engineering lifecycle
Batch Processing
Stream Processing
ETL vs ELT
Data Pipelines
Data Lakes
Data Warehouses
Lakehouse Architecture
Data Marts
Metadata
Data Lineage
Data Governance
Data Quality
Data Catalogs
Evaluate
Understanding of modern data platforms.
Selection of appropriate architectures.
End-to-end pipeline knowledge.
2. SQL
SQL Fundamentals

Candidate should understand

SELECT
WHERE
ORDER BY
GROUP BY
HAVING
DISTINCT
LIMIT / TOP
CASE Statements
Aliases
Joins

Knowledge of

INNER JOIN
LEFT JOIN
RIGHT JOIN
FULL OUTER JOIN
CROSS JOIN
SELF JOIN

Evaluate

Appropriate join selection.
Join optimization.
Handling duplicate records.
Advanced SQL

Candidate should know

Common Table Expressions (CTEs)
Recursive CTEs
Window Functions
Ranking Functions
Aggregate Functions
Scalar Functions
Subqueries
Correlated Subqueries
EXISTS
IN
UNION
UNION ALL
INTERSECT
EXCEPT/MINUS
Window Functions

Evaluate

ROW_NUMBER()
RANK()
DENSE_RANK()
NTILE()
LEAD()
LAG()
FIRST_VALUE()
LAST_VALUE()
Data Manipulation

Knowledge of

INSERT
UPDATE
DELETE
MERGE
UPSERT
Transactions
COMMIT
ROLLBACK
Query Optimization

Candidate should understand

Indexes
Partitioning
Predicate Pushdown
Query Execution Plans
Statistics
Materialized Views

Evaluate

Performance tuning.
Efficient query writing.
Large dataset optimization.
3. Data Modeling

Candidate should understand

OLTP vs OLAP
Normalization
Denormalization
Star Schema
Snowflake Schema
Fact Tables
Dimension Tables
Slowly Changing Dimensions (SCD Type 1, 2, 3)
Surrogate Keys
Natural Keys
Grain
Data Vault (desirable)

Evaluate

Appropriate data model selection.
Handling historical data.
Scalability.
4. Databricks
Core Concepts

Candidate should understand

Databricks Workspace
Lakehouse Architecture
Clusters
Notebooks
Jobs
Repos
Unity Catalog
Workflows
Delta Lake

Knowledge of

ACID Transactions
Delta Tables
Time Travel
Versioning
Schema Evolution
Schema Enforcement
MERGE INTO
OPTIMIZE
VACUUM
Z-Ordering

Evaluate

Data reliability.
Performance optimization.
Incremental loading.
Databricks Features

Evaluate

Notebook development
Cluster management
Job scheduling
Secrets management
MLflow basics (if applicable)
Workspace organization
5. Apache Spark
Fundamentals

Candidate should know

Spark Architecture
Driver
Executors
Cluster Manager
DAG
Lazy Evaluation
Transformations
Actions
Spark APIs

Knowledge of

DataFrames
Datasets (Scala/Java)
RDDs
Spark SQL

Evaluate

API selection.
Performance implications.
Transformations

Candidate should understand

map
flatMap
filter
select
withColumn
groupBy
agg
join
union
distinct
repartition
coalesce
Performance Optimization

Evaluate

Partitioning
Caching
Broadcast Joins
Shuffle Optimization
Skew Handling
Adaptive Query Execution (AQE)
File Size Optimization
Spark Streaming

Knowledge of

Structured Streaming
Watermarking
Checkpointing
Event-time vs Processing-time
Streaming sinks
6. dbt (Data Build Tool)
Fundamentals

Candidate should understand

dbt Architecture
dbt Projects
Models
Seeds
Snapshots
Sources
Macros
Packages
Materializations
Model Types

Knowledge of

View
Table
Incremental
Ephemeral

Evaluate

Appropriate materialization selection.
Testing

Candidate should know

Generic Tests
Singular Tests
Unique
Not Null
Relationships
Accepted Values
Custom Tests

Evaluate

Data quality implementation.
Documentation

Knowledge of

dbt Docs
Lineage Graph
Exposures
Advanced dbt

Evaluate

Incremental Models
Snapshots
Variables
Jinja
Environment Configuration
CI/CD Integration
7. ETL & ELT

Candidate should understand

Source systems
Data ingestion
Transformation logic
Data validation
Error handling
Incremental loads
CDC (Change Data Capture)
Scheduling
Recovery mechanisms

Evaluate

Pipeline robustness.
Data reconciliation.
Scalability.
8. Data Quality

Knowledge of

Completeness
Accuracy
Consistency
Timeliness
Uniqueness
Validity

Evaluate

Validation strategies.
Data profiling.
Data reconciliation.
9. Workflow Orchestration

Candidate should know

Apache Airflow
Azure Data Factory
Databricks Workflows
Prefect
Dagster (desirable)

Evaluate

Dependency management.
Scheduling.
Retry mechanisms.
Monitoring.
10. File Formats

Knowledge of

CSV
JSON
XML
Parquet
Avro
ORC
Delta

Evaluate

Storage efficiency.
Compression.
Schema evolution.
11. Cloud Data Platforms

Candidate should understand

AWS

S3
Glue
Athena
Redshift

Azure

ADLS
Azure Data Factory
Synapse
Databricks

GCP

BigQuery
Dataflow
Dataproc
Cloud Storage

Evaluate

Cloud-native data pipelines.
Integration patterns.
12. Performance Optimization

Evaluate

Partition pruning
Predicate pushdown
File compaction
Broadcast joins
Data skipping
Caching
Cluster sizing
Parallelism
Resource optimization
13. Security & Governance

Candidate should know

Row-level security
Column-level security
Encryption
Data masking
Access control
Unity Catalog
IAM integration
Secrets management
Audit logging
14. Monitoring & Troubleshooting

Evaluate

Pipeline monitoring
Job failures
Data validation failures
Performance bottlenecks
Logging
Alerting
Root cause analysis
15. Version Control & CI/CD

Knowledge of

Git
GitHub
Azure DevOps
GitLab
Pull Requests

dbt CI/CD

Databricks Repos

Automated deployment

Environment promotion

16. Engineering Best Practices

Candidate should understand

Modular pipeline design
Reusable transformations
Documentation
Naming conventions
Parameterization
Error handling
Idempotent processing
Code reviews
Testing strategies
Observability
17. Scenario-Based Engineering

Evaluate ability to:

Design an end-to-end ETL/ELT pipeline.
Handle late-arriving data.
Manage schema changes without breaking downstream systems.
Optimize Spark jobs with data skew.
Implement incremental loading in dbt.
Debug failed Databricks jobs.
Validate data between source and target systems.
Migrate workloads from traditional ETL tools to Spark/Databricks.
Ensure data quality in production pipelines.
18. Leadership & Architecture (Senior Candidates)

Evaluate

Data platform architecture.
Lakehouse design.
Technology selection.
Cost optimization.
Governance strategy.
Data quality framework.
Team mentoring.
Cross-functional collaboration.
Stakeholder communication.
Roadmap planning.
Experience Mapping
0–2 Years

Evaluate

SQL fundamentals
Basic joins
ETL concepts
Spark basics
Databricks notebooks
dbt models
Data validation
File formats
3–5 Years

Evaluate

Advanced SQL
Window functions
Spark transformations
Delta Lake
dbt testing
Incremental models
Pipeline development
Performance tuning
Workflow orchestration
6–8 Years

Evaluate

Data modeling
Spark optimization
Databricks architecture
Delta Lake optimization
CI/CD for dbt
Pipeline scalability
Security
Troubleshooting
End-to-end data engineering solutions
8+ Years

Evaluate

Enterprise data architecture
Lakehouse strategy
Data governance
Performance engineering
Platform modernization
Technology selection
Cost optimization
Leadership
Mentoring
Data engineering best practices
Guidance for the AI Interview Assistant

When using this repository:

Prioritize the technologies specified in the JD and demonstrated in the candidate's resume. For example, if the role emphasizes Databricks and dbt, focus on Delta Lake, Spark optimization, dbt models, testing, and orchestration while still validating SQL fundamentals.
Adapt questions to the candidate's experience level. Junior candidates should be assessed on core SQL, ETL concepts, and basic Spark usage, while senior candidates should be challenged with architecture, optimization, governance, and platform design.
Emphasize practical, scenario-based evaluation. Ask candidates to explain how they would design, troubleshoot, optimize, or scale data pipelines instead of recalling syntax or definitions.
Assess engineering practices in addition to technical knowledge. Explore data quality, testing, documentation, version control, CI/CD, monitoring, and maintainability as part of the interview.
Personalize questions using the resume. Reference the candidate's projects, domains, and technologies to verify claimed experience and encourage discussion of real-world implementations rather than hypothetical examples.