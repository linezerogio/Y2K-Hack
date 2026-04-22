FROM --platform=linux/amd64 docker.io/cloudflare/sandbox:0.8.11

# HTML Tidy for the coding agent's validate_html tool (project.md §10).
RUN apt-get update && apt-get install -y --no-install-recommends tidy \
    && rm -rf /var/lib/apt/lists/* \
    && which tidy && tidy --version | head -1

# ffmpeg for the Mux V2 recorder — renders agent status timeline as MP4
# inside the sandbox before uploading to Mux. Kept in its own layer so
# cache invalidation is explicit and the build fails loud if the package
# vanishes. See Implementation/Mux/v2/IMPLEMENTATION-PROPOSAL.md.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/* \
    && ffmpeg -version | head -1 \
    && echo "ffmpeg installed at $(which ffmpeg)"

EXPOSE 8080
