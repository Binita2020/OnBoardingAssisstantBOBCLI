Testing Knowledge Repository

Purpose

This document defines the core knowledge, practical skills, and engineering practices expected of software testing professionals. It serves as a reference for an AI Interview Assistant to generate personalized interview questions based on the candidate's resume, job description (JD), experience level, and target role.

The assistant should use this repository to:

Generate conceptual, practical, debugging, and scenario-based interview questions.
Assess both tool-specific expertise and testing fundamentals.
Adjust question complexity according to the candidate's experience.
Focus on engineering practices, not just tool usage.
1. Software Testing Fundamentals
Candidate should understand
SDLC (Software Development Life Cycle)
STLC (Software Testing Life Cycle)
Defect Life Cycle
Test Planning
Test Strategy
Test Scenarios
Test Cases
Test Execution
Test Closure
Risk-Based Testing
Shift Left Testing
Continuous Testing
Evaluate
Understanding of quality assurance principles.
Ability to design effective test strategies.
Awareness of testing throughout the development lifecycle.
2. Test Design Techniques

Candidate should know:

Equivalence Partitioning
Boundary Value Analysis
Decision Table Testing
State Transition Testing
Pairwise Testing
Use Case Testing
Error Guessing
Exploratory Testing
Risk-Based Testing

Evaluate:

Ability to create efficient and comprehensive test cases.
Selection of appropriate techniques for different scenarios.
3. Test Automation Fundamentals

Evaluate understanding of:

Why automate?
What should and should not be automated?
ROI of automation
Automation Pyramid
Test Automation Strategy
Flaky Tests
Test Stability
Test Maintainability
Test Data Management

Senior candidates should also understand:

Automation governance
Automation maturity models
Automation metrics
4. Selenium WebDriver
Core Concepts
Selenium Architecture
WebDriver API
Browser Drivers
W3C WebDriver Protocol
Browser Compatibility
Locators
ID
Name
CSS Selectors
XPath
Relative XPath
Dynamic XPath

Evaluate:

Locator strategy
Locator reliability
Performance considerations
Synchronization

Candidate should understand:

Implicit Wait
Explicit Wait
Fluent Wait
Dynamic synchronization

Evaluate:

Appropriate wait selection.
Handling dynamic applications.
Web Elements

Knowledge of handling:

Buttons
Textboxes
Checkboxes
Radio Buttons
Dropdowns
Tables
Calendars
Alerts
Frames
Windows/Tabs
Shadow DOM
Dynamic Elements
Advanced Selenium

Evaluate knowledge of:

Actions Class
JavaScript Executor
File Upload/Download
Headless Execution
Selenium Grid
Cross-browser testing
Parallel execution
Browser capabilities
Common Selenium Challenges
Stale Element Reference
Element Not Interactable
NoSuchElementException
Synchronization failures
Dynamic IDs
AJAX applications

Evaluate debugging and troubleshooting approaches.

5. Playwright
Core Concepts

Candidate should know:

Playwright Architecture
Browser Contexts
Auto Waiting
Multi-browser support
Cross-platform execution
Locators
Role-based locators
Text locators
CSS
XPath
Test IDs

Evaluate:

Stable locator strategy.
Accessibility-based selectors.
Features

Knowledge of:

Auto waiting
Network interception
API mocking
Tracing
Screenshots
Video recording
Parallel execution
Multiple browser contexts
Advanced Topics

Evaluate:

Authentication handling
Storage State
Mobile emulation
Cross-browser execution
Retry mechanisms
6. Cypress
Core Concepts

Candidate should understand:

Cypress Architecture
Command Queue
Automatic waiting
DOM interaction
Browser support
Features

Knowledge of:

Fixtures
Intercepts
Aliases
Custom Commands
Environment Variables
API Testing
Screenshots
Video Recording
Advanced Topics

Evaluate:

Network stubbing
Session management
Cross-origin testing
Component Testing
End-to-End Testing
Limitations

Candidate should know:

Browser limitations
Multi-tab limitations
Architecture constraints
7. Automation Framework Design

Evaluate understanding of:

Framework Types

Data Driven
Keyword Driven
Hybrid
Modular
BDD

Framework Components

Base Classes
Driver Factory
Page Object Model
Page Factory
Utilities
Logging
Reporting
Retry Logic
Configuration Management

Senior candidates should understand:

Framework scalability
Reusability
Maintainability
Enterprise framework architecture
8. API Testing
Fundamentals

Candidate should know:

REST
SOAP
GraphQL (desirable)
HTTP Methods
Status Codes
Headers
Cookies
Authentication
Authorization
Authentication

Knowledge of:

