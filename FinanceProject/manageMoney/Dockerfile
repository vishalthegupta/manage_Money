# Start with a Maven image to build the app
FROM maven:3.9.4-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /app

# Copy the pom.xml and install dependencies
COPY pom.xml .

# Copy the entire source code
COPY src ./src

# Package the application
RUN mvn clean package -DskipTests

# Use a smaller JDK image for running the app
FROM eclipse-temurin:17-jre

# Set working directory in container
WORKDIR /app

# Copy the built JAR file from the builder stage
COPY --from=build /app/target/*.jar app.jar

# Set the port (Heroku/Render expects this env var)
ENV PORT=8080

# Expose the port (optional for local)
EXPOSE ${PORT}

# Run the JAR file
ENTRYPOINT ["java", "-jar", "app.jar"]
