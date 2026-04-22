FROM --platform=linux/amd64 docker.io/cloudflare/sandbox:0.8.11

# HTML Tidy for the coding agent's validate_html tool (project.md §10).
RUN apt-get update && apt-get install -y --no-install-recommends tidy \
    && rm -rf /var/lib/apt/lists/* \
    && which tidy && tidy --version | head -1

EXPOSE 8080
