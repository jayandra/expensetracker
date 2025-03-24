class ApplicationMailer < ActionMailer::Base
  default from: "no-reply@expensetracker.com"
  layout "mailer"
end
