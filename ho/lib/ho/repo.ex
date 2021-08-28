defmodule Ho.Repo do
  use Ecto.Repo,
    otp_app: :ho,
    adapter: Ecto.Adapters.Postgres
end
