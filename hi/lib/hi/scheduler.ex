defmodule Hi.Scheduler do
  use Quantum, otp_app: :hi

  require Logger

  alias Crontab.CronExpression.Parser, as: CronExpressionParser
  alias Quantum.Job

  defp run_job() do
    Logger.info("Job running on: #{inspect(Node.self())} from #{inspect(Node.list())}")
  end

  def init(opts) do
    job =
      __MODULE__.new_job()
      |> Job.set_name(:hi_job)
      |> Job.set_state(:active)
      |> Job.set_schedule(CronExpressionParser.parse!("* * * * *", true))

    job = Job.set_task(job, fn -> run_job() end)

    #jobs = [{"* * * * *", fn -> run_job() end}]
    jobs = [job]
    Logger.info("setting up scheduler with jobs: #{inspect(jobs)}")
    Keyword.put(opts, :jobs, jobs)
  end
end
