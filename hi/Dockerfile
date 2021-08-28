ARG BASE_IMAGE=elixir:1.10.4-alpine
FROM $BASE_IMAGE AS release_stage

RUN apk add --no-cache build-base git npm

COPY mix.exs .
COPY mix.lock .
ENV MIX_ENV=prod
RUN mix do local.hex --force, local.rebar --force
RUN mix do deps.clean --unlock --unused, deps.get --force
RUN mix compile --force

COPY config ./config
COPY lib ./lib
COPY priv ./priv
COPY rel ./rel

ENV MIX_ENV=prod
RUN mix phx.digest
RUN mix release

### run stage
FROM alpine:3.9 AS run_stage

RUN apk add --no-cache bash openssl ncurses-libs curl jq
#SD debug
RUN apk add --no-cache bind-tools

#TODO do not run as root

COPY --from=release_stage $HOME/_build .
EXPOSE 4000
CMD ["./prod/rel/hi/bin/hi", "start"]

#docker network create example
#docker build -t build-hi:latest .
#docker run -e RELEASE_COOKIE=1234 -e NODE_NAME=h2 -p 4001:4000 build-hi:latest
#docker run -e RELEASE_COOKIE=1234 -p 4000:4000 build-hi:latest
