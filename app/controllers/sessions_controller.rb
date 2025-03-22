class SessionsController < ApplicationController
  allow_unauthenticated_access only: %i[ new create signup complete_signup]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { redirect_to new_session_url, alert: "Try again later." }

  def new
  end

  def create
    @user = User.authenticate_by(session_params)
    if @user
      start_new_session_for @user
      redirect_to after_authentication_url
    else
      @errors = User.new.errors
      @errors.add(:base, "Try another email address or password")
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    terminate_session
    redirect_to new_session_path
  end


  def signup
    render :signup
  end

  def complete_signup
    @user = User.new(session_params)
    if @user.save
      start_new_session_for @user
      Category.seed_category_for_new_user(@user)
      redirect_to categories_path, notice: "Welcome to ExpenseTracker!"
    else
      render :signup, status: :unprocessable_entity
    end
  end

  private

  def session_params
    params.permit(:email_address, :password)
  end
end