Basic Authentication
Bearer Token
OAuth
JWT
API Keys
Request Validation

Evaluate:

Headers
Parameters
Payloads
Response validation
JSON
XML
Schema validation
API Automation Tools

Knowledge of:

Postman
Newman
Rest Assured
Karate
ReadyAPI / SoapUI
Playwright API Testing
API Testing Scenarios

Evaluate ability to test:

CRUD operations
Pagination
Sorting
Filtering
Error handling
Rate limiting
Authentication failures
Performance
Negative testing
9. Performance Testing
Fundamentals

Candidate should understand:

Load Testing
Stress Testing
Spike Testing
Endurance Testing
Volume Testing
Scalability Testing
Performance Metrics

Knowledge of:

Response Time
Throughput
Transactions Per Second
Concurrent Users
Latency
CPU
Memory
Disk Utilization
Network Utilization
Performance Tools

Knowledge of:

JMeter
LoadRunner
Gatling
k6
Performance Analysis

Evaluate:

Bottleneck identification
Server-side analysis
Database bottlenecks
Application bottlenecks
Infrastructure bottlenecks
10. Test Management

Candidate should know:

Test Planning
Test Estimation
Defect Management
Traceability Matrix
Test Metrics
Test Reporting

Tools

Jira
Zephyr
Xray
Azure DevOps
TestRail
11. CI/CD Integration

Knowledge of:

Jenkins
GitHub Actions
Azure DevOps
GitLab CI
Bamboo

Evaluate:

Pipeline integration
Automated regression
Nightly execution
Parallel execution
Reporting integration
12. Database Testing

Candidate should understand:

SQL validation
CRUD validation
Data integrity
ETL validation
Stored Procedures
Transactions
Data comparison
13. Logging & Reporting

Knowledge of:

Extent Reports
Allure Reports
Log4j
Screenshots
Video recording
Execution logs

Evaluate:

Debugging support
Reporting quality
Failure analysis
14. Debugging & Troubleshooting

Evaluate ability to:

Analyze failed tests
Read stack traces
Identify flaky tests
Debug synchronization issues
Investigate browser logs
Use developer tools
Perform root cause analysis
15. Automation Engineering Best Practices

Candidate should understand:

DRY (Don't Repeat Yourself)
KISS (Keep It Simple)
SOLID principles
Page Object Model
Reusable utilities
Independent test cases
Proper assertions
Test isolation
Configuration management
Version control
Code reviews
Static code analysis
16. Test Data Management

Knowledge of:

Test data creation
Synthetic data
Masked production data
Environment-specific data
Data cleanup
Data-driven testing
17. Agile Testing

Candidate should know:

Scrum
Sprint Planning
Daily Stand-up
User Stories
Acceptance Criteria
Definition of Done
Retrospectives
Backlog Refinement
18. Leadership & Strategy (Senior Candidates)

Evaluate:

Automation roadmap creation
Tool evaluation and selection
Framework architecture
Mentoring engineers
Code reviews
Estimation
Resource planning
Risk management
Stakeholder communication
Automation KPIs
ROI measurement
Experience Mapping
0–2 Years

Evaluate:

Testing fundamentals
Basic automation concepts
Selenium/Playwright/Cypress basics
Simple API testing
Basic SQL
Test execution
3–5 Years

Evaluate:

Automation framework usage
API automation
CI/CD integration
Debugging
Synchronization
Test design
Performance basics
6–8 Years

Evaluate:

Framework design
Parallel execution
Cross-browser testing
Advanced API testing
Performance analysis
Test strategy
Root cause analysis
8+ Years

Evaluate:

Enterprise automation architecture
Tool selection and migration (e.g., Selenium to Playwright)
Automation governance
Framework scalability
Performance engineering strategy
Leadership and mentoring
Quality engineering transformation
Automation ROI and metrics
Guidance for the AI Interview Assistant

When using this repository:

Prioritize technologies from the JD and resume. If the role requires Playwright, focus on Playwright while assessing transferable automation concepts from Selenium or Cypress where relevant.
Adapt to the candidate's experience. Junior candidates should be evaluated on implementation and fundamentals, while senior candidates should be challenged with architecture, strategy, scalability, and leadership.
Favor practical and scenario-based questions. Ask candidates how they would design, debug, optimize, or improve automation solutions rather than recalling definitions.
Assess transferable skills. Candidates experienced in one automation framework may still demonstrate strong engineering practices applicable to another. Explore adaptability where appropriate.
Balance the interview. Cover testing fundamentals, tool-specific knowledge, framework design, API and performance testing (if required), debugging, best practices, and engineering judgment based on the role.