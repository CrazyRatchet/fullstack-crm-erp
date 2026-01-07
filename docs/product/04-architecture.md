# System Architecture

## Overview

The system follows a layered architecture, separating responsibilities between presentation, application logic, and data persistence.
This structure promotes maintainability, scalability, and clear separation of concerns.

Each technology stack is implemented as an independent, self-contained system, including its own backend, database, and infrastructure, while adhering to a shared set of architectural principles and functional requirements.

## Architectural Layers

- Presentation Layer (Frontend)
Responsible for user interaction, UI rendering, and client-side validation.
- Application Layer (Backend / API)
Handles business logic, use cases, validation, authentication, authorization, and orchestration of domain operations.
- Data Layer (Database)
Responsible for data persistence, integrity, and isolation per tenant and per stack.

## Authentication and Authorization

The system uses token-based authentication and a role-based access control (RBAC) model to manage access to system functionalities.

Authorization rules are enforced at the application layer to ensure users can only access resources permitted by their assigned roles and company context.

## Multi-Tenancy

Multi-tenancy is implemented within each stack.
Each company (tenant) has its own isolated data, users, and business entities, ensuring data separation, security, and integrity.

There is no shared database or infrastructure between stacks; tenant isolation applies only within the boundaries of each implementation.

## Communication

The frontend communicates with the backend through well-defined APIs (e.g., REST or equivalent), using secure protocols.

All requests are authenticated and authorized before accessing protected resources.
