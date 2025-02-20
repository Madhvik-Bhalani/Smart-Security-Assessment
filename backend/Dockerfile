# Python & Perl base image
FROM python:3.13.1

# Install Perl 
RUN apt-get update && apt-get install -y perl

# set dir
WORKDIR /app

# Python dependencies copy and install
COPY requirements.txt .
RUN pip install -r requirements.txt

# બેકએન્ડ ફાઇલો copy કરો
COPY . .

# expose port
EXPOSE 5000

# start backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000", "--reload"]
