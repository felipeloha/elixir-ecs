defmodule HiWeb.PageController do
  use HiWeb, :controller

  def index(conn, _params) do
    IO.inspect(Node.list)
    IO.inspect(Node.self)
    render(conn, "index.html", %{self: Node.self, nodes: Node.list})
  end
end
