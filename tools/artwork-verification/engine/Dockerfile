FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY printsahaj_verify/ printsahaj_verify/

ENV PRINTSAHAJ_OPEN_BROWSER=0
ENV PRINTSAHAJ_REQUIRE_AUTH=1

CMD ["python", "-m", "printsahaj_verify", "--serve", "--host", "0.0.0.0"]
