FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY printsahaj_verify/ printsahaj_verify/
# Compliance rules live in versioned JSON packs the code loads at runtime from
# the folder next to the package. Without them every check raises.
COPY rule_packs/ rule_packs/

ENV PRINTSAHAJ_OPEN_BROWSER=0
ENV PRINTSAHAJ_REQUIRE_AUTH=1

CMD ["python", "-m", "printsahaj_verify", "--serve", "--host", "0.0.0.0"]
