# Tienda Perritos - Orquestación en AWS (EP3)

Este repositorio contiene la infraestructura y el código de la aplicación "Tienda Perritos", desarrollado para la Evaluación Parcial N°3 de Introducción a Herramientas DevOps. 

En esta fase, evolucionamos de una arquitectura tradicional (Lift & Shift) a un entorno completamente orquestado y automatizado en la nube utilizando AWS y contenedores Docker.

## Arquitectura del Proyecto

El proyecto está dividido en dos microservicios principales, desplegados sobre un clúster de **AWS ECS (Fargate)** para asegurar escalabilidad sin tener que administrar servidores físicos:

*   **Frontend (React + Nginx):** Expuesto a internet a través de un Application Load Balancer (ALB) en subredes públicas.
*   **Backend (Node.js):** Aislado por motivos de seguridad dentro de subredes privadas, aceptando tráfico únicamente desde el Frontend.

Ambos servicios cuentan con políticas de Autoescalado (Target Tracking) configuradas para levantar nuevas réplicas si el uso de CPU supera el 50%.

## Automatización (CI/CD)

Todo el proceso de integración y despliegue continuo está automatizado con **GitHub Actions**. Los flujos de trabajo se encuentran en la carpeta `.github/workflows/`.

¿Cómo funciona el pipeline?
1. Al hacer un `git push` a la rama `main`, GitHub Actions entra en acción.
2. Hace login de forma segura en AWS usando credenciales configuradas en los Secrets del repositorio.
3. Compila las nuevas imágenes Docker (usando Multi-stage builds para optimizar peso y tiempo).
4. Sube (Push) las imágenes a nuestros repositorios en **Amazon ECR**.
5. Ejecuta un comando para actualizar los servicios en el clúster **ECS**, descargando la nueva versión sin dar de baja la aplicación.

## ¿Cómo utilizar el proyecto?

Como el entorno está 100% automatizado, no es necesario entrar a los servidores por SSH. 

Para desplegar un cambio:
1. Modifica el código en tu entorno local.
2. Realiza un commit y súbelo a la rama principal:
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push origin main