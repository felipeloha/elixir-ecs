# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :hi, Hi.Scheduler,
  debug_logging: false,
  timezone: :utc,
  run_strategy: {Quantum.RunStrategy.Random, :cluster},
  overlap: false

# config :hi,
#  ecto_repos: [Hi.Repo]

# Configures the endpoint
config :hi, HiWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "e33iRNyPm7atpx8nud5MGez2OEYyjjuzOpv5PKLEOEhk/pARp4/WotLlRixfHd03",
  render_errors: [view: HiWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: Hi.PubSub,
  live_view: [signing_salt: "tijzxqXb"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
