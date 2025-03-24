class WelcomeMailer < ApplicationMailer
  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.welcome_mailer.welcome_email.subject
  #
  def welcome_email(user)
    @user = user
    @category_path = categories_url

    mail to: @user.email_address, subject: "Welcome to ExpenseTracker"
  end
end
