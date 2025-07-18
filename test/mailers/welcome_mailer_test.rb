require "test_helper"

class WelcomeMailerTest < ActionMailer::TestCase
  test "welcome_email" do
    mail = WelcomeMailer.welcome_email
    assert_equal "Welcome email", mail.subject
    assert_equal [ "to@example.org" ], mail.to
    assert_equal [ "from@example.com" ], mail.from
    assert_match "Hi", mail.body.encoded
  end
end
