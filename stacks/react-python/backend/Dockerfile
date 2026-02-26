
#Imagen Base
#Se usa la versión "slim" porque es más ligera
FROM python:3.11-slim

#Variables de entorno internas de Python
#Evita que se generen archivos .pyv
ENV PYTHONDONTWRITEBYTECODE=1

#Hace que los logs salgan inmediatamente 
ENV PYTHONUNBUFFERED=1

#Directorio de trabajo dentro del contenedor
#Todo el código vivirá en /app dentro del contenedor
WORKDIR /app

#Dependencias del sistema
#gcc y libpq-dev son necesarias para psycopg2
RUN apt-get update && apt-get install -y gcc libpq-dev

#Instalar dependencias Python
#Se copian los requeriments.txt
#para aprovechar cache de Docker
COPY requirements.txt .

#Atualización pip
RUN pip install --upgrade pip

#Instalacipon de depnedencias
RUN pip install -r requirements.txt

#Copia el resto del proyecto
#Copia todo lo que esté en backend/
#Hacia /app dentro del contenedorv
COPY . .