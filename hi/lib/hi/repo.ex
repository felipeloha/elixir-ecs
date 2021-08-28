defmodule Hi.Repo do
  use Ecto.Repo,
    otp_app: :hi,
    adapter: Ecto.Adapters.Postgres
end
