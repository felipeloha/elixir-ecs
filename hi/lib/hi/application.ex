defmodule Hi.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    topologies = [
      ecs: [
        strategy: Cluster.Strategy.Gossip
      ]
    ]

    children = [

      # Start the Ecto repository
      #Hi.Repo,
      # Start the Telemetry supervisor
      HiWeb.Telemetry,
      Hi.Scheduler,
      # Start the PubSub system
      {Phoenix.PubSub, name: Hi.PubSub},
      # Start the Endpoint (http/https)
      HiWeb.Endpoint,
      {Cluster.Supervisor, [topologies, [name: Hi.ClusterSupervisor]]},
      # Start a worker by calling: Hi.Worker.start_link(arg)
      # {Hi.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Hi.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    HiWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
