# In this file, we load production configuration and secrets
# from environment variables. You can also hardcode secrets,
# although such is generally not recommended and you have to
# remember to add this file to your .gitignore.
use Mix.Config

# database_url = System.get_env("DATABASE_URL") || "NO_DB"

# config :hi, Hi.Repo,
# ssl: true,
# url: database_url,
# pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10")

# TODO this should be passed from the ENVs
secret_key_base =
  System.get_env("SECRET_KEY_BASE") ||
    "fZHf7el71+DVOaUNpjkk2Wy6fPh/zA6dyI23L/Upxaj2ORaKXlWRpyHxrCjgviFc"

config :hi, HiWeb.Endpoint,
  server: true,
  http: [
    port: String.to_integer(System.get_env("PORT") || "4000"),
    transport_options: [socket_opts: [:inet6]]
  ],
  secret_key_base: secret_key_base
