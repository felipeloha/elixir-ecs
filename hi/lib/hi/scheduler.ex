defmodule Hi.Scheduler do
  use Quantum, otp_app: :hi

  require Logger

  alias Crontab.CronExpression.Parser, as: CronExpressionParser
  alias Quantum.Job

  def init(opts) do
    job =
      __MODULE__.new_job()
      |> Job.set_name(:hi_job)
      |> Job.set_state(:active)
      |> Job.set_schedule(CronExpressionParser.parse!("*/5", true))

    job =
      Job.set_task(job, fn ->
        Logger.info("Job running on: #{inspect(Node.self())} with cookie #{inspect(Node.get_cookie())} from possible hosts: #{inspect(Node.list())}")
      end)

    jobs = [job]
    Logger.info("setting up scheduler with jobs: #{inspect(jobs)}")
    Keyword.put(opts, :jobs, jobs)
  end
end
