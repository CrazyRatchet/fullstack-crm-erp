# Data Model

## Core Entities

- Company
- User
- Role
- Customer
- Product
- Sale
- Invoice
- Inventory
  
  ## Relationships

- A Company has many Users
- A Company has many Customers
- A Company has many Products
- A Company has one Inventory (logical container per company)
- A User belongs to a Company
- A User is assigned one or more Roles
- A Sale belongs to a Company
- A Sale is associated with one Customer
- A Sale generates one Invoice
- An Invoice belongs to a Company
- A Product belongs to a Company

## Data Modeling Considerations

- All entities include basic audit fields (e.g., created_at, updated_at, created_by)
- Soft deletes are used to preserve historical data
- Foreign keys enforce referential integrity
- Data is logically isolated per company (tenant) within each stack
- Each technology stack maintains its own independent database schema, following this conceptual model
  