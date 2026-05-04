# Use the official Python image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy the requirements file to the working directory
COPY requirements.txt /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . /app/

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]