class ExpensesChannel < ApplicationCable::Channel
  def subscribed
    stream_for ExpensesChannel.broadcasting_for("expenses:user:#{current_user.email_address}")
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
