## Development Style
This project should remain realistic for a software engineering practical/final project level.

Requirements:
- Keep code understandable and maintainable
- Prefer simple, readable solutions over overly advanced patterns
- Do not over-engineer
- Avoid unnecessary abstractions
- Keep architecture clean but practical
- Reuse existing coding style and naming conventions
- Match the current complexity level of the codebase
- Do not rewrite modules just to make them "more professional"
- Keep improvements incremental, not drastic

## Engineering Level
Target level:
Final-year practical software engineering / technician-level project.

That means:
- good separation of concerns
- routes, middleware, controllers, services, repositories
- clear DB logic
- basic validation and error handling
- reusable helpers where useful
- reasonable modularity

Avoid:
- enterprise-level complexity
- unnecessary design patterns
- microservices thinking
- over-abstracted architecture
- advanced optimizations unless clearly needed

# Project Context

Inventory Management App

## Stack
- React Native client
- Node.js / Express backend
- PostgreSQL database

## Architecture
- routes -> middleware -> controllers -> services -> db
- JWT auth
- protected task routes

## Rules
- keep auth untouched unless asked
- explain large changes first
- do not break API responses
- preserve folder structure
- ask before deleting files
