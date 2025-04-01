class SendEmailsJob < ApplicationJob
  queue_as :default

  def perform(user, email_type)
    if email_type == :signup
      WelcomeMailer.welcome_email(user).deliver_now
    elsif email_type == :password_reset
      PasswordsMailer.reset(user).deliver_now
    end
  end
end
