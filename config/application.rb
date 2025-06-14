require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Expensetracker
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.0

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    config.action_mailer.default_url_options = { host: ENV["MAILER_HOST"] || Rails.application.credentials.smtp&.hostname }
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.raise_delivery_errors = true
    smtp_username = ENV["EMAIL_USERNAME"]  || Rails.application.credentials.smtp&.username
    smtp_password = ENV["EMAIL_PASSWORD"]  || Rails.application.credentials.smtp&.password
    config.action_mailer.smtp_settings = {
      address:         "smtp.gmail.com",
      port:            587,
      domain:          "expensetracker.com",
      user_name:       smtp_username,
      password:        smtp_password,
      authentication:  "plain",
      enable_starttls: true,
      open_timeout:    5,
      read_timeout:    5 }

    config.active_job.queue_adapter = :solid_queue
    # config.solid_queue.connects_to = { database: { writing: :queue } }
    config.mission_control.jobs.base_controller_class = "AdminController"
  end
end
