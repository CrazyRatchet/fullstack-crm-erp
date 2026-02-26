# React + Python Stack (CRM/ERP)

## Requisitos

- Docker Desktop instalado

## Cómo correr el proyecto

1. Ir a:
   cd stacks/react-python

2. Levantar contenedores:
   docker compose up --build

3. Crear superusuario:
   docker compose exec react_python_backend python manage.py createsuperuser

4. Acceder:
   <http://localhost:8001>
   <http://localhost:8001/admin>
