FROM python:3.10.0

ENV PROJ_DIR=/usr/local

WORKDIR /app

COPY src/edaphoclimatic_api/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt && \
    rm requirements.txt

COPY ./src/edaphoclimatic_api .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "wsgi:app"]